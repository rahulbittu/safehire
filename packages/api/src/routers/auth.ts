import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import { createDevToken, isDevAuthAllowed } from "@verifyme/auth";

export const authRouter = router({
  /**
   * Register a new user by phone number.
   *
   * DEV AUTH ONLY — blocked in staging/production.
   * In Supabase Auth mode, user creation happens via supabase.auth.signInWithOtp().
   */
  register: publicProcedure
    .input(z.object({
      phone: z.string().min(10).max(15),
      role: z.enum(["worker", "hirer"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!isDevAuthAllowed()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Dev auth registration is disabled in this environment. Use Supabase Auth.",
        });
      }

      const { data, error } = await ctx.db
        .from("users")
        .insert({
          phone: input.phone,
          role: input.role,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          const { data: existing } = await ctx.db
            .from("users")
            .select("id")
            .eq("phone", input.phone)
            .single();
          return { success: true, userId: (existing as Record<string, unknown>)?.id as string, message: "User already exists" };
        }
        throw error;
      }
      return { success: true, userId: (data as Record<string, unknown>)?.id as string, message: "User created" };
    }),

  /**
   * Verify OTP and return an HMAC-signed session token.
   *
   * DEV AUTH ONLY — blocked in staging/production.
   * Accepts "123456" as valid OTP. Not for production.
   */
  verifyOtp: publicProcedure
    .input(z.object({
      phone: z.string().min(10).max(15),
      otp: z.string().length(6),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!isDevAuthAllowed()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Dev auth OTP verification is disabled in this environment. Use Supabase Auth.",
        });
      }

      if (input.otp !== "123456") {
        return { success: false, session: null, message: "Invalid OTP" };
      }

      const { data: user } = await ctx.db
        .from("users")
        .select("id, role")
        .eq("phone", input.phone)
        .single();

      if (!user) {
        return { success: false, session: null, message: "User not found. Register first." };
      }

      const u = user as Record<string, unknown>;
      const userId = u.id as string;
      const role = u.role as "worker" | "hirer" | "admin";

      const token = createDevToken(userId, role);

      return {
        success: true,
        session: { userId, role, token },
      };
    }),

  /**
   * Get current session info.
   * Works with both Supabase Auth and dev auth tokens.
   */
  getSession: publicProcedure.query(({ ctx }) => {
    if (!ctx.session) {
      return { session: null, authMode: null };
    }
    return {
      session: {
        userId: ctx.session.userId,
        role: ctx.session.role,
      },
      authMode: ctx.session.authMode,
    };
  }),

  /**
   * Logout.
   */
  logout: publicProcedure.mutation(() => {
    return { success: true };
  }),
});
