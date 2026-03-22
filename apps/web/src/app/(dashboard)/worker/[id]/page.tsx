"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface WorkerPageProps { params: { id: string } }

const C = { amber: "#C49A1A", navy: "#0D1B2A", green: "#16A34A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };
const DEFAULT_FIELDS = ["full_name", "skills", "experience_years"];

const FIELD_LABELS: Record<string, string> = {
  full_name: "Full Name", skills: "Skills", experience_years: "Experience",
  languages: "Languages", verified_at: "Verification", phone: "Phone",
};

const CATEGORIES: Record<string, string> = {
  maid: "Maid", cook: "Cook", driver: "Driver", nanny: "Nanny",
  electrician: "Electrician", plumber: "Plumber", cleaner: "Cleaner",
  security: "Security", technician: "Technician", painter: "Painter",
};

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

const INTENTS = [
  { value: "hire_now", label: "I want to hire this worker" },
  { value: "discuss_availability", label: "Check availability" },
  { value: "request_contact", label: "Get contact details" },
  { value: "compare", label: "Comparing for a role" },
];

export default function WorkerTrustCardPage({ params }: WorkerPageProps) {
  const [intent, setIntent] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [reqSent, setReqSent] = useState(false);
  const [refSent, setRefSent] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const { data, isLoading, error } = trpc.hirer.viewTrustCard.useQuery({ workerId: params.id });
  const reqMut = trpc.consent.requestAccess.useMutation({ onSuccess: () => setReqSent(true) });
  const refMut = trpc.trust.submitEndorsement.useMutation({ onSuccess: () => setRefSent(true) });

  if (isLoading) return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      {[120, 60, 60].map((h, i) => <div key={i} style={{ height: h, background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 12 }} />)}
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ background: "#FEF2F2", padding: "14px 16px", borderRadius: 10, fontSize: 14, color: "#DC2626" }}>{error.message}</div>
    </div>
  );

  if (!data) return null;

  const card = data.trustCard as Record<string, unknown>;
  const profile = data.profile as Record<string, unknown> | null;
  const tier = (card.tier as string) ?? "unverified";
  const verSteps = card.verification_steps as Record<string, unknown> | null;
  const completedSteps = verSteps ? VERIFICATION_STEPS.filter((s) => verSteps[s.key] === true).length : 0;
  const endorsementCount = (card.endorsement_count as number) ?? 0;
  const incidentFlag = !!card.incident_flag;
  const tenureMonths = (card.tenure_months as number) ?? 0;

  const name = (profile?.full_name as string) || "Worker";
  const workerCategory = (profile?.category as string) || (card.category as string) || "";
  const catLabel = CATEGORIES[workerCategory] || workerCategory;
  const workerLocality = (profile?.locality as string) || (card.locality as string) || "";
  const exp = (profile?.experience_years as number) ?? 0;
  const rawLangs = profile?.languages;
  const languages = Array.isArray(rawLangs) ? rawLangs as string[] : [];
  const availability = (profile?.availability as string) || (card.availability as string) || "";
  const avgRating = card.avg_rating as number | undefined;
  const ratingCount = card.rating_count as number | undefined;
  const agencyId = (profile?.agency_id as string) || (card.agency_id as string) || "";
  const initial = name.charAt(0).toUpperCase();

  const tierStyles: Record<string, { bg: string; color: string; label: string }> = {
    unverified: { bg: "#F3F4F6", color: "#6B7280", label: "Unverified" },
    basic: { bg: "#FDF6E8", color: C.amber, label: "Basic" },
    enhanced: { bg: "#DCFCE7", color: C.green, label: "Enhanced" },
  };
  const ts = tierStyles[tier] ?? tierStyles.unverified;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <a href="/search" style={{ fontSize: 13, color: C.sub, textDecoration: "none", marginBottom: 16, display: "inline-block" }}>← Back to search</a>

      {/* Service header — who they are and what they do */}
      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, marginBottom: 12 }}>
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", gap: 16 }}>
            {/* Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: 28, flexShrink: 0,
              background: agencyId ? "#DBEAFE" : C.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700, color: agencyId ? "#1D4ED8" : C.navy,
            }}>{initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: C.navy, margin: 0 }}>{name}</h1>
                {avgRating != null && ratingCount != null && ratingCount > 0 && (
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{avgRating} ★</span>
                )}
              </div>
              <div style={{ fontSize: 14, color: C.sub, marginTop: 4 }}>
                {catLabel}{workerLocality && <> · {workerLocality}</>}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {availability === "available" && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: "#DCFCE7", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>Available</span>
                )}
                {agencyId ? (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8", background: "#DBEAFE", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>Agency-backed</span>
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 600, color: C.muted, background: C.bg, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>Independent</span>
                )}
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase",
                  background: ts.bg, color: ts.color,
                }}>{ts.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats — service quality first */}
        <div style={{ borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }} className="grid-4col">
          {[
            { v: avgRating != null && ratingCount != null && ratingCount > 0 ? `${avgRating} ★` : "New", l: ratingCount && ratingCount > 0 ? `${ratingCount} ratings` : "No ratings yet" },
            { v: exp > 0 ? `${exp} yr` : "—", l: "Experience" },
            { v: String(endorsementCount), l: "References" },
            { v: incidentFlag ? "Flagged" : "Clean", l: "Record" },
          ].map((s) => (
            <div key={s.l} style={{ padding: "12px 8px", textAlign: "center", borderRight: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: s.v === "Flagged" ? "#DC2626" : C.navy }}>{s.v}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Extra info row */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted }}>
          <span>{languages.length > 0 ? languages.join(", ") : "—"}</span>
          <span>{tenureMonths > 0 ? `${tenureMonths} mo on SafeHire` : "New"}</span>
        </div>
      </div>

      {/* Primary CTA — the hiring action */}
      {!data.hasConsent && !reqSent && (
        <div style={{ marginBottom: 12 }}>
          {!showRequest ? (
            <button onClick={() => setShowRequest(true)} style={{
              width: "100%", padding: 14, background: C.amber, color: "#fff",
              border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}>
              Contact this worker
            </button>
          ) : (
            <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 10 }}>What do you need?</div>
              <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
                {INTENTS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setIntent(opt.value)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 8, cursor: "pointer", width: "100%", textAlign: "left",
                    border: intent === opt.value ? `2px solid ${C.amber}` : `1px solid ${C.border}`,
                    background: intent === opt.value ? "#FDF6E8" : "#fff",
                  }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: 8, flexShrink: 0,
                      border: intent === opt.value ? `5px solid ${C.amber}` : `2px solid ${C.border}`,
                      boxSizing: "border-box",
                    }} />
                    <span style={{ fontSize: 13, color: C.navy, fontWeight: intent === opt.value ? 600 : 400 }}>{opt.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => { if (intent) reqMut.mutate({ workerId: params.id, fields: DEFAULT_FIELDS, message: intent }); }} disabled={reqMut.isPending || !intent} style={{
                width: "100%", padding: 14, background: intent ? C.amber : `${C.amber}66`, color: "#fff",
                border: "none", borderRadius: 10, cursor: intent ? "pointer" : "default", fontSize: 14, fontWeight: 700,
              }}>
                {reqMut.isPending ? "Sending..." : "Send request"}
              </button>
              {reqMut.error && <div style={{ marginTop: 8, fontSize: 12, color: "#DC2626" }}>{reqMut.error.message}</div>}
            </div>
          )}
        </div>
      )}

      {reqSent && (
        <div style={{ background: "#DCFCE7", borderRadius: 12, padding: "14px 18px", marginBottom: 12, fontSize: 14, color: C.green, fontWeight: 600 }}>
          Request sent. The worker will review it.
        </div>
      )}

      {/* Consented profile data */}
      {data.hasConsent && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: C.green }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Contact details available</div>
          </div>
          {profile && (
            <div style={{ display: "grid", gap: 6 }}>
              {Object.entries(profile).filter(([key]) => key !== "user_id").map(([key, value]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: C.bg, borderRadius: 6 }}>
                  <span style={{ fontSize: 13, color: C.sub }}>{FIELD_LABELS[key] || key.replace(/_/g, " ")}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.navy, textAlign: "right" }}>{Array.isArray(value) ? value.join(", ") : String(value ?? "—")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verification — compact, expandable */}
      {verSteps && (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 12, overflow: "hidden" }}>
          <button onClick={() => setShowVerification(!showVerification)} style={{
            width: "100%", padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Verification</span>
              {/* Compact progress bar */}
              <div style={{ width: 60, height: 4, borderRadius: 2, background: "#E5E7EB" }}>
                <div style={{ height: 4, borderRadius: 2, background: completedSteps >= 8 ? C.green : C.amber, width: `${completedSteps * 10}%` }} />
              </div>
              <span style={{ fontSize: 12, color: C.muted }}>{completedSteps}/10</span>
            </div>
            <span style={{ fontSize: 12, color: C.muted }}>{showVerification ? "▲" : "▼"}</span>
          </button>
          {showVerification && (
            <div style={{ padding: "0 20px 16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }} className="grid-2col">
                {VERIFICATION_STEPS.map((step) => {
                  const done = verSteps[step.key] === true;
                  const pending = verSteps[step.key] === "pending";
                  return (
                    <div key={step.key} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 8px", borderRadius: 6,
                      background: done ? "#DCFCE7" : pending ? "#FDF6E8" : C.bg,
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
                      <span style={{ fontSize: 11, color: done ? C.green : pending ? C.amber : C.muted, fontWeight: done ? 600 : 400 }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Write a reference — bottom of page */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 3 }}>Rate or reference this worker</div>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 14 }}>Worked with them before? Your feedback helps other hirers.</div>
        {refSent ? (
          <div style={{ fontSize: 14, color: C.green, fontWeight: 600, background: "#DCFCE7", padding: "12px 16px", borderRadius: 8 }}>Reference submitted. Thank you.</div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            const f = e.target as HTMLFormElement;
            const rel = (f.elements.namedItem("relationship") as HTMLInputElement).value;
            const com = (f.elements.namedItem("comment") as HTMLTextAreaElement).value;
            if (rel) refMut.mutate({ workerId: params.id, relationship: rel, comment: com || undefined });
          }}>
            <input name="relationship" placeholder="Your relationship (e.g. Former employer)" style={{
              width: "100%", padding: "11px 14px", border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8, boxSizing: "border-box", fontSize: 13, outline: "none",
            }} />
            <textarea name="comment" placeholder="How was your experience?" rows={2} style={{
              width: "100%", padding: "11px 14px", border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 10, boxSizing: "border-box", resize: "vertical", fontSize: 13, outline: "none",
            }} />
            <button type="submit" disabled={refMut.isPending} style={{
              padding: "12px 24px", background: C.navy, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700,
            }}>
              {refMut.isPending ? "Submitting..." : "Submit reference"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
