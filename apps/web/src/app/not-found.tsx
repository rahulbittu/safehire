export default function NotFound() {
  return (
    <div style={{
      maxWidth: 520, margin: "0 auto", padding: "80px 20px",
      textAlign: "center",
    }}>
      <div style={{
        fontSize: 56, fontWeight: 800, color: "#E5E5EA",
        letterSpacing: "-0.04em", marginBottom: 8,
      }}>
        404
      </div>
      <h1 style={{
        fontSize: 22, fontWeight: 800, color: "#0D1B2A",
        margin: "0 0 8px", letterSpacing: "-0.02em",
      }}>
        Page not found
      </h1>
      <p style={{ color: "#636366", fontSize: 15, marginBottom: 28, lineHeight: 1.5 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <a
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", padding: "12px 24px",
            background: "#C49A1A", color: "#fff", borderRadius: 12,
            textDecoration: "none", fontSize: 14, fontWeight: 700,
          }}
        >
          Go home
        </a>
        <a
          href="/login"
          style={{
            display: "inline-flex", alignItems: "center", padding: "12px 24px",
            background: "#F7F6F3", color: "#0D1B2A", borderRadius: 12,
            textDecoration: "none", fontSize: 14, fontWeight: 700,
            border: "1px solid #E5E5EA",
          }}
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
