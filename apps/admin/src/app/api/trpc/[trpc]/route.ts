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

      // Admin panel: always use service_role for admin operations
      // Admin access is enforced at the tRPC middleware layer (adminProcedure)
      const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

      return { session, db };
    },
  });

export { handler as GET, handler as POST };
