import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TrpcProvider } from "@/lib/trpc-provider";
import { AuthProvider } from "@verifyme/auth";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeHire — Trust profiles workers own and control",
  description: "Privacy-first verified trust identities for India's informal workforce. Workers own their profiles. Hirers get safety signals — with consent.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "SafeHire — Trust profiles workers own and control",
    description: "Privacy-first verified trust identities for India's informal workforce.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: "#191919",
        background: "#F4F2EE",
      }}>
        <TrpcProvider>
          <AuthProvider>
            <div style={{ background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)" }}>
              <Nav />
            </div>
            <main>
              {children}
            </main>
          </AuthProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}
