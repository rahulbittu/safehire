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

const VERIFICATION_STEPS = [
  "phone_verified", "selfie_captured", "government_id", "face_match",
  "address_submitted", "emergency_contact", "work_category", "reference_added",
  "agency_review", "active_reverification",
];

function getVerificationCount(steps: unknown): number {
  if (!steps || typeof steps !== "object") return 0;
  const s = steps as Record<string, unknown>;
  return VERIFICATION_STEPS.filter((step) => s[step] === true).length;
}

export default function SearchPage() {
  return <Suspense><SearchPageInner /></Suspense>;
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [locality, setLocality] = useState("");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
    const loc = searchParams.get("locality");
    if (loc) setLocality(loc);
  }, [searchParams]);

  const { data, isLoading, error } = trpc.hirer.searchWorkers.useQuery(
    { query: query || undefined, category: category || undefined, locality: locality || undefined, page: 1, limit: 20 },
  );

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        Find workers
      </h1>
      <p style={{ fontSize: 14, color: C.sub, margin: "0 0 16px" }}>Search by category, area, or name</p>

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

      {/* Search + locality */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }} className="grid-2col">
        <input type="text" placeholder="Name or skill..." value={query} onChange={(e) => setQuery(e.target.value)} style={{
          width: "100%", padding: "11px 14px", background: "#fff", border: `1px solid ${C.border}`,
          borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none",
        }} />
        <input type="text" placeholder="Area (e.g. Koramangala)" value={locality} onChange={(e) => setLocality(e.target.value)} style={{
          width: "100%", padding: "11px 14px", background: "#fff", border: `1px solid ${C.border}`,
          borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none",
        }} />
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", padding: "12px 16px", borderRadius: 10, marginBottom: 14, fontSize: 13, color: "#DC2626" }}>
          {error.message}
        </div>
      )}

      {isLoading && (
        <div style={{ display: "grid", gap: 8 }}>
          {[1, 2, 3].map((n) => <div key={n} style={{ height: 80, background: "#fff", borderRadius: 10, border: `1px solid ${C.border}` }} />)}
        </div>
      )}

      {data && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {data.total} result{data.total !== 1 ? "s" : ""}
            {category && <> in <strong style={{ color: C.navy }}>{CATEGORIES.find((c) => c.slug === category)?.label || category}</strong></>}
          </div>

          {data.workers.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 10, padding: 28, textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, color: C.sub }}>No workers found.</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Try a different category or area.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {data.workers.map((w: Record<string, unknown>) => {
                const name = (w.full_name as string) || "Unknown";
                const rawSkills = w.skills;
                const skills = Array.isArray(rawSkills) ? rawSkills as string[] : typeof rawSkills === "string" ? [rawSkills] : [];
                const exp = (w.experience_years as number) ?? 0;
                const workerCategory = (w.category as string) || "";
                const catLabel = CATEGORIES.find((c) => c.slug === workerCategory)?.label || workerCategory;
                const workerLocality = (w.locality as string) || "";
                const agencyId = w.agency_id as string | null;
                const verSteps = getVerificationCount(w.verification_steps);
                const avgRating = w.avg_rating as number | undefined;
                const ratingCount = w.rating_count as number | undefined;
                const availability = (w.availability as string) || "";
                const rawLangs = w.languages;
                const languages = Array.isArray(rawLangs) ? rawLangs as string[] : typeof rawLangs === "string" ? [rawLangs] : [];
                const tier = (w.tier as string) || "";

                const initial = name.charAt(0).toUpperCase();
                const avatarBg = agencyId ? "#DBEAFE" : C.bg;
                const avatarColor = agencyId ? "#1D4ED8" : C.navy;

                return (
                  <a key={w.id as string} href={`/worker/${w.user_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{
                      background: "#fff", borderRadius: 12, padding: "16px",
                      border: `1px solid ${C.border}`,
                      borderLeft: agencyId ? `3px solid #1D4ED8` : `3px solid ${C.border}`,
                    }}>
                      <div style={{ display: "flex", gap: 14 }}>
                        {/* Avatar */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 22, flexShrink: 0,
                          background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 18, fontWeight: 700, color: avatarColor,
                        }}>{initial}</div>
                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{name}</span>
                            {avgRating != null && ratingCount != null && ratingCount > 0 && (
                              <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{avgRating} ★</span>
                            )}
                          </div>
                          <div style={{ fontSize: 13, color: C.sub, marginTop: 3 }}>
                            {catLabel || (skills.length > 0 ? skills.join(" · ") : "No category")}
                            {workerLocality && <> · {workerLocality}</>}
                          </div>
                          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                            {availability === "available" && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: "#DCFCE7", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>Available</span>
                            )}
                            {agencyId ? (
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8", background: "#DBEAFE", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>Agency-backed</span>
                            ) : (
                              <span style={{ fontSize: 10, fontWeight: 600, color: C.muted, background: C.bg, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>Independent</span>
                            )}
                            {tier === "enhanced" && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: "#DCFCE7", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>{verSteps}/10 verified</span>
                            )}
                            {tier === "basic" && (
                              <span style={{ fontSize: 10, fontWeight: 600, color: C.amber, background: "#FDF6E8", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>{verSteps}/10 verified</span>
                            )}
                            {!tier && verSteps > 0 && (
                              <span style={{ fontSize: 10, fontWeight: 600, color: C.muted, background: C.bg, padding: "2px 8px", borderRadius: 10 }}>{verSteps}/10</span>
                            )}
                            {exp > 0 && <span style={{ fontSize: 11, color: C.muted }}>{exp} yr exp</span>}
                            {languages.length > 0 && <span style={{ fontSize: 11, color: C.muted }}>{languages.join(", ")}</span>}
                          </div>
                        </div>
                        {/* CTA */}
                        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                          <span style={{
                            padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                            background: C.amber, color: "#fff", whiteSpace: "nowrap",
                          }}>View</span>
                        </div>
                      </div>
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
