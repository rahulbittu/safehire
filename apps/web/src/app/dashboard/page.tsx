"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

const C = {
  primary: "#0A66C2",
  verified: "#057642",
  bg: "#F4F2EE",
  card: "#FFFFFF",
  text: "#191919",
  textSec: "#666666",
  textTer: "#999999",
  border: "#E0E0E0",
  warning: "#C37D16",
};

function Avatar({ name, size = 48, color }: { name: string; size?: number; color?: string }) {
  const bg = color || C.primary;
  const initial = name.charAt(0).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.42, fontWeight: 700, flexShrink: 0,
    }}>
      {initial}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card, borderRadius: 8,
      border: `1px solid ${C.border}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ maxWidth: 1128, margin: "0 auto", padding: "24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 240px", gap: 24 }} className="dashboard-grid">
          <div style={{ height: 300, background: "#fff", borderRadius: 8, border: `1px solid ${C.border}` }} />
          <div style={{ height: 400, background: "#fff", borderRadius: 8, border: `1px solid ${C.border}` }} />
          <div style={{ height: 200, background: "#fff", borderRadius: 8, border: `1px solid ${C.border}` }} />
        </div>
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <div style={{ maxWidth: 1128, margin: "0 auto", padding: "24px 24px" }}>
      {user.role === "worker" ? <WorkerDashboard /> : <HirerDashboard />}
    </div>
  );
}

// =============================================================================
// HIRER DASHBOARD
// =============================================================================

function HirerDashboard() {
  const { data: workers, isLoading, error } = trpc.hirer.getMyWorkers.useQuery();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 240px", gap: 24 }} className="dashboard-grid">
      {/* Left sidebar */}
      <div>
        <Card>
          <div style={{ background: "linear-gradient(135deg, #0A66C2, #004182)", height: 56, borderRadius: "8px 8px 0 0" }} />
          <div style={{ padding: "0 16px 16px", textAlign: "center", marginTop: -24 }}>
            <Avatar name="H" size={48} color={C.primary} />
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginTop: 8 }}>Hirer Dashboard</div>
            <div style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>Find verified workers</div>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: C.textSec }}>Active access</span>
              <span style={{ color: C.primary, fontWeight: 700 }}>{workers?.workers?.length ?? 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Center feed */}
      <div>
        {error && (
          <Card style={{ padding: 16, marginBottom: 16, borderLeft: `3px solid #CC1016` }}>
            <div style={{ fontSize: 14, color: "#CC1016" }}>{error.message}</div>
          </Card>
        )}

        {/* Quick actions */}
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Quick Actions
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="grid-2col">
            <a href="/search" style={{
              display: "flex", alignItems: "center", gap: 12, padding: 14,
              background: "#EEF3F8", borderRadius: 8, textDecoration: "none",
            }}>
              <span style={{ fontSize: 24 }}>🔍</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Search Workers</div>
                <div style={{ fontSize: 12, color: C.textSec }}>Find verified talent</div>
              </div>
            </a>
            <a href="/consent" style={{
              display: "flex", alignItems: "center", gap: 12, padding: 14,
              background: "#EEF3F8", borderRadius: 8, textDecoration: "none",
            }}>
              <span style={{ fontSize: 24 }}>📋</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Access Requests</div>
                <div style={{ fontSize: 12, color: C.textSec }}>View request status</div>
              </div>
            </a>
          </div>
        </Card>

        {/* Workers with active access */}
        <Card style={{ padding: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 14 }}>
            Workers with Active Access
          </div>
          {isLoading ? (
            <div style={{ display: "grid", gap: 12 }}>
              {[1, 2].map((n) => (
                <div key={n} style={{ height: 64, background: "#F4F2EE", borderRadius: 8 }} />
              ))}
            </div>
          ) : workers?.workers.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
              <div style={{ fontSize: 14, color: C.textSec }}>No workers with active consent yet.</div>
              <a href="/search" style={{
                display: "inline-block", marginTop: 12, padding: "8px 20px",
                background: C.primary, color: "#fff", borderRadius: 20,
                textDecoration: "none", fontSize: 14, fontWeight: 600,
              }}>
                Search Workers
              </a>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {workers?.workers.map((w: Record<string, unknown>, i: number) => (
                <a key={i} href={`/worker/${w.worker_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12, padding: 12,
                    borderRadius: 8, border: `1px solid ${C.border}`,
                    cursor: "pointer",
                  }}>
                    <Avatar name={String((w.fields as string[])?.[0] || "W")} size={40} color={C.verified} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                        {Array.isArray(w.fields) ? (w.fields as string[]).join(", ") : "Profile access"}
                      </div>
                      <div style={{ fontSize: 12, color: C.textSec }}>
                        Expires {w.expires_at ? new Date(w.expires_at as string).toLocaleDateString() : "never"}
                      </div>
                    </div>
                    <span style={{ fontSize: 13, color: C.primary, fontWeight: 600 }}>View →</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Right sidebar */}
      <div>
        <Card style={{ padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>
            Getting Started
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              "Search for workers by skill",
              "View trust cards for free",
              "Request access with consent",
              "Endorse workers you've hired",
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "start", fontSize: 13, color: C.textSec }}>
                <span style={{ color: C.primary, fontWeight: 700, flexShrink: 0 }}>✓</span>
                {tip}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// WORKER DASHBOARD
// =============================================================================

function WorkerDashboard() {
  const { data: profile, isLoading: profileLoading, error: profileError } = trpc.worker.getProfile.useQuery();
  const { data: trustCard, isLoading: trustLoading } = trpc.worker.getMyTrustCard.useQuery();
  const { data: consents } = trpc.consent.getMyConsents.useQuery();
  const { data: pendingRequests } = trpc.consent.getMyPendingRequests.useQuery();
  const { data: endorsements } = trpc.worker.getMyEndorsements.useQuery();

  if (profileLoading || trustLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 240px", gap: 24 }} className="dashboard-grid">
        <div style={{ height: 300, background: "#fff", borderRadius: 8, border: `1px solid ${C.border}` }} />
        <div style={{ height: 400, background: "#fff", borderRadius: 8, border: `1px solid ${C.border}` }} />
        <div style={{ height: 200, background: "#fff", borderRadius: 8, border: `1px solid ${C.border}` }} />
      </div>
    );
  }

  if (profileError) {
    return (
      <Card style={{ padding: 16, borderLeft: `3px solid #CC1016` }}>
        <div style={{ fontSize: 14, color: "#CC1016" }}>Error loading profile: {profileError.message}</div>
      </Card>
    );
  }

  // No profile yet — onboarding
  if (!profile) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Card>
          <div style={{ background: "linear-gradient(135deg, #057642, #0A66C2)", height: 80, borderRadius: "8px 8px 0 0" }} />
          <div style={{ padding: "0 32px 32px", textAlign: "center", marginTop: -24 }}>
            <Avatar name="?" size={64} color={C.primary} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginTop: 12, marginBottom: 4 }}>
              Welcome to SafeHire
            </h2>
            <p style={{ color: C.textSec, marginBottom: 24, lineHeight: 1.5, fontSize: 14 }}>
              Create your professional profile and start building your trust card.
              It takes less than a minute.
            </p>
            <a href="/profile/create" style={{
              display: "inline-block", padding: "12px 28px",
              background: C.primary, color: "#fff", borderRadius: 20,
              textDecoration: "none", fontSize: 16, fontWeight: 600,
            }}>
              Create your profile
            </a>
          </div>
        </Card>
      </div>
    );
  }

  const p = profile as Record<string, unknown>;
  const tc = trustCard as Record<string, unknown>;
  const tier = (tc?.tier as string) ?? "unverified";
  const pendingCount = (pendingRequests?.requests as unknown[])?.length ?? 0;
  const endorsementList = (endorsements?.endorsements ?? []) as Array<Record<string, unknown>>;

  const tierConfig: Record<string, { gradient: string; color: string; label: string }> = {
    unverified: { gradient: "linear-gradient(135deg, #666, #999)", color: C.textSec, label: "Unverified" },
    basic: { gradient: "linear-gradient(135deg, #0A66C2, #004182)", color: C.primary, label: "Basic Trust" },
    enhanced: { gradient: "linear-gradient(135deg, #057642, #0A4A2E)", color: C.verified, label: "Enhanced Trust" },
  };
  const tc_ = tierConfig[tier] ?? tierConfig.unverified;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 240px", gap: 24 }} className="dashboard-grid">
      {/* Left sidebar — Profile card */}
      <div>
        <Card>
          <div style={{ background: tc_.gradient, height: 56, borderRadius: "8px 8px 0 0" }} />
          <div style={{ padding: "0 16px 16px", textAlign: "center", marginTop: -28 }}>
            <Avatar name={p.full_name as string} size={56} color={tc_.color} />
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginTop: 8 }}>
              {p.full_name as string}
            </div>
            <div style={{ fontSize: 13, color: C.textSec, marginTop: 2, lineHeight: 1.4 }}>
              {Array.isArray(p.skills) && (p.skills as string[]).length > 0
                ? (p.skills as string[]).join(" · ")
                : "No skills listed"}
            </div>
            <div style={{
              display: "inline-block", marginTop: 8,
              padding: "3px 12px", borderRadius: 12,
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.04em",
              background: tier === "enhanced" ? "#E8F5E9" : tier === "basic" ? "#E3F2FD" : "#F5F5F5",
              color: tc_.color,
            }}>
              {tc_.label}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 16px" }}>
            {[
              { label: "Endorsements", value: (tc?.endorsement_count as number) ?? 0 },
              { label: "Tenure", value: `${(tc?.tenure_months as number) ?? 0} months` },
              { label: "Experience", value: `${p.experience_years as number} years` },
            ].map((stat) => (
              <div key={stat.label} style={{
                display: "flex", justifyContent: "space-between",
                padding: "4px 0", fontSize: 13,
              }}>
                <span style={{ color: C.textSec }}>{stat.label}</span>
                <span style={{ color: C.text, fontWeight: 600 }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Center feed */}
      <div>
        {/* Pending requests banner */}
        {pendingCount > 0 && (
          <a href="/consent" style={{ textDecoration: "none" }}>
            <Card style={{ padding: 16, marginBottom: 16, borderLeft: `3px solid ${C.warning}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🔔</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                      {pendingCount} pending access request{pendingCount > 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: 12, color: C.textSec }}>A hirer wants to view your profile</div>
                  </div>
                </div>
                <span style={{
                  padding: "6px 16px", borderRadius: 20,
                  background: C.warning, color: "#fff",
                  fontSize: 12, fontWeight: 700,
                }}>
                  Review
                </span>
              </div>
            </Card>
          </a>
        )}

        {/* Activity feed — endorsements */}
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 14 }}>
            Activity
          </div>
          {endorsementList.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
              <div style={{ fontSize: 14, color: C.textSec }}>No endorsements yet.</div>
              <div style={{ fontSize: 13, color: C.textTer, marginTop: 4 }}>
                Ask hirers you&apos;ve worked with to endorse you.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {endorsementList.slice(0, 5).map((e, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, padding: 12,
                  background: "#FAFAFA", borderRadius: 8,
                }}>
                  <Avatar name={String(e.relationship || "H")} size={40} color={C.primary} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                      {e.relationship as string}
                    </div>
                    {e.comment ? (
                      <div style={{ fontSize: 13, color: C.textSec, marginTop: 4, lineHeight: 1.5, fontStyle: "italic" }}>
                        &ldquo;{e.comment as string}&rdquo;
                      </div>
                    ) : null}
                    <div style={{ fontSize: 11, color: C.textTer, marginTop: 4 }}>
                      {e.created_at ? new Date(e.created_at as string).toLocaleDateString() : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Active consents */}
        {consents && (consents.consents as unknown[]).length > 0 && (
          <Card style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Who has access</div>
              <a href="/consent" style={{ color: C.primary, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Manage</a>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {(consents.consents as Array<Record<string, unknown>>).map((c) => (
                <div key={c.id as string} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: 12, borderRadius: 8, border: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name="H" size={36} color={C.primary} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                        {Array.isArray(c.fields) ? (c.fields as string[]).join(", ") : "Profile access"}
                      </div>
                      <div style={{ fontSize: 12, color: C.textTer }}>
                        Expires {c.expires_at ? new Date(c.expires_at as string).toLocaleDateString() : "never"}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: C.verified,
                    background: "#E8F5E9", padding: "3px 10px", borderRadius: 12,
                  }}>
                    Active
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Right sidebar */}
      <div>
        <Card style={{ padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>
            Build Your Trust
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              { done: !!(p.full_name), text: "Complete your profile" },
              { done: (tc?.endorsement_count as number) > 0, text: "Get your first endorsement" },
              { done: tier !== "unverified", text: "Reach Basic trust tier" },
              { done: tier === "enhanced", text: "Reach Enhanced trust tier" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: 8, alignItems: "start",
                fontSize: 13, color: item.done ? C.verified : C.textSec,
              }}>
                <span style={{ flexShrink: 0 }}>{item.done ? "✅" : "○"}</span>
                <span style={{ textDecoration: item.done ? "line-through" : "none" }}>{item.text}</span>
              </div>
            ))}
          </div>
          {/* Profile strength */}
          <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>Profile strength</div>
            <div style={{ height: 6, background: "#E0E0E0", borderRadius: 3 }}>
              <div style={{
                height: 6, borderRadius: 3,
                background: tier === "enhanced" ? C.verified : tier === "basic" ? C.primary : C.warning,
                width: tier === "enhanced" ? "100%" : tier === "basic" ? "60%" : "30%",
                transition: "width 0.3s",
              }} />
            </div>
            <div style={{ fontSize: 11, color: C.textTer, marginTop: 4, textTransform: "capitalize" }}>
              {tier}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
