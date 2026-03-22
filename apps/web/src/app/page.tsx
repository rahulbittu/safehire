"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const C = { amber: "#C49A1A", navy: "#0D1B2A", green: "#16A34A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

const CATEGORIES = [
  { slug: "maid", label: "Maid", icon: "🏠" },
  { slug: "cook", label: "Cook", icon: "🍳" },
  { slug: "driver", label: "Driver", icon: "🚗" },
  { slug: "nanny", label: "Nanny", icon: "👶" },
  { slug: "electrician", label: "Electrician", icon: "⚡" },
  { slug: "plumber", label: "Plumber", icon: "🔧" },
  { slug: "cleaner", label: "Cleaner", icon: "✨" },
  { slug: "security", label: "Security", icon: "🛡" },
  { slug: "technician", label: "Technician", icon: "🔩" },
  { slug: "painter", label: "Painter", icon: "🎨" },
];

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
      {/* UAT Banner */}
      <div style={{
        background: C.navy, padding: "8px 20px", textAlign: "center",
        fontSize: 12, color: "#fff", fontWeight: 600, letterSpacing: "0.02em",
      }}>
        Product preview — use demo accounts to explore
      </div>

      {/* Hero */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px 32px" }}>
        <h1 className="hero-title" style={{
          fontSize: 36, fontWeight: 800, lineHeight: 1.15,
          color: C.navy, margin: "0 0 12px", letterSpacing: "-0.03em",
        }}>
          Trusted help,<br />verified workers
        </h1>
        <p className="hero-subtitle" style={{
          fontSize: 16, color: C.sub, lineHeight: 1.6,
          margin: "0 0 28px", maxWidth: 420,
        }}>
          India&apos;s first trust platform for domestic hiring. Workers carry verified trust cards. Hirers get reliable signals. Agencies manage rosters.
        </p>

        {/* Three actor paths */}
        <div style={{ display: "grid", gap: 10, marginBottom: 40 }}>
          <a href="/login?role=hirer" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 20px", background: C.amber,
            border: `2px solid ${C.amber}`, borderRadius: 12,
            textDecoration: "none",
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>I need to hire someone</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>Search by category, check trust cards</div>
            </div>
            <span style={{ fontSize: 20, color: "#fff" }}>→</span>
          </a>
          <a href="/login?role=worker" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 20px", background: "#fff",
            border: `2px solid ${C.amber}`, borderRadius: 12,
            textDecoration: "none",
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.amber }}>I&apos;m a worker</div>
              <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>Get verified, build your trust card</div>
            </div>
            <span style={{ fontSize: 20, color: C.amber }}>→</span>
          </a>
          <a href="/login?role=agency" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 20px", background: "#fff",
            border: `2px solid ${C.border}`, borderRadius: 12,
            textDecoration: "none",
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>I run an agency</div>
              <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>Manage your worker roster and bookings</div>
            </div>
            <span style={{ fontSize: 20, color: C.muted }}>→</span>
          </a>
        </div>
      </section>

      {/* Category grid */}
      <section style={{ borderTop: `1px solid ${C.border}`, background: C.bg, padding: "40px 20px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Browse by category
          </div>
          <div className="grid-cat" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {CATEGORIES.map((cat) => (
              <a key={cat.slug} href={`/search?category=${cat.slug}`} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "16px 8px", background: "#fff", borderRadius: 12,
                border: `1px solid ${C.border}`, textDecoration: "none",
              }}>
                <span style={{ fontSize: 24, marginBottom: 6 }}>{cat.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{cat.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ borderTop: `1px solid ${C.border}`, padding: "40px 20px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
            How it works
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            {[
              { n: "1", title: "Worker creates a trust card", desc: "Name, category, area, experience. 60 seconds. Data is encrypted and worker-owned." },
              { n: "2", title: "10-step verification builds trust", desc: "Phone → selfie → ID → face match → address → emergency contact → category → reference → agency review → re-verification." },
              { n: "3", title: "Hirers search by category & area", desc: "Find a cook in Koramangala, a driver in Indiranagar. Check verification progress and ratings before hiring." },
            ].map((item) => (
              <div key={item.n} style={{ display: "flex", gap: 14, alignItems: "start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: C.navy, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800,
                }}>{item.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample trust card */}
      <section style={{ padding: "40px 20px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
            Sample trust card
          </div>
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>Priya Sharma</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Cook · Koramangala, Bangalore</div>
              </div>
              <div style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: "#DCFCE7", color: C.green, textTransform: "uppercase" }}>
                8/10 verified
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: `1px solid ${C.border}` }}>
              {[
                { v: "6 yr", l: "Experience" },
                { v: "4.5 ★", l: "Rating" },
                { v: "4", l: "References" },
              ].map((s) => (
                <div key={s.l} style={{ padding: "12px 10px", textAlign: "center", borderRight: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.muted }}>Agency-backed · HomeServe Bangalore</span>
              <span style={{ fontSize: 11, color: C.muted }}>Consent required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust principles */}
      <section style={{ padding: "40px 20px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Why SafeHire
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              { title: "Not a blacklist", desc: "Workers own their data. Incident reports are reviewed fairly. Workers can always appeal." },
              { title: "Consent before access", desc: "Hirers must request permission. Workers approve or reject every request." },
              { title: "Verification, not vanity", desc: "10 real verification steps. No fake reviews. No pay-to-rank. Trust is earned." },
            ].map((item) => (
              <div key={item.title} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", border: `1px solid ${C.border}` }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: C.navy, padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
          Ready to get started?
        </div>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Free for workers. Always.</p>
        <a href="/login" style={{
          display: "inline-flex", padding: "12px 24px",
          background: C.amber, color: "#fff", borderRadius: 10,
          textDecoration: "none", fontSize: 14, fontWeight: 700,
        }}>
          Create your trust card
        </a>
      </section>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "16px 20px", textAlign: "center", fontSize: 11, color: C.muted }}>
        SafeHire — Verified trust for India&apos;s domestic workforce
      </footer>
    </div>
  );
}
