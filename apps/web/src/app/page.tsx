"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("verifyme-token");
    if (token) router.replace("/dashboard"); else setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <div style={{ background: "#fff" }}>
      {/* Hero */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "72px 20px 56px", textAlign: "center" }}>
        <div style={{
          display: "inline-block", padding: "6px 16px", borderRadius: 99,
          background: "#FDF6E8", color: "#C49A1A", fontSize: 13, fontWeight: 700,
          marginBottom: 24,
        }}>
          Trusted by workers across India
        </div>
        <h1 className="hero-title" style={{
          fontSize: 44, fontWeight: 800, lineHeight: 1.15,
          color: "#0D1B2A", margin: "0 0 16px", letterSpacing: "-0.03em",
        }}>
          Your work speaks for itself
        </h1>
        <p className="hero-subtitle" style={{
          fontSize: 18, color: "#636366", lineHeight: 1.7,
          margin: "0 auto 36px", maxWidth: 480,
        }}>
          Build a trust profile that follows you. Get endorsed by people you&apos;ve worked with. No blacklists, no middlemen — just your reputation.
        </p>
        <div className="cta-buttons" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <a href="/login" style={{
            padding: "14px 32px", background: "#C49A1A", color: "#fff",
            borderRadius: 12, textDecoration: "none", fontSize: 16, fontWeight: 700,
          }}>
            Create your profile
          </a>
          <a href="#how-it-works" style={{
            padding: "14px 32px", background: "#F7F6F3", color: "#0D1B2A",
            borderRadius: 12, textDecoration: "none", fontSize: 16, fontWeight: 600,
            border: "1px solid #E5E5EA",
          }}>
            How it works
          </a>
        </div>
      </section>

      {/* Demo card */}
      <section style={{ maxWidth: 420, margin: "0 auto", padding: "0 20px 56px" }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid #E5E5EA",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #C49A1A, #F0C84A)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700,
            }}>P</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#0D1B2A", fontSize: 16 }}>Priya Sharma</div>
              <div style={{ fontSize: 13, color: "#636366" }}>Cooking · Cleaning · Childcare</div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 800, color: "#C49A1A",
              background: "#FDF6E8", padding: "4px 10px", borderRadius: 99,
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}>Enhanced</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { v: "4", l: "Endorsements" },
              { v: "18mo", l: "Tenure" },
              { v: "6yr", l: "Experience" },
            ].map((s) => (
              <div key={s.l} style={{ background: "#F7F6F3", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A" }}>{s.v}</div>
                <div style={{ fontSize: 10, color: "#8E8E93", marginTop: 2, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust pillars */}
      <section style={{ borderTop: "1px solid #E5E5EA", borderBottom: "1px solid #E5E5EA", padding: "32px 20px", background: "#FAFAF8" }}>
        <div className="trust-bar" style={{ maxWidth: 640, margin: "0 auto", display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
          {[
            ["🔐", "Worker-owned", "Your profile belongs to you"],
            ["✅", "Consent-first", "You decide who sees your data"],
            ["🛡️", "No blacklists", "Fair trust, not punishment"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ textAlign: "center", maxWidth: 180 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0D1B2A" }}>{title}</div>
              <div style={{ fontSize: 13, color: "#636366", marginTop: 2 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ maxWidth: 640, margin: "0 auto", padding: "64px 20px" }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: "#0D1B2A", textAlign: "center", marginBottom: 40, letterSpacing: "-0.02em" }}>
          How SafeHire works
        </h2>
        <div style={{ display: "grid", gap: 16 }}>
          {[
            { n: "1", title: "Create your profile", desc: "Add your skills, experience, languages. Takes less than a minute. Your data is encrypted.", color: "#C49A1A" },
            { n: "2", title: "Get endorsed", desc: "Hirers you've worked with can endorse you. Real reviews from real people — not fake ratings.", color: "#34C759" },
            { n: "3", title: "Share with consent", desc: "When a hirer wants your details, you decide. Approve or reject every request.", color: "#007AFF" },
          ].map((item) => (
            <div key={item.n} style={{
              background: "#fff", borderRadius: 14, padding: 24,
              display: "flex", gap: 18, alignItems: "start",
              border: "1px solid #E5E5EA",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: item.color, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 800,
              }}>{item.n}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#0D1B2A", marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 14, color: "#636366", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two audiences */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 64px" }}>
        <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ borderRadius: 14, padding: 28, background: "#FDF6E8", border: "1px solid #F0C84A33" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#C49A1A", letterSpacing: "0.06em", marginBottom: 10 }}>
              For Workers
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0D1B2A", marginBottom: 12 }}>
              Your work, your identity
            </div>
            {["Portable profile", "You control your data", "Build real trust", "No unfair blacklists"].map((t) => (
              <div key={t} style={{ display: "flex", gap: 8, fontSize: 14, color: "#636366", marginBottom: 6 }}>
                <span style={{ color: "#C49A1A" }}>→</span> {t}
              </div>
            ))}
          </div>
          <div style={{ borderRadius: 14, padding: 28, background: "#F0F7FF", border: "1px solid #007AFF22" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#007AFF", letterSpacing: "0.06em", marginBottom: 10 }}>
              For Hirers
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0D1B2A", marginBottom: 12 }}>
              Hire with confidence
            </div>
            {["Verified trust signals", "Consent-based access", "Real endorsements", "Incident accountability"].map((t) => (
              <div key={t} style={{ display: "flex", gap: 8, fontSize: 14, color: "#636366", marginBottom: 6 }}>
                <span style={{ color: "#007AFF" }}>→</span> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#0D1B2A", padding: "56px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 10 }}>
          Start building your trust profile
        </h2>
        <p style={{ fontSize: 15, color: "#8E8E93", marginBottom: 28 }}>
          Free for workers. Always.
        </p>
        <a href="/login" style={{
          display: "inline-flex", padding: "14px 32px",
          background: "#C49A1A", color: "#fff", borderRadius: 12,
          textDecoration: "none", fontSize: 16, fontWeight: 700,
        }}>
          Get started
        </a>
      </section>

      <footer style={{ borderTop: "1px solid #E5E5EA", padding: 24, textAlign: "center", fontSize: 13, color: "#8E8E93" }}>
        SafeHire — Trust profiles for India&apos;s informal workforce.
      </footer>
    </div>
  );
}
