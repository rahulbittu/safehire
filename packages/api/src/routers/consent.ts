import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { ConsentManager, AuditLogger } from "@verifyme/privacy";

export const consentRouter = router({
  // =========================================================================
  // CONSENT REQUESTS (hirer-initiated)
  // =========================================================================

  /**
   * Hirer requests access to a worker's profile data.
   * Creates a pending consent_request for the worker to review.
   */
  requestAccess: protectedProcedure
    .input(z.object({
      workerId: z.string().uuid(),
      fields: z.array(z.string()).min(1),
      message: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role !== "hirer") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only hirers can request access" });
      }

      // Check for existing pending request
      const { data: existing } = await ctx.db
        .from("consent_requests")
        .select("id")
        .eq("hirer_id", ctx.session.userId)
        .eq("worker_id", input.workerId)
        .eq("status", "pending")
        .maybeSingle();

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "You already have a pending request for this worker" });
      }

      const { data, error } = await ctx.db
        .from("consent_requests")
        .insert({
          hirer_id: ctx.session.userId,
          worker_id: input.workerId,
          fields: input.fields,
          message: input.message ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      // Audit log
      const audit = new AuditLogger(ctx.db);
      await audit.log({
        actorId: ctx.session.userId,
        action: "consent_request_created",
        resourceType: "consent_request",
        resourceId: (data as Record<string, unknown>).id as string,
        metadata: { workerId: input.workerId, fields: input.fields },
      });

      return {
        success: true,
        requestId: (data as Record<string, unknown>).id as string,
      };
    }),

  /**
   * Get pending access requests for the current worker.
   */
  getMyPendingRequests: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.role !== "worker") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only workers can view their pending requests" });
    }

    const { data, error } = await ctx.db
      .from("consent_requests")
      .select("*")
      .eq("worker_id", ctx.session.userId)
      .eq("status", "pending")
      .order("requested_at", { ascending: false });

    if (error) throw error;
    return { requests: data ?? [] };
  }),

  /**
   * Get consent requests sent by the current hirer.
   */
  getMyRequests: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.role !== "hirer") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only hirers can view their requests" });
    }

    const { data, error } = await ctx.db
      .from("consent_requests")
      .select("*")
      .eq("hirer_id", ctx.session.userId)
      .order("requested_at", { ascending: false });

    if (error) throw error;
    return { requests: data ?? [] };
  }),

  /**
   * Worker approves a consent request.
   * Creates a consent_grant and updates the request status.
   */
  approveRequest: protectedProcedure
    .input(z.object({
      requestId: z.string().uuid(),
      expiresInDays: z.number().int().min(1).max(365).default(90),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role !== "worker") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only workers can approve requests" });
      }

      // Fetch the request
      const { data: request, error: fetchError } = await ctx.db
        .from("consent_requests")
        .select("*")
        .eq("id", input.requestId)
        .eq("worker_id", ctx.session.userId)
        .eq("status", "pending")
        .single();

      if (fetchError || !request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pending request not found" });
      }

      const req = request as Record<string, unknown>;

      // Create consent grant
      const consent = new ConsentManager(ctx.db);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      const grant = await consent.grantConsent({
        workerId: ctx.session.userId,
        hirerId: req.hirer_id as string,
        fields: req.fields as string[],
        expiresAt,
      });

      // Update request status
      await ctx.db
        .from("consent_requests")
        .update({
          status: "approved",
          responded_at: new Date().toISOString(),
          consent_grant_id: grant.id,
        })
        .eq("id", input.requestId);

      // Audit log
      const audit = new AuditLogger(ctx.db);
      await audit.logConsentChange({
        actorId: ctx.session.userId,
        consentId: grant.id,
        action: "granted",
        workerId: ctx.session.userId,
        hirerId: req.hirer_id as string,
      });
      await audit.log({
        actorId: ctx.session.userId,
        action: "consent_request_approved",
        resourceType: "consent_request",
        resourceId: input.requestId,
        metadata: { consentGrantId: grant.id },
      });

      return {
        success: true,
        consentId: grant.id,
        expiresAt: expiresAt.toISOString(),
      };
    }),

  /**
   * Worker rejects a consent request.
   */
  rejectRequest: protectedProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role !== "worker") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only workers can reject requests" });
      }

      // Verify the request belongs to this worker and is pending
      const { data: request, error: fetchError } = await ctx.db
        .from("consent_requests")
        .select("hirer_id")
        .eq("id", input.requestId)
        .eq("worker_id", ctx.session.userId)
        .eq("status", "pending")
        .single();

      if (fetchError || !request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pending request not found" });
      }

      await ctx.db
        .from("consent_requests")
        .update({
          status: "rejected",
          responded_at: new Date().toISOString(),
        })
        .eq("id", input.requestId);

      // Audit log
      const audit = new AuditLogger(ctx.db);
      await audit.log({
        actorId: ctx.session.userId,
        action: "consent_request_rejected",
        resourceType: "consent_request",
        resourceId: input.requestId,
        metadata: { hirerId: (request as Record<string, unknown>).hirer_id },
      });

      return { success: true };
    }),

  // =========================================================================
  // CONSENT GRANTS (worker-initiated or from approved request)
  // =========================================================================

  /**
   * Grant consent for a hirer to view specific worker fields.
   * Only workers can grant consent (worker-owned data).
   */
  grantConsent: protectedProcedure
    .input(z.object({
      hirerId: z.string().uuid(),
      fields: z.array(z.string()).min(1),
      expiresInDays: z.number().int().min(1).max(365).default(90),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role !== "worker") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only workers can grant consent" });
      }

      const consent = new ConsentManager(ctx.db);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      const result = await consent.grantConsent({
        workerId: ctx.session.userId,
        hirerId: input.hirerId,
        fields: input.fields,
        expiresAt,
      });

      const audit = new AuditLogger(ctx.db);
      await audit.logConsentChange({
        actorId: ctx.session.userId,
        consentId: result.id,
        action: "granted",
        workerId: ctx.session.userId,
        hirerId: input.hirerId,
      });

      return { success: true, consentId: result.id, expiresAt: expiresAt.toISOString() };
    }),

  /**
   * Revoke a previously granted consent.
   * Only the worker who granted it can revoke.
   */
  revokeConsent: protectedProcedure
    .input(z.object({ consentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role !== "worker") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only workers can revoke consent" });
      }

      const { data: grant } = await ctx.db
        .from("consent_grants")
        .select("worker_id, hirer_id")
        .eq("id", input.consentId)
        .single();

      if (!grant || (grant as Record<string, unknown>).worker_id !== ctx.session.userId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Consent grant not found" });
      }

      const consent = new ConsentManager(ctx.db);
      await consent.revokeConsent(input.consentId);

      const audit = new AuditLogger(ctx.db);
      await audit.logConsentChange({
        actorId: ctx.session.userId,
        consentId: input.consentId,
        action: "revoked",
        workerId: ctx.session.userId,
        hirerId: (grant as Record<string, unknown>).hirer_id as string,
      });

      return { success: true };
    }),

  /**
   * Check if a hirer has active consent to view a worker's data.
   */
  checkConsent: protectedProcedure
    .input(z.object({
      workerId: z.string().uuid(),
      hirerId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const consent = new ConsentManager(ctx.db);
      const result = await consent.checkConsent(input.workerId, input.hirerId);
      return { hasConsent: result !== null, fields: result?.fields ?? [] };
    }),

  /**
   * Get all active consent grants for the current worker.
   */
  getMyConsents: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.role !== "worker") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only workers can view their consents" });
    }

    const consent = new ConsentManager(ctx.db);
    const grants = await consent.getActiveConsents(ctx.session.userId);
    return { consents: grants };
  }),

  /**
   * Get consent grants where the current hirer has been granted access.
   */
  getGrantedToMe: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.role !== "hirer" && ctx.session.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only hirers can view granted consents" });
    }

    const { data, error } = await ctx.db
      .from("consent_grants")
      .select("*")
      .eq("hirer_id", ctx.session.userId)
      .is("revoked_at", null)
      .gte("expires_at", new Date().toISOString());

    if (error) throw error;
    return { consents: data ?? [] };
  }),
});
