"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

const FIELD_LABELS: Record<string, string> = {
  full_name: "Full Name", skills: "Skills", experience_years: "Experience",
  languages: "Languages", verified_at: "Verification", phone: "Phone",
};
function humanizeFields(fields: unknown): string {
  if (!Array.isArray(fields)) return "Profile access";
  return (fields as string[]).map((f) => FIELD_LABELS[f] || f.replace(/_/g, " ")).join(", ");
}

const C = {
  amber: "#C49A1A", navy: "#0D1B2A", green: "#16A34A",
  blue: "#007AFF", bg: "#F7F6F3", sub: "#636366",
  muted: "#8E8E93", border: "#E5E5EA",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
        {[120, 80, 80].map((h, i) => (
          <div key={i} style={{ height: h, background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 12 }} />
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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Find trusted help
        </h1>
        <p style={{ fontSize: 14, color: C.sub, margin: 0 }}>Search workers, check trust cards, request access.</p>
      </div>

      {/* Primary action */}
      <a href="/search" style={{ textDecoration: "none", display: "block", marginBottom: 16 }}>
        <div style={{
          background: C.amber, borderRadius: 12, padding: "18px 20px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Search workers</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>By name, skill, or job type</div>
          </div>
          <span style={{ fontSize: 22, color: "#fff" }}>→</span>
        </div>
      </a>

      {/* Active access */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: "18px 20px",
        border: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Workers you have access to</div>
          <a href="/consent" style={{ fontSize: 12, color: C.amber, fontWeight: 600, textDecoration: "none" }}>View all</a>
        </div>
        {isLoading ? (
          <div style={{ display: "grid", gap: 8 }}>
            {[1, 2].map((n) => <div key={n} style={{ height: 52, background: C.bg, borderRadius: 8 }} />)}
          </div>
        ) : workers?.workers.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: C.sub }}>No active access grants yet.</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Search for workers and request access to their trust cards.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {workers?.workers.map((w: Record<string, unknown>, i: number) => (
              <a key={i} href={`/worker/${w.worker_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 14px", borderRadius: 8, background: C.bg,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>
                      {humanizeFields(w.fields)}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                      Expires {w.expires_at ? new Date(w.expires_at as string).toLocaleDateString() : "never"}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: C.amber }}>→</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
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
        {[120, 80, 80].map((h, i) => (
          <div key={i} style={{ height: h, background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 12 }} />
        ))}
      </>
    );
  }

  if (pError) {
    return (
      <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 14, color: "#DC2626" }}>Error: {pError.message}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ background: "#fff", borderRadius: 12, padding: "32px 24px", border: `1px solid ${C.border}`, textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 8 }}>
          Create your trust card
        </div>
        <p style={{ color: C.sub, marginBottom: 24, lineHeight: 1.6, fontSize: 14 }}>
          Add your skills and experience. Workers with trust cards get hired faster.
        </p>
        <a href="/profile/create" style={{
          display: "inline-block", padding: "13px 28px",
          background: C.amber, color: "#fff", borderRadius: 10,
          textDecoration: "none", fontSize: 15, fontWeight: 700,
        }}>
          Get started
        </a>
      </div>
    );
  }

  const p = profile as Record<string, unknown>;
  const tc = trustCard as Record<string, unknown>;
  const tier = (tc?.tier as string) ?? "unverified";
  const pendingCount = (pendingRequests?.requests as unknown[])?.length ?? 0;
  const endoList = (endorsements?.endorsements ?? []) as Array<Record<string, unknown>>;
  const skills = Array.isArray(p.skills) ? (p.skills as string[]) : [];

  const tierStyles: Record<string, { bg: string; color: string; label: string }> = {
    unverified: { bg: "#F3F4F6", color: "#6B7280", label: "Unverified" },
    basic: { bg: "#DBEAFE", color: "#1D4ED8", label: "Basic" },
    enhanced: { bg: "#DCFCE7", color: C.green, label: "Verified" },
  };
  const ts = tierStyles[tier] ?? tierStyles.unverified;

  return (
    <>
      {/* Trust card — flat, practical, not LinkedIn profile */}
      <div style={{
        background: "#fff", borderRadius: 12, overflow: "hidden",
        border: `1px solid ${C.border}`, marginBottom: 12,
      }}>
        <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>{p.full_name as string}</div>
            <div style={{ fontSize: 14, color: C.sub, marginTop: 4 }}>
              {skills.length > 0 ? skills.join(" · ") : "No skills listed"}
            </div>
            {p.experience_years ? (
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{p.experience_years as number} years experience</div>
            ) : null}
          </div>
          <div style={{
            padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
            background: ts.bg, color: ts.color, textTransform: "uppercase", flexShrink: 0,
          }}>{ts.label}</div>
        </div>
        {/* Key stats — horizontal, compact */}
        <div style={{ borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[
            { v: String((tc?.endorsement_count as number) ?? 0), l: "References" },
            { v: `${(tc?.tenure_months as number) ?? 0}mo`, l: "Tenure" },
            { v: tc?.incident_flag ? "Flagged" : "Clean", l: "Record" },
          ].map((s) => (
            <div key={s.l} style={{ padding: "12px", textAlign: "center", borderRight: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending consent requests — action-oriented */}
      {pendingCount > 0 && (
        <a href="/consent" style={{ textDecoration: "none", display: "block", marginBottom: 12 }}>
          <div style={{
            background: "#FDF6E8", borderRadius: 12, padding: "16px 20px",
            border: `1px solid ${C.amber}33`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>
                {pendingCount} access request{pendingCount > 1 ? "s" : ""}
              </div>
              <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>A hirer wants to view your details</div>
            </div>
            <div style={{
              padding: "8px 16px", borderRadius: 8,
              background: C.amber, color: "#fff", fontSize: 13, fontWeight: 700,
            }}>Review</div>
          </div>
        </a>
      )}

      {/* References — not "endorsements" */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: "18px 20px",
        border: `1px solid ${C.border}`, marginBottom: 12,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>References from past employers</div>
        {endoList.length === 0 ? (
          <div style={{ padding: "16px 0", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: C.sub }}>No references yet.</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Ask employers you&apos;ve worked with to write a reference on your trust card.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {endoList.slice(0, 5).map((e, i) => (
              <div key={i} style={{ padding: "12px 14px", background: C.bg, borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{e.relationship as string}</div>
                {e.comment ? (
                  <div style={{ fontSize: 13, color: C.sub, marginTop: 4, lineHeight: 1.5 }}>
                    &ldquo;{e.comment as string}&rdquo;
                  </div>
                ) : null}
                <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                  {e.created_at ? new Date(e.created_at as string).toLocaleDateString() : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Who has access — compact */}
      {consents && (consents.consents as unknown[]).length > 0 && (
        <div style={{
          background: "#fff", borderRadius: 12, padding: "18px 20px",
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Who can see your details</div>
            <a href="/consent" style={{ color: C.amber, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Manage</a>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {(consents.consents as Array<Record<string, unknown>>).map((c) => (
              <div key={c.id as string} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", borderRadius: 8, background: C.bg,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>
                    {humanizeFields(c.fields)}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    Expires {c.expires_at ? new Date(c.expires_at as string).toLocaleDateString() : "never"}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: C.green,
                  background: "#DCFCE7", padding: "3px 8px", borderRadius: 6,
                  textTransform: "uppercase",
                }}>Active</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
