"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ height: 24, width: 160, background: "#F1F5F9", borderRadius: 6, marginBottom: 24 }} />
        <div style={{ height: 120, background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0" }} />
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.025em", margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
          {user.role === "worker" ? "Manage your profile and trust card" : "Manage your workers and access requests"}
        </p>
      </div>
      {user.role === "worker" ? <WorkerDashboard /> : <HirerDashboard />}
    </div>
  );
}

function HirerDashboard() {
  const { data: workers, isLoading, error } = trpc.hirer.getMyWorkers.useQuery();

  return (
    <div>
      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
          {error.message}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
        <a href="/search" style={{
          display: "flex", flexDirection: "column", padding: 20,
          background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12,
          textDecoration: "none", color: "#1D4ED8",
        }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Search Workers</span>
          <span style={{ fontSize: 13, color: "#3B82F6", marginTop: 4 }}>Find verified talent</span>
        </a>
        <a href="/consent" style={{
          display: "flex", flexDirection: "column", padding: 20,
          background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12,
          textDecoration: "none", color: "#334155",
        }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Access Requests</span>
          <span style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>View request status</span>
        </a>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>Workers with Active Access</h2>

      {isLoading ? (
        <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, padding: 32, textAlign: "center" }}>
          <p style={{ color: "#94A3B8", fontSize: 14 }}>Loading...</p>
        </div>
      ) : workers?.workers.length === 0 ? (
        <div style={{
          border: "1px dashed #CBD5E1", borderRadius: 12, padding: 32, textAlign: "center",
        }}>
          <div style={{ fontSize: 14, color: "#64748B", marginBottom: 4 }}>No workers with active consent yet.</div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            Use <a href="/search" style={{ color: "#1D4ED8", fontWeight: 600 }}>Search</a> to find workers and request access.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {workers?.workers.map((w: Record<string, unknown>, i: number) => (
            <a key={i} href={`/worker/${w.worker_id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{
                border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 18px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#fff", cursor: "pointer",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#0F172A" }}>
                    {Array.isArray(w.fields) ? (w.fields as string[]).join(", ") : "Profile access"}
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                    Expires {w.expires_at ? new Date(w.expires_at as string).toLocaleDateString() : "never"}
                  </div>
                </div>
                <span style={{ fontSize: 13, color: "#64748B" }}>View &rarr;</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkerDashboard() {
  const { data: profile, isLoading: profileLoading, error: profileError } = trpc.worker.getProfile.useQuery();
  const { data: trustCard, isLoading: trustLoading } = trpc.worker.getMyTrustCard.useQuery();
  const { data: consents } = trpc.consent.getMyConsents.useQuery();
  const { data: pendingRequests } = trpc.consent.getMyPendingRequests.useQuery();

  if (profileLoading || trustLoading) {
    return (
      <div>
        <div style={{ height: 120, background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0", marginBottom: 16 }} />
        <div style={{ height: 100, background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0" }} />
      </div>
    );
  }

  if (profileError) {
    return (
      <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
        Error loading profile: {profileError.message}
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{
        border: "1px solid #E2E8F0", borderRadius: 16, padding: "48px 32px",
        textAlign: "center", background: "#F8FAFC",
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>&#9733;</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
          Welcome to SafeHire
        </h2>
        <p style={{ color: "#64748B", marginBottom: 24, maxWidth: 360, margin: "0 auto 24px", lineHeight: 1.5 }}>
          Create your profile to start building your trust card. It takes less than a minute.
        </p>
        <a
          href="/profile/create"
          style={{
            display: "inline-flex", alignItems: "center", padding: "14px 28px",
            background: "#1D4ED8", color: "#fff", borderRadius: 8,
            textDecoration: "none", fontSize: 15, fontWeight: 600,
          }}
        >
          Create your profile
        </a>
      </div>
    );
  }

  const p = profile as Record<string, unknown>;
  const tc = trustCard as Record<string, unknown>;
  const pendingCount = (pendingRequests?.requests as unknown[])?.length ?? 0;

  const tierColors: Record<string, { bg: string; text: string; border: string }> = {
    unverified: { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" },
    basic: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    enhanced: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  };
  const tier = (tc?.tier as string) ?? "unverified";
  const tc_ = tierColors[tier] ?? tierColors.unverified;

  return (
    <div>
      {/* Pending requests banner */}
      {pendingCount > 0 && (
        <a href="/consent" style={{ textDecoration: "none" }}>
          <div style={{
            background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10,
            padding: "12px 16px", marginBottom: 20, display: "flex",
            justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ color: "#92400E", fontWeight: 600, fontSize: 14 }}>
              {pendingCount} pending access request{pendingCount > 1 ? "s" : ""}
            </span>
            <span style={{
              color: "#D97706", fontSize: 12, fontWeight: 600,
              background: "#FEF3C7", padding: "3px 10px", borderRadius: 12,
            }}>
              Review
            </span>
          </div>
        </a>
      )}

      {/* Profile card */}
      <div style={{
        border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, marginBottom: 16,
        background: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#0F172A" }}>{p.full_name as string}</div>
            <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
              {Array.isArray(p.skills) && (p.skills as string[]).length > 0
                ? (p.skills as string[]).join(", ")
                : "No skills listed"}
            </div>
            <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>
              {p.experience_years as number} years experience
            </div>
          </div>
          <span style={{
            background: tc_.bg, color: tc_.text, border: `1px solid ${tc_.border}`,
            padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.04em",
          }}>
            {tier}
          </span>
        </div>
      </div>

      {/* Trust card stats */}
      <div className="grid-4col" style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20,
      }}>
        {[
          { label: "Endorsements", value: (tc?.endorsement_count as number) ?? 0 },
          { label: "Tenure", value: `${(tc?.tenure_months as number) ?? 0}mo` },
          { label: "Incidents", value: tc?.incident_flag ? "Flagged" : "None" },
          { label: "Tier", value: tier },
        ].map((stat) => (
          <div key={stat.label} style={{
            border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 12px",
            textAlign: "center", background: "#FAFBFC",
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Active consents */}
      {consents && (consents.consents as unknown[]).length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>Active Consent Grants</h2>
            <a href="/consent" style={{ color: "#1D4ED8", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Manage</a>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {(consents.consents as Array<Record<string, unknown>>).map((c) => (
              <div key={c.id as string} style={{
                border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                    {Array.isArray(c.fields) ? (c.fields as string[]).join(", ") : "Profile access"}
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                    Expires {c.expires_at ? new Date(c.expires_at as string).toLocaleDateString() : "never"}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: "#15803D",
                  background: "#F0FDF4", padding: "2px 8px", borderRadius: 10,
                }}>
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
