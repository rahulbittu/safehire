"use client";

import { trpc } from "@/lib/trpc";

export default function IncidentReviewPage() {
  const { data, isLoading } = trpc.admin.getPendingReviews.useQuery();
  const reviewMutation = trpc.admin.reviewIncident.useMutation();
  const utils = trpc.useUtils();

  const handleReview = (incidentId: string, decision: "substantiated" | "unsubstantiated" | "inconclusive") => {
    reviewMutation.mutate(
      { incidentId, decision },
      { onSuccess: () => utils.admin.getPendingReviews.invalidate() }
    );
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Incident Review Queue</h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>Review submitted incidents and make determinations.</p>

      {isLoading ? (
        <p>Loading incidents...</p>
      ) : (data?.pendingIncidents.length ?? 0) === 0 ? (
        <p style={{ color: "#9CA3AF", padding: 32, textAlign: "center" }}>No incidents pending review.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8 }}>
          <thead>
            <tr>
              {["Type", "Severity", "Status", "Reported", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", borderBottom: "2px solid #E5E7EB", fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.pendingIncidents.map((inc: any) => (
              <tr key={inc.id}>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>{inc.type}</td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>{inc.severity}</td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>{inc.status}</td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>{new Date(inc.reported_at).toLocaleDateString()}</td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => handleReview(inc.id, "substantiated")} style={{ padding: "4px 8px", background: "#DC2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                      Substantiate
                    </button>
                    <button onClick={() => handleReview(inc.id, "unsubstantiated")} style={{ padding: "4px 8px", background: "#16A34A", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                      Dismiss
                    </button>
                    <button onClick={() => handleReview(inc.id, "inconclusive")} style={{ padding: "4px 8px", background: "#6B7280", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                      Inconclusive
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
