"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

const AVAILABLE_FIELDS = ["full_name", "skills", "languages", "experience_years", "photo_url", "verified_at"];

export default function ConsentPage() {
  const [hirerId, setHirerId] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>(["full_name", "skills"]);
  const [expiresInDays, setExpiresInDays] = useState(90);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string | null>(null);

  // Detect role from localStorage
  if (typeof window !== "undefined" && role === null) {
    setRole(localStorage.getItem("verifyme-role") || "worker");
  }

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
  const grantMutation = trpc.consent.grantConsent.useMutation({
    onSuccess: () => { setHirerId(""); setError(""); utils.consent.getMyConsents.invalidate(); },
    onError: (err) => setError(err.message),
  });
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

  // Hirer mutations
  const requestMutation = trpc.consent.requestAccess.useMutation({
    onSuccess: () => {
      setHirerId("");
      setError("");
      utils.consent.getMyRequests.invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

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

      {/* Grant New Consent */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 16, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Grant New Access</h2>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Hirer ID (UUID)</label>
          <input
            type="text"
            placeholder="Hirer UUID"
            value={hirerId}
            onChange={(e) => setHirerId(e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Fields to Share</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {AVAILABLE_FIELDS.map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => toggleField(field)}
                style={{
                  padding: "4px 10px", borderRadius: 12, fontSize: 13, cursor: "pointer",
                  border: "1px solid #D1D5DB",
                  background: selectedFields.includes(field) ? "#2563EB" : "#fff",
                  color: selectedFields.includes(field) ? "#fff" : "#1F2937",
                }}
              >
                {field.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Expires in (days)</label>
          <input
            type="number"
            min={1}
            max={365}
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 90)}
            style={{ width: 100, padding: 8, border: "1px solid #D1D5DB", borderRadius: 6 }}
          />
        </div>

        <button
          onClick={() => {
            if (!hirerId || selectedFields.length === 0) {
              setError("Hirer ID and at least one field are required");
              return;
            }
            grantMutation.mutate({ hirerId, fields: selectedFields, expiresInDays });
          }}
          disabled={grantMutation.isPending}
          style={{ padding: "8px 16px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          {grantMutation.isPending ? "Granting..." : "Grant Access"}
        </button>
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
    const [workerId, setWorkerId] = useState("");
    const [reqFields, setReqFields] = useState<string[]>(["full_name", "skills"]);
    const [message, setMessage] = useState("");

    return (
      <div style={{ maxWidth: 700, padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Request Worker Access</h1>
        <p style={{ color: "#6B7280", marginBottom: 24 }}>
          Request access to a worker&apos;s profile data. The worker will be notified and can approve or reject your request.
        </p>

        {error && (
          <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Request Access Form */}
        <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>New Access Request</h2>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Worker ID (UUID)</label>
            <input
              type="text"
              placeholder="Worker UUID"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              style={{ width: "100%", padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Fields to Request</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {AVAILABLE_FIELDS.map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => setReqFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field])}
                  style={{
                    padding: "4px 10px", borderRadius: 12, fontSize: 13, cursor: "pointer",
                    border: "1px solid #D1D5DB",
                    background: reqFields.includes(field) ? "#2563EB" : "#fff",
                    color: reqFields.includes(field) ? "#fff" : "#1F2937",
                  }}
                >
                  {field.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Message (optional)</label>
            <textarea
              placeholder="Why do you need access to this worker's data?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              style={{ width: "100%", padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, boxSizing: "border-box", resize: "vertical" }}
            />
          </div>

          <button
            onClick={() => {
              if (!workerId || reqFields.length === 0) {
                setError("Worker ID and at least one field are required");
                return;
              }
              requestMutation.mutate({ workerId, fields: reqFields, message: message || undefined });
            }}
            disabled={requestMutation.isPending}
            style={{ padding: "8px 16px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            {requestMutation.isPending ? "Sending..." : "Send Request"}
          </button>
        </div>

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
