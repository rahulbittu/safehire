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

      {/* How it works — marketplace flow, not trust internals */}
      <section style={{ borderTop: `1px solid ${C.border}`, background: C.bg, padding: "36px 20px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            How it works
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            {[
              { n: "1", title: "Search by category and area", desc: "Need a cook in Koramangala? A driver in Indiranagar? Pick a category, enter your area, and see who's available." },
              { n: "2", title: "Compare ratings and verification", desc: "Every worker has a rating from past employers and a verification score. Independent workers and agency-backed workers side by side." },
              { n: "3", title: "Request, book, and hire", desc: "Found someone good? Request contact details, check availability, and hire directly. No middlemen fees on basic requests." },
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

      {/* Sample results — show what the marketplace looks like */}
      <section style={{ padding: "36px 20px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            What you see when you search
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              { name: "Priya Sharma", cat: "Cook", loc: "Koramangala", rating: "4.5 ★", exp: "6 yr", ver: "8/10", lang: "Hindi, English", agency: "HomeServe Bangalore", avail: true },
              { name: "Raju M.", cat: "Cook", loc: "Koramangala", rating: "4.2 ★", exp: "3 yr", ver: "5/10", lang: "Kannada, Hindi", agency: null, avail: true },
              { name: "Sunita Devi", cat: "Cook", loc: "HSR Layout", rating: "—", exp: "10 yr", ver: "3/10", lang: "Hindi", agency: null, avail: false },
            ].map((w) => (
              <div key={w.name} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{w.name}</span>
                      {w.agency && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8", background: "#DBEAFE", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>Agency</span>
                      )}
                      {w.avail && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: "#DCFCE7", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>Available</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>{w.cat} · {w.loc}</div>
                    <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12, color: C.muted, flexWrap: "wrap" }}>
                      <span style={{ color: C.navy, fontWeight: 600 }}>{w.rating}</span>
                      <span>{w.exp} exp</span>
                      <span>{w.ver} verified</span>
                      <span>{w.lang}</span>
                    </div>
                    {w.agency && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{w.agency}</div>}
                  </div>
                  <span style={{ fontSize: 16, color: C.muted, flexShrink: 0, marginLeft: 12 }}>→</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <a href="/search?category=cook" style={{ fontSize: 13, color: C.amber, fontWeight: 600, textDecoration: "none" }}>See all cooks →</a>
          </div>
        </div>
      </section>

      {/* Agencies — first-class supply side */}
      <section style={{ padding: "36px 20px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Agencies on SafeHire
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 14 }}>
            Hire independent workers or choose agency-backed teams
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="grid-2col">
            <div style={{ background: "#fff", borderRadius: 10, padding: "16px", border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 4 }}>HomeServe Bangalore</div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5, marginBottom: 8 }}>Cook, Maid, Cleaner · Koramangala, Indiranagar, HSR</div>
              <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                <span style={{ color: C.navy, fontWeight: 600 }}>12 workers</span>
                <span style={{ color: C.muted }}>4.3 ★ avg</span>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "16px", border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 4 }}>DriveRight</div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5, marginBottom: 8 }}>Driver · Whitefield, Electronic City, Marathahalli</div>
              <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                <span style={{ color: C.navy, fontWeight: 600 }}>8 drivers</span>
                <span style={{ color: C.muted }}>4.6 ★ avg</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <a href="/login?role=agency" style={{
              display: "block", padding: "14px 18px", background: "#fff",
              border: `1px solid ${C.border}`, borderRadius: 10, textDecoration: "none",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Run an agency? Join SafeHire</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>List your workers, grow your business, get booked directly</div>
            </a>
          </div>
        </div>
      </section>

      {/* Why SafeHire — marketplace value, not trust defensiveness */}
      <section style={{ padding: "36px 20px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
            Why SafeHire
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="grid-2col">
            {[
              { title: "Ratings you can trust", desc: "Every rating comes from a real past employer. No fake reviews." },
              { title: "Verified, not just listed", desc: "10-step verification. ID, face match, references — real checks." },
              { title: "Independent & agency workers", desc: "Choose freelance workers or agency-backed teams. Both on one platform." },
              { title: "Free for workers, always", desc: "Workers join free. Build a reputation. Get found by hirers nearby." },
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
          Hire better. Get hired faster.
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 18 }}>Search by category and area. Compare ratings and verification. Hire with confidence.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/login?role=hirer" style={{
            padding: "12px 24px", background: C.amber, color: "#fff", borderRadius: 10,
            textDecoration: "none", fontSize: 14, fontWeight: 700,
          }}>
            Find help now
          </a>
          <a href="/login?role=worker" style={{
            padding: "12px 24px", background: "transparent", color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10,
            textDecoration: "none", fontSize: 14, fontWeight: 600,
          }}>
            List yourself free
          </a>
          <a href="/login?role=agency" style={{
            padding: "12px 24px", background: "transparent", color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10,
            textDecoration: "none", fontSize: 14, fontWeight: 600,
          }}>
            Register your agency
          </a>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "14px 20px", textAlign: "center", fontSize: 11, color: C.muted }}>
        SafeHire — Local labor marketplace for India
      </footer>
    </div>
  );
}
