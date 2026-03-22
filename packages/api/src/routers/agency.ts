import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const agencyRouter = router({
  /**
   * Get agency by the current user's ID (for agency owners).
   */
  getAgency: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.db
      .from("agencies")
      .select("*")
      .eq("user_id", ctx.session.userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return { agency: data ?? null };
  }),

  /**
   * Get agency by agency ID (for public viewing).
   */
  getAgencyPublic: protectedProcedure
    .input(z.object({ agencyId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.db
        .from("agencies")
        .select("id, name, description, categories, localities, contact_phone, worker_count, verified_at, created_at")
        .eq("id", input.agencyId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return { agency: data ?? null };
    }),

  /**
   * Search agencies by category and/or locality.
   */
  searchAgencies: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      locality: z.string().optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      let queryBuilder = ctx.db
        .from("agencies")
        .select("id, name, description, categories, localities, contact_phone, worker_count, verified_at, created_at", {
          count: "exact",
        });

      if (input.category) {
        queryBuilder = queryBuilder.contains("categories", JSON.stringify([input.category]));
      }

      if (input.locality) {
        queryBuilder = queryBuilder.contains("localities", JSON.stringify([input.locality]));
      }

      const offset = (input.page - 1) * input.limit;
      queryBuilder = queryBuilder.range(offset, offset + input.limit - 1);

      const { data, error, count } = await queryBuilder;

      if (error) throw error;
      return { agencies: data ?? [], total: count ?? 0, page: input.page, limit: input.limit };
    }),

  /**
   * Get workers managed by an agency.
   */
  getAgencyWorkers: protectedProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const { data, error, count } = await ctx.db
        .from("worker_profiles")
        .select("id, user_id, full_name, skills, languages, experience_years, verified_at, category, locality, availability, agency_id", {
          count: "exact",
        })
        .eq("agency_id", input.agencyId)
        .range(offset, offset + input.limit - 1);

      if (error) throw error;
      return { workers: data ?? [], total: count ?? 0, page: input.page, limit: input.limit };
    }),
});
