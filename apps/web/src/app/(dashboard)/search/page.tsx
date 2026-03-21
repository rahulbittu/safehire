"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

const T = {
  teal: "#0F766E",
  tealLight: "#F0FDF9",
  amber: "#D97706",
  text: "#1E293B",
  sub: "#64748B",
  muted: "#94A3B8",
  border: "#F1F5F9",
};

const AVATAR_COLORS = ["#0F766E", "#D97706", "#6366F1", "#DC2626", "#0891B2", "#7C3AED", "#059669"];
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = trpc.hirer.searchWorkers.useQuery(
    { query: query || undefined, page: 1, limit: 20 },
  );

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px" }}>
      {/* Search */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: 20, marginBottom: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: `1px solid ${T.border}`,
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          Find Workers
        </h1>
        <input
          type="text"
          placeholder="Search by name, skill, or expertise..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%", padding: "12px 16px",
            background: "#F8FAFC", border: `1.5px solid ${T.border}`,
            borderRadius: 10, fontSize: 14, boxSizing: "border-box",
            outline: "none",
          }}
        />
      </div>

      {error && (
        <div style={{
          background: "#fff", borderLeft: "3px solid #DC2626",
          padding: 16, borderRadius: 14, marginBottom: 16, fontSize: 14, color: "#DC2626",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: `1px solid ${T.border}`,
        }}>
          {error.message}
        </div>
      )}

      {isLoading && (
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{
              height: 80, background: "#fff", borderRadius: 14, border: `1px solid ${T.border}`,
            }} />
          ))}
        </div>
      )}

      {data && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.muted, marginBottom: 12 }}>
            {data.total} worker{data.total !== 1 ? "s" : ""} found
          </div>

          {data.workers.length === 0 ? (
            <div style={{
              background: "#fff", borderRadius: 14, padding: 40, textAlign: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: `1px solid ${T.border}`,
            }}>
              <div style={{ fontSize: 15, color: T.sub }}>No workers found.</div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>Try a different search term.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {data.workers.map((worker: Record<string, unknown>) => {
                const name = worker.full_name as string;
                const skills = (worker.skills as string[]) || [];
                const color = avatarColor(name);

                return (
                  <a key={worker.id as string} href={`/worker/${worker.user_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{
                      background: "#fff", borderRadius: 14, padding: "18px 20px",
                      display: "flex", alignItems: "center", gap: 16,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      border: `1px solid ${T.border}`,
                      cursor: "pointer",
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: `linear-gradient(135deg, ${color}, ${color}88)`,
                        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, fontWeight: 700, flexShrink: 0,
                      }}>
                        {name.charAt(0)}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{name}</span>
                          {worker.verified_at ? (
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: T.teal,
                              background: T.tealLight, padding: "2px 8px", borderRadius: 6,
                            }}>
                              Verified
                            </span>
                          ) : null}
                        </div>
                        <div style={{ fontSize: 14, color: T.sub, marginTop: 3 }}>
                          {skills.join(" · ") || "No skills listed"}
                        </div>
                        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                          {worker.experience_years as number} years experience
                        </div>
                      </div>

                      {/* CTA */}
                      <span style={{
                        padding: "8px 18px", borderRadius: 8,
                        border: `1.5px solid ${T.teal}`, color: T.teal,
                        fontSize: 13, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap",
                      }}>
                        View
                      </span>
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
