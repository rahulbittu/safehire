"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

const C = { amber: "#C49A1A", navy: "#0D1B2A", green: "#16A34A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading, error } = trpc.hirer.searchWorkers.useQuery(
    { query: query || undefined, page: 1, limit: 20 },
  );

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        Find workers
      </h1>
      <p style={{ fontSize: 14, color: C.sub, margin: "0 0 16px" }}>Search by name, skill, or job type</p>
      <input
        type="text"
        placeholder="e.g. cook, driver, Priya..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%", padding: "13px 16px",
          background: "#fff", border: `1px solid ${C.border}`,
          borderRadius: 10, fontSize: 15, boxSizing: "border-box",
          outline: "none", marginBottom: 20,
        }}
      />

      {error && (
        <div style={{ background: "#FEF2F2", padding: "12px 16px", borderRadius: 10, marginBottom: 14, fontSize: 13, color: "#DC2626" }}>
          {error.message}
        </div>
      )}

      {isLoading && (
        <div style={{ display: "grid", gap: 8 }}>
          {[1, 2, 3].map((n) => <div key={n} style={{ height: 72, background: "#fff", borderRadius: 10, border: `1px solid ${C.border}` }} />)}
        </div>
      )}

      {data && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {data.total} result{data.total !== 1 ? "s" : ""}
          </div>

          {data.workers.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 10, padding: 32, textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, color: C.sub }}>No workers found.</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Try a different search term.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {data.workers.map((w: Record<string, unknown>) => {
                const name = (w.full_name as string) || "Unknown";
                const rawSkills = w.skills;
                const skills = Array.isArray(rawSkills) ? rawSkills as string[] : typeof rawSkills === "string" ? [rawSkills] : [];
                const exp = (w.experience_years as number) ?? 0;
                const verified = !!w.verified_at;

                return (
                  <a key={w.id as string} href={`/worker/${w.user_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{
                      background: "#fff", borderRadius: 10, padding: "14px 16px",
                      border: `1px solid ${C.border}`,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{name}</span>
                          {verified && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: C.green,
                              background: "#DCFCE7", padding: "2px 6px", borderRadius: 4,
                              textTransform: "uppercase",
                            }}>Verified</span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>
                          {skills.length > 0 ? skills.join(" · ") : "No skills listed"}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                          {exp > 0 ? `${exp} yr experience` : "Experience not listed"}
                        </div>
                      </div>
                      <span style={{ fontSize: 16, color: C.muted, flexShrink: 0, marginLeft: 12 }}>→</span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
