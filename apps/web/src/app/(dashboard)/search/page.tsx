"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  // Always fetch — shows all workers by default, filters on search
  const { data, isLoading, error } = trpc.hirer.searchWorkers.useQuery(
    { query: query || undefined, page: 1, limit: 20 },
  );

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Search Workers</h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>
        Find workers with verified trust profiles. Click a worker to view their trust card and request access.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Filter by name or skill..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: 10, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 16 }}
        />
      </div>

      {isLoading && <p style={{ color: "#6B7280" }}>Loading workers...</p>}

      {error && (
        <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
          {error.message}
        </div>
      )}

      {data && (
        <div>
          <p style={{ color: "#6B7280", marginBottom: 16 }}>{data.total} worker{data.total !== 1 ? "s" : ""} found</p>
          {data.workers.length === 0 ? (
            <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 24, textAlign: "center" }}>
              <p style={{ color: "#9CA3AF", marginBottom: 8 }}>No workers found.</p>
              <p style={{ color: "#9CA3AF", fontSize: 13 }}>
                Log in as a worker first and create a profile, then search here as a hirer.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {data.workers.map((worker: Record<string, unknown>) => (
                <a
                  key={worker.id as string}
                  href={`/worker/${worker.user_id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 16, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 600 }}>{worker.full_name as string}</div>
                      <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace" }}>
                        {(worker.user_id as string)?.slice(0, 8)}...
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
                      {(worker.skills as string[])?.join(", ") || "No skills listed"} · {worker.experience_years as number} years
                    </div>
                    <div style={{ fontSize: 12, color: worker.verified_at ? "#059669" : "#9CA3AF", marginTop: 4 }}>
                      {worker.verified_at ? "Verified" : "Unverified"}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
