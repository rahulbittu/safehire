"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

const C = { amber: "#C49A1A", navy: "#0D1B2A", green: "#16A34A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

const FIELD_LABELS: Record<string, string> = {
  full_name: "Full Name", skills: "Skills", experience_years: "Experience",
  languages: "Languages", verified_at: "Verification", phone: "Phone",
};
function humanizeFields(fields: unknown): string {
  if (!Array.isArray(fields)) return "Profile access";
  return (fields as string[]).map((f) => FIELD_LABELS[f] || f.replace(/_/g, " ")).join(", ");
}

export default function ConsentPage() {
  const [error, setError] = useState("");
  const { user } = useAuth();
  const role = user?.role ?? null;
  const utils = trpc.useUtils();

  const { data: consents, isLoading: consentsLoading } = trpc.consent.getMyConsents.useQuery(undefined, { enabled: role === "worker" });
  const { data: pendingRequests, isLoading: requestsLoading } = trpc.consent.getMyPendingRequests.useQuery(undefined, { enabled: role === "worker" });
  const { data: myRequests, isLoading: myRequestsLoading } = trpc.consent.getMyRequests.useQuery(undefined, { enabled: role === "hirer" });

  const revokeMutation = trpc.consent.revokeConsent.useMutation({
    onSuccess: () => utils.consent.getMyConsents.invalidate(),
    onError: (err) => setError(err.message),
  });
  const approveMutation = trpc.consent.approveRequest.useMutation({
    onSuccess: () => { utils.consent.getMyPendingRequests.invalidate(); utils.consent.getMyConsents.invalidate(); },
    onError: (err) => setError(err.message),
  });
  const rejectMutation = trpc.consent.rejectRequest.useMutation({
    onSuccess: () => utils.consent.getMyPendingRequests.invalidate(),
    onError: (err) => setError(err.message),
  });

  if (role === "hirer") return <HirerConsentView />;

  const pendingList = pendingRequests?.requests as Array<Record<string, unknown>> | undefined;
  const pendingCount = pendingList?.length ?? 0;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Consent
        </h1>
        <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>
          You decide who sees your details. Revoke access any time.
        </p>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Pending requests */}
      {!requestsLoading && pendingCount > 0 && (
        <div style={{
          background: "#FDF6E8", borderRadius: 12, padding: "16px 20px",
          marginBottom: 12, border: `1px solid ${C.amber}33`,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>
            {pendingCount} pending request{pendingCount > 1 ? "s" : ""}
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {pendingList!.map((r) => (
              <div key={r.id as string} style={{ background: "#fff", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 4 }}>
                  {humanizeFields(r.fields)}
                </div>
                {typeof r.message === "string" && r.message && (
                  <div style={{ fontSize: 13, color: C.sub, marginBottom: 6, fontStyle: "italic" }}>
                    &ldquo;{r.message}&rdquo;
                  </div>
                )}
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
                  {r.requested_at ? new Date(r.requested_at as string).toLocaleDateString() : ""}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => approveMutation.mutate({ requestId: r.id as string })}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    style={{
                      padding: "8px 18px", background: C.green, color: "#fff",
                      border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}
                  >Approve</button>
                  <button
                    onClick={() => rejectMutation.mutate({ requestId: r.id as string })}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    style={{
                      padding: "8px 18px", background: "#fff", color: "#DC2626",
                      border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}
                  >Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explainer when no pending */}
      {!requestsLoading && pendingCount === 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 12, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 4 }}>No pending requests</div>
          <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: 1.5 }}>
            When a hirer wants to see your details, their request appears here. You approve or reject each one.
          </p>
        </div>
      )}

      {/* Active grants */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Active access grants</div>
        {consentsLoading ? (
          <div style={{ display: "grid", gap: 8 }}>
            {[1, 2].map((n) => <div key={n} style={{ height: 52, background: C.bg, borderRadius: 8 }} />)}
          </div>
        ) : (consents?.consents as unknown[])?.length === 0 ? (
          <div style={{ padding: "16px 0", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: C.sub }}>No active grants.</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>When you approve a request, the grant appears here.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {(consents?.consents as Array<Record<string, unknown>>)?.map((c) => (
              <div key={c.id as string} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", borderRadius: 8, background: C.bg,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{humanizeFields(c.fields)}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    Expires {c.expires_at ? new Date(c.expires_at as string).toLocaleDateString() : "never"}
                  </div>
                </div>
                <button
                  onClick={() => revokeMutation.mutate({ consentId: c.id as string })}
                  disabled={revokeMutation.isPending}
                  style={{
                    padding: "6px 14px", background: "#fff", color: "#DC2626",
                    border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >Revoke</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function HirerConsentView() {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Your access requests
          </h1>
          <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>
            Track requests you&apos;ve sent to workers.
          </p>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Request history</div>
          {myRequestsLoading ? (
            <div style={{ display: "grid", gap: 8 }}>
              {[1, 2].map((n) => <div key={n} style={{ height: 52, background: C.bg, borderRadius: 8 }} />)}
            </div>
          ) : (myRequests?.requests as unknown[])?.length === 0 ? (
            <div style={{ padding: "16px 0", textAlign: "center" }}>
              <div style={{ fontSize: 14, color: C.sub }}>No requests yet.</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                <a href="/search" style={{ color: C.amber, fontWeight: 600, textDecoration: "none" }}>Search for workers</a> and request access to their trust cards.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {(myRequests?.requests as Array<Record<string, unknown>>)?.map((r) => (
                <div key={r.id as string} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", borderRadius: 8, background: C.bg,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{humanizeFields(r.fields)}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                      {r.requested_at ? new Date(r.requested_at as string).toLocaleDateString() : ""}
                    </div>
                  </div>
                  <StatusBadge status={r.status as string} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    pending: { bg: "#FDF6E8", text: "#C49A1A" },
    approved: { bg: "#DCFCE7", text: "#16A34A" },
    rejected: { bg: "#FEF2F2", text: "#DC2626" },
    expired: { bg: "#F3F4F6", text: "#6B7280" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{
      padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.text, textTransform: "uppercase",
    }}>
      {status}
    </span>
  );
}
