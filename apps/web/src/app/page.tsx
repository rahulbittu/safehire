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
  const [locality, setLocality] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("verifyme-token");
    if (token) router.replace("/dashboard"); else setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <div style={{ background: "#fff" }}>
      {/* UAT Banner */}
      <div style={{
        background: C.navy, padding: "6px 20px", textAlign: "center",
        fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500,
      }}>
        Product preview — <a href="/login" style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>sign in with demo accounts</a> to explore
      </div>

      {/* Hero */}
      <section style={{ maxWidth: 520, margin: "0 auto", padding: "44px 20px 0" }}>
        <h1 className="hero-title" style={{
          fontSize: 34, fontWeight: 800, lineHeight: 1.15,
          color: C.navy, margin: "0 0 10px", letterSpacing: "-0.03em",
        }}>
          Find trusted help<br />in your area
        </h1>
        <p style={{
          fontSize: 15, color: C.sub, lineHeight: 1.6,
          margin: "0 0 24px", maxWidth: 400,
        }}>
          Search verified cooks, drivers, maids, nannies, and more — by category and locality. Workers carry trust cards. You see real signals.
        </p>
      </section>

      {/* Category + locality search — the real entry point */}
      <section style={{ maxWidth: 520, margin: "0 auto", padding: "0 20px 32px" }}>
        <div style={{
          background: "#fff", borderRadius: 14, border: `2px solid ${C.amber}`,
          padding: "20px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 12 }}>What do you need?</div>
          <div className="grid-cat" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
            {CATEGORIES.map((cat) => (
              <a key={cat.slug} href={`/search?category=${cat.slug}${locality ? `&locality=${encodeURIComponent(locality)}` : ""}`} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "10px 4px", background: C.bg, borderRadius: 10,
                border: `1px solid ${C.border}`, textDecoration: "none",
                cursor: "pointer",
              }}>
                <span style={{ fontSize: 20, marginBottom: 3 }}>{cat.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{cat.label}</span>
              </a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Your area (e.g. Koramangala, HSR Layout)"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              style={{
                flex: 1, padding: "12px 14px", border: `1px solid ${C.border}`,
                borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box",
              }}
            />
            <a href={`/search${locality ? `?locality=${encodeURIComponent(locality)}` : ""}`} style={{
              padding: "12px 20px", background: C.amber, color: "#fff",
              borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none",
              display: "flex", alignItems: "center", whiteSpace: "nowrap",
            }}>
              Search all
            </a>
          </div>
        </div>

        {/* Actor paths — secondary, below search */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} className="grid-2col">
          <a href="/login?role=worker" style={{
            padding: "16px", background: "#fff", border: `1px solid ${C.border}`,
            borderRadius: 12, textDecoration: "none",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 2 }}>I&apos;m a worker</div>
            <div style={{ fontSize: 12, color: C.sub }}>Get verified, get hired faster</div>
          </a>
          <a href="/login?role=agency" style={{
            padding: "16px", background: "#fff", border: `1px solid ${C.border}`,
            borderRadius: 12, textDecoration: "none",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 2 }}>I run an agency</div>
            <div style={{ fontSize: 12, color: C.sub }}>Manage workers and bookings</div>
          </a>
        </div>
      </section>

      {/* How it works */}
      <section style={{ borderTop: `1px solid ${C.border}`, background: C.bg, padding: "36px 20px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            How it works
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            {[
              { n: "1", title: "Workers create a trust card", desc: "Category, area, experience. Verified through a 10-step process. Data is encrypted and worker-owned." },
              { n: "2", title: "Hirers search by category and area", desc: "Find a cook in Koramangala, a driver in Indiranagar. See verification progress, ratings, and availability." },
              { n: "3", title: "Hire with confidence", desc: "Check trust cards, read ratings from past employers, and connect directly. No middlemen, no blacklists." },
            ].map((item) => (
              <div key={item.n} style={{ display: "flex", gap: 12, alignItems: "start" }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  background: C.navy, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800,
                }}>{item.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample trust card */}
      <section style={{ padding: "36px 20px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            What a trust card looks like
          </div>
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>Priya Sharma</div>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Cook · Koramangala, Bangalore</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#DCFCE7", color: C.green, textTransform: "uppercase" }}>8/10</span>
                  <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#DBEAFE", color: "#1D4ED8", textTransform: "uppercase" }}>Agency</span>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderBottom: `1px solid ${C.border}` }} className="grid-4col">
              {[
                { v: "6 yr", l: "Exp" },
                { v: "4.5 ★", l: "Rating" },
                { v: "4", l: "Refs" },
                { v: "Available", l: "Status" },
              ].map((s) => (
                <div key={s.l} style={{ padding: "10px 6px", textAlign: "center", borderRight: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "8px 16px", fontSize: 11, color: C.muted, display: "flex", justifyContent: "space-between" }}>
              <span>HomeServe Bangalore</span>
              <span>Hindi · English</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust principles */}
      <section style={{ padding: "36px 20px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
            Why SafeHire
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="grid-2col">
            {[
              { title: "Not a blacklist", desc: "Reports are reviewed fairly. Workers can appeal." },
              { title: "Consent required", desc: "Workers approve every access request." },
              { title: "Verification earned", desc: "10 real steps. No pay-to-rank." },
              { title: "Free for workers", desc: "Always free. Workers own their data." },
            ].map((item) => (
              <div key={item.title} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.navy, marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: C.navy, padding: "36px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
          Ready to get started?
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 18 }}>Free for workers. Always.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/login?role=hirer" style={{
            padding: "11px 22px", background: C.amber, color: "#fff", borderRadius: 10,
            textDecoration: "none", fontSize: 14, fontWeight: 700,
          }}>
            Find help now
          </a>
          <a href="/login?role=worker" style={{
            padding: "11px 22px", background: "transparent", color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10,
            textDecoration: "none", fontSize: 14, fontWeight: 600,
          }}>
            Create your trust card
          </a>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "14px 20px", textAlign: "center", fontSize: 11, color: C.muted }}>
        SafeHire — Verified trust for India&apos;s domestic workforce
      </footer>
    </div>
  );
}
