import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TrpcProvider } from "@/lib/trpc-provider";
import { AuthProvider } from "@verifyme/auth";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Verify Me — Trusted Worker Platform",
  description: "Privacy-first worker trust platform for India.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", color: "#1F2937" }}>
        <TrpcProvider>
          <AuthProvider>
            <Nav />
            <main style={{ padding: 24 }}>
              {children}
            </main>
          </AuthProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}
