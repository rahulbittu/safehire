"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

export default function ConsentPage() {
  const [error, setError] = useState("");
  const { user } = useAuth();
  const role = user?.role ?? null;

  const utils = trpc.useUtils();

  // Worker queries
  const { data: consents, isLoading: consentsLoading } = trpc.consent.getMyConsents.useQuery(
    undefined,
    { enabled: role === "worker" }
  );
  const { data: pendingRequests, isLoading: requestsLoading } = trpc.consent.getMyPendingRequests.useQuery(
    undefined,
    { enabled: role === "worker" }
  );

  // Hirer queries
  const { data: myRequests, isLoading: myRequestsLoading } = trpc.consent.getMyRequests.useQuery(
    undefined,
    { enabled: role === "hirer" }
  );

  // Worker mutations
  const revokeMutation = trpc.consent.revokeConsent.useMutation({
    onSuccess: () => utils.consent.getMyConsents.invalidate(),
    onError: (err) => setError(err.message),
  });
  const approveMutation = trpc.consent.approveRequest.useMutation({
    onSuccess: () => {
      utils.consent.getMyPendingRequests.invalidate();
      utils.consent.getMyConsents.invalidate();
    },
    onError: (err) => setError(err.message),
  });
  const rejectMutation = trpc.consent.rejectRequest.useMutation({
    onSuccess: () => utils.consent.getMyPendingRequests.invalidate(),
    onError: (err) => setError(err.message),
  });

  if (role === "hirer") return <HirerConsentView />;

  // Worker view
  const pendingList = pendingRequests?.requests as Array<Record<string, unknown>> | undefined;
  const pendingCount = pendingList?.length ?? 0;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.025em", margin: 0 }}>
          Manage Consent
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
          Control which hirers can see your profile data. Revoke access at any time.
        </p>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Pending Access Requests */}
      {!requestsLoading && pendingCount > 0 && (
        <div style={{
          border: "1px solid #FDE68A", borderRadius: 12, padding: 20,
          marginBottom: 24, background: "#FFFBEB",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#92400E", margin: 0 }}>
              Pending Requests
            </h2>
            <span style={{
              fontSize: 12, fontWeight: 700, color: "#D97706",
              background: "#FEF3C7", padding: "3px 10px", borderRadius: 12,
            }}>
              {pendingCount}
            </span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {pendingList!.map((r) => (
              <div key={r.id as string} style={{
                background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                      {Array.isArray(r.fields) ? (r.fields as string[]).join(", ") : "Profile access"}
                    </div>
                    {typeof r.message === "string" && r.message && (
                      <div style={{ fontSize: 13, color: "#64748B", marginTop: 4, fontStyle: "italic", lineHeight: 1.4 }}>
                        &ldquo;{r.message}&rdquo;
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
                      {r.requested_at ? new Date(r.requested_at as string).toLocaleDateString() : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginLeft: 12, flexShrink: 0 }}>
                    <button
                      onClick={() => approveMutation.mutate({ requestId: r.id as string })}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      style={{
                        padding: "6px 14px", background: "#15803D", color: "#fff",
                        border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate({ requestId: r.id as string })}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      style={{
                        padding: "6px 14px", background: "#fff", color: "#DC2626",
                        border: "1px solid #FECACA", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How consent works — show only when no pending requests */}
      {!requestsLoading && pendingCount === 0 && (
        <div style={{
          background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12,
          padding: "16px 20px", marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, color: "#334155", fontSize: 13, marginBottom: 4 }}>How consent works</div>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
            When a hirer wants to see your profile, they send an access request.
            You&apos;ll see it here. You can approve or reject each request.
          </p>
        </div>
      )}

      {/* Active Consents */}
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>Active Consent Grants</h2>
      {consentsLoading ? (
        <div style={{ display: "grid", gap: 10 }}>
          {[1, 2].map((n) => (
            <div key={n} style={{ height: 64, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }} />
          ))}
        </div>
      ) : (consents?.consents as unknown[])?.length === 0 ? (
        <div style={{
          border: "1px dashed #CBD5E1", borderRadius: 12, padding: 28, textAlign: "center",
        }}>
          <div style={{ fontSize: 14, color: "#64748B" }}>No active consent grants.</div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
            Grants appear here when you approve a hirer&apos;s access request.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {(consents?.consents as Array<Record<string, unknown>>)?.map((c) => (
            <div key={c.id as string} style={{
              border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 18px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                  {Array.isArray(c.fields) ? (c.fields as string[]).join(", ") : "Profile access"}
                </div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                  Granted {c.granted_at ? new Date(c.granted_at as string).toLocaleDateString() : "—"}
                  {c.expires_at ? ` · Expires ${new Date(c.expires_at as string).toLocaleDateString()}` : ""}
                </div>
              </div>
              <button
                onClick={() => revokeMutation.mutate({ consentId: c.id as string })}
                disabled={revokeMutation.isPending}
                style={{
                  padding: "6px 14px", background: "#fff", color: "#DC2626",
                  border: "1px solid #FECACA", borderRadius: 6, fontSize: 12,
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // =========================================================================
  // Hirer view
  // =========================================================================

  function HirerConsentView() {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.025em", margin: 0 }}>
            Access Requests
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
            Track the status of your access requests to worker profiles.
          </p>
        </div>

        {/* Guide */}
        <div style={{
          background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12,
          padding: "16px 20px", marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, color: "#1D4ED8", fontSize: 13, marginBottom: 6 }}>How to request access</div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#1E40AF", lineHeight: 1.8 }}>
            <li>Go to <a href="/search" style={{ color: "#1D4ED8", fontWeight: 700, textDecoration: "none" }}>Search</a> and find a worker</li>
            <li>View their trust card</li>
            <li>Click &ldquo;Request Access&rdquo;</li>
          </ol>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
            {error}
          </div>
        )}

        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>My Requests</h2>
        {myRequestsLoading ? (
          <div style={{ display: "grid", gap: 10 }}>
            {[1, 2].map((n) => (
              <div key={n} style={{ height: 64, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }} />
            ))}
          </div>
        ) : (myRequests?.requests as unknown[])?.length === 0 ? (
          <div style={{
            border: "1px dashed #CBD5E1", borderRadius: 12, padding: 28, textAlign: "center",
          }}>
            <div style={{ fontSize: 14, color: "#64748B" }}>No access requests yet.</div>
            <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
              Use <a href="/search" style={{ color: "#1D4ED8", fontWeight: 600, textDecoration: "none" }}>Search</a> to find workers and request access.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {(myRequests?.requests as Array<Record<string, unknown>>)?.map((r) => (
              <div key={r.id as string} style={{
                border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 18px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                    {Array.isArray(r.fields) ? (r.fields as string[]).join(", ") : "Profile access"}
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                    {r.requested_at ? new Date(r.requested_at as string).toLocaleDateString() : ""}
                  </div>
                </div>
                <StatusBadge status={r.status as string} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
    approved: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    rejected: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
    expired: { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      textTransform: "uppercase", letterSpacing: "0.04em",
    }}>
      {status}
    </span>
  );
}
