"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

const C = {
  primary: "#0A66C2",
  verified: "#057642",
  text: "#191919",
  textSec: "#666666",
  textTer: "#999999",
  border: "#E0E0E0",
};

// Generate a consistent color from a name
function nameColor(name: string): string {
  const colors = ["#0A66C2", "#057642", "#B24020", "#8B5CF6", "#DC2626", "#0891B2", "#D97706"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = trpc.hirer.searchWorkers.useQuery(
    { query: query || undefined, page: 1, limit: 20 },
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 24px" }}>
      {/* Search bar */}
      <div style={{
        background: "#fff", borderRadius: 8, border: `1px solid ${C.border}`,
        padding: 16, marginBottom: 16,
      }}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: 16, color: C.textTer,
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by name, skill, or expertise..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%", padding: "12px 16px 12px 42px",
              background: "#EEF3F8", border: "none", borderRadius: 4,
              fontSize: 14, boxSizing: "border-box", outline: "none",
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{
          background: "#fff", border: `1px solid ${C.border}`, borderLeft: "3px solid #CC1016",
          padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 14, color: "#CC1016",
        }}>
          {error.message}
        </div>
      )}

      {isLoading && (
        <div style={{ display: "grid", gap: 2 }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={{
              height: 88, background: "#fff", border: `1px solid ${C.border}`,
              borderRadius: n === 1 ? "8px 8px 0 0" : n === 4 ? "0 0 8px 8px" : 0,
            }} />
          ))}
        </div>
      )}

      {data && (
        <>
          <div style={{
            background: "#fff", borderRadius: "8px 8px 0 0", border: `1px solid ${C.border}`,
            padding: "12px 16px", borderBottom: "none",
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
              {data.total} worker{data.total !== 1 ? "s" : ""} found
            </span>
          </div>

          {data.workers.length === 0 ? (
            <div style={{
              background: "#fff", border: `1px solid ${C.border}`,
              borderRadius: "0 0 8px 8px", padding: 40, textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
              <div style={{ fontSize: 15, color: C.textSec, marginBottom: 4 }}>No workers found.</div>
              <div style={{ fontSize: 13, color: C.textTer }}>
                Try a different search term or clear the filter.
              </div>
            </div>
          ) : (
            <div>
              {data.workers.map((worker: Record<string, unknown>, index: number) => {
                const name = worker.full_name as string;
                const skills = (worker.skills as string[]) || [];
                const isLast = index === data.workers.length - 1;

                return (
                  <a
                    key={worker.id as string}
                    href={`/worker/${worker.user_id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div style={{
                      background: "#fff",
                      border: `1px solid ${C.border}`,
                      borderTop: "none",
                      borderRadius: isLast ? "0 0 8px 8px" : 0,
                      padding: "16px 20px",
                      display: "flex", alignItems: "center", gap: 16,
                      cursor: "pointer",
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: nameColor(name), color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, fontWeight: 700, flexShrink: 0,
                      }}>
                        {name.charAt(0)}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                            {name}
                          </span>
                          {worker.verified_at ? (
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: C.verified,
                              background: "#E8F5E9", padding: "2px 8px", borderRadius: 10,
                            }}>
                              ✓ Verified
                            </span>
                          ) : null}
                        </div>
                        <div style={{ fontSize: 14, color: C.textSec, marginTop: 2 }}>
                          {skills.join(" · ") || "No skills listed"}
                        </div>
                        <div style={{ fontSize: 13, color: C.textTer, marginTop: 2 }}>
                          {worker.experience_years as number} years experience
                          {worker.verified_at ? " · Profile verified" : ""}
                        </div>
                      </div>

                      {/* Action */}
                      <span style={{
                        padding: "8px 16px", borderRadius: 20,
                        border: `2px solid ${C.primary}`, color: C.primary,
                        fontSize: 14, fontWeight: 600, flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}>
                        View Profile
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
