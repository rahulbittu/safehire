import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { incidentQueries } from "@verifyme/db";
import { encryptField } from "@verifyme/privacy";

export const incidentRouter = router({
  reportIncident: protectedProcedure
    .input(z.object({
      workerId: z.string().uuid(),
      type: z.enum(["theft", "misconduct", "property_damage", "harassment", "safety_concern", "other"]),
      severity: z.enum(["low", "medium", "high", "critical"]),
      description: z.string().min(10).max(10000),
      evidence: z.array(z.object({
        type: z.enum(["photo", "video", "document", "other"]),
        storagePath: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // AES-256-GCM field-level encryption (see packages/privacy/src/encryption.ts)
      const descriptionEncrypted = encryptField(input.description);

      const incident = await incidentQueries.createIncident(ctx.db, {
        reporterId: ctx.session.userId,
        workerId: input.workerId,
        type: input.type,
        severity: input.severity,
        descriptionEncrypted,
      });

      // Store evidence references if provided
      if (input.evidence?.length && incident) {
        for (const ev of input.evidence) {
          await ctx.db.from("incident_evidence").insert({
            incident_id: (incident as any).id,
            type: ev.type,
            storage_path: ev.storagePath,
            uploaded_at: new Date().toISOString(),
          });
        }
      }

      return { success: true, incidentId: (incident as any)?.id, status: "submitted" };
    }),

  getIncident: protectedProcedure
    .input(z.object({ incidentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const incident = await incidentQueries.getIncidentById(ctx.db, input.incidentId);
      if (!incident) return null;
      // Access control: reporter, subject worker, or admin
      const inc = incident as any;
      if (inc.reporter_id !== ctx.session.userId &&
          inc.worker_id !== ctx.session.userId &&
          ctx.session.role !== "admin") {
        return null; // Don't reveal existence
      }
      return incident;
    }),

  getIncidentsForWorker: adminProcedure
    .input(z.object({
      workerId: z.string().uuid(),
      status: z.enum(["submitted", "under_review", "substantiated", "unsubstantiated", "inconclusive", "appealed"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return await incidentQueries.getIncidentsForWorker(ctx.db, input.workerId, { status: input.status });
    }),

  updateIncidentStatus: adminProcedure
    .input(z.object({
      incidentId: z.string().uuid(),
      status: z.enum(["under_review", "substantiated", "unsubstantiated", "inconclusive"]),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const _updated = await incidentQueries.updateIncidentStatus(
        ctx.db, input.incidentId, input.status, ctx.session.userId
      );
      return { success: true, incidentId: input.incidentId, newStatus: input.status };
    }),

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
      return { success: true, appealId: (appeal as any)?.id };
    }),
});
