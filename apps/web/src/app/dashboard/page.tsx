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

const CATEGORIES = [
  { slug: "maid", label: "Maid", icon: "🏠" },
  { slug: "cook", label: "Cook", icon: "🍳" },
  { slug: "driver", label: "Driver", icon: "🚗" },
  { slug: "nanny", label: "Nanny", icon: "👶" },
  { slug: "electrician", label: "Electrician", icon: "⚡" },
  { slug: "plumber", label: "Plumber", icon: "🔧" },
  { slug: "cleaner", label: "Cleaner", icon: "✨" },
  { slug: "security", label: "Security", icon: "🛡" },
  { slug: "technician", label: "Technician", icon: "🔩" },
  { slug: "painter", label: "Painter", icon: "🎨" },
];

const VERIFICATION_STEPS = [
  { key: "phone_verified", label: "Phone verified" },
  { key: "selfie_captured", label: "Selfie captured" },
  { key: "government_id", label: "Government ID" },
  { key: "face_match", label: "Face match" },
  { key: "address_submitted", label: "Address submitted" },
  { key: "emergency_contact", label: "Emergency contact" },
  { key: "work_category", label: "Work category" },
  { key: "reference_added", label: "Reference added" },
  { key: "agency_review", label: "Agency review" },
  { key: "active_reverification", label: "Re-verification" },
];

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
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Find trusted help
        </h1>
        <p style={{ fontSize: 14, color: C.sub, margin: 0 }}>Search by category, check trust cards, request access.</p>
      </div>

      {/* Category grid — primary action */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>
          What do you need?
        </div>
        <div className="grid-cat" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <a key={cat.slug} href={`/search?category=${cat.slug}`} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "14px 6px", background: "#fff", borderRadius: 10,
              border: `1px solid ${C.border}`, textDecoration: "none",
            }}>
              <span style={{ fontSize: 22, marginBottom: 4 }}>{cat.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{cat.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Search all */}
      <a href="/search" style={{ textDecoration: "none", display: "block", marginBottom: 16 }}>
        <div style={{
          background: C.amber, borderRadius: 10, padding: "14px 18px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Search all workers</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>By name, skill, or area</div>
          </div>
          <span style={{ fontSize: 20, color: "#fff" }}>→</span>
        </div>
      </a>

      {/* Active access */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Workers you have access to</div>
          <a href="/consent" style={{ fontSize: 12, color: C.amber, fontWeight: 600, textDecoration: "none" }}>View all</a>
        </div>
        {isLoading ? (
          <div style={{ display: "grid", gap: 8 }}>
            {[1, 2].map((n) => <div key={n} style={{ height: 48, background: C.bg, borderRadius: 8 }} />)}
          </div>
        ) : workers?.workers.length === 0 ? (
          <div style={{ padding: "16px 0", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: C.sub }}>No active access grants yet.</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Search for workers and request access to their trust cards.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {workers?.workers.map((w: Record<string, unknown>, i: number) => {
              const wp = w.worker_profiles as Record<string, unknown> | undefined;
              const workerName = (wp?.full_name as string) || "Worker";
              const workerSkills = Array.isArray(wp?.skills) ? (wp.skills as string[]).join(", ") : "";
              return (
                <a key={i} href={`/worker/${w.worker_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 12px", borderRadius: 8, background: C.bg,
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{workerName}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                        {workerSkills || humanizeFields(w.fields)} · Expires {w.expires_at ? new Date(w.expires_at as string).toLocaleDateString() : "never"}
                      </div>
                    </div>
                    <span style={{ fontSize: 13, color: C.amber }}>→</span>
                  </div>
                </a>
              );
            })}
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
      <div style={{ background: "#fff", borderRadius: 12, padding: "28px 20px", border: `1px solid ${C.border}`, textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 8 }}>
          Create your trust card
        </div>
        <p style={{ color: C.sub, marginBottom: 20, lineHeight: 1.6, fontSize: 14 }}>
          Add your skills, category, and area. Workers with trust cards get hired faster.
        </p>
        <a href="/profile/create" style={{
          display: "inline-block", padding: "12px 24px",
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
  const languages = Array.isArray(p.languages) ? (p.languages as string[]) : [];
  const workerCategory = (p.category as string) || "";
  const catLabel = CATEGORIES.find((c) => c.slug === workerCategory)?.label || workerCategory;
  const verSteps = (tc?.verification_steps ?? p.verification_steps) as Record<string, unknown> | null;
  const completedSteps = verSteps ? VERIFICATION_STEPS.filter((s) => verSteps[s.key] === true).length : 0;
  const availability = (p.availability as string) || "";

  const tierStyles: Record<string, { bg: string; color: string; label: string }> = {
    unverified: { bg: "#F3F4F6", color: "#6B7280", label: "Unverified" },
    basic: { bg: "#FDF6E8", color: C.amber, label: "Basic" },
    enhanced: { bg: "#DCFCE7", color: C.green, label: "Enhanced" },
  };
  const ts = tierStyles[tier] ?? tierStyles.unverified;

  // Find next incomplete verification step
  const nextStep = verSteps ? VERIFICATION_STEPS.find((s) => verSteps[s.key] !== true) : VERIFICATION_STEPS[0];

  return (
    <>
      {/* Trust card — flat, practical */}
      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, marginBottom: 12 }}>
        <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>{p.full_name as string}</span>
              <span style={{
                padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700,
                background: ts.bg, color: ts.color, textTransform: "uppercase",
              }}>{ts.label}</span>
              {availability === "available" && (
                <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: "#DCFCE7", color: C.green, textTransform: "uppercase" }}>Available</span>
              )}
            </div>
            <div style={{ fontSize: 14, color: C.sub, marginTop: 5 }}>
              {catLabel}{(p.locality as string) ? ` · ${p.locality as string}` : ""}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(p.experience_years as number) > 0 && <span>{p.experience_years as number} yr exp</span>}
              {languages.length > 0 && <span>{languages.join(", ")}</span>}
            </div>
          </div>
        </div>
        {/* Stats */}
        <div style={{ borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }} className="grid-4col">
          {[
            { v: `${completedSteps}/10`, l: "Verified" },
            { v: String((tc?.endorsement_count as number) ?? 0), l: "References" },
            { v: `${(tc?.tenure_months as number) ?? 0} mo`, l: "Tenure" },
            { v: tc?.incident_flag ? "Flagged" : "Clean", l: "Record" },
          ].map((s) => (
            <div key={s.l} style={{ padding: "12px 8px", textAlign: "center", borderRight: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{s.v}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Next step nudge */}
      {nextStep && completedSteps < 10 && (
        <div style={{
          background: "#FDF6E8", borderRadius: 12, padding: "14px 18px",
          border: `1px solid ${C.amber}33`, marginBottom: 12,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Next: {nextStep.label}</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Complete step {completedSteps + 1} of 10 to strengthen your trust card</div>
          </div>
          <div style={{ padding: "7px 14px", borderRadius: 8, background: C.amber, color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>Do it</div>
        </div>
      )}

      {/* Verification progress */}
      {verSteps && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Verification progress</div>
            <span style={{ fontSize: 12, color: C.muted }}>{completedSteps}/10 complete</span>
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, borderRadius: 3, background: "#E5E7EB", marginBottom: 12 }}>
            <div style={{ height: 6, borderRadius: 3, background: completedSteps >= 8 ? C.green : C.amber, width: `${completedSteps * 10}%`, transition: "width 0.3s" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }} className="grid-2col">
            {VERIFICATION_STEPS.map((step) => {
              const done = verSteps[step.key] === true;
              const pending = verSteps[step.key] === "pending";
              return (
                <div key={step.key} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "6px 8px", borderRadius: 5,
                  background: done ? "#DCFCE7" : pending ? "#FDF6E8" : "transparent",
                }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: 8, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700,
                    background: done ? C.green : pending ? C.amber : "#D1D5DB",
                    color: "#fff",
                  }}>
                    {done ? "✓" : pending ? "…" : "—"}
                  </span>
                  <span style={{ fontSize: 12, color: done ? C.green : pending ? C.amber : C.muted, fontWeight: done ? 600 : 400 }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending consent requests */}
      {pendingCount > 0 && (
        <a href="/consent" style={{ textDecoration: "none", display: "block", marginBottom: 12 }}>
          <div style={{
            background: "#FDF6E8", borderRadius: 12, padding: "14px 18px",
            border: `1px solid ${C.amber}33`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>
                {pendingCount} access request{pendingCount > 1 ? "s" : ""}
              </div>
              <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>A hirer wants to view your details</div>
            </div>
            <div style={{ padding: "7px 14px", borderRadius: 8, background: C.amber, color: "#fff", fontSize: 13, fontWeight: 700 }}>Review</div>
          </div>
        </a>
      )}

      {/* References */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 10 }}>References from past employers</div>
        {endoList.length === 0 ? (
          <div style={{ padding: "14px 0", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: C.sub }}>No references yet.</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Ask employers you&apos;ve worked with to write a reference.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {endoList.slice(0, 5).map((e, i) => (
              <div key={i} style={{ padding: "10px 12px", background: C.bg, borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{e.relationship as string}</div>
                {e.comment ? (
                  <div style={{ fontSize: 13, color: C.sub, marginTop: 3, lineHeight: 1.5 }}>
                    &ldquo;{e.comment as string}&rdquo;
                  </div>
                ) : null}
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                  {e.created_at ? new Date(e.created_at as string).toLocaleDateString() : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Who has access */}
      {consents && (consents.consents as unknown[]).length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Who can see your details</div>
            <a href="/consent" style={{ color: C.amber, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Manage</a>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {(consents.consents as Array<Record<string, unknown>>).map((c) => (
              <div key={c.id as string} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 12px", borderRadius: 8, background: C.bg,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{humanizeFields(c.fields)}</div>
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
