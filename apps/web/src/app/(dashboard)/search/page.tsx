"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

const C = { amber: "#C49A1A", navy: "#0D1B2A", green: "#34C759", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

const COLORS = ["#C49A1A", "#34C759", "#007AFF", "#FF3B30", "#AF52DE", "#FF9500", "#5AC8FA"];
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading, error } = trpc.hirer.searchWorkers.useQuery(
    { query: query || undefined, page: 1, limit: 20 },
  );

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 14px", letterSpacing: "-0.02em" }}>
        Find Workers
      </h1>
      <input
        type="text"
        placeholder="Search by name or skill..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%", padding: "14px 16px",
          background: "#fff", border: `1px solid ${C.border}`,
          borderRadius: 12, fontSize: 15, boxSizing: "border-box",
          outline: "none", marginBottom: 20,
        }}
      />

      {error && (
        <div style={{ background: "#fff", borderLeft: `3px solid #FF3B30`, padding: 16, borderRadius: 14, marginBottom: 14, fontSize: 14, color: "#FF3B30", border: `1px solid ${C.border}` }}>
          {error.message}
        </div>
      )}

      {isLoading && (
        <div style={{ display: "grid", gap: 10 }}>
          {[1, 2, 3].map((n) => <div key={n} style={{ height: 80, background: "#fff", borderRadius: 14, border: `1px solid ${C.border}` }} />)}
        </div>
      )}

      {data && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 12 }}>
            {data.total} result{data.total !== 1 ? "s" : ""}
          </div>

          {data.workers.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 14, padding: 40, textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 15, color: C.sub }}>No workers found.</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Try a different search.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {data.workers.map((w: Record<string, unknown>) => {
                const name = (w.full_name as string) || "Unknown";
                const rawSkills = w.skills;
                const skills = Array.isArray(rawSkills) ? rawSkills as string[] : typeof rawSkills === "string" ? [rawSkills] : [];
                const color = avatarColor(name);

                return (
                  <a key={w.id as string} href={`/worker/${w.user_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{
                      background: "#fff", borderRadius: 14, padding: "16px 18px",
                      display: "flex", alignItems: "center", gap: 14,
                      border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}>
                      <div style={{
                        width: 50, height: 50, borderRadius: 14,
                        background: `linear-gradient(135deg, ${color}, ${color}99)`,
                        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, fontWeight: 700, flexShrink: 0,
                      }}>{name.charAt(0)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{name}</span>
                          {w.verified_at ? (
                            <span style={{
                              fontSize: 9, fontWeight: 800, color: C.green,
                              background: "#E8FAE8", padding: "2px 7px", borderRadius: 99,
                              textTransform: "uppercase",
                            }}>Verified</span>
                          ) : null}
                        </div>
                        <div style={{ fontSize: 13, color: C.sub, marginTop: 3 }}>
                          {skills.join(" · ") || "No skills listed"}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                          {(w.experience_years as number) ?? 0} years
                        </div>
                      </div>
                      <span style={{ fontSize: 18, color: C.amber }}>→</span>
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
