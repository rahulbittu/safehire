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
  return (
    <div style={{ maxWidth: 700, padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Manage Consent</h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>
        Control which hirers can see your profile data. You can grant and revoke access at any time.
      </p>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Pending Access Requests */}
      <PendingRequests
        requests={pendingRequests?.requests as Array<Record<string, unknown>> | undefined}
        isLoading={requestsLoading}
        onApprove={(id: string) => approveMutation.mutate({ requestId: id })}
        onReject={(id: string) => rejectMutation.mutate({ requestId: id })}
        isPending={approveMutation.isPending || rejectMutation.isPending}
      />

      {/* How consent works */}
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: 16, marginBottom: 24 }}>
        <div style={{ fontWeight: 600, color: "#1E40AF", marginBottom: 4 }}>How consent works</div>
        <p style={{ fontSize: 14, color: "#1E40AF", margin: 0 }}>
          When a hirer wants to see your profile, they send an access request.
          You&apos;ll see it in &quot;Pending Access Requests&quot; above. You can approve or reject each request.
        </p>
      </div>

      {/* Active Consents */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Active Consent Grants</h2>
      {consentsLoading ? (
        <p style={{ color: "#6B7280" }}>Loading...</p>
      ) : (consents?.consents as unknown[])?.length === 0 ? (
        <p style={{ color: "#9CA3AF" }}>No active consent grants.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {(consents?.consents as Array<Record<string, unknown>>)?.map((c) => (
            <div key={c.id as string} style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    Hirer: {(c.hirer_id as string)?.slice(0, 8)}...
                  </div>
                  <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                    Fields: {Array.isArray(c.fields) ? (c.fields as string[]).join(", ") : "—"}
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                    Granted: {c.granted_at ? new Date(c.granted_at as string).toLocaleDateString() : "—"} |
                    Expires: {c.expires_at ? new Date(c.expires_at as string).toLocaleDateString() : "—"}
                  </div>
                </div>
                <button
                  onClick={() => revokeMutation.mutate({ consentId: c.id as string })}
                  disabled={revokeMutation.isPending}
                  style={{ padding: "4px 12px", background: "#DC2626", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // =========================================================================
  // Sub-components
  // =========================================================================

  function PendingRequests({
    requests,
    isLoading: loading,
    onApprove,
    onReject,
    isPending,
  }: {
    requests: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    isPending: boolean;
  }) {
    if (loading) return null;
    if (!requests || requests.length === 0) return null;

    return (
      <div style={{ border: "2px solid #F59E0B", borderRadius: 8, padding: 16, marginBottom: 24, background: "#FFFBEB" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#92400E" }}>
          Pending Access Requests ({requests.length})
        </h2>
        <div style={{ display: "grid", gap: 12 }}>
          {requests.map((r) => (
            <div key={r.id as string} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                Hirer: {(r.hirer_id as string)?.slice(0, 8)}...
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                Requested fields: {Array.isArray(r.fields) ? (r.fields as string[]).join(", ") : "—"}
              </div>
              {typeof r.message === "string" && r.message && (
                <div style={{ fontSize: 13, color: "#4B5563", marginTop: 4, fontStyle: "italic" }}>
                  &quot;{r.message}&quot;
                </div>
              )}
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                Requested: {r.requested_at ? new Date(r.requested_at as string).toLocaleDateString() : "—"}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => onApprove(r.id as string)}
                  disabled={isPending}
                  style={{ padding: "4px 12px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject(r.id as string)}
                  disabled={isPending}
                  style={{ padding: "4px 12px", background: "#DC2626", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function HirerConsentView() {
    return (
      <div style={{ maxWidth: 700, padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Consent &amp; Access Requests</h1>
        <p style={{ color: "#6B7280", marginBottom: 24 }}>
          View the status of your access requests. To request access to a new worker, use Search.
        </p>

        {/* Guide to requesting access */}
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: "#1E40AF", marginBottom: 4 }}>How to request access</div>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#1E40AF" }}>
            <li>Go to <a href="/search" style={{ color: "#2563EB", fontWeight: 600 }}>Search</a> and find a worker</li>
            <li>Click on their profile to view their trust card</li>
            <li>Click &quot;Request Access&quot; to ask for their profile data</li>
          </ol>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* My Requests */}
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>My Requests</h2>
        {myRequestsLoading ? (
          <p style={{ color: "#6B7280" }}>Loading...</p>
        ) : (myRequests?.requests as unknown[])?.length === 0 ? (
          <p style={{ color: "#9CA3AF" }}>No access requests.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {(myRequests?.requests as Array<Record<string, unknown>>)?.map((r) => (
              <div key={r.id as string} style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      Worker: {(r.worker_id as string)?.slice(0, 8)}...
                    </div>
                    <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                      Fields: {Array.isArray(r.fields) ? (r.fields as string[]).join(", ") : "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                      Requested: {r.requested_at ? new Date(r.requested_at as string).toLocaleDateString() : "—"}
                    </div>
                  </div>
                  <StatusBadge status={r.status as string} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: "#FEF3C7", text: "#92400E" },
    approved: { bg: "#DCFCE7", text: "#166534" },
    rejected: { bg: "#FEF2F2", text: "#991B1B" },
    expired: { bg: "#F3F4F6", text: "#6B7280" },
  };
  const c = colors[status] || colors.pending;
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600,
      background: c.bg, color: c.text,
    }}>
      {status}
    </span>
  );
}
