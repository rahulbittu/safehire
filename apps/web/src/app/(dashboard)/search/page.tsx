"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = trpc.hirer.searchWorkers.useQuery(
    { query: query || undefined, page: 1, limit: 20 },
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.025em", margin: 0 }}>
          Search Workers
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
          Find workers with verified trust profiles. Click to view their trust card.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search by name or skill..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%", padding: "12px 16px", border: "1px solid #E2E8F0",
            borderRadius: 10, fontSize: 15, boxSizing: "border-box",
            outline: "none", background: "#F8FAFC",
          }}
        />
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
          {error.message}
        </div>
      )}

      {isLoading && (
        <div style={{ display: "grid", gap: 10 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ height: 72, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }} />
          ))}
        </div>
      )}

      {data && (
        <>
          <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 12, fontWeight: 500 }}>
            {data.total} worker{data.total !== 1 ? "s" : ""} found
          </div>

          {data.workers.length === 0 ? (
            <div style={{
              border: "1px dashed #CBD5E1", borderRadius: 12, padding: 32, textAlign: "center",
            }}>
              <div style={{ fontSize: 14, color: "#64748B", marginBottom: 4 }}>No workers found.</div>
              <div style={{ fontSize: 13, color: "#94A3B8" }}>
                Try a different search, or log in as a worker first to create a profile.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {data.workers.map((worker: Record<string, unknown>) => (
                <a
                  key={worker.id as string}
                  href={`/worker/${worker.user_id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div style={{
                    border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 18px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "#fff", cursor: "pointer",
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>
                        {worker.full_name as string}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748B", marginTop: 3 }}>
                        {(worker.skills as string[])?.join(", ") || "No skills listed"}
                        <span style={{ color: "#CBD5E1", margin: "0 6px" }}>·</span>
                        {worker.experience_years as number} years
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                        padding: "3px 8px", borderRadius: 10,
                        background: worker.verified_at ? "#F0FDF4" : "#F8FAFC",
                        color: worker.verified_at ? "#15803D" : "#94A3B8",
                        border: `1px solid ${worker.verified_at ? "#BBF7D0" : "#E2E8F0"}`,
                      }}>
                        {worker.verified_at ? "Verified" : "Unverified"}
                      </span>
                      <span style={{ fontSize: 13, color: "#94A3B8" }}>&rarr;</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
