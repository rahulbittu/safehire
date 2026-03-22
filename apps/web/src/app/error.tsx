"use client";

const C = { amber: "#C49A1A", navy: "#0D1B2A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA" };

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 8px" }}>
        Something went wrong
      </h1>
      <p style={{ color: C.sub, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        style={{
          padding: "12px 28px", background: C.amber, color: "#fff",
          border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
