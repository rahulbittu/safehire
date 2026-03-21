import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { trustQueries, incidentQueries } from "@verifyme/db";
import { computeTrustCard } from "@verifyme/trust";
import type { VerificationTier } from "@verifyme/types";

/**
 * Determine verification tier from a list of verifications.
 */
function determineVerificationTier(
  verifications: Array<{ status: string; type: string }>
): VerificationTier {
  const verified = verifications.filter((v) => v.status === "verified");
  if (verified.length === 0) return "unverified";
  // If identity verification exists, enhanced; otherwise basic (phone-only)
  const hasIdentity = verified.some((v) => v.type === "identity" || v.type === "aadhaar");
  return hasIdentity ? "enhanced" : "basic";
}

function determineVerificationStatus(
  verifications: Array<{ status: string }>
): "pending" | "verified" | "expired" | "rejected" {
  if (verifications.length === 0) return "pending";
  const statuses = verifications.map((v) => v.status);
  if (statuses.includes("verified")) return "verified";
  if (statuses.includes("pending")) return "pending";
  if (statuses.includes("expired")) return "expired";
  return "rejected";
}

export const trustRouter = router({
  /**
   * Compute and store a worker's trust card.
   * Gathers verifications, endorsements, and incidents, then runs
   * the deterministic scoring algorithm and persists the result.
   */
  computeTrustCard: protectedProcedure
    .input(z.object({ workerId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Gather all data needed for trust computation
      const [verifications, endorsements, incidentResult] = await Promise.all([
        trustQueries.getVerifications(ctx.db, input.workerId),
        trustQueries.getEndorsements(ctx.db, input.workerId),
        incidentQueries.getIncidentsForWorker(ctx.db, input.workerId, {
          status: "substantiated",
        }),
      ]);

      const tier = determineVerificationTier(verifications as Array<{ status: string; type: string }>);
      const verificationStatus = determineVerificationStatus(verifications as Array<{ status: string }>);

      // Compute tenure from earliest verification date
      let tenureMonths = 0;
      const verifiedDates = (verifications as Array<{ verified_at: string | null }>)
        .filter((v) => v.verified_at)
        .map((v) => new Date(v.verified_at!).getTime());
      if (verifiedDates.length > 0) {
        const earliest = Math.min(...verifiedDates);
        tenureMonths = Math.floor((Date.now() - earliest) / (30.44 * 24 * 60 * 60 * 1000));
      }

      const substantiatedIncidents = (incidentResult.incidents as Array<{ severity: string }>).map(
        (inc) => ({ severity: inc.severity as "low" | "medium" | "high" | "critical" })
      );

      // Compute the trust card
      const card = computeTrustCard({
        workerId: input.workerId,
        verificationTier: tier,
        verificationStatus,
        tenureMonths,
        endorsementCount: endorsements.length,
        substantiatedIncidents,
      });

      // Persist to database
      const persisted = await trustQueries.upsertTrustCard(ctx.db, {
        workerId: card.workerId,
        tier: card.tier,
        verificationStatus: card.verificationStatus,
        tenureMonths: card.tenureMonths,
        endorsementCount: card.endorsementCount,
        incidentFlag: card.incidentFlag,
        incidentSeverityMax: card.incidentSeverityMax,
      });

      return { success: true, trustCard: persisted };
    }),

  /**
   * Get a worker's trust card.
   * Workers can view their own. Hirers see limited data (consent checked in hirer router).
   */
  getTrustCard: protectedProcedure
    .input(z.object({ workerId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const card = await trustQueries.getTrustCard(ctx.db, input.workerId);
      if (!card) {
        return {
          workerId: input.workerId,
          tier: "unverified" as const,
          verification_status: "pending" as const,
          tenure_months: 0,
          endorsement_count: 0,
          incident_flag: false,
          incident_severity_max: null,
          last_computed_at: new Date().toISOString(),
        };
      }
      return card;
    }),

  /**
   * Get verification status for a worker.
   */
  getVerificationStatus: protectedProcedure
    .input(z.object({ workerId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const verifications = await trustQueries.getVerifications(ctx.db, input.workerId);
      const tier = determineVerificationTier(verifications as Array<{ status: string; type: string }>);
      return {
        workerId: input.workerId,
        verifications,
        overallTier: tier,
      };
    }),

  /**
   * Submit an endorsement for a worker.
   * Only hirers can endorse. Creates the endorsement and triggers trust recomputation.
   */
  submitEndorsement: protectedProcedure
    .input(z.object({
      workerId: z.string().uuid(),
      relationship: z.string().min(1).max(200),
      comment: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role !== "hirer" && ctx.session.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only hirers can endorse workers" });
      }

      // Create endorsement
      const endorsement = await trustQueries.createEndorsement(ctx.db, {
        workerId: input.workerId,
        hirerId: ctx.session.userId,
        relationship: input.relationship,
        comment: input.comment,
      });

      // Trigger trust card recomputation (non-blocking)
      // We call the computation inline since it's a mutation anyway
      const [verifications, endorsements, incidentResult] = await Promise.all([
        trustQueries.getVerifications(ctx.db, input.workerId),
        trustQueries.getEndorsements(ctx.db, input.workerId),
        incidentQueries.getIncidentsForWorker(ctx.db, input.workerId, {
          status: "substantiated",
        }),
      ]);

      const tier = determineVerificationTier(verifications as Array<{ status: string; type: string }>);
      const verificationStatus = determineVerificationStatus(verifications as Array<{ status: string }>);

      let tenureMonths = 0;
      const verifiedDates = (verifications as Array<{ verified_at: string | null }>)
        .filter((v) => v.verified_at)
        .map((v) => new Date(v.verified_at!).getTime());
      if (verifiedDates.length > 0) {
        const earliest = Math.min(...verifiedDates);
        tenureMonths = Math.floor((Date.now() - earliest) / (30.44 * 24 * 60 * 60 * 1000));
      }

      const card = computeTrustCard({
        workerId: input.workerId,
        verificationTier: tier,
        verificationStatus,
        tenureMonths,
        endorsementCount: endorsements.length,
        substantiatedIncidents: (incidentResult.incidents as Array<{ severity: string }>).map(
          (inc) => ({ severity: inc.severity as "low" | "medium" | "high" | "critical" })
        ),
      });

      await trustQueries.upsertTrustCard(ctx.db, {
        workerId: card.workerId,
        tier: card.tier,
        verificationStatus: card.verificationStatus,
        tenureMonths: card.tenureMonths,
        endorsementCount: card.endorsementCount,
        incidentFlag: card.incidentFlag,
        incidentSeverityMax: card.incidentSeverityMax,
      });

      return { success: true, endorsementId: (endorsement as Record<string, unknown>).id as string };
    }),
});
