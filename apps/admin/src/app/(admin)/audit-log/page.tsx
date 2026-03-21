"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = trpc.admin.getAuditLog.useQuery({ page, limit: 50 });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Audit Log</h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>Complete audit trail of data access and administrative actions.</p>

      {isLoading ? (
        <p>Loading audit log...</p>
      ) : (data?.entries.length ?? 0) === 0 ? (
        <p style={{ color: "#9CA3AF", padding: 32, textAlign: "center" }}>No audit log entries.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr>
              {["Timestamp", "Actor", "Action", "Resource", "IP"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", borderBottom: "2px solid #E5E7EB", fontSize: 13, color: "#6B7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.entries.map((entry: any) => (
              <tr key={entry.id}>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>{new Date(entry.created_at).toLocaleString()}</td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>{entry.actor_id?.slice(0, 8)}...</td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>{entry.action}</td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>{entry.resource_type}:{entry.resource_id?.slice(0, 8)}</td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>{entry.ip_address || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #D1D5DB", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>Previous</button>
        <span style={{ padding: "8px 16px", fontSize: 14, color: "#6B7280" }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #D1D5DB", background: "#fff", cursor: "pointer" }}>Next</button>
      </div>
    </div>
  );
}
