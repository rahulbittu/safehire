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

  const { data, isLoading, error } = trpc.hirer.viewTrustCard.useQuery(
    { workerId: params.id }
  );

  const requestMutation = trpc.consent.requestAccess.useMutation({
    onSuccess: () => setRequestSent(true),
  });

  const endorseMutation = trpc.trust.submitEndorsement.useMutation({
    onSuccess: () => alert("Endorsement submitted!"),
  });

  if (isLoading) return <div style={{ padding: 24 }}>Loading trust card...</div>;
  if (error) return <div style={{ padding: 24, color: "#DC2626" }}>Error: {error.message}</div>;
  if (!data) return <div style={{ padding: 24 }}>No data</div>;

  const card = data.trustCard as Record<string, unknown>;
  const tierColors: Record<string, string> = {
    unverified: "#9CA3AF",
    basic: "#2563EB",
    enhanced: "#059669",
  };

  return (
    <div style={{ maxWidth: 700, padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Worker Trust Card</h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>
        Aggregated trust signals. Personal data requires worker consent.
      </p>

      {/* Trust Card */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{
            background: tierColors[(card.tier as string) ?? "unverified"] ?? "#9CA3AF",
            color: "#fff",
            padding: "4px 12px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            textTransform: "uppercase",
          }}>
            {(card.tier as string) ?? "unverified"}
          </span>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>
            Last updated: {card.last_computed_at ? new Date(card.last_computed_at as string).toLocaleDateString() : "Never"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6B7280", textTransform: "uppercase" }}>Verification</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{(card.verification_status as string) ?? "pending"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6B7280", textTransform: "uppercase" }}>Tenure</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{(card.tenure_months as number) ?? 0} months</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6B7280", textTransform: "uppercase" }}>Endorsements</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{(card.endorsement_count as number) ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6B7280", textTransform: "uppercase" }}>Incident Flag</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {card.incident_flag ? `Yes (${card.incident_severity_max})` : "None"}
            </div>
          </div>
        </div>
      </div>

      {/* Consent Status */}
      {data.hasConsent ? (
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: "#166534", marginBottom: 4 }}>Consent Granted</div>
          <div style={{ fontSize: 14, color: "#15803D" }}>
            You have access to: {data.consentedFields.join(", ")}
          </div>
          {data.profile && (
            <div style={{ marginTop: 12, padding: 12, background: "#fff", borderRadius: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Worker Profile</div>
              {Object.entries(data.profile as Record<string, unknown>).map(([key, value]) => (
                <div key={key} style={{ fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: "#6B7280" }}>{key.replace(/_/g, " ")}:</span>{" "}
                  <span>{Array.isArray(value) ? value.join(", ") : String(value ?? "—")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: "#92400E", marginBottom: 4 }}>No Consent</div>
          <div style={{ fontSize: 14, color: "#A16207" }}>
            The worker has not granted you access to their profile data.
            Only the trust card summary is visible.
          </div>
          {!requestSent ? (
            <div style={{ marginTop: 12 }}>
              <textarea
                placeholder="Why do you need access? (optional)"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                maxLength={500}
                rows={2}
                style={{ width: "100%", padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, marginBottom: 8, boxSizing: "border-box", resize: "vertical" }}
              />
              <button
                onClick={() => requestMutation.mutate({
                  workerId: params.id,
                  fields: DEFAULT_REQUEST_FIELDS,
                  message: requestMessage || undefined,
                })}
                disabled={requestMutation.isPending}
                style={{ padding: "8px 16px", background: "#D97706", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
              >
                {requestMutation.isPending ? "Sending..." : "Request Access"}
              </button>
              {requestMutation.error && (
                <div style={{ marginTop: 8, fontSize: 13, color: "#DC2626" }}>
                  {requestMutation.error.message}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 13, color: "#059669" }}>
              Access request sent. The worker will review your request.
            </div>
          )}
        </div>
      )}

      {/* Endorse Worker */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Endorse This Worker</div>
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
            style={{ width: "100%", padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, marginBottom: 8, boxSizing: "border-box" }}
          />
          <textarea
            name="comment"
            placeholder="Optional comment..."
            rows={3}
            style={{ width: "100%", padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, marginBottom: 8, boxSizing: "border-box", resize: "vertical" }}
          />
          <button
            type="submit"
            disabled={endorseMutation.isPending}
            style={{ padding: "8px 16px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            {endorseMutation.isPending ? "Submitting..." : "Submit Endorsement"}
          </button>
        </form>
      </div>
    </div>
  );
}
