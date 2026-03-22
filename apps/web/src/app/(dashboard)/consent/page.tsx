"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

const C = { amber: "#C49A1A", navy: "#0D1B2A", green: "#34C759", blue: "#007AFF", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

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

  const { data: consents, isLoading: consentsLoading } = trpc.consent.getMyConsents.useQuery(
    undefined,
    { enabled: role === "worker" }
  );
  const { data: pendingRequests, isLoading: requestsLoading } = trpc.consent.getMyPendingRequests.useQuery(
    undefined,
    { enabled: role === "worker" }
  );

  const { data: myRequests, isLoading: myRequestsLoading } = trpc.consent.getMyRequests.useQuery(
    undefined,
    { enabled: role === "hirer" }
  );

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

  const pendingList = pendingRequests?.requests as Array<Record<string, unknown>> | undefined;
  const pendingCount = pendingList?.length ?? 0;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, letterSpacing: "-0.02em", margin: 0 }}>
          Manage Consent
        </h1>
        <p style={{ color: C.sub, fontSize: 14, marginTop: 4 }}>
          Control which hirers can see your profile data.
        </p>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", borderLeft: "3px solid #FF3B30", color: "#FF3B30", padding: "10px 14px", borderRadius: 14, marginBottom: 14, fontSize: 13, border: `1px solid ${C.border}` }}>
          {error}
        </div>
      )}

      {/* Pending Access Requests */}
      {!requestsLoading && pendingCount > 0 && (
        <div style={{
          background: "#fff", borderRadius: 14, padding: 18,
          marginBottom: 14, borderLeft: `3px solid ${C.amber}`,
          border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.amber }}>
              Pending Requests
            </div>
            <span style={{
              fontSize: 11, fontWeight: 800, color: C.amber,
              background: "#FDF6E8", padding: "3px 10px", borderRadius: 99,
            }}>
              {pendingCount}
            </span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {pendingList!.map((r) => (
              <div key={r.id as string} style={{
                background: C.bg, borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>
                      {humanizeFields(r.fields)}
                    </div>
                    {typeof r.message === "string" && r.message && (
                      <div style={{ fontSize: 13, color: C.sub, marginTop: 4, fontStyle: "italic", lineHeight: 1.4 }}>
                        &ldquo;{r.message}&rdquo;
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                      {r.requested_at ? new Date(r.requested_at as string).toLocaleDateString() : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginLeft: 12, flexShrink: 0 }}>
                    <button
                      onClick={() => approveMutation.mutate({ requestId: r.id as string })}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      style={{
                        padding: "8px 16px", background: C.green, color: "#fff",
                        border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate({ requestId: r.id as string })}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      style={{
                        padding: "8px 16px", background: "#fff", color: "#FF3B30",
                        border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
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

      {/* How consent works */}
      {!requestsLoading && pendingCount === 0 && (
        <div style={{
          background: "#fff", borderRadius: 14, padding: 18,
          marginBottom: 14, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontWeight: 800, color: C.navy, fontSize: 14, marginBottom: 4 }}>How consent works</div>
          <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: 1.6 }}>
            When a hirer wants to see your profile, they send an access request.
            You&apos;ll see it here. You can approve or reject each request.
          </p>
        </div>
      )}

      {/* Active Consents */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 18, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 14 }}>Active Consent Grants</div>
        {consentsLoading ? (
          <div style={{ display: "grid", gap: 10 }}>
            {[1, 2].map((n) => (
              <div key={n} style={{ height: 64, background: C.bg, borderRadius: 12 }} />
            ))}
          </div>
        ) : (consents?.consents as unknown[])?.length === 0 ? (
          <div style={{ padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: C.sub }}>No active consent grants.</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              Grants appear here when you approve a hirer&apos;s access request.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {(consents?.consents as Array<Record<string, unknown>>)?.map((c) => (
              <div key={c.id as string} style={{
                background: C.bg, borderRadius: 12, padding: "14px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>
                    {humanizeFields(c.fields)}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    Granted {c.granted_at ? new Date(c.granted_at as string).toLocaleDateString() : "—"}
                    {c.expires_at ? ` · Expires ${new Date(c.expires_at as string).toLocaleDateString()}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => revokeMutation.mutate({ consentId: c.id as string })}
                  disabled={revokeMutation.isPending}
                  style={{
                    padding: "8px 16px", background: "#fff", color: "#FF3B30",
                    border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13,
                    fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // =========================================================================
  function HirerConsentView() {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, letterSpacing: "-0.02em", margin: 0 }}>
            Access Requests
          </h1>
          <p style={{ color: C.sub, fontSize: 14, marginTop: 4 }}>
            Track the status of your access requests to worker profiles.
          </p>
        </div>

        {/* Guide */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: 18,
          marginBottom: 14, borderLeft: `3px solid ${C.blue}`,
          border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontWeight: 800, color: C.blue, fontSize: 14, marginBottom: 6 }}>How to request access</div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.sub, lineHeight: 1.8 }}>
            <li>Go to <a href="/search" style={{ color: C.amber, fontWeight: 700, textDecoration: "none" }}>Search</a> and find a worker</li>
            <li>View their trust card</li>
            <li>Click &ldquo;Request Access&rdquo;</li>
          </ol>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", borderLeft: "3px solid #FF3B30", color: "#FF3B30", padding: "10px 14px", borderRadius: 14, marginBottom: 14, fontSize: 13, border: `1px solid ${C.border}` }}>
            {error}
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 14, padding: 18, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 14 }}>My Requests</div>
          {myRequestsLoading ? (
            <div style={{ display: "grid", gap: 10 }}>
              {[1, 2].map((n) => (
                <div key={n} style={{ height: 64, background: C.bg, borderRadius: 12 }} />
              ))}
            </div>
          ) : (myRequests?.requests as unknown[])?.length === 0 ? (
            <div style={{ padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 14, color: C.sub }}>No access requests yet.</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                Use <a href="/search" style={{ color: C.amber, fontWeight: 700, textDecoration: "none" }}>Search</a> to find workers and request access.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {(myRequests?.requests as Array<Record<string, unknown>>)?.map((r) => (
                <div key={r.id as string} style={{
                  background: C.bg, borderRadius: 12, padding: "14px 16px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>
                      {humanizeFields(r.fields)}
                    </div>
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
    approved: { bg: "#E8FAE8", text: "#34C759" },
    rejected: { bg: "#FEF2F2", text: "#FF3B30" },
    expired: { bg: "#F7F6F3", text: "#8E8E93" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{
      padding: "4px 12px", borderRadius: 99, fontSize: 10, fontWeight: 800,
      background: s.bg, color: s.text,
      textTransform: "uppercase", letterSpacing: "0.04em",
    }}>
      {status}
    </span>
  );
}
