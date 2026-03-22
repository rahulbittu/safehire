"use client";

const C = { amber: "#C49A1A", navy: "#0D1B2A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

export default function IncidentsPage() {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, letterSpacing: "-0.02em", margin: 0 }}>
          Incidents
        </h1>
        <p style={{ color: C.sub, fontSize: 14, marginTop: 4 }}>
          View and manage incidents you have reported.
        </p>
      </div>

      {/* Guide */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: 18,
        marginBottom: 14, borderLeft: `3px solid ${C.amber}`,
        border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <div style={{ fontWeight: 800, color: C.amber, fontSize: 14, marginBottom: 4 }}>About incident reporting</div>
        <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: 1.6 }}>
          SafeHire is not a blacklist. Reports are reviewed fairly. Workers are notified and can appeal.
          False reports may result in account restrictions.
        </p>
      </div>

      <div style={{
        background: "#fff", borderRadius: 14, padding: 18,
        border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>My Reports</div>
          <a
            href="/incidents/report"
            style={{
              padding: "8px 18px", background: "#FF3B30", color: "#fff",
              borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 700,
            }}
          >
            Report Incident
          </a>
        </div>

        <div style={{ padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: C.sub, marginBottom: 4 }}>No incidents reported yet.</div>
          <div style={{ fontSize: 13, color: C.muted }}>
            When you report an incident, it will appear here with its review status.
          </div>
        </div>
      </div>
    </div>
  );
}
