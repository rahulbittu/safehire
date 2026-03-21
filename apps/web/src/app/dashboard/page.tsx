"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

// SafeHire design tokens — teal + amber identity
const T = {
  teal: "#0F766E",
  tealLight: "#F0FDF9",
  amber: "#D97706",
  amberLight: "#FFF7ED",
  text: "#1E293B",
  sub: "#64748B",
  muted: "#94A3B8",
  border: "#F1F5F9",
  card: "#FFFFFF",
  bg: "#FAFBFC",
  violet: "#6366F1",
};

function Avatar({ name, size = 48, variant = "teal" }: { name: string; size?: number; variant?: "teal" | "amber" | "violet" }) {
  const gradients = {
    teal: "linear-gradient(135deg, #0F766E, #14B8A6)",
    amber: "linear-gradient(135deg, #D97706, #F59E0B)",
    violet: "linear-gradient(135deg, #6366F1, #A78BFA)",
  };
  return (
    <div style={{
      width: size, height: size, borderRadius: size > 40 ? 14 : 10,
      background: gradients[variant],
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: T.card, borderRadius: 14,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      border: `1px solid ${T.border}`,
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
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 260px", gap: 20 }} className="dashboard-grid">
          {[280, 400, 200].map((h, i) => (
            <div key={i} style={{ height: h, background: "#fff", borderRadius: 14, border: `1px solid ${T.border}` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!user) { router.replace("/login"); return null; }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px" }}>
      {user.role === "worker" ? <WorkerDashboard /> : <HirerDashboard />}
    </div>
  );
}

// =============================================================================
function HirerDashboard() {
  const { data: workers, isLoading } = trpc.hirer.getMyWorkers.useQuery();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 260px", gap: 20 }} className="dashboard-grid">
      {/* Sidebar */}
      <div>
        <Card style={{ overflow: "hidden" }}>
          <div style={{ height: 48, background: "linear-gradient(135deg, #D97706, #F59E0B)" }} />
          <div style={{ padding: "16px 20px", textAlign: "center", marginTop: -24 }}>
            <Avatar name="H" size={48} variant="amber" />
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text, marginTop: 10 }}>Dashboard</div>
            <div style={{ fontSize: 13, color: T.sub, marginTop: 2 }}>Find verified workers</div>
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: T.sub }}>Active access</span>
              <span style={{ color: T.amber, fontWeight: 800 }}>{workers?.workers?.length ?? 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Feed */}
      <div>
        <Card style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            Quick Actions
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="grid-2col">
            {[
              { href: "/search", title: "Find Workers", desc: "Search verified talent", color: T.teal, bg: T.tealLight },
              { href: "/consent", title: "Access Requests", desc: "View request status", color: T.amber, bg: T.amberLight },
            ].map((a) => (
              <a key={a.href} href={a.href} style={{
                display: "flex", alignItems: "center", gap: 14, padding: 16,
                background: a.bg, borderRadius: 12, textDecoration: "none",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: a.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>
                  {a.title.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: T.sub }}>{a.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 16 }}>Workers with Active Access</div>
          {isLoading ? (
            <div style={{ display: "grid", gap: 10 }}>
              {[1, 2].map((n) => <div key={n} style={{ height: 60, background: T.bg, borderRadius: 10 }} />)}
            </div>
          ) : workers?.workers.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 14, color: T.sub, marginBottom: 12 }}>No workers with active consent yet.</div>
              <a href="/search" style={{
                display: "inline-block", padding: "10px 24px",
                background: T.teal, color: "#fff", borderRadius: 10,
                textDecoration: "none", fontSize: 14, fontWeight: 600,
              }}>Find Workers</a>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {workers?.workers.map((w: Record<string, unknown>, i: number) => (
                <a key={i} href={`/worker/${w.worker_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14, padding: 14,
                    borderRadius: 10, border: `1px solid ${T.border}`, cursor: "pointer",
                  }}>
                    <Avatar name="W" size={40} variant="teal" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                        {Array.isArray(w.fields) ? (w.fields as string[]).join(", ") : "Profile access"}
                      </div>
                      <div style={{ fontSize: 12, color: T.muted }}>
                        Expires {w.expires_at ? new Date(w.expires_at as string).toLocaleDateString() : "never"}
                      </div>
                    </div>
                    <span style={{ fontSize: 13, color: T.teal, fontWeight: 700 }}>View →</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Right sidebar */}
      <div>
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 12 }}>Getting Started</div>
          {[
            "Search for workers by skill",
            "View trust cards for free",
            "Request access with consent",
            "Endorse workers you hire",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: T.sub, marginBottom: 8 }}>
              <span style={{ color: T.teal, fontWeight: 800 }}>✓</span> {tip}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
function WorkerDashboard() {
  const { data: profile, isLoading: profileLoading, error: profileError } = trpc.worker.getProfile.useQuery();
  const { data: trustCard, isLoading: trustLoading } = trpc.worker.getMyTrustCard.useQuery();
  const { data: consents } = trpc.consent.getMyConsents.useQuery();
  const { data: pendingRequests } = trpc.consent.getMyPendingRequests.useQuery();
  const { data: endorsements } = trpc.worker.getMyEndorsements.useQuery();

  if (profileLoading || trustLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 260px", gap: 20 }} className="dashboard-grid">
        {[280, 400, 200].map((h, i) => (
          <div key={i} style={{ height: h, background: "#fff", borderRadius: 14, border: `1px solid ${T.border}` }} />
        ))}
      </div>
    );
  }

  if (profileError) {
    return <Card style={{ padding: 20, borderLeft: `3px solid #DC2626` }}>
      <div style={{ fontSize: 14, color: "#DC2626" }}>Error: {profileError.message}</div>
    </Card>;
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <Card style={{ overflow: "hidden" }}>
          <div style={{ height: 64, background: "linear-gradient(135deg, #0F766E, #14B8A6)" }} />
          <div style={{ padding: "0 32px 36px", textAlign: "center", marginTop: -24 }}>
            <Avatar name="?" size={56} variant="teal" />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginTop: 14, marginBottom: 6, letterSpacing: "-0.02em" }}>
              Welcome to SafeHire
            </h2>
            <p style={{ color: T.sub, marginBottom: 24, lineHeight: 1.6, fontSize: 14, maxWidth: 360, margin: "0 auto 24px" }}>
              Create your professional profile and start building your trust card. It takes less than a minute.
            </p>
            <a href="/profile/create" style={{
              display: "inline-block", padding: "12px 28px",
              background: T.teal, color: "#fff", borderRadius: 10,
              textDecoration: "none", fontSize: 15, fontWeight: 700,
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

  const tierStyle: Record<string, { gradient: string; bg: string; color: string; label: string }> = {
    unverified: { gradient: "linear-gradient(135deg, #64748B, #94A3B8)", bg: "#F8FAFC", color: "#64748B", label: "Unverified" },
    basic: { gradient: "linear-gradient(135deg, #0F766E, #14B8A6)", bg: T.tealLight, color: T.teal, label: "Basic" },
    enhanced: { gradient: "linear-gradient(135deg, #D97706, #F59E0B)", bg: T.amberLight, color: T.amber, label: "Enhanced" },
  };
  const ts = tierStyle[tier] ?? tierStyle.unverified;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 260px", gap: 20 }} className="dashboard-grid">
      {/* Left — Profile card */}
      <div>
        <Card style={{ overflow: "hidden" }}>
          <div style={{ height: 48, background: ts.gradient }} />
          <div style={{ padding: "16px 20px", textAlign: "center", marginTop: -28 }}>
            <Avatar name={p.full_name as string} size={52} variant={tier === "enhanced" ? "amber" : "teal"} />
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text, marginTop: 10 }}>
              {p.full_name as string}
            </div>
            <div style={{ fontSize: 13, color: T.sub, marginTop: 4, lineHeight: 1.4 }}>
              {Array.isArray(p.skills) && (p.skills as string[]).length > 0
                ? (p.skills as string[]).join(" · ")
                : "No skills listed"}
            </div>
            <div style={{
              display: "inline-block", marginTop: 10,
              padding: "4px 14px", borderRadius: 8,
              fontSize: 11, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.04em", background: ts.bg, color: ts.color,
            }}>
              {ts.label}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 20px" }}>
            {[
              { label: "Endorsements", value: String((tc?.endorsement_count as number) ?? 0) },
              { label: "Tenure", value: `${(tc?.tenure_months as number) ?? 0}mo` },
              { label: "Experience", value: `${p.experience_years as number}yr` },
            ].map((stat) => (
              <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 }}>
                <span style={{ color: T.sub }}>{stat.label}</span>
                <span style={{ color: T.text, fontWeight: 700 }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Center — Feed */}
      <div>
        {/* Pending requests */}
        {pendingCount > 0 && (
          <a href="/consent" style={{ textDecoration: "none" }}>
            <Card style={{ padding: 18, marginBottom: 16, borderLeft: `3px solid ${T.amber}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                    {pendingCount} pending access request{pendingCount > 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>A hirer wants to view your profile</div>
                </div>
                <span style={{
                  padding: "7px 18px", borderRadius: 8,
                  background: T.amber, color: "#fff", fontSize: 12, fontWeight: 700,
                }}>Review</span>
              </div>
            </Card>
          </a>
        )}

        {/* Endorsements feed */}
        <Card style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 16 }}>Activity</div>
          {endorsementList.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 14, color: T.sub }}>No endorsements yet.</div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>Ask hirers you&apos;ve worked with to endorse you.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {endorsementList.slice(0, 5).map((e, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, padding: 14,
                  background: T.bg, borderRadius: 12,
                }}>
                  <Avatar name={String(e.relationship || "H")} size={40} variant={i % 2 === 0 ? "amber" : "violet"} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{e.relationship as string}</div>
                    {e.comment ? (
                      <div style={{ fontSize: 13, color: T.sub, marginTop: 4, lineHeight: 1.6 }}>
                        &ldquo;{e.comment as string}&rdquo;
                      </div>
                    ) : null}
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
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
          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>Who has access</div>
              <a href="/consent" style={{ color: T.teal, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Manage</a>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {(consents.consents as Array<Record<string, unknown>>).map((c) => (
                <div key={c.id as string} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: 14, borderRadius: 10, border: `1px solid ${T.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar name="H" size={36} variant="amber" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                        {Array.isArray(c.fields) ? (c.fields as string[]).join(", ") : "Profile access"}
                      </div>
                      <div style={{ fontSize: 12, color: T.muted }}>
                        Expires {c.expires_at ? new Date(c.expires_at as string).toLocaleDateString() : "never"}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: T.teal,
                    background: T.tealLight, padding: "4px 10px", borderRadius: 6,
                  }}>Active</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Right — Progress */}
      <div>
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 14 }}>Trust Progress</div>
          {/* Progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3 }}>
              <div style={{
                height: 6, borderRadius: 3, transition: "width 0.3s",
                background: ts.gradient,
                width: tier === "enhanced" ? "100%" : tier === "basic" ? "60%" : "25%",
              }} />
            </div>
            <div style={{ fontSize: 12, color: ts.color, fontWeight: 700, marginTop: 6 }}>{ts.label}</div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { done: !!(p.full_name), text: "Complete your profile" },
              { done: (tc?.endorsement_count as number) > 0, text: "Get endorsed" },
              { done: tier !== "unverified", text: "Reach Basic trust" },
              { done: tier === "enhanced", text: "Reach Enhanced trust" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "center",
                fontSize: 13, color: item.done ? T.teal : T.sub,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 5,
                  border: item.done ? "none" : `1.5px solid ${T.border}`,
                  background: item.done ? T.teal : "transparent",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                }}>
                  {item.done ? "✓" : ""}
                </div>
                <span style={{ textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.6 : 1 }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
