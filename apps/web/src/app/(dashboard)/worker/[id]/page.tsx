"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface WorkerPageProps {
  params: { id: string };
}

const T = {
  teal: "#0F766E",
  tealLight: "#F0FDF9",
  amber: "#D97706",
  amberLight: "#FFF7ED",
  text: "#1E293B",
  sub: "#64748B",
  muted: "#94A3B8",
  border: "#F1F5F9",
};

const DEFAULT_REQUEST_FIELDS = ["full_name", "skills", "experience_years"];

export default function WorkerTrustCardPage({ params }: WorkerPageProps) {
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [endorsementSent, setEndorsementSent] = useState(false);

  const { data, isLoading, error } = trpc.hirer.viewTrustCard.useQuery({ workerId: params.id });
  const requestMutation = trpc.consent.requestAccess.useMutation({ onSuccess: () => setRequestSent(true) });
  const endorseMutation = trpc.trust.submitEndorsement.useMutation({ onSuccess: () => setEndorsementSent(true) });

  if (isLoading) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px" }}>
        {[160, 120].map((h, i) => (
          <div key={i} style={{ height: h, background: "#fff", borderRadius: 14, border: `1px solid ${T.border}`, marginBottom: 16 }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px" }}>
        <div style={{ background: "#fff", borderLeft: "3px solid #DC2626", padding: 16, borderRadius: 14, fontSize: 14, color: "#DC2626", border: `1px solid ${T.border}` }}>
          {error.message}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const card = data.trustCard as Record<string, unknown>;
  const tier = (card.tier as string) ?? "unverified";

  const tierStyle: Record<string, { gradient: string; color: string; label: string; bg: string }> = {
    unverified: { gradient: "linear-gradient(135deg, #64748B, #94A3B8)", color: T.sub, label: "Unverified", bg: "#F8FAFC" },
    basic: { gradient: "linear-gradient(135deg, #0F766E, #14B8A6)", color: T.teal, label: "Basic", bg: T.tealLight },
    enhanced: { gradient: "linear-gradient(135deg, #D97706, #F59E0B)", color: T.amber, label: "Enhanced", bg: T.amberLight },
  };
  const ts = tierStyle[tier] ?? tierStyle.unverified;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px" }}>
      <a href="/search" style={{ fontSize: 13, color: T.sub, textDecoration: "none", marginBottom: 16, display: "inline-block" }}>
        ← Back to search
      </a>

      {/* Profile header */}
      <div style={{
        background: "#fff", borderRadius: 14, overflow: "hidden", marginBottom: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: `1px solid ${T.border}`,
      }}>
        <div style={{ height: 64, background: ts.gradient }} />
        <div style={{ padding: "0 24px 22px", marginTop: -28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: ts.gradient, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, border: "3px solid #fff",
          }}>W</div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>
                Worker Profile
              </h1>
              <div style={{ fontSize: 14, color: T.sub, marginTop: 4 }}>
                Trust signals visible. Profile details require consent.
              </div>
            </div>
            <span style={{
              padding: "5px 14px", borderRadius: 8,
              fontSize: 11, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.04em", background: ts.bg, color: ts.color,
            }}>{ts.label}</span>
          </div>
        </div>
      </div>

      {/* Trust stats */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: 20, marginBottom: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: `1px solid ${T.border}`,
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 14 }}>Trust Card</div>
        <div className="grid-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { label: "Verification", value: (card.verification_status as string) ?? "pending" },
            { label: "Tenure", value: `${(card.tenure_months as number) ?? 0}mo` },
            { label: "Endorsements", value: String((card.endorsement_count as number) ?? 0) },
            { label: "Incidents", value: card.incident_flag ? `Yes` : "None" },
          ].map((stat) => (
            <div key={stat.label} style={{
              textAlign: "center", padding: 14, background: "#F8FAFC", borderRadius: 10,
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 4, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 12, textAlign: "right" }}>
          Updated {card.last_computed_at ? new Date(card.last_computed_at as string).toLocaleDateString() : "—"}
        </div>
      </div>

      {/* Consent section */}
      {data.hasConsent ? (
        <div style={{
          background: "#fff", borderRadius: 14, padding: 20, marginBottom: 16,
          borderLeft: `3px solid ${T.teal}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.teal, marginBottom: 12 }}>Access Granted</div>
          <div style={{ fontSize: 13, color: T.sub, marginBottom: 14 }}>
            Fields: {data.consentedFields.join(", ")}
          </div>
          {data.profile && (
            <div style={{ padding: 16, background: "#F8FAFC", borderRadius: 10 }}>
              {Object.entries(data.profile as Record<string, unknown>).map(([key, value]) => (
                <div key={key} style={{ fontSize: 14, marginBottom: 6, display: "flex", gap: 12 }}>
                  <span style={{ color: T.sub, minWidth: 130, textTransform: "capitalize", fontWeight: 500 }}>
                    {key.replace(/_/g, " ")}
                  </span>
                  <span style={{ color: T.text, fontWeight: 700 }}>
                    {Array.isArray(value) ? value.join(", ") : String(value ?? "—")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: "#fff", borderRadius: 14, padding: 20, marginBottom: 16,
          borderLeft: `3px solid ${T.amber}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.amber, marginBottom: 4 }}>Profile Access Required</div>
          <div style={{ fontSize: 13, color: T.sub, marginBottom: 14 }}>
            Request access to see detailed worker profile data.
          </div>
          {!requestSent ? (
            <div>
              <textarea
                placeholder="Why do you need access? (optional)"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                maxLength={500}
                rows={2}
                style={{
                  width: "100%", padding: "10px 14px", border: `1.5px solid ${T.border}`,
                  borderRadius: 10, marginBottom: 10, boxSizing: "border-box",
                  resize: "vertical", fontSize: 13, outline: "none", background: "#F8FAFC",
                }}
              />
              <button
                onClick={() => requestMutation.mutate({ workerId: params.id, fields: DEFAULT_REQUEST_FIELDS, message: requestMessage || undefined })}
                disabled={requestMutation.isPending}
                style={{
                  padding: "10px 24px", background: T.teal, color: "#fff",
                  border: "none", borderRadius: 8, cursor: "pointer",
                  fontSize: 14, fontWeight: 700,
                }}
              >
                {requestMutation.isPending ? "Sending..." : "Request Access"}
              </button>
              {requestMutation.error && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#DC2626" }}>{requestMutation.error.message}</div>
              )}
            </div>
          ) : (
            <div style={{
              fontSize: 14, color: T.teal, fontWeight: 700,
              background: T.tealLight, padding: "10px 14px", borderRadius: 8,
            }}>
              ✓ Access request sent. The worker will review it.
            </div>
          )}
        </div>
      )}

      {/* Endorsement */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: `1px solid ${T.border}`,
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 4 }}>Write an endorsement</div>
        <div style={{ fontSize: 13, color: T.sub, marginBottom: 14 }}>Help build this worker&apos;s trust profile.</div>
        {endorsementSent ? (
          <div style={{ fontSize: 14, color: T.teal, fontWeight: 700, background: T.tealLight, padding: "12px 16px", borderRadius: 8 }}>
            ✓ Endorsement submitted.
          </div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const relationship = (form.elements.namedItem("relationship") as HTMLInputElement).value;
            const comment = (form.elements.namedItem("comment") as HTMLTextAreaElement).value;
            if (relationship) endorseMutation.mutate({ workerId: params.id, relationship, comment: comment || undefined });
          }}>
            <input name="relationship" placeholder="Your relationship (e.g., Former employer)" style={{
              width: "100%", padding: "10px 14px", border: `1.5px solid ${T.border}`, borderRadius: 10, marginBottom: 8, boxSizing: "border-box", fontSize: 13, outline: "none", background: "#F8FAFC",
            }} />
            <textarea name="comment" placeholder="Share your experience..." rows={3} style={{
              width: "100%", padding: "10px 14px", border: `1.5px solid ${T.border}`, borderRadius: 10, marginBottom: 12, boxSizing: "border-box", resize: "vertical", fontSize: 13, outline: "none", background: "#F8FAFC",
            }} />
            <button type="submit" disabled={endorseMutation.isPending} style={{
              padding: "10px 24px", background: T.teal, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700,
            }}>
              {endorseMutation.isPending ? "Submitting..." : "Submit Endorsement"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
