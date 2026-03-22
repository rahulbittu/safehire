"use client";

const C = { navy: "#0D1B2A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA" };

export default function IncidentsPage() {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Incident reports
        </h1>
        <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>
          View and manage incidents you have reported.
        </p>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 12, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Fair reporting</div>
        <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: 1.5 }}>
          SafeHire is not a blacklist. Reports are reviewed by our team. Workers are notified and can appeal. False reports may result in account restrictions.
        </p>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>My reports</div>
          <a href="/incidents/report" style={{
            padding: "8px 16px", background: "#DC2626", color: "#fff",
            borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 700,
          }}>
            Report incident
          </a>
        </div>
        <div style={{ padding: "16px 0", textAlign: "center" }}>
          <div style={{ fontSize: 14, color: C.sub }}>No incidents reported.</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Reports you file will appear here with their review status.</div>
        </div>
      </div>
    </div>
  );
}
