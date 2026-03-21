import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TrpcProvider } from "@/lib/trpc-provider";

export const metadata: Metadata = {
  title: "Verify Me — Admin",
  description: "Admin dashboard for the Verify Me worker trust platform.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", color: "#1F2937" }}>
        <TrpcProvider>
          <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <nav
              style={{
                width: 240,
                backgroundColor: "#111827",
                color: "#F9FAFB",
                padding: 20,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 32 }}>
                Verify Me Admin
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <NavItem href="/" label="Dashboard" />
                <NavItem href="/incidents" label="Incidents" />
                <NavItem href="/appeals" label="Appeals" />
                <NavItem href="/disclosures" label="Disclosures" />
                <NavItem href="/audit-log" label="Audit Log" />
              </ul>
            </nav>

            {/* Main content */}
            <main style={{ flex: 1, padding: 32, backgroundColor: "#F9FAFB" }}>
              {children}
            </main>
          </div>
        </TrpcProvider>
      </body>
    </html>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <li style={{ marginBottom: 8 }}>
      <a
        href={href}
        style={{
          color: "#D1D5DB",
          textDecoration: "none",
          display: "block",
          padding: "8px 12px",
          borderRadius: 6,
          fontSize: 14,
        }}
      >
        {label}
      </a>
    </li>
  );
}
