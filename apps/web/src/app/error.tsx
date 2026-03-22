"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0D1B2A", margin: "0 0 8px" }}>
        Something went wrong
      </h1>
      <p style={{ color: "#636366", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
        {error.message || "An unexpected error occurred."}
      </p>
      <button onClick={reset} style={{
        padding: "12px 24px", background: "#C49A1A", color: "#fff",
        border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
      }}>
        Try again
      </button>
    </div>
  );
}
