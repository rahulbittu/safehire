"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("verifyme-token");
    if (token) {
      router.replace("/dashboard");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return (
    <div style={{ background: "#fff" }}>
      {/* Hero */}
      <section style={{
        maxWidth: 1080, margin: "0 auto", padding: "80px 24px 64px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center",
      }} className="grid-2col">
        <div>
          <div style={{
            display: "inline-block", padding: "6px 14px", borderRadius: 6,
            background: "#F0FDF9", color: "#0F766E", fontSize: 13, fontWeight: 700,
            marginBottom: 20, letterSpacing: "0.02em",
          }}>
            Now in early access
          </div>
          <h1 className="hero-title" style={{
            fontSize: 46, fontWeight: 800, lineHeight: 1.15,
            color: "#1E293B", margin: "0 0 20px", letterSpacing: "-0.03em",
          }}>
            The trust layer for<br />
            <span style={{ color: "#0F766E" }}>informal hiring</span>
          </h1>
          <p className="hero-subtitle" style={{
            fontSize: 18, color: "#64748B", lineHeight: 1.7,
            margin: "0 0 32px", maxWidth: 440,
          }}>
            Workers build portable trust profiles. Hirers get verified signals — with consent, not surveillance. No blacklists.
          </p>
          <div className="cta-buttons" style={{ display: "flex", gap: 12 }}>
            <a href="/login" style={{
              display: "inline-flex", alignItems: "center", padding: "14px 28px",
              background: "#0F766E", color: "#fff", borderRadius: 10,
              textDecoration: "none", fontSize: 16, fontWeight: 600,
            }}>
              Start for free
            </a>
            <a href="#how-it-works" style={{
              display: "inline-flex", alignItems: "center", padding: "14px 28px",
              background: "#F8FAFC", color: "#1E293B", borderRadius: 10,
              textDecoration: "none", fontSize: 16, fontWeight: 600,
              border: "1.5px solid #E2E8F0",
            }}>
              See how it works
            </a>
          </div>
        </div>

        {/* Hero visual — stacked cards */}
        <div style={{ position: "relative" }}>
          {/* Profile card */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #0F766E, #14B8A6)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 700,
              }}>P</div>
              <div>
                <div style={{ fontWeight: 700, color: "#1E293B", fontSize: 16 }}>Priya Sharma</div>
                <div style={{ fontSize: 13, color: "#64748B" }}>Cooking · Cleaning · Childcare</div>
              </div>
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
            }}>
              {[
                { label: "Endorsements", value: "4" },
                { label: "Tenure", value: "18mo" },
                { label: "Trust", value: "Enhanced" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "#F8FAFC", borderRadius: 10, padding: "10px 12px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#1E293B" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2, textTransform: "uppercase", fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Consent notification */}
          <div style={{
            background: "#fff", borderRadius: 12, padding: "14px 18px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "#FFF7ED", color: "#D97706",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700,
            }}>✓</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>Access approved</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Worker granted you profile access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{
        borderTop: "1px solid #F1F5F9", borderBottom: "1px solid #F1F5F9",
        padding: "28px 24px", background: "#FAFBFC",
      }}>
        <div className="trust-bar" style={{
          maxWidth: 1080, margin: "0 auto",
          display: "flex", justifyContent: "center", gap: 56, flexWrap: "wrap",
        }}>
          {[
            ["Worker-owned", "Profiles belong to workers, not platforms"],
            ["Consent-first", "Hirers see data only when workers approve"],
            ["No blacklists", "Trust signals without exploitative practices"],
          ].map(([title, desc]) => (
            <div key={title} style={{ textAlign: "center", maxWidth: 240 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1E293B" }}>{title}</div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{
        maxWidth: 1080, margin: "0 auto", padding: "72px 24px",
      }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#1E293B", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
            How it works
          </h2>
          <p style={{ fontSize: 16, color: "#64748B", margin: 0 }}>Three steps to verified trust.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {[
            {
              step: "01", color: "#0F766E",
              title: "Create your profile",
              desc: "Add your skills, experience, and languages. Your profile is encrypted and you decide who sees it.",
            },
            {
              step: "02", color: "#D97706",
              title: "Build trust over time",
              desc: "Earn endorsements from hirers. Your trust card grows with real, verified experience.",
            },
            {
              step: "03", color: "#6366F1",
              title: "Hire with confidence",
              desc: "Search for workers by skill. View trust cards. Request access to profiles — with worker consent.",
            },
          ].map((item) => (
            <div key={item.step} style={{
              background: "#fff", borderRadius: 14, padding: 28,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              border: "1px solid #F1F5F9",
            }}>
              <div style={{
                fontSize: 12, fontWeight: 800, color: item.color,
                letterSpacing: "0.08em", marginBottom: 14,
              }}>
                STEP {item.step}
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#1E293B", marginBottom: 8 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two-audience section */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 72px" }}>
        <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{
            borderRadius: 16, padding: 32,
            background: "linear-gradient(135deg, #F0FDF9 0%, #ECFDF5 100%)",
            border: "1px solid #D1FAE5",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, textTransform: "uppercase",
              color: "#0F766E", letterSpacing: "0.06em", marginBottom: 10,
            }}>
              For Workers
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#134E4A", marginBottom: 14, letterSpacing: "-0.02em" }}>
              Own your professional identity
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                "Portable profile across employers",
                "You approve every data request",
                "Build trust that follows you",
                "No one can blacklist you unfairly",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "#166534" }}>
                  <span style={{ color: "#0F766E", fontWeight: 700 }}>→</span> {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{
            borderRadius: 16, padding: 32,
            background: "linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)",
            border: "1px solid #FDE68A",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, textTransform: "uppercase",
              color: "#D97706", letterSpacing: "0.06em", marginBottom: 10,
            }}>
              For Hirers
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#78350F", marginBottom: 14, letterSpacing: "-0.02em" }}>
              Hire with confidence
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                "Verified trust signals, not rumors",
                "Consent-based access to profiles",
                "Endorsement history from past hirers",
                "Incident reporting for accountability",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "#92400E" }}>
                  <span style={{ color: "#D97706", fontWeight: 700 }}>→</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: "#1E293B", padding: "56px 24px", textAlign: "center",
      }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 10, letterSpacing: "-0.02em" }}>
            Ready to build safer hiring?
          </h2>
          <p style={{ fontSize: 16, color: "#94A3B8", marginBottom: 28, lineHeight: 1.6 }}>
            Whether you&apos;re a worker or a hirer — get started in minutes.
          </p>
          <a href="/login" style={{
            display: "inline-flex", alignItems: "center", padding: "14px 32px",
            background: "#0F766E", color: "#fff", borderRadius: 10,
            textDecoration: "none", fontSize: 16, fontWeight: 600,
          }}>
            Join SafeHire
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #F1F5F9", padding: "24px",
        textAlign: "center", fontSize: 13, color: "#94A3B8",
      }}>
        SafeHire — Privacy-first worker trust for India&apos;s informal workforce.
      </footer>
    </div>
  );
}
