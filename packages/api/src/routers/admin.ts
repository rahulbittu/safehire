import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const adminRouter = router({
  getPendingReviews: adminProcedure.query(async ({ ctx }) => {
    const { data: incidents } = await ctx.db
      .from("incidents")
      .select("*")
      .in("status", ["submitted", "under_review"])
      .order("reported_at", { ascending: false });

    const { data: appeals } = await ctx.db
      .from("appeals")
      .select("*, incidents(*)")
      .eq("status", "pending")
      .order("submitted_at", { ascending: false });

    return {
      pendingIncidents: incidents ?? [],
      pendingAppeals: appeals ?? [],
      totalPending: (incidents?.length ?? 0) + (appeals?.length ?? 0),
    };
  }),

  reviewIncident: adminProcedure
    .input(z.object({
      incidentId: z.string().uuid(),
      decision: z.enum(["substantiated", "unsubstantiated", "inconclusive"]),
      notes: z.string().max(5000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.db
        .from("incidents")
        .update({
          status: input.decision,
          reviewer_id: ctx.session.userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", input.incidentId);
      if (error) throw error;
      return { success: true, incidentId: input.incidentId, decision: input.decision };
    }),

  reviewAppeal: adminProcedure
    .input(z.object({
      appealId: z.string().uuid(),
      decision: z.enum(["accepted", "rejected"]),
      notes: z.string().max(5000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.db
        .from("appeals")
        .update({
          status: input.decision,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", input.appealId);
      if (error) throw error;
      return { success: true, appealId: input.appealId, decision: input.decision };
    }),

  getAuditLog: adminProcedure
    .input(z.object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(50),
      action: z.string().optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .from("audit_log")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (input.action) query = query.eq("action", input.action);
      if (input.startDate) query = query.gte("created_at", input.startDate.toISOString());
      if (input.endDate) query = query.lte("created_at", input.endDate.toISOString());

      const offset = (input.page - 1) * input.limit;
      query = query.range(offset, offset + input.limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { entries: data ?? [], total: count ?? 0, page: input.page, limit: input.limit };
    }),

  getDisclosureRequests: adminProcedure
    .input(z.object({ status: z.enum(["pending", "approved", "denied"]).optional() }))
    .query(async ({ ctx, input }) => {
      let query = ctx.db.from("disclosure_requests").select("*", { count: "exact" });
      if (input.status) query = query.eq("status", input.status);
      const { data, error, count } = await query;
      if (error) throw error;
      return { requests: data ?? [], total: count ?? 0 };
    }),

  processDisclosure: adminProcedure
    .input(z.object({
      requestId: z.string().uuid(),
      decision: z.enum(["approved", "denied"]),
      notes: z.string().max(5000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.db
        .from("disclosure_requests")
        .update({
          status: input.decision,
          processed_at: new Date().toISOString(),
          processor_id: ctx.session.userId,
        })
        .eq("id", input.requestId);
      if (error) throw error;
      return { success: true, requestId: input.requestId, decision: input.decision };
    }),
});
