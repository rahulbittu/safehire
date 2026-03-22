"use client";

import { trpc } from "@/lib/trpc";

const C = { amber: "#C49A1A", navy: "#0D1B2A", green: "#16A34A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

export default function AgencyDashboard() {
  const { data: agencyData, isLoading } = trpc.agency.getAgency.useQuery();
  const agency = agencyData?.agency as Record<string, unknown> | null;

  const { data: workersData } = trpc.agency.getAgencyWorkers.useQuery(
    { agencyId: agency?.id as string },
    { enabled: !!agency?.id },
  );

  if (isLoading) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
        {[100, 80, 80].map((h, i) => (
          <div key={i} style={{ height: h, background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  if (!agency) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: "28px 20px", border: `1px solid ${C.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 8 }}>
            No agency found
          </div>
          <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.6 }}>
            Your account is not linked to an agency. Contact support to set up your agency profile.
          </p>
        </div>
      </div>
    );
  }

  const categories = Array.isArray(agency.categories) ? (agency.categories as string[]) : [];
  const localities = Array.isArray(agency.localities) ? (agency.localities as string[]) : [];
  const workers = (workersData?.workers ?? []) as Array<Record<string, unknown>>;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      {/* Agency header */}
      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, marginBottom: 12 }}>
        <div style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>{agency.name as string}</div>
            {typeof agency.description === "string" && agency.description && (
              <div style={{ fontSize: 13, color: C.sub, marginTop: 3 }}>{agency.description}</div>
            )}
          </div>
          {!!agency.verified_at && (
            <div style={{
              padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700,
              background: "#DCFCE7", color: C.green, textTransform: "uppercase", flexShrink: 0,
            }}>Verified</div>
          )}
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[
            { v: String(agency.worker_count ?? workers.length), l: "Workers" },
            { v: String(categories.length), l: "Categories" },
            { v: String(localities.length), l: "Areas" },
          ].map((s) => (
            <div key={s.l} style={{ padding: "10px 6px", textAlign: "center", borderRight: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{s.v}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories & areas */}
      {(categories.length > 0 || localities.length > 0) && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
          {categories.length > 0 && (
            <div style={{ marginBottom: localities.length > 0 ? 12 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Categories</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {categories.map((cat) => (
                  <span key={cat} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: "#FDF6E8", color: C.amber, border: `1px solid ${C.amber}33`,
                  }}>{cat}</span>
                ))}
              </div>
            </div>
          )}
          {localities.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Service areas</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {localities.map((loc) => (
                  <span key={loc} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: C.bg, color: C.sub, border: `1px solid ${C.border}`,
                  }}>{loc}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Worker roster */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Worker roster</div>
          <span style={{ fontSize: 12, color: C.muted }}>{workers.length} worker{workers.length !== 1 ? "s" : ""}</span>
        </div>
        {workers.length === 0 ? (
          <div style={{ padding: "16px 0", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: C.sub }}>No workers linked to this agency yet.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {workers.map((w) => {
              const skills = Array.isArray(w.skills) ? (w.skills as string[]) : [];
              return (
                <a key={w.user_id as string} href={`/worker/${w.user_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    padding: "10px 12px", borderRadius: 8, background: C.bg,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{(w.full_name as string) || "Unknown"}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                        {[
                          w.category as string,
                          w.locality as string,
                          skills.length > 0 ? skills.join(", ") : "",
                        ].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {!!w.verified_at && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: "#DCFCE7", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>Verified</span>
                      )}
                      <span style={{ fontSize: 13, color: C.muted }}>→</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
