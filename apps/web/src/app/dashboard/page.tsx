"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) return <p style={{ padding: 24, color: "#6B7280" }}>Loading...</p>;

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <div style={{ maxWidth: 700, padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
      {user.role === "worker" ? <WorkerDashboard /> : <HirerDashboard />}
    </div>
  );
}

function HirerDashboard() {
  const { data: workers, isLoading, error } = trpc.hirer.getMyWorkers.useQuery();

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Your Workers</h2>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
          {error.message}
        </div>
      )}

      {isLoading ? (
        <p style={{ color: "#6B7280" }}>Loading...</p>
      ) : workers?.workers.length === 0 ? (
        <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 24, textAlign: "center" }}>
          <p style={{ color: "#6B7280", marginBottom: 12 }}>
            No workers with active consent grants yet.
          </p>
          <a
            href="/search"
            style={{
              display: "inline-block", padding: "8px 16px", background: "#2563EB",
              color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 14,
            }}
          >
            Search for Workers
          </a>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {workers?.workers.map((w: Record<string, unknown>, i: number) => (
            <a key={i} href={`/worker/${w.worker_id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 16, cursor: "pointer" }}>
                <div style={{ fontWeight: 600 }}>Worker: {(w.worker_id as string)?.slice(0, 8)}...</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                  Fields: {Array.isArray(w.fields) ? (w.fields as string[]).join(", ") : "—"}
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                  Expires: {w.expires_at ? new Date(w.expires_at as string).toLocaleDateString() : "—"}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <a href="/search" style={{ color: "#2563EB", fontSize: 14, marginRight: 16 }}>Search Workers</a>
        <a href="/consent" style={{ color: "#2563EB", fontSize: 14 }}>View my access requests</a>
      </div>
    </div>
  );
}

function WorkerDashboard() {
  const { data: profile, isLoading: profileLoading, error: profileError } = trpc.worker.getProfile.useQuery();
  const { data: trustCard, isLoading: trustLoading } = trpc.worker.getMyTrustCard.useQuery();
  const { data: consents } = trpc.consent.getMyConsents.useQuery();
  const { data: pendingRequests } = trpc.consent.getMyPendingRequests.useQuery();

  if (profileLoading || trustLoading) return <p style={{ color: "#6B7280" }}>Loading...</p>;

  if (profileError) {
    return (
      <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
        Error loading profile: {profileError.message}
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 24, textAlign: "center" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Welcome!</h2>
        <p style={{ color: "#6B7280", marginBottom: 16 }}>Create your profile to start building your trust card.</p>
        <a
          href="/profile/create"
          style={{
            display: "inline-block", padding: "12px 24px", background: "#2563EB",
            color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 16, fontWeight: 600,
          }}
        >
          Create Profile
        </a>
      </div>
    );
  }

  const p = profile as Record<string, unknown>;
  const tc = trustCard as Record<string, unknown>;
  const pendingCount = (pendingRequests?.requests as unknown[])?.length ?? 0;

  return (
    <div>
      {/* Pending requests notification */}
      {pendingCount > 0 && (
        <a href="/consent" style={{ textDecoration: "none" }}>
          <div style={{
            background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 8,
            padding: 12, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ color: "#92400E", fontWeight: 600, fontSize: 14 }}>
              {pendingCount} pending access request{pendingCount > 1 ? "s" : ""}
            </span>
            <span style={{ color: "#D97706", fontSize: 13 }}>Review &rarr;</span>
          </div>
        </a>
      )}

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Your Profile</h2>
      <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 16, marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 18 }}>{p.full_name as string}</div>
        <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          Skills: {Array.isArray(p.skills) ? (p.skills as string[]).join(", ") : "—"}
        </div>
        <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          Experience: {p.experience_years as number} years
        </div>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 8, fontFamily: "monospace" }}>
          User ID: {p.user_id as string}
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Your Trust Card</h2>
      <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 16, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>TIER</div>
            <div style={{ fontWeight: 600 }}>{(tc?.tier as string) ?? "unverified"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>ENDORSEMENTS</div>
            <div style={{ fontWeight: 600 }}>{(tc?.endorsement_count as number) ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>TENURE</div>
            <div style={{ fontWeight: 600 }}>{(tc?.tenure_months as number) ?? 0} months</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>INCIDENTS</div>
            <div style={{ fontWeight: 600 }}>{tc?.incident_flag ? "Flagged" : "None"}</div>
          </div>
        </div>
      </div>

      {consents && (consents.consents as unknown[]).length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Active Consent Grants</h2>
            <a href="/consent" style={{ color: "#2563EB", fontSize: 13 }}>Manage</a>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {(consents.consents as Array<Record<string, unknown>>).map((c) => (
              <div key={c.id as string} style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 14 }}>
                  Hirer: {(c.hirer_id as string)?.slice(0, 8)}... |
                  Fields: {Array.isArray(c.fields) ? (c.fields as string[]).join(", ") : "—"} |
                  Expires: {c.expires_at ? new Date(c.expires_at as string).toLocaleDateString() : "—"}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
