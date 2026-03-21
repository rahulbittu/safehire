export default function NotFound() {
  return (
    <div style={{
      maxWidth: 480, margin: "0 auto", padding: "80px 24px",
      textAlign: "center",
    }}>
      <div style={{
        fontSize: 56, fontWeight: 800, color: "#E2E8F0",
        letterSpacing: "-0.04em", marginBottom: 8,
      }}>
        404
      </div>
      <h1 style={{
        fontSize: 22, fontWeight: 700, color: "#0F172A",
        margin: "0 0 8px", letterSpacing: "-0.02em",
      }}>
        Page not found
      </h1>
      <p style={{ color: "#64748B", fontSize: 15, marginBottom: 28, lineHeight: 1.5 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <a
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", padding: "12px 24px",
            background: "#1D4ED8", color: "#fff", borderRadius: 8,
            textDecoration: "none", fontSize: 14, fontWeight: 600,
          }}
        >
          Go home
        </a>
        <a
          href="/login"
          style={{
            display: "inline-flex", alignItems: "center", padding: "12px 24px",
            background: "#F1F5F9", color: "#334155", borderRadius: 8,
            textDecoration: "none", fontSize: 14, fontWeight: 600,
          }}
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
