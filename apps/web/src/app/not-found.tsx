export default function NotFound() {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, fontWeight: 800, color: "#E5E5EA", marginBottom: 8 }}>404</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0D1B2A", margin: "0 0 8px" }}>Page not found</h1>
      <p style={{ color: "#636366", fontSize: 14, marginBottom: 24 }}>
        This page doesn&apos;t exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <a href="/" style={{
          padding: "10px 20px", background: "#C49A1A", color: "#fff",
          borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 700,
        }}>Go home</a>
        <a href="/login" style={{
          padding: "10px 20px", background: "#fff", color: "#0D1B2A",
          borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600,
          border: "1px solid #E5E5EA",
        }}>Sign in</a>
      </div>
    </div>
  );
}
