"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const C = { amber: "#C49A1A", navy: "#0D1B2A", green: "#16A34A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

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
        Product preview — use demo accounts to explore. Not yet live.
      </div>

      {/* Hero — practical, not aspirational */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "56px 20px 40px" }}>
        <h1 className="hero-title" style={{
          fontSize: 40, fontWeight: 800, lineHeight: 1.12,
          color: C.navy, margin: "0 0 16px", letterSpacing: "-0.03em",
        }}>
          Verified trust for<br />domestic hiring
        </h1>
        <p className="hero-subtitle" style={{
          fontSize: 17, color: C.sub, lineHeight: 1.7,
          margin: "0 0 32px", maxWidth: 440,
        }}>
          SafeHire lets workers carry a reusable trust card — verified by real employers. Hirers get reliable signals. Workers stay in control of their data.
        </p>

        {/* Two clear paths */}
        <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 48 }}>
          <a href="/login" style={{
            display: "block", padding: "20px 20px", background: "#fff",
            border: `2px solid ${C.amber}`, borderRadius: 12,
            textDecoration: "none", textAlign: "center",
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.amber, marginBottom: 4 }}>I&apos;m hiring</div>
            <div style={{ fontSize: 13, color: C.sub }}>Find trusted local help</div>
          </a>
          <a href="/login" style={{
            display: "block", padding: "20px 20px", background: C.amber,
            border: `2px solid ${C.amber}`, borderRadius: 12,
            textDecoration: "none", textAlign: "center",
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>I&apos;m a worker</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Get verified, get hired faster</div>
          </a>
        </div>
      </section>

      {/* How it works — 3 steps, dead simple */}
      <section id="how-it-works" style={{ borderTop: `1px solid ${C.border}`, background: C.bg, padding: "48px 20px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
            How it works
          </div>
          <div style={{ display: "grid", gap: 20 }}>
            {[
              { n: "1", title: "Worker creates a trust card", desc: "Name, skills, languages, experience. Takes 60 seconds. Data is encrypted and worker-owned." },
              { n: "2", title: "Employers verify with references", desc: "Past employers write references. Each one strengthens the trust card. No fake ratings — real people only." },
              { n: "3", title: "Hirers request access with consent", desc: "Workers approve or reject every request. No one sees your details without your permission." },
            ].map((item) => (
              <div key={item.n} style={{ display: "flex", gap: 16, alignItems: "start" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: C.navy, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800,
                }}>{item.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust principles — why SafeHire is different */}
      <section style={{ padding: "48px 20px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
            Privacy-first trust
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            {[
              { title: "Workers own their data", desc: "Your trust card belongs to you. Take it with you when you change employers. No one can delete it." },
              { title: "Consent before access", desc: "Hirers must request permission to see your details. You approve or reject every request individually." },
              { title: "No blacklists, no punishment", desc: "SafeHire is not a blacklist system. Incident reports are reviewed fairly. Workers can always appeal." },
            ].map((item) => (
              <div key={item.title} style={{
                background: "#fff", borderRadius: 12, padding: "18px 20px",
                border: `1px solid ${C.border}`,
              }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample trust card — practical, not vanity */}
      <section style={{ padding: "48px 20px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Sample trust card
          </div>
          <div style={{
            background: "#fff", borderRadius: 12, overflow: "hidden",
            border: `1px solid ${C.border}`,
          }}>
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 16 }}>Priya Sharma</div>
                <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>Cook · Housekeeper · Childcare</div>
              </div>
              <div style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: "#DCFCE7", color: C.green, textTransform: "uppercase",
              }}>Verified</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: `1px solid ${C.border}` }}>
              {[
                { v: "6 yr", l: "Experience" },
                { v: "4", l: "References" },
                { v: "Hindi, Eng", l: "Languages" },
              ].map((s) => (
                <div key={s.l} style={{ padding: "14px 12px", textAlign: "center", borderRight: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 20px", fontSize: 12, color: C.muted }}>
              Consent required to view full details
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: C.navy, padding: "48px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
          Ready to get started?
        </div>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>
          Free for workers. Always.
        </p>
        <a href="/login" style={{
          display: "inline-flex", padding: "13px 28px",
          background: C.amber, color: "#fff", borderRadius: 10,
          textDecoration: "none", fontSize: 15, fontWeight: 700,
        }}>
          Create your trust card
        </a>
      </section>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "20px 20px", textAlign: "center", fontSize: 12, color: C.muted }}>
        SafeHire — Verified trust for India&apos;s domestic workforce
      </footer>
    </div>
  );
}
