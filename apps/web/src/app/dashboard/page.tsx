"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

// TopRanker-inspired tokens
const C = {
  amber: "#C49A1A",
  amberLight: "#FDF6E8",
  navy: "#0D1B2A",
  green: "#34C759",
  blue: "#007AFF",
  bg: "#F7F6F3",
  surface: "#FFFFFF",
  text: "#0D1B2A",
  sub: "#636366",
  muted: "#8E8E93",
  border: "#E5E5EA",
};

function Avatar({ name, size = 48, gradient = "amber" }: { name: string; size?: number; gradient?: "amber" | "green" | "blue" | "navy" }) {
  const g: Record<string, string> = {
    amber: "linear-gradient(135deg, #C49A1A, #F0C84A)",
    green: "linear-gradient(135deg, #34C759, #6EE7B7)",
    blue: "linear-gradient(135deg, #007AFF, #58A6FF)",
    navy: "linear-gradient(135deg, #0D1B2A, #162940)",
  };
  return (
    <div style={{
      width: size, height: size, borderRadius: size > 40 ? 14 : 10,
      background: g[gradient], color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.surface, borderRadius: 14,
      border: `1px solid ${C.border}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      ...style,
    }}>{children}</div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
        {[180, 120, 100].map((h, i) => (
          <div key={i} style={{ height: h, background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 14 }} />
        ))}
      </div>
    );
  }

  if (!user) { router.replace("/login"); return null; }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      {user.role === "worker" ? <WorkerDash /> : <HirerDash />}
    </div>
  );
}

// =============================================================================
function HirerDash() {
  const { data: workers, isLoading } = trpc.hirer.getMyWorkers.useQuery();

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.navy, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: C.sub, margin: 0 }}>Find and connect with verified workers.</p>
      </div>

      {/* Quick actions — big, tappable cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }} className="grid-2col">
        <a href="/search" style={{ textDecoration: "none" }}>
          <Card style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Find Workers</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Search by skill</div>
          </Card>
        </a>
        <a href="/consent" style={{ textDecoration: "none" }}>
          <Card style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>My Requests</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>View status</div>
          </Card>
        </a>
      </div>

      {/* Workers list */}
      <Card style={{ padding: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 14 }}>Workers with Active Access</div>
        {isLoading ? (
          <div style={{ display: "grid", gap: 10 }}>
            {[1, 2].map((n) => <div key={n} style={{ height: 56, background: C.bg, borderRadius: 12 }} />)}
          </div>
        ) : workers?.workers.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: C.sub, marginBottom: 12 }}>No workers yet.</div>
            <a href="/search" style={{
              display: "inline-block", padding: "10px 24px",
              background: C.amber, color: "#fff", borderRadius: 12,
              textDecoration: "none", fontSize: 14, fontWeight: 700,
            }}>Find Workers</a>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {workers?.workers.map((w: Record<string, unknown>, i: number) => (
              <a key={i} href={`/worker/${w.worker_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 14, padding: 14,
                  borderRadius: 12, background: C.bg, cursor: "pointer",
                }}>
                  <Avatar name="W" size={42} gradient="green" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                      {Array.isArray(w.fields) ? (w.fields as string[]).join(", ") : "Profile access"}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      Expires {w.expires_at ? new Date(w.expires_at as string).toLocaleDateString() : "never"}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: C.amber, fontWeight: 700 }}>→</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

// =============================================================================
function WorkerDash() {
  const { data: profile, isLoading: pLoading, error: pError } = trpc.worker.getProfile.useQuery();
  const { data: trustCard, isLoading: tLoading } = trpc.worker.getMyTrustCard.useQuery();
  const { data: consents } = trpc.consent.getMyConsents.useQuery();
  const { data: pendingRequests } = trpc.consent.getMyPendingRequests.useQuery();
  const { data: endorsements } = trpc.worker.getMyEndorsements.useQuery();

  if (pLoading || tLoading) {
    return (
      <>
        {[180, 120, 100].map((h, i) => (
          <div key={i} style={{ height: h, background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 14 }} />
        ))}
      </>
    );
  }

  if (pError) {
    return <Card style={{ padding: 20, borderLeft: `3px solid #FF3B30` }}>
      <div style={{ fontSize: 14, color: "#FF3B30" }}>Error: {pError.message}</div>
    </Card>;
  }

  if (!profile) {
    return (
      <Card style={{ overflow: "hidden" }}>
        <div style={{ height: 56, background: "linear-gradient(135deg, #C49A1A, #F0C84A)" }} />
        <div style={{ padding: "0 28px 32px", textAlign: "center", marginTop: -20 }}>
          <Avatar name="?" size={56} gradient="amber" />
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginTop: 14, marginBottom: 6 }}>
            Welcome to SafeHire
          </h2>
          <p style={{ color: C.sub, marginBottom: 24, lineHeight: 1.6, fontSize: 14 }}>
            Create your profile and start building trust. Takes under a minute.
          </p>
          <a href="/profile/create" style={{
            display: "inline-block", padding: "14px 32px",
            background: C.amber, color: "#fff", borderRadius: 12,
            textDecoration: "none", fontSize: 16, fontWeight: 700,
          }}>
            Create profile
          </a>
        </div>
      </Card>
    );
  }

  const p = profile as Record<string, unknown>;
  const tc = trustCard as Record<string, unknown>;
  const tier = (tc?.tier as string) ?? "unverified";
  const pendingCount = (pendingRequests?.requests as unknown[])?.length ?? 0;
  const endoList = (endorsements?.endorsements ?? []) as Array<Record<string, unknown>>;

  const tierMap: Record<string, { gradient: string; bg: string; color: string; label: string }> = {
    unverified: { gradient: "linear-gradient(135deg, #636366, #8E8E93)", bg: "#F8F8F8", color: "#636366", label: "Unverified" },
    basic: { gradient: "linear-gradient(135deg, #007AFF, #58A6FF)", bg: "#F0F7FF", color: "#007AFF", label: "Basic" },
    enhanced: { gradient: "linear-gradient(135deg, #C49A1A, #F0C84A)", bg: "#FDF6E8", color: "#C49A1A", label: "Enhanced" },
  };
  const ts = tierMap[tier] ?? tierMap.unverified;

  return (
    <>
      {/* Profile card — big, warm, achievement-style */}
      <Card style={{ overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: 48, background: ts.gradient }} />
        <div style={{ padding: "0 20px 20px", marginTop: -24 }}>
          <Avatar name={p.full_name as string} size={56} gradient={tier === "enhanced" ? "amber" : tier === "basic" ? "blue" : "navy"} />
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{p.full_name as string}</div>
            <div style={{ fontSize: 14, color: C.sub, marginTop: 2 }}>
              {Array.isArray(p.skills) ? (p.skills as string[]).join(" · ") : "No skills listed"}
            </div>
          </div>
          {/* Trust badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <span style={{
              padding: "5px 14px", borderRadius: 99, fontSize: 11, fontWeight: 800,
              textTransform: "uppercase", letterSpacing: "0.04em",
              background: ts.bg, color: ts.color,
            }}>{ts.label}</span>
            <span style={{ fontSize: 12, color: C.muted }}>{p.experience_years as number} years exp</span>
          </div>
        </div>
        {/* Stats row */}
        <div style={{ borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[
            { v: String((tc?.endorsement_count as number) ?? 0), l: "Endorsements" },
            { v: `${(tc?.tenure_months as number) ?? 0}mo`, l: "Tenure" },
            { v: tc?.incident_flag ? "Yes" : "None", l: "Incidents" },
          ].map((s) => (
            <div key={s.l} style={{ padding: "14px 12px", textAlign: "center", borderRight: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>{s.v}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pending requests */}
      {pendingCount > 0 && (
        <a href="/consent" style={{ textDecoration: "none" }}>
          <Card style={{ padding: 18, marginBottom: 14, borderLeft: `3px solid ${C.amber}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                  {pendingCount} new request{pendingCount > 1 ? "s" : ""}
                </div>
                <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>Someone wants to see your profile</div>
              </div>
              <span style={{
                padding: "8px 18px", borderRadius: 12,
                background: C.amber, color: "#fff", fontSize: 13, fontWeight: 700,
              }}>Review</span>
            </div>
          </Card>
        </a>
      )}

      {/* Endorsements */}
      <Card style={{ padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 14 }}>Endorsements</div>
        {endoList.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: C.sub }}>No endorsements yet.</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Share your profile with hirers you&apos;ve worked with.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {endoList.slice(0, 5).map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: 14, background: C.bg, borderRadius: 12 }}>
                <Avatar name={String(e.relationship || "H")} size={40} gradient={i % 2 === 0 ? "amber" : "green"} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{e.relationship as string}</div>
                  {e.comment ? (
                    <div style={{ fontSize: 13, color: C.sub, marginTop: 4, lineHeight: 1.6 }}>
                      &ldquo;{e.comment as string}&rdquo;
                    </div>
                  ) : null}
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                    {e.created_at ? new Date(e.created_at as string).toLocaleDateString() : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Who has access */}
      {consents && (consents.consents as unknown[]).length > 0 && (
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Who has access</div>
            <a href="/consent" style={{ color: C.amber, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Manage</a>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {(consents.consents as Array<Record<string, unknown>>).map((c) => (
              <div key={c.id as string} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: 14, borderRadius: 12, background: C.bg,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name="H" size={36} gradient="blue" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                      {Array.isArray(c.fields) ? (c.fields as string[]).join(", ") : "Profile access"}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      Expires {c.expires_at ? new Date(c.expires_at as string).toLocaleDateString() : "never"}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: C.green,
                  background: "#E8FAE8", padding: "3px 10px", borderRadius: 99,
                  textTransform: "uppercase",
                }}>Active</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
