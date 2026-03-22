import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { workerQueries, trustQueries } from "@verifyme/db";
import { ConsentManager, AuditLogger } from "@verifyme/privacy";

export const hirerRouter = router({
  /**
   * Search workers — returns non-PII fields only (name, skills, experience, verification status).
   * No consent required for search results.
   */
  /**
   * Get all job categories sorted by sort_order.
   */
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.db
      .from("job_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return { categories: data ?? [] };
  }),

  searchWorkers: protectedProcedure
    .input(z.object({
      query: z.string().optional(),
      category: z.string().optional(),
      locality: z.string().optional(),
      filters: z.object({
        skills: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional(),
        minExperienceYears: z.number().int().min(0).optional(),
        verificationTier: z.enum(["unverified", "basic", "enhanced"]).optional(),
      }).optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const result = await workerQueries.searchWorkers(ctx.db, {
        query: input.query,
        skills: input.filters?.skills,
        languages: input.filters?.languages,
        minExperienceYears: input.filters?.minExperienceYears,
        category: input.category,
        locality: input.locality,
        page: input.page,
        limit: input.limit,
      });

      // Enrich with trust card tier and average rating
      const workerIds = result.workers.map((w: Record<string, unknown>) => w.user_id as string);
      if (workerIds.length > 0) {
        const [trustCards, ratings] = await Promise.all([
          ctx.db.from("trust_cards").select("worker_id, tier, endorsement_count, incident_flag").in("worker_id", workerIds),
          ctx.db.from("ratings").select("worker_id, score").in("worker_id", workerIds),
        ]);

        const trustMap = new Map<string, Record<string, unknown>>();
        for (const tc of trustCards.data ?? []) {
          trustMap.set((tc as Record<string, unknown>).worker_id as string, tc as Record<string, unknown>);
        }

        const ratingMap = new Map<string, { total: number; count: number }>();
        for (const r of ratings.data ?? []) {
          const rid = (r as Record<string, unknown>).worker_id as string;
          const score = (r as Record<string, unknown>).score as number;
          const existing = ratingMap.get(rid) ?? { total: 0, count: 0 };
          ratingMap.set(rid, { total: existing.total + score, count: existing.count + 1 });
        }

        for (const w of result.workers as Array<Record<string, unknown>>) {
          const uid = w.user_id as string;
          const tc = trustMap.get(uid);
          if (tc) {
            w.tier = tc.tier;
            w.endorsement_count = tc.endorsement_count;
            w.incident_flag = tc.incident_flag;
          }
          const rat = ratingMap.get(uid);
          if (rat && rat.count > 0) {
            w.avg_rating = Math.round((rat.total / rat.count) * 10) / 10;
            w.rating_count = rat.count;
          }
        }
      }

      return { ...result, page: input.page, limit: input.limit };
    }),

  /**
   * View a worker's trust card.
   * Returns limited trust card data by default (tier, endorsement count, incident flag).
   * Returns expanded profile data only when the hirer has active consent.
   */
  viewTrustCard: protectedProcedure
    .input(z.object({ workerId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const card = await trustQueries.getTrustCard(ctx.db, input.workerId);
      const trustCard = card ?? {
        worker_id: input.workerId,
        tier: "unverified",
        verification_status: "pending",
        tenure_months: 0,
        endorsement_count: 0,
        incident_flag: false,
        incident_severity_max: null,
        last_computed_at: new Date().toISOString(),
      };

      // Check consent
      const consent = new ConsentManager(ctx.db);
      const consentResult = await consent.checkConsent(input.workerId, ctx.session.userId);

      // Log the data access
      const audit = new AuditLogger(ctx.db);
      await audit.logDataAccess({
        actorId: ctx.session.userId,
        resourceType: "trust_card",
        resourceId: input.workerId,
        fieldsAccessed: consentResult ? consentResult.fields : ["trust_card_summary"],
      });

      if (!consentResult) {
        // No consent — return limited view only
        return {
          trustCard,
          hasConsent: false,
          consentedFields: [] as string[],
          profile: null,
        };
      }

      // Has consent — return expanded profile for consented fields
      let profile = null;
      try {
        const workerProfile = await workerQueries.getWorkerById(ctx.db, input.workerId);
        if (workerProfile) {
          const wp = workerProfile as Record<string, unknown>;
          // Only return fields the worker consented to share
          const filtered: Record<string, unknown> = { user_id: wp.user_id };
          const consentedFields = consentResult.fields;
          if (consentedFields.includes("full_name")) filtered.full_name = wp.full_name;
          if (consentedFields.includes("skills")) filtered.skills = wp.skills;
          if (consentedFields.includes("languages")) filtered.languages = wp.languages;
          if (consentedFields.includes("experience_years")) filtered.experience_years = wp.experience_years;
          if (consentedFields.includes("photo_url")) filtered.photo_url = wp.photo_url;
          if (consentedFields.includes("verified_at")) filtered.verified_at = wp.verified_at;
          // NEVER include encrypted_aadhaar_hash in hirer views
          profile = filtered;
        }
      } catch {
        // Profile not found — that's ok
      }

      return {
        trustCard,
        hasConsent: true,
        consentedFields: consentResult.fields,
        profile,
      };
    }),

  /**
   * Request consent from a worker to view their data.
   * This creates a disclosure request that the worker can approve.
   */
  requestDisclosure: protectedProcedure
    .input(z.object({
      workerId: z.string().uuid(),
      legalBasis: z.string().min(1),
      documents: z.array(z.object({ name: z.string(), storagePath: z.string() })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.db
        .from("disclosure_requests")
        .insert({
          requester_type: "employer" as const,
          requester_id: ctx.session.userId,
          worker_id: input.workerId,
          legal_basis: input.legalBasis,
          documents: input.documents,
          status: "pending" as const,
        })
        .select()
        .single();
      if (error) throw error;
      return { success: true, requestId: (data as Record<string, unknown>)?.id as string, status: "pending" };
    }),

  /**
   * Get workers where this hirer has active consent grants.
   */
  getMyWorkers: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.db
      .from("consent_grants")
      .select("*, worker_profiles!inner(full_name, skills, experience_years)")
      .eq("hirer_id", ctx.session.userId)
      .is("revoked_at", null)
      .gte("expires_at", new Date().toISOString());

    if (error) {
      // Fallback if join fails (worker_profiles may not exist for all)
      const { data: simple, error: simpleError } = await ctx.db
        .from("consent_grants")
        .select("worker_id, fields, granted_at, expires_at")
        .eq("hirer_id", ctx.session.userId)
        .is("revoked_at", null)
        .gte("expires_at", new Date().toISOString());
      if (simpleError) throw simpleError;
      return { workers: simple ?? [], total: (simple ?? []).length };
    }
    return { workers: data ?? [], total: (data ?? []).length };
  }),
});
