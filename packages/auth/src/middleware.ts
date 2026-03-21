/**
 * Auth middleware for tRPC — dual-mode session extraction.
 *
 * PRIMARY PATH: Supabase Auth JWT verification via supabase.auth.getUser().
 * When a valid Supabase JWT is present, the user's Supabase Auth UID is used
 * and their role is looked up from the users table.
 *
 * FALLBACK PATH: HMAC-signed dev tokens (DEV/TEST ONLY).
 * Allowed only when APP_ENV is "development" or "test".
 * Blocked in staging and production — will log a warning and return null.
 *
 * ENVIRONMENT GATING:
 * - APP_ENV=development | test → dev auth allowed
 * - APP_ENV=staging | production → dev auth BLOCKED, Supabase Auth required
 * - If APP_ENV is not set, defaults to "development" (dev auth allowed)
 */
import { createHmac, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const DEV_AUTH_SECRET = process.env.DEV_AUTH_SECRET || "safehire-dev-secret-change-in-production";

export type AuthMode = "supabase" | "dev";

export interface SessionPayload {
  userId: string;
  role: "worker" | "hirer" | "admin";
  authMode: AuthMode;
}

interface DevTokenPayload {
  sub: string;
  role: "worker" | "hirer" | "admin";
  iat: number;
}

/**
 * Check if dev auth is allowed in the current environment.
 */
export function isDevAuthAllowed(): boolean {
  const env = process.env.APP_ENV;
  if (env === "staging" || env === "production") return false;
  return true; // development, test, or unset
}

/**
 * DEV AUTH: Create an HMAC-signed dev token.
 * Throws if called in staging/production.
 */
export function createDevToken(userId: string, role: "worker" | "hirer" | "admin"): string {
  if (!isDevAuthAllowed()) {
    throw new Error(
      `[AUTH] Dev token creation is BLOCKED in ${process.env.APP_ENV} environment. ` +
      `Use Supabase Auth for real authentication.`
    );
  }

  const payload: DevTokenPayload = {
    sub: userId,
    role,
    iat: Date.now(),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", DEV_AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

/**
 * DEV AUTH: Verify an HMAC-signed dev token.
 * Returns null if called in staging/production (dev auth blocked).
 */
export function verifyDevToken(token: string): DevTokenPayload | null {
  if (!isDevAuthAllowed()) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return null;

  const expectedSignature = createHmac("sha256", DEV_AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");

  try {
    const sigBuffer = Buffer.from(signature, "base64url");
    const expectedBuffer = Buffer.from(expectedSignature, "base64url");
    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;
  } catch {
    return null;
  }

  try {
    const decoded = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const parsed = JSON.parse(decoded) as DevTokenPayload;
    if (!parsed.sub || !parsed.role) return null;

    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.iat > maxAge) return null;

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Try to extract a session from a Supabase Auth JWT.
 */
async function extractSupabaseSession(
  token: string,
  supabaseClient: SupabaseClient
): Promise<SessionPayload | null> {
  if (token.split(".").length !== 3) return null;

  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error || !user) return null;

    const { data: dbUser } = await supabaseClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!dbUser) return null;
    const role = (dbUser as Record<string, unknown>).role as "worker" | "hirer" | "admin";

    return {
      userId: user.id,
      role,
      authMode: "supabase",
    };
  } catch {
    return null;
  }
}

/**
 * Extract session from request headers.
 *
 * 1. Tries Supabase Auth JWT (always)
 * 2. Falls back to dev HMAC token (only in development/test)
 *
 * In staging/production, if no valid Supabase JWT is found, returns null.
 * The app will not authenticate dev tokens in those environments.
 */
export async function extractSession(
  headers: Record<string, string | string[] | undefined>,
  supabaseClient?: SupabaseClient
): Promise<SessionPayload | null> {
  const authHeader = headers["authorization"];
  if (!authHeader || typeof authHeader !== "string") return null;

  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (!token) return null;

  // 1. Try Supabase Auth JWT (primary path — always attempted)
  if (supabaseClient) {
    const supabaseSession = await extractSupabaseSession(token, supabaseClient);
    if (supabaseSession) return supabaseSession;
  }

  // 2. Fall back to dev HMAC token (blocked in staging/production)
  if (!isDevAuthAllowed()) {
    // In staging/production, log that a non-Supabase token was rejected
    console.warn("[AUTH] Rejected non-Supabase token in", process.env.APP_ENV, "environment");
    return null;
  }

  const devPayload = verifyDevToken(token);
  if (devPayload) {
    return {
      userId: devPayload.sub,
      role: devPayload.role,
      authMode: "dev",
    };
  }

  return null;
}

/**
 * Create tRPC context from request headers.
 */
export async function createContext(opts: {
  headers: Record<string, string | string[] | undefined>;
  supabaseClient?: SupabaseClient;
}) {
  const session = await extractSession(opts.headers, opts.supabaseClient);
  return { session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
