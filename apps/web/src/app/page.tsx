"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const C = {
  primary: "#0A66C2",
  primaryDark: "#004182",
  verified: "#057642",
  text: "#191919",
  textSec: "#666666",
  border: "#E0E0E0",
};

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
        maxWidth: 1128, margin: "0 auto", padding: "72px 24px 56px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center",
      }} className="grid-2col">
        <div>
          <h1 className="hero-title" style={{
            fontSize: 48, fontWeight: 700, lineHeight: 1.2,
            color: C.text, margin: "0 0 20px",
          }}>
            Trust profiles for India&apos;s informal workforce
          </h1>
          <p className="hero-subtitle" style={{
            fontSize: 20, color: C.textSec, lineHeight: 1.6,
            margin: "0 0 32px",
          }}>
            SafeHire gives domestic workers, drivers, and skilled professionals a portable, verified trust identity.
            Hirers get safety signals — with consent, not surveillance.
          </p>
          <div className="cta-buttons" style={{ display: "flex", gap: 12 }}>
            <a
              href="/login"
              style={{
                display: "inline-flex", alignItems: "center", padding: "14px 28px",
                background: C.primary, color: "#fff", borderRadius: 24,
                textDecoration: "none", fontSize: 16, fontWeight: 600,
              }}
            >
              Get started — it&apos;s free
            </a>
            <a
              href="#how-it-works"
              style={{
                display: "inline-flex", alignItems: "center", padding: "14px 28px",
                background: "transparent", color: C.primary, borderRadius: 24,
                textDecoration: "none", fontSize: 16, fontWeight: 600,
                border: `2px solid ${C.primary}`,
              }}
            >
              Learn more
            </a>
          </div>
        </div>
        <div style={{
          background: "linear-gradient(135deg, #E8F5E9 0%, #E3F2FD 100%)",
          borderRadius: 16, padding: 32, display: "flex", flexDirection: "column",
          gap: 16,
        }}>
          {/* Fake profile card preview */}
          <div style={{
            background: "#fff", borderRadius: 12, padding: 20,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", background: C.verified,
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 700,
              }}>P</div>
              <div>
                <div style={{ fontWeight: 700, color: C.text }}>Priya Sharma</div>
                <div style={{ fontSize: 13, color: C.textSec }}>Cooking · Cleaning · Childcare</div>
              </div>
              <span style={{
                marginLeft: "auto", fontSize: 10, fontWeight: 700,
                background: "#E8F5E9", color: C.verified, padding: "3px 10px", borderRadius: 10,
              }}>
                ✓ ENHANCED
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: C.textSec }}>
              <span>⭐ 4 endorsements</span>
              <span>📅 18 months</span>
              <span>🛡️ Verified</span>
            </div>
          </div>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 13,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.verified, fontWeight: 600 }}>
              <span>✅</span> Access granted — worker approved your request
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{
        borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
        padding: "20px 24px", background: "#F8F9FA",
      }}>
        <div className="trust-bar" style={{
          maxWidth: 1128, margin: "0 auto",
          display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap",
        }}>
          {[
            ["🔐", "Worker-owned", "Profiles belong to workers, not platforms"],
            ["✅", "Consent-first", "Hirers see data only when workers approve"],
            ["🛡️", "No blacklists", "Trust signals without exploitative practices"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ textAlign: "center", maxWidth: 220 }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{title}</div>
              <div style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{
        maxWidth: 1128, margin: "0 auto", padding: "64px 24px",
      }}>
        <h2 style={{
          fontSize: 32, fontWeight: 700, color: C.text,
          textAlign: "center", marginBottom: 48,
        }}>
          How SafeHire works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {[
            {
              step: "1", icon: "👤",
              title: "Workers create a profile",
              desc: "Add your skills, experience, and languages. Your profile is encrypted and you decide who sees it.",
            },
            {
              step: "2", icon: "⭐",
              title: "Build trust over time",
              desc: "Earn endorsements from hirers. Your trust card grows with verified experience — no gaming, no fake reviews.",
            },
            {
              step: "3", icon: "🤝",
              title: "Hirers request access",
              desc: "Search for workers by skill. View public trust cards. Request access to detailed profiles — with worker consent.",
            },
          ].map((item) => (
            <div key={item.step} style={{
              background: "#fff", borderRadius: 12, padding: 28,
              border: `1px solid ${C.border}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 8 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.6 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two-audience section */}
      <section style={{
        maxWidth: 1128, margin: "0 auto", padding: "0 24px 64px",
      }}>
        <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{
            background: "#F0FDF4", border: "1px solid #BBF7D0",
            borderRadius: 12, padding: 32,
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>👷</div>
            <div style={{
              fontSize: 12, fontWeight: 700, textTransform: "uppercase",
              color: C.verified, letterSpacing: "0.05em", marginBottom: 8,
            }}>
              For Workers
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#14532D", marginBottom: 12 }}>
              Own your professional identity
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "#166534", lineHeight: 2 }}>
              <li>Portable profile across employers</li>
              <li>You approve every data request</li>
              <li>Build trust that follows you</li>
              <li>No one can blacklist you unfairly</li>
            </ul>
          </div>
          <div style={{
            background: "#E3F2FD", border: "1px solid #90CAF9",
            borderRadius: 12, padding: 32,
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🏢</div>
            <div style={{
              fontSize: 12, fontWeight: 700, textTransform: "uppercase",
              color: C.primary, letterSpacing: "0.05em", marginBottom: 8,
            }}>
              For Hirers
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F", marginBottom: 12 }}>
              Hire with confidence
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "#1565C0", lineHeight: 2 }}>
              <li>Verified trust signals, not rumors</li>
              <li>Consent-based access to profiles</li>
              <li>Endorsement history from past hirers</li>
              <li>Incident reporting for accountability</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, padding: "56px 24px", textAlign: "center",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Ready to build safer hiring?
          </h2>
          <p style={{ fontSize: 16, color: "#999", marginBottom: 28 }}>
            Whether you&apos;re a worker building your trust profile or a hirer looking for verified talent — get started in minutes.
          </p>
          <a
            href="/login"
            style={{
              display: "inline-flex", alignItems: "center", padding: "14px 32px",
              background: C.primary, color: "#fff", borderRadius: 24,
              textDecoration: "none", fontSize: 16, fontWeight: 600,
            }}
          >
            Join SafeHire today
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${C.border}`, padding: "24px",
        textAlign: "center", fontSize: 13, color: "#999",
        background: "#F8F9FA",
      }}>
        SafeHire — Privacy-first worker trust for India&apos;s informal workforce.
      </footer>
    </div>
  );
}
