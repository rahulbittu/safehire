import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TrpcProvider } from "@/lib/trpc-provider";
import { AuthProvider } from "@verifyme/auth";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeHire — Trust profiles workers own and control",
  description: "Privacy-first verified trust identities for India's informal workforce.",
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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        margin: 0,
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#0D1B2A",
        background: "#F7F6F3",
      }}>
        <TrpcProvider>
          <AuthProvider>
            <Nav />
            <main>{children}</main>
          </AuthProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}
