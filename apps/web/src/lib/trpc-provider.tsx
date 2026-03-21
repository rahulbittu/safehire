"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "./trpc";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return "http://localhost:3000";
}

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          async headers() {
            // Try dev token from localStorage
            const devToken = typeof window !== "undefined"
              ? localStorage.getItem("verifyme-token")
              : null;
            if (devToken) {
              return { authorization: `Bearer ${devToken}` };
            }

            // Try Supabase Auth session
            if (typeof window !== "undefined") {
              try {
                const { createClient } = await import("@supabase/supabase-js");
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                if (url && anonKey) {
                  const supabase = createClient(url, anonKey);
                  const { data: { session } } = await supabase.auth.getSession();
                  if (session?.access_token) {
                    return { authorization: `Bearer ${session.access_token}` };
                  }
                }
              } catch {
                // Supabase not configured — no auth header
              }
            }

            return {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
