import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { createClient } from "@verifyme/db";

export interface Context {
  session: {
    userId: string;
    role: "worker" | "hirer" | "admin";
    authMode: "supabase" | "dev";
  } | null;
  db: ReturnType<typeof createClient>;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

const enforceAuth = middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

const enforceAdmin = middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
  }
  if (ctx.session.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

export const adminProcedure = t.procedure.use(enforceAdmin);

/**
 * Audit logging middleware — logs mutations and sensitive queries to audit_log table.
 */
export const withAuditLog = middleware(async ({ ctx, next, path, type }) => {
  const result = await next();
  if (ctx.session) {
    const action = `${type}:${path}`;
    // Write to audit_log table — non-blocking, errors are swallowed
    ctx.db.from("audit_log").insert({
      actor_id: ctx.session.userId,
      action,
      resource_type: path.split(".")[0] ?? "unknown",
      resource_id: "n/a",
      metadata: { type, path },
      created_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.error("[AUDIT] Failed to write audit log:", error.message);
    });
  }
  return result;
});

export const auditedProcedure = protectedProcedure.use(withAuditLog);
export const auditedAdminProcedure = adminProcedure.use(withAuditLog);
