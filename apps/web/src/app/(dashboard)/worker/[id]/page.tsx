"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface WorkerPageProps {
  params: { id: string };
}

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
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ height: 24, width: 200, background: "#F1F5F9", borderRadius: 6, marginBottom: 24 }} />
        <div style={{ height: 180, background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0", marginBottom: 16 }} />
        <div style={{ height: 100, background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
          {error.message}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const card = data.trustCard as Record<string, unknown>;
  const tier = (card.tier as string) ?? "unverified";

  const tierStyles: Record<string, { bg: string; text: string }> = {
    unverified: { bg: "#F1F5F9", text: "#64748B" },
    basic: { bg: "#1D4ED8", text: "#fff" },
    enhanced: { bg: "#15803D", text: "#fff" },
  };
  const ts = tierStyles[tier] ?? tierStyles.unverified;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <a href="/search" style={{ fontSize: 13, color: "#64748B", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>
        &larr; Back to search
      </a>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.025em", margin: 0 }}>
          Worker Trust Card
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
          Aggregated trust signals. Personal data requires worker consent.
        </p>
      </div>

      {/* Trust card */}
      <div style={{
        border: "1px solid #E2E8F0", borderRadius: 14, padding: 24, marginBottom: 20,
        background: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{
            background: ts.bg, color: ts.text,
            padding: "5px 14px", borderRadius: 12,
            fontSize: 12, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}>
            {tier}
          </span>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>
            Updated {card.last_computed_at ? new Date(card.last_computed_at as string).toLocaleDateString() : "—"}
          </span>
        </div>

        <div className="grid-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Verification", value: (card.verification_status as string) ?? "pending" },
            { label: "Tenure", value: `${(card.tenure_months as number) ?? 0}mo` },
            { label: "Endorsements", value: (card.endorsement_count as number) ?? 0 },
            { label: "Incidents", value: card.incident_flag ? `Yes (${card.incident_severity_max})` : "None" },
          ].map((stat) => (
            <div key={stat.label} style={{
              textAlign: "center", padding: "12px 8px",
              background: "#FAFBFC", borderRadius: 8,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 4, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consent status */}
      {data.hasConsent ? (
        <div style={{
          background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12,
          padding: 20, marginBottom: 20,
        }}>
          <div style={{ fontWeight: 700, color: "#15803D", fontSize: 14, marginBottom: 8 }}>
            Consent Granted
          </div>
          <div style={{ fontSize: 13, color: "#166534", marginBottom: 12 }}>
            You have access to: {data.consentedFields.join(", ")}
          </div>
          {data.profile && (
            <div style={{ padding: 16, background: "#fff", borderRadius: 8, border: "1px solid #DCFCE7" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>Worker Profile</div>
              {Object.entries(data.profile as Record<string, unknown>).map(([key, value]) => (
                <div key={key} style={{ fontSize: 13, marginBottom: 4, display: "flex", gap: 8 }}>
                  <span style={{ color: "#64748B", minWidth: 120, textTransform: "capitalize" }}>
                    {key.replace(/_/g, " ")}
                  </span>
                  <span style={{ color: "#0F172A", fontWeight: 500 }}>
                    {Array.isArray(value) ? value.join(", ") : String(value ?? "—")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12,
          padding: 20, marginBottom: 20,
        }}>
          <div style={{ fontWeight: 700, color: "#92400E", fontSize: 14, marginBottom: 4 }}>
            Profile Access Required
          </div>
          <div style={{ fontSize: 13, color: "#A16207", marginBottom: 12 }}>
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
                  width: "100%", padding: "10px 12px", border: "1px solid #FDE68A",
                  borderRadius: 8, marginBottom: 8, boxSizing: "border-box",
                  resize: "vertical", fontSize: 13, outline: "none",
                  background: "#fff",
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
                  padding: "10px 20px", background: "#D97706", color: "#fff",
                  border: "none", borderRadius: 8, cursor: "pointer",
                  fontSize: 13, fontWeight: 600,
                }}
              >
                {requestMutation.isPending ? "Sending..." : "Request Access"}
              </button>
              {requestMutation.error && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#DC2626" }}>
                  {requestMutation.error.message}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              fontSize: 13, color: "#15803D", fontWeight: 600,
              background: "#F0FDF4", padding: "8px 12px", borderRadius: 6,
            }}>
              Access request sent. The worker will review your request.
            </div>
          )}
        </div>
      )}

      {/* Endorse worker */}
      <div style={{
        border: "1px solid #E2E8F0", borderRadius: 12, padding: 20,
        background: "#fff",
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 12 }}>
          Endorse this worker
        </div>
        {endorsementSent ? (
          <div style={{
            fontSize: 13, color: "#15803D", fontWeight: 600,
            background: "#F0FDF4", padding: "10px 14px", borderRadius: 8,
          }}>
            Endorsement submitted successfully.
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
              placeholder="Relationship (e.g., Former employer)"
              style={{
                width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0",
                borderRadius: 8, marginBottom: 8, boxSizing: "border-box",
                fontSize: 13, outline: "none",
              }}
            />
            <textarea
              name="comment"
              placeholder="Comment (optional)"
              rows={2}
              style={{
                width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0",
                borderRadius: 8, marginBottom: 10, boxSizing: "border-box",
                resize: "vertical", fontSize: 13, outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={endorseMutation.isPending}
              style={{
                padding: "10px 20px", background: "#1D4ED8", color: "#fff",
                border: "none", borderRadius: 8, cursor: "pointer",
                fontSize: 13, fontWeight: 600,
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
