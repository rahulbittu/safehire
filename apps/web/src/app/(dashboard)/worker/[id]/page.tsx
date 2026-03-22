"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface WorkerPageProps { params: { id: string } }

const C = { amber: "#C49A1A", navy: "#0D1B2A", green: "#34C759", blue: "#007AFF", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };
const DEFAULT_FIELDS = ["full_name", "skills", "experience_years"];

export default function WorkerTrustCardPage({ params }: WorkerPageProps) {
  const [msg, setMsg] = useState("");
  const [reqSent, setReqSent] = useState(false);
  const [endoSent, setEndoSent] = useState(false);

  const { data, isLoading, error } = trpc.hirer.viewTrustCard.useQuery({ workerId: params.id });
  const reqMut = trpc.consent.requestAccess.useMutation({ onSuccess: () => setReqSent(true) });
  const endoMut = trpc.trust.submitEndorsement.useMutation({ onSuccess: () => setEndoSent(true) });

  if (isLoading) return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      {[160, 100].map((h, i) => <div key={i} style={{ height: h, background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 14 }} />)}
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ background: "#fff", borderLeft: "3px solid #FF3B30", padding: 16, borderRadius: 14, fontSize: 14, color: "#FF3B30", border: `1px solid ${C.border}` }}>{error.message}</div>
    </div>
  );

  if (!data) return null;

  const card = data.trustCard as Record<string, unknown>;
  const tier = (card.tier as string) ?? "unverified";
  const tierMap: Record<string, { gradient: string; bg: string; color: string; label: string }> = {
    unverified: { gradient: "linear-gradient(135deg, #636366, #8E8E93)", bg: "#F8F8F8", color: "#636366", label: "Unverified" },
    basic: { gradient: "linear-gradient(135deg, #007AFF, #58A6FF)", bg: "#F0F7FF", color: "#007AFF", label: "Basic" },
    enhanced: { gradient: "linear-gradient(135deg, #C49A1A, #F0C84A)", bg: "#FDF6E8", color: "#C49A1A", label: "Enhanced" },
  };
  const ts = tierMap[tier] ?? tierMap.unverified;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <a href="/search" style={{ fontSize: 13, color: C.sub, textDecoration: "none", marginBottom: 14, display: "inline-block" }}>← Back</a>

      {/* Profile header */}
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", marginBottom: 14, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ height: 56, background: ts.gradient }} />
        <div style={{ padding: "0 20px 18px", marginTop: -24 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: ts.gradient, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, border: "3px solid #fff",
          }}>W</div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: C.navy, margin: 0 }}>Worker Profile</h1>
              <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>Trust card is public. Details need consent.</div>
            </div>
            <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", background: ts.bg, color: ts.color }}>{ts.label}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 18, marginBottom: 14, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 12 }}>Trust Card</div>
        <div className="grid-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { v: (card.verification_status as string) ?? "pending", l: "Verified" },
            { v: `${(card.tenure_months as number) ?? 0}mo`, l: "Tenure" },
            { v: String((card.endorsement_count as number) ?? 0), l: "Endorsed" },
            { v: card.incident_flag ? "Yes" : "None", l: "Incidents" },
          ].map((s) => (
            <div key={s.l} style={{ background: C.bg, borderRadius: 10, padding: "12px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{s.v}</div>
              <div style={{ fontSize: 9, color: C.muted, marginTop: 3, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Consent */}
      {data.hasConsent ? (
        <div style={{ background: "#fff", borderRadius: 14, padding: 18, marginBottom: 14, borderLeft: `3px solid ${C.green}`, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.green, marginBottom: 10 }}>✓ Access Granted</div>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>Fields: {data.consentedFields.join(", ")}</div>
          {data.profile && (
            <div style={{ padding: 14, background: C.bg, borderRadius: 10 }}>
              {Object.entries(data.profile as Record<string, unknown>).map(([key, value]) => (
                <div key={key} style={{ fontSize: 14, marginBottom: 6, display: "flex", gap: 10 }}>
                  <span style={{ color: C.sub, minWidth: 110, textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</span>
                  <span style={{ color: C.navy, fontWeight: 700 }}>{Array.isArray(value) ? value.join(", ") : String(value ?? "—")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 14, padding: 18, marginBottom: 14, borderLeft: `3px solid ${C.amber}`, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.amber, marginBottom: 4 }}>🔒 Profile Locked</div>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>Request access to see this worker&apos;s details.</div>
          {!reqSent ? (
            <div>
              <textarea placeholder="Why do you need access? (optional)" value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={500} rows={2} style={{
                width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 10, boxSizing: "border-box", resize: "vertical", fontSize: 13, outline: "none", background: C.bg,
              }} />
              <button onClick={() => reqMut.mutate({ workerId: params.id, fields: DEFAULT_FIELDS, message: msg || undefined })} disabled={reqMut.isPending} style={{
                padding: "11px 24px", background: C.amber, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700,
              }}>
                {reqMut.isPending ? "Sending..." : "Request Access"}
              </button>
              {reqMut.error && <div style={{ marginTop: 8, fontSize: 12, color: "#FF3B30" }}>{reqMut.error.message}</div>}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: C.green, fontWeight: 700, background: "#E8FAE8", padding: "10px 14px", borderRadius: 10 }}>
              ✓ Request sent. The worker will review it.
            </div>
          )}
        </div>
      )}

      {/* Endorse */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 18, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Endorse this worker</div>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>Help build their trust profile.</div>
        {endoSent ? (
          <div style={{ fontSize: 14, color: C.green, fontWeight: 700, background: "#E8FAE8", padding: "12px 14px", borderRadius: 10 }}>✓ Endorsement submitted.</div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            const f = e.target as HTMLFormElement;
            const rel = (f.elements.namedItem("relationship") as HTMLInputElement).value;
            const com = (f.elements.namedItem("comment") as HTMLTextAreaElement).value;
            if (rel) endoMut.mutate({ workerId: params.id, relationship: rel, comment: com || undefined });
          }}>
            <input name="relationship" placeholder="Your relationship (e.g., Former employer)" style={{
              width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 8, boxSizing: "border-box", fontSize: 13, outline: "none", background: C.bg,
            }} />
            <textarea name="comment" placeholder="Share your experience..." rows={2} style={{
              width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 10, boxSizing: "border-box", resize: "vertical", fontSize: 13, outline: "none", background: C.bg,
            }} />
            <button type="submit" disabled={endoMut.isPending} style={{
              padding: "11px 24px", background: C.amber, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700,
            }}>
              {endoMut.isPending ? "Submitting..." : "Submit Endorsement"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
