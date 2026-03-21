/**
 * Environment configuration — single source of truth for environment detection.
 *
 * APP_ENV values:
 * - "development" (default): Dev auth allowed, dev crypto keys allowed, verbose logging
 * - "test": Dev auth allowed (for integration tests), dev crypto keys allowed
 * - "staging": Dev auth BLOCKED, real crypto keys REQUIRED, Supabase Auth REQUIRED
 * - "production": Dev auth BLOCKED, real crypto keys REQUIRED, Supabase Auth REQUIRED
 *
 * NODE_ENV is NOT used for this because it controls build optimizations, not security policy.
 * APP_ENV explicitly controls security behavior.
 */

export type AppEnv = "development" | "test" | "staging" | "production";

/**
 * Get the current application environment.
 * Defaults to "development" if APP_ENV is not set.
 */
export function getAppEnv(): AppEnv {
  const env = process.env.APP_ENV;
  if (env === "production" || env === "staging" || env === "test") {
    return env;
  }
  return "development";
}

/**
 * Whether dev auth (HMAC tokens, static OTP) is allowed in this environment.
 * Only allowed in development and test environments.
 */
export function isDevAuthAllowed(): boolean {
  const env = getAppEnv();
  return env === "development" || env === "test";
}

/**
 * Whether this environment requires real (production-grade) security.
 * True for staging and production.
 */
export function requiresRealSecurity(): boolean {
  const env = getAppEnv();
  return env === "staging" || env === "production";
}

/**
 * Assert that a required env var is set. Throws with a clear message if not.
 * Use this for security-critical config in staging/production.
 */
export function requireEnvVar(name: string, context: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[${getAppEnv().toUpperCase()}] Missing required environment variable: ${name}. ` +
      `${context}. Set APP_ENV=development to use dev fallbacks.`
    );
  }
  return value;
}
