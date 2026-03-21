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
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", color: "#1F2937" }}>
        <TrpcProvider>
          <AuthProvider>
            <Nav />
            <main>
              {children}
            </main>
          </AuthProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}
