import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@verifyme/api";
import { createClient } from "@verifyme/db";
import { extractSession } from "@verifyme/auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async ({ req }) => {
      // Service-role client for JWT verification and role lookup
      const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

      // Extract session — tries Supabase Auth JWT first, then dev HMAC token
      const session = await extractSession(
        { authorization: req.headers.get("authorization") ?? undefined },
        serviceClient
      );

      // Choose DB client based on auth mode:
      // - Supabase Auth: use anon key + user's JWT for RLS enforcement
      // - Dev auth: use service_role (bypasses RLS — auth is at tRPC layer)
      let db;
      if (session?.authMode === "supabase") {
        // Per-user client: RLS policies apply using the user's JWT
        const accessToken = req.headers.get("authorization")?.slice(7) ?? "";
        db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        await db.auth.setSession({
          access_token: accessToken,
          refresh_token: "",
        });
      } else {
        // Dev auth: service_role bypasses RLS (auth enforced at tRPC middleware layer)
        // NOTE: This means RLS policies are NOT enforced in dev auth mode.
        // In production, all auth should go through Supabase Auth.
        db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
      }

      return { session, db };
    },
  });

export { handler as GET, handler as POST };
