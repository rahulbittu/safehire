import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

const EVIDENCE_BUCKET = "incident-evidence";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4"];
const SIGNED_URL_EXPIRY = 60 * 5; // 5 minutes

export const storageRouter = router({
  /**
   * Get a signed upload URL for incident evidence.
   *
   * Access control: only the reporter of the incident can upload evidence.
   * Files are stored at: incident-evidence/{incidentId}/{filename}
   *
   * The client uploads directly to Supabase Storage using the signed URL.
   * After upload, the client calls reportIncident or updates the incident
   * with the storage path.
   */
  getEvidenceUploadUrl: protectedProcedure
    .input(z.object({
      incidentId: z.string().uuid(),
      filename: z.string().min(1).max(255),
      contentType: z.string(),
      fileSize: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate content type
      if (!ALLOWED_TYPES.includes(input.contentType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File type not allowed. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        });
      }

      // Validate file size
      if (input.fileSize > MAX_FILE_SIZE) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024} MB`,
        });
      }

      // Verify the incident exists and the user is the reporter
      const { data: incident } = await ctx.db
        .from("incidents")
        .select("reporter_id")
        .eq("id", input.incidentId)
        .single();

      if (!incident) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Incident not found" });
      }
      if ((incident as Record<string, unknown>).reporter_id !== ctx.session.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the reporter can upload evidence" });
      }

      // Sanitize filename: remove path separators, limit to safe characters
      const safeName = input.filename
        .replace(/[/\\]/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 100);

      const storagePath = `${input.incidentId}/${Date.now()}_${safeName}`;

      // Generate signed upload URL
      const { data, error } = await ctx.db.storage
        .from(EVIDENCE_BUCKET)
        .createSignedUploadUrl(storagePath);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate upload URL",
        });
      }

      return {
        signedUrl: data.signedUrl,
        storagePath,
        token: data.token,
        expiresIn: SIGNED_URL_EXPIRY,
      };
    }),

  /**
   * Get a signed download URL for incident evidence.
   *
   * Access control: reporter, subject worker, or admin.
   */
  getEvidenceDownloadUrl: protectedProcedure
    .input(z.object({
      incidentId: z.string().uuid(),
      storagePath: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      // Verify the incident exists and user has access
      const { data: incident } = await ctx.db
        .from("incidents")
        .select("reporter_id, worker_id")
        .eq("id", input.incidentId)
        .single();

      if (!incident) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Incident not found" });
      }

      const inc = incident as Record<string, unknown>;
      if (
        inc.reporter_id !== ctx.session.userId &&
        inc.worker_id !== ctx.session.userId &&
        ctx.session.role !== "admin"
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this evidence" });
      }

      // Verify the path belongs to this incident
      if (!input.storagePath.startsWith(`${input.incidentId}/`)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid storage path for this incident" });
      }

      const { data, error } = await ctx.db.storage
        .from(EVIDENCE_BUCKET)
        .createSignedUrl(input.storagePath, SIGNED_URL_EXPIRY);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate download URL",
        });
      }

      return {
        signedUrl: data.signedUrl,
        expiresIn: SIGNED_URL_EXPIRY,
      };
    }),

  /**
   * List evidence files for an incident.
   *
   * Access control: reporter, subject worker, or admin.
   */
  listEvidence: protectedProcedure
    .input(z.object({ incidentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify access
      const { data: incident } = await ctx.db
        .from("incidents")
        .select("reporter_id, worker_id")
        .eq("id", input.incidentId)
        .single();

      if (!incident) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Incident not found" });
      }

      const inc = incident as Record<string, unknown>;
      if (
        inc.reporter_id !== ctx.session.userId &&
        inc.worker_id !== ctx.session.userId &&
        ctx.session.role !== "admin"
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      // List from incident_evidence table (metadata)
      const { data, error } = await ctx.db
        .from("incident_evidence")
        .select("id, type, storage_path, uploaded_at")
        .eq("incident_id", input.incidentId)
        .order("uploaded_at", { ascending: true });

      if (error) throw error;
      return { evidence: data ?? [] };
    }),
});
