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
        maxWidth: 800, margin: "0 auto", padding: "64px 24px 48px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-block", padding: "4px 14px", borderRadius: 20,
          background: "#EFF6FF", color: "#1D4ED8", fontSize: 13, fontWeight: 600,
          marginBottom: 20, letterSpacing: "0.02em",
        }}>
          Privacy-first identity for India&apos;s workforce
        </div>
        <h1 className="hero-title" style={{
          fontSize: 44, fontWeight: 800, lineHeight: 1.15,
          color: "#0F172A", margin: "0 0 16px", letterSpacing: "-0.025em",
        }}>
          Trust profiles workers<br />own and control
        </h1>
        <p className="hero-subtitle" style={{
          fontSize: 18, color: "#64748B", lineHeight: 1.6,
          maxWidth: 560, margin: "0 auto 32px",
        }}>
          SafeHire gives domestic workers, drivers, and skilled professionals a portable, verified trust identity.
          Hirers get safety signals — without blacklists, surveillance, or unregulated WhatsApp groups.
        </p>
        <div className="cta-buttons" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <a
            href="/login"
            style={{
              display: "inline-flex", alignItems: "center", padding: "14px 28px",
              background: "#1D4ED8", color: "#fff", borderRadius: 8,
              textDecoration: "none", fontSize: 16, fontWeight: 600,
              transition: "background 0.15s",
            }}
          >
            Get Started
          </a>
          <a
            href="#how-it-works"
            style={{
              display: "inline-flex", alignItems: "center", padding: "14px 28px",
              background: "#F1F5F9", color: "#334155", borderRadius: 8,
              textDecoration: "none", fontSize: 16, fontWeight: 600,
            }}
          >
            How it works
          </a>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{
        borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0",
        padding: "20px 24px", background: "#FAFBFC",
      }}>
        <div className="trust-bar" style={{
          maxWidth: 800, margin: "0 auto",
          display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap",
        }}>
          {[
            ["Worker-owned", "Profiles belong to workers, not platforms"],
            ["Consent-first", "Hirers see data only when workers approve"],
            ["No blacklists", "Trust signals without exploitative practices"],
          ].map(([title, desc]) => (
            <div key={title} style={{ textAlign: "center", maxWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{title}</div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{
        maxWidth: 800, margin: "0 auto", padding: "56px 24px",
      }}>
        <h2 style={{
          fontSize: 28, fontWeight: 700, color: "#0F172A",
          textAlign: "center", marginBottom: 40, letterSpacing: "-0.02em",
        }}>
          How SafeHire works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {[
            {
              step: "1",
              title: "Workers create a profile",
              desc: "Add your skills, experience, and languages. Your profile is encrypted and you decide who sees it.",
            },
            {
              step: "2",
              title: "Build trust over time",
              desc: "Earn endorsements from hirers. Your trust card grows with verified experience — no gaming, no fake reviews.",
            },
            {
              step: "3",
              title: "Hirers request access",
              desc: "Search for workers by skill. View public trust cards. Request access to detailed profiles — with worker consent.",
            },
          ].map((item) => (
            <div key={item.step} style={{
              border: "1px solid #E2E8F0", borderRadius: 12, padding: 24,
              background: "#fff",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: "#EFF6FF",
                color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 16, marginBottom: 16,
              }}>
                {item.step}
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, color: "#0F172A", marginBottom: 8 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two-audience section */}
      <section style={{
        maxWidth: 800, margin: "0 auto", padding: "0 24px 56px",
      }}>
        <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{
            background: "#F0FDF4", border: "1px solid #BBF7D0",
            borderRadius: 12, padding: 28,
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, textTransform: "uppercase",
              color: "#15803D", letterSpacing: "0.05em", marginBottom: 8,
            }}>
              For Workers
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#14532D", marginBottom: 8 }}>
              Own your professional identity
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "#166534", lineHeight: 1.8 }}>
              <li>Portable profile across employers</li>
              <li>You approve every data request</li>
              <li>Build trust that follows you</li>
              <li>No one can blacklist you unfairly</li>
            </ul>
          </div>
          <div style={{
            background: "#EFF6FF", border: "1px solid #BFDBFE",
            borderRadius: 12, padding: 28,
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, textTransform: "uppercase",
              color: "#1D4ED8", letterSpacing: "0.05em", marginBottom: 8,
            }}>
              For Hirers
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1E3A5F", marginBottom: 8 }}>
              Hire with confidence
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "#1E40AF", lineHeight: 1.8 }}>
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
        background: "#0F172A", padding: "48px 24px", textAlign: "center",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 24, fontWeight: 700, color: "#fff",
            marginBottom: 12,
          }}>
            Ready to build safer hiring?
          </h2>
          <p style={{ fontSize: 16, color: "#94A3B8", marginBottom: 24 }}>
            Whether you&apos;re a worker building your trust profile or a hirer looking for verified talent — get started in minutes.
          </p>
          <a
            href="/login"
            style={{
              display: "inline-flex", alignItems: "center", padding: "14px 32px",
              background: "#fff", color: "#0F172A", borderRadius: 8,
              textDecoration: "none", fontSize: 16, fontWeight: 600,
            }}
          >
            Create your account
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #E2E8F0", padding: "24px",
        textAlign: "center", fontSize: 13, color: "#94A3B8",
      }}>
        SafeHire — Privacy-first worker trust for India&apos;s informal workforce.
      </footer>
    </div>
  );
}
