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

export default function WorkerTrustCardPage({ params }: WorkerPageProps) {
  const [msg, setMsg] = useState("");
  const [reqSent, setReqSent] = useState(false);
  const [refSent, setRefSent] = useState(false);

  const { data, isLoading, error } = trpc.hirer.viewTrustCard.useQuery({ workerId: params.id });
  const reqMut = trpc.consent.requestAccess.useMutation({ onSuccess: () => setReqSent(true) });
  const refMut = trpc.trust.submitEndorsement.useMutation({ onSuccess: () => setRefSent(true) });

  if (isLoading) return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      {[100, 80, 80].map((h, i) => <div key={i} style={{ height: h, background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 12 }} />)}
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ background: "#FEF2F2", padding: "14px 16px", borderRadius: 10, fontSize: 14, color: "#DC2626" }}>{error.message}</div>
    </div>
  );

  if (!data) return null;

  const card = data.trustCard as Record<string, unknown>;
  const tier = (card.tier as string) ?? "unverified";
  const verSteps = card.verification_steps as Record<string, unknown> | null;
  const completedSteps = verSteps ? VERIFICATION_STEPS.filter((s) => verSteps[s.key] === true).length : 0;
  const tierStyles: Record<string, { bg: string; color: string; label: string }> = {
    unverified: { bg: "#F3F4F6", color: "#6B7280", label: "Unverified" },
    basic: { bg: "#DBEAFE", color: "#1D4ED8", label: "Basic" },
    enhanced: { bg: "#DCFCE7", color: C.green, label: "Verified" },
  };
  const ts = tierStyles[tier] ?? tierStyles.unverified;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <a href="/search" style={{ fontSize: 13, color: C.sub, textDecoration: "none", marginBottom: 16, display: "inline-block" }}>← Back to search</a>

      {/* Trust card header */}
      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, marginBottom: 12 }}>
        <div style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: C.navy, margin: 0 }}>Trust Card</h1>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 3 }}>Public trust data · details require consent</div>
          </div>
          <div style={{
            padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700,
            background: ts.bg, color: ts.color, textTransform: "uppercase", flexShrink: 0,
          }}>{ts.label}</div>
        </div>

        {/* Key stats */}
        <div style={{ borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }} className="grid-4col">
          {[
            { v: `${completedSteps}/10`, l: "Verified" },
            { v: `${(card.tenure_months as number) ?? 0}mo`, l: "Tenure" },
            { v: String((card.endorsement_count as number) ?? 0), l: "Refs" },
            { v: card.incident_flag ? "Flagged" : "Clean", l: "Record" },
          ].map((s) => (
            <div key={s.l} style={{ padding: "12px 6px", textAlign: "center", borderRight: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{s.v}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification ladder */}
      {verSteps && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 10 }}>Verification progress</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }} className="grid-2col">
            {VERIFICATION_STEPS.map((step) => {
              const done = verSteps[step.key] === true;
              const pending = verSteps[step.key] === "pending";
              return (
                <div key={step.key} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 6,
                  background: done ? "#DCFCE7" : pending ? "#FDF6E8" : C.bg,
                }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 9, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700,
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

      {/* Consent / Access */}
      {data.hasConsent ? (
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: C.green }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Access granted</div>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
            Fields: {data.consentedFields.map((f: string) => FIELD_LABELS[f] || f.replace(/_/g, " ")).join(", ")}
          </div>
          {data.profile && (
            <div style={{ display: "grid", gap: 5 }}>
              {Object.entries(data.profile as Record<string, unknown>).map(([key, value]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", background: C.bg, borderRadius: 6 }}>
                  <span style={{ fontSize: 13, color: C.sub }}>{FIELD_LABELS[key] || key.replace(/_/g, " ")}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{Array.isArray(value) ? value.join(", ") : String(value ?? "—")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 3 }}>Request access to full details</div>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>The worker will review and approve or reject.</div>
          {!reqSent ? (
            <div>
              <textarea placeholder="Why do you need access? (optional)" value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={500} rows={2} style={{
                width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8, boxSizing: "border-box", resize: "vertical", fontSize: 13, outline: "none",
              }} />
              <button onClick={() => reqMut.mutate({ workerId: params.id, fields: DEFAULT_FIELDS, message: msg || undefined })} disabled={reqMut.isPending} style={{
                padding: "10px 20px", background: C.amber, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700,
              }}>
                {reqMut.isPending ? "Sending..." : "Request access"}
              </button>
              {reqMut.error && <div style={{ marginTop: 8, fontSize: 12, color: "#DC2626" }}>{reqMut.error.message}</div>}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: C.green, fontWeight: 600, background: "#DCFCE7", padding: "10px 14px", borderRadius: 8 }}>
              Request sent. The worker will review it.
            </div>
          )}
        </div>
      )}

      {/* Write a reference */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 3 }}>Write a reference</div>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>Have you worked with this person? Your reference strengthens their trust card.</div>
        {refSent ? (
          <div style={{ fontSize: 14, color: C.green, fontWeight: 600, background: "#DCFCE7", padding: "10px 14px", borderRadius: 8 }}>Reference submitted. Thank you.</div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            const f = e.target as HTMLFormElement;
            const rel = (f.elements.namedItem("relationship") as HTMLInputElement).value;
            const com = (f.elements.namedItem("comment") as HTMLTextAreaElement).value;
            if (rel) refMut.mutate({ workerId: params.id, relationship: rel, comment: com || undefined });
          }}>
            <input name="relationship" placeholder="Your relationship (e.g. Former employer)" style={{
              width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8, boxSizing: "border-box", fontSize: 13, outline: "none",
            }} />
            <textarea name="comment" placeholder="How was your experience?" rows={2} style={{
              width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8, boxSizing: "border-box", resize: "vertical", fontSize: 13, outline: "none",
            }} />
            <button type="submit" disabled={refMut.isPending} style={{
              padding: "10px 20px", background: C.navy, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700,
            }}>
              {refMut.isPending ? "Submitting..." : "Submit reference"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
