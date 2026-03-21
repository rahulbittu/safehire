"use client";

import { trpc } from "@/lib/trpc";

export default function AdminDashboardPage() {
  const { data, isLoading } = trpc.admin.getPendingReviews.useQuery();

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <DashCard
          label="Pending Incidents"
          value={isLoading ? "..." : String(data?.pendingIncidents.length ?? 0)}
          color="#EF4444"
          href="/incidents"
        />
        <DashCard
          label="Pending Appeals"
          value={isLoading ? "..." : String(data?.pendingAppeals.length ?? 0)}
          color="#F59E0B"
          href="/appeals"
        />
        <DashCard
          label="Total Pending"
          value={isLoading ? "..." : String(data?.totalPending ?? 0)}
          color="#3B82F6"
          href="/incidents"
        />
      </div>
    </div>
  );
}

function DashCard({ label, value, color, href }: { label: string; value: string; color: string; href: string }) {
  return (
    <a href={href} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderLeft: `4px solid ${color}`, borderRadius: 8, padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>{label}</div>
      </div>
    </a>
  );
}
