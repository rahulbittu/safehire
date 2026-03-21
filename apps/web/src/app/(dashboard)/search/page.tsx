"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading } = trpc.hirer.searchWorkers.useQuery(
    { query, page: 1, limit: 20 },
    { enabled: submitted }
  );

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Search Workers</h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>Find workers with verified trust profiles</p>

      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSubmitted(false); }}
            style={{ flex: 1, padding: 10, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 16 }}
          />
          <button
            type="submit"
            style={{ padding: "10px 20px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Search
          </button>
        </div>
      </form>

      {isLoading && <p>Searching...</p>}

      {data && (
        <div>
          <p style={{ color: "#6B7280", marginBottom: 16 }}>{data.total} workers found</p>
          {data.workers.length === 0 ? (
            <p style={{ color: "#9CA3AF" }}>No workers match your search. Try different terms.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {data.workers.map((worker: any) => (
                <a
                  key={worker.id}
                  href={`/worker/${worker.user_id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontWeight: 600 }}>{worker.full_name}</div>
                    <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
                      {worker.skills?.join(", ") || "No skills listed"} | {worker.experience_years} years
                    </div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
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
