"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface WorkerPageProps {
  params: { id: string };
}

const C = {
  primary: "#0A66C2",
  verified: "#057642",
  text: "#191919",
  textSec: "#666666",
  textTer: "#999999",
  border: "#E0E0E0",
  warning: "#C37D16",
};

const DEFAULT_REQUEST_FIELDS = ["full_name", "skills", "experience_years"];

export default function WorkerTrustCardPage({ params }: WorkerPageProps) {
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [endorsementSent, setEndorsementSent] = useState(false);

  const { data, isLoading, error } = trpc.hirer.viewTrustCard.useQuery(
    { workerId: params.id }
  );

  const requestMutation = trpc.consent.requestAccess.useMutation({
    onSuccess: () => setRequestSent(true),
  });

  const endorseMutation = trpc.trust.submitEndorsement.useMutation({
    onSuccess: () => setEndorsementSent(true),
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 24px" }}>
        <div style={{ height: 180, background: "#fff", borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 16 }} />
        <div style={{ height: 120, background: "#fff", borderRadius: 8, border: `1px solid ${C.border}` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 24px" }}>
        <div style={{
          background: "#fff", border: `1px solid ${C.border}`, borderLeft: "3px solid #CC1016",
          padding: 16, borderRadius: 8, fontSize: 14, color: "#CC1016",
        }}>
          {error.message}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const card = data.trustCard as Record<string, unknown>;
  const tier = (card.tier as string) ?? "unverified";

  const tierConfig: Record<string, { gradient: string; color: string; label: string }> = {
    unverified: { gradient: "linear-gradient(135deg, #666, #999)", color: C.textSec, label: "Unverified" },
    basic: { gradient: "linear-gradient(135deg, #0A66C2, #004182)", color: C.primary, label: "Basic Trust" },
    enhanced: { gradient: "linear-gradient(135deg, #057642, #0A4A2E)", color: C.verified, label: "Enhanced Trust" },
  };
  const tc_ = tierConfig[tier] ?? tierConfig.unverified;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 24px" }}>
      <a href="/search" style={{ fontSize: 13, color: C.textSec, textDecoration: "none", marginBottom: 16, display: "inline-block" }}>
        ← Back to search
      </a>

      {/* Profile header — LinkedIn style */}
      <div style={{
        background: "#fff", borderRadius: 8, border: `1px solid ${C.border}`,
        marginBottom: 16, overflow: "hidden",
      }}>
        {/* Banner */}
        <div style={{ background: tc_.gradient, height: 80 }} />

        {/* Profile info */}
        <div style={{ padding: "0 24px 20px", marginTop: -32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: tc_.color, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700,
            border: "3px solid #fff",
          }}>
            W
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>
                  Worker Profile
                </h1>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  padding: "3px 10px", borderRadius: 12,
                  background: tier === "enhanced" ? "#E8F5E9" : tier === "basic" ? "#E3F2FD" : "#F5F5F5",
                  color: tc_.color,
                }}>
                  {tc_.label}
                </span>
              </div>
              <div style={{ fontSize: 14, color: C.textSec, marginTop: 4 }}>
                Trust signals are public. Personal data requires worker consent.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust card stats */}
      <div style={{
        background: "#fff", borderRadius: 8, border: `1px solid ${C.border}`,
        padding: 20, marginBottom: 16,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 14 }}>Trust Card</div>
        <div className="grid-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Verification", value: (card.verification_status as string) ?? "pending", icon: "🛡️" },
            { label: "Tenure", value: `${(card.tenure_months as number) ?? 0}mo`, icon: "📅" },
            { label: "Endorsements", value: (card.endorsement_count as number) ?? 0, icon: "⭐" },
            { label: "Incidents", value: card.incident_flag ? `Yes (${card.incident_severity_max})` : "None", icon: "📋" },
          ].map((stat) => (
            <div key={stat.label} style={{
              textAlign: "center", padding: 14,
              background: "#F8F9FA", borderRadius: 8,
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: C.textTer, marginTop: 4, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.textTer, marginTop: 12, textAlign: "right" }}>
          Updated {card.last_computed_at ? new Date(card.last_computed_at as string).toLocaleDateString() : "—"}
        </div>
      </div>

      {/* Consent status */}
      {data.hasConsent ? (
        <div style={{
          background: "#fff", borderRadius: 8, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${C.verified}`, padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <span style={{ fontWeight: 700, color: C.verified, fontSize: 15 }}>Access Granted</span>
          </div>
          <div style={{ fontSize: 13, color: C.textSec, marginBottom: 14 }}>
            You have access to: {data.consentedFields.join(", ")}
          </div>
          {data.profile && (
            <div style={{ padding: 16, background: "#F8F9FA", borderRadius: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Worker Details</div>
              {Object.entries(data.profile as Record<string, unknown>).map(([key, value]) => (
                <div key={key} style={{ fontSize: 14, marginBottom: 6, display: "flex", gap: 12 }}>
                  <span style={{ color: C.textSec, minWidth: 130, textTransform: "capitalize", fontWeight: 500 }}>
                    {key.replace(/_/g, " ")}
                  </span>
                  <span style={{ color: C.text, fontWeight: 600 }}>
                    {Array.isArray(value) ? value.join(", ") : String(value ?? "—")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: "#fff", borderRadius: 8, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${C.warning}`, padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={{ fontWeight: 700, color: C.warning, fontSize: 15 }}>Profile Access Required</span>
          </div>
          <div style={{ fontSize: 13, color: C.textSec, marginBottom: 14 }}>
            Only the trust card summary is visible. Request access to see detailed profile data.
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
                  width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`,
                  borderRadius: 8, marginBottom: 10, boxSizing: "border-box",
                  resize: "vertical", fontSize: 13, outline: "none", background: "#F8F9FA",
                }}
              />
              <button
                onClick={() => requestMutation.mutate({
                  workerId: params.id,
                  fields: DEFAULT_REQUEST_FIELDS,
                  message: requestMessage || undefined,
                })}
                disabled={requestMutation.isPending}
                style={{
                  padding: "10px 24px", background: C.primary, color: "#fff",
                  border: "none", borderRadius: 20, cursor: "pointer",
                  fontSize: 14, fontWeight: 600,
                }}
              >
                {requestMutation.isPending ? "Sending..." : "Request Access"}
              </button>
              {requestMutation.error && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#CC1016" }}>
                  {requestMutation.error.message}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 14, color: C.verified, fontWeight: 600,
              background: "#E8F5E9", padding: "10px 14px", borderRadius: 8,
            }}>
              <span>✅</span> Access request sent. The worker will review your request.
            </div>
          )}
        </div>
      )}

      {/* Endorse worker */}
      <div style={{
        background: "#fff", borderRadius: 8, border: `1px solid ${C.border}`,
        padding: 20,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          Write an endorsement
        </div>
        <div style={{ fontSize: 13, color: C.textSec, marginBottom: 14 }}>
          Help build this worker&apos;s trust profile with your recommendation.
        </div>
        {endorsementSent ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 14, color: C.verified, fontWeight: 600,
            background: "#E8F5E9", padding: "12px 16px", borderRadius: 8,
          }}>
            <span>✅</span> Endorsement submitted successfully.
          </div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const relationship = (form.elements.namedItem("relationship") as HTMLInputElement).value;
            const comment = (form.elements.namedItem("comment") as HTMLTextAreaElement).value;
            if (relationship) {
              endorseMutation.mutate({ workerId: params.id, relationship, comment: comment || undefined });
            }
          }}>
            <input
              name="relationship"
              placeholder="Your relationship (e.g., Former employer, Neighbor)"
              style={{
                width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`,
                borderRadius: 8, marginBottom: 8, boxSizing: "border-box",
                fontSize: 13, outline: "none", background: "#F8F9FA",
              }}
            />
            <textarea
              name="comment"
              placeholder="Share your experience working with them..."
              rows={3}
              style={{
                width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`,
                borderRadius: 8, marginBottom: 12, boxSizing: "border-box",
                resize: "vertical", fontSize: 13, outline: "none", background: "#F8F9FA",
              }}
            />
            <button
              type="submit"
              disabled={endorseMutation.isPending}
              style={{
                padding: "10px 24px", background: C.primary, color: "#fff",
                border: "none", borderRadius: 20, cursor: "pointer",
                fontSize: 14, fontWeight: 600,
              }}
            >
              {endorseMutation.isPending ? "Submitting..." : "Submit Endorsement"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
