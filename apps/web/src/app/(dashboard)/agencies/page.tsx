"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";

const C = { amber: "#C49A1A", navy: "#0D1B2A", green: "#16A34A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

const CATEGORIES = [
  { slug: "maid", label: "Maid" }, { slug: "cook", label: "Cook" },
  { slug: "driver", label: "Driver" }, { slug: "nanny", label: "Nanny" },
  { slug: "electrician", label: "Electrician" }, { slug: "plumber", label: "Plumber" },
  { slug: "cleaner", label: "Cleaner" }, { slug: "security", label: "Security" },
  { slug: "technician", label: "Technician" }, { slug: "painter", label: "Painter" },
];

export default function AgenciesPage() {
  return <Suspense><AgenciesPageInner /></Suspense>;
}

function AgenciesPageInner() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState("");
  const [locality, setLocality] = useState("");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
    const loc = searchParams.get("locality");
    if (loc) setLocality(loc);
  }, [searchParams]);

  const { data, isLoading, error } = trpc.agency.searchAgencies.useQuery({
    category: category || undefined,
    locality: locality || undefined,
    page: 1,
    limit: 20,
  });

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        Agencies
      </h1>
      <p style={{ fontSize: 14, color: C.sub, margin: "0 0 16px" }}>
        Browse agency-backed teams by category and area
      </p>

      {/* Category pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        <button onClick={() => setCategory("")} style={{
          padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
          border: !category ? `2px solid ${C.amber}` : `1px solid ${C.border}`,
          background: !category ? "#FDF6E8" : "#fff", color: !category ? C.amber : C.sub,
          cursor: "pointer",
        }}>All</button>
        {CATEGORIES.map((cat) => (
          <button key={cat.slug} onClick={() => setCategory(category === cat.slug ? "" : cat.slug)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            border: category === cat.slug ? `2px solid ${C.amber}` : `1px solid ${C.border}`,
            background: category === cat.slug ? "#FDF6E8" : "#fff",
            color: category === cat.slug ? C.amber : C.sub, cursor: "pointer",
          }}>{cat.label}</button>
        ))}
      </div>

      {/* Locality filter */}
      <input type="text" placeholder="Filter by area (e.g. Koramangala)" value={locality} onChange={(e) => setLocality(e.target.value)} style={{
        width: "100%", padding: "11px 14px", background: "#fff", border: `1px solid ${C.border}`,
        borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none", marginBottom: 16,
      }} />

      {error && (
        <div style={{ background: "#FEF2F2", padding: "12px 16px", borderRadius: 10, marginBottom: 14, fontSize: 13, color: "#DC2626" }}>
          {error.message}
        </div>
      )}

      {isLoading && (
        <div style={{ display: "grid", gap: 10 }}>
          {[1, 2, 3].map((n) => <div key={n} style={{ height: 100, background: "#fff", borderRadius: 12, border: `1px solid ${C.border}` }} />)}
        </div>
      )}

      {data && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {data.total} agenc{data.total !== 1 ? "ies" : "y"}
            {category && <> serving <strong style={{ color: C.navy }}>{CATEGORIES.find((c) => c.slug === category)?.label || category}</strong></>}
          </div>

          {data.agencies.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, color: C.sub }}>No agencies found.</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Try a different category or area.</div>
              <a href="/search" style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: C.amber, fontWeight: 600, textDecoration: "none" }}>
                Search individual workers instead →
              </a>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {data.agencies.map((a: Record<string, unknown>) => {
                const categories = Array.isArray(a.categories) ? (a.categories as string[]) : [];
                const localities = Array.isArray(a.localities) ? (a.localities as string[]) : [];
                const catLabels = categories.map((c) => CATEGORIES.find((cat) => cat.slug === c)?.label || c);
                const workerCount = (a.worker_count as number) ?? 0;
                const verified = !!a.verified_at;
                const initial = ((a.name as string) || "A").charAt(0).toUpperCase();

                return (
                  <div key={a.id as string} style={{
                    background: "#fff", borderRadius: 12, padding: "18px 20px",
                    border: `1px solid ${C.border}`, borderLeft: `3px solid #1D4ED8`,
                  }}>
                    <div style={{ display: "flex", gap: 14 }}>
                      {/* Agency avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 700, color: "#1D4ED8",
                      }}>{initial}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{a.name as string}</span>
                          {verified && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: "#DCFCE7", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>Verified</span>
                          )}
                        </div>
                        {typeof a.description === "string" && a.description && (
                          <div style={{ fontSize: 13, color: C.sub, marginTop: 4, lineHeight: 1.4 }}>{a.description}</div>
                        )}
                        {/* Categories served */}
                        {catLabels.length > 0 && (
                          <div style={{ fontSize: 12, color: C.sub, marginTop: 6 }}>
                            {catLabels.join(", ")}
                          </div>
                        )}
                        {/* Areas served */}
                        {localities.length > 0 && (
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                            {localities.join(", ")}
                          </div>
                        )}
                        {/* Stats + CTA row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                          <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                            <span style={{ fontWeight: 600, color: C.navy }}>{workerCount} worker{workerCount !== 1 ? "s" : ""}</span>
                          </div>
                          <a href={`/search?agency=${a.id}`} style={{
                            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                            background: C.amber, color: "#fff", textDecoration: "none",
                          }}>View workers</a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Agency CTA */}
      <div style={{ marginTop: 20, background: C.bg, borderRadius: 12, padding: "18px 20px", border: `1px solid ${C.border}`, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Run a staffing agency?</div>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>List your workers, grow your business, get booked directly on SafeHire.</div>
        <a href="/login?role=agency" style={{
          display: "inline-block", padding: "10px 22px", background: C.amber, color: "#fff",
          borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 700,
        }}>Register your agency</a>
      </div>
    </div>
  );
}
