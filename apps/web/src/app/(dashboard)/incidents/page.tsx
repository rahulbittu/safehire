"use client";

export default function IncidentsPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.025em", margin: 0 }}>
          Incidents
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
          View and manage incidents you have reported.
        </p>
      </div>

      {/* Guide */}
      <div style={{
        background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12,
        padding: "16px 20px", marginBottom: 24,
      }}>
        <div style={{ fontWeight: 700, color: "#92400E", fontSize: 13, marginBottom: 4 }}>About incident reporting</div>
        <p style={{ fontSize: 13, color: "#A16207", margin: 0, lineHeight: 1.5 }}>
          SafeHire is not a blacklist. Reports are reviewed fairly. Workers are notified and can appeal.
          False reports may result in account restrictions.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>My Reports</h2>
        <a
          href="/incidents/report"
          style={{
            padding: "8px 16px", background: "#DC2626", color: "#fff",
            borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600,
          }}
        >
          Report Incident
        </a>
      </div>

      <div style={{
        border: "1px dashed #CBD5E1", borderRadius: 12, padding: 32, textAlign: "center",
      }}>
        <div style={{ fontSize: 14, color: "#64748B", marginBottom: 4 }}>No incidents reported yet.</div>
        <div style={{ fontSize: 13, color: "#94A3B8" }}>
          When you report an incident, it will appear here with its review status.
        </div>
      </div>
    </div>
  );
}
