import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { workerQueries, trustQueries, incidentQueries } from "@verifyme/db";

export const workerRouter = router({
  /**
   * Get own profile, or null if not yet created (triggers onboarding).
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const profile = await workerQueries.getWorkerById(ctx.db, ctx.session.userId);
      return profile;
    } catch {
      return null;
    }
  }),

  /**
   * Update own profile (partial fields).
   */
  updateProfile: protectedProcedure
    .input(z.object({
      fullName: z.string().min(1).max(200).optional(),
      skills: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
      experienceYears: z.number().int().min(0).optional(),
      photoUrl: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updated = await workerQueries.updateWorkerProfile(ctx.db, ctx.session.userId, input);
      return { success: true, profile: updated };
    }),

  /**
   * Create a new worker profile.
   */
  createProfile: protectedProcedure
    .input(z.object({
      fullName: z.string().min(1).max(200),
      skills: z.array(z.string()),
      languages: z.array(z.string()),
      experienceYears: z.number().int().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await workerQueries.createWorkerProfile(ctx.db, {
        userId: ctx.session.userId,
        fullName: input.fullName,
        skills: input.skills,
        languages: input.languages,
        experienceYears: input.experienceYears,
      });

      // Create initial trust card for the worker
      await trustQueries.upsertTrustCard(ctx.db, {
        workerId: ctx.session.userId,
        tier: "unverified",
        verificationStatus: "pending",
        tenureMonths: 0,
        endorsementCount: 0,
        incidentFlag: false,
        incidentSeverityMax: null,
      });

      return { success: true, profile };
    }),

  /**
   * Get own trust card.
   */
  getMyTrustCard: protectedProcedure.query(async ({ ctx }) => {
    const card = await trustQueries.getTrustCard(ctx.db, ctx.session.userId);
    if (!card) {
      return {
        worker_id: ctx.session.userId,
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
   * Get own endorsements.
   */
  getMyEndorsements: protectedProcedure.query(async ({ ctx }) => {
    const endorsements = await trustQueries.getEndorsements(ctx.db, ctx.session.userId);
    return { endorsements };
  }),

  /**
   * Get own incidents.
   */
  getMyIncidents: protectedProcedure.query(async ({ ctx }) => {
    return await incidentQueries.getIncidentsForWorker(ctx.db, ctx.session.userId);
  }),

  /**
   * Submit appeal for an incident.
   */
  submitAppeal: protectedProcedure
    .input(z.object({
      incidentId: z.string().uuid(),
      reason: z.string().min(10).max(5000),
    }))
    .mutation(async ({ ctx, input }) => {
      const appeal = await incidentQueries.createAppeal(ctx.db, {
        incidentId: input.incidentId,
        workerId: ctx.session.userId,
        reason: input.reason,
      });
      return { success: true, appeal };
    }),
});
