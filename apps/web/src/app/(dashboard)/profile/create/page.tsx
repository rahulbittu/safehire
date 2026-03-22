"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

const C = { amber: "#C49A1A", navy: "#0D1B2A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

export default function CreateProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    skills: "",
    languages: "",
    experienceYears: 0,
  });
  const [error, setError] = useState("");

  const createMutation = trpc.worker.createProfile.useMutation({
    onSuccess: () => router.push("/dashboard"),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) { setError("Name is required"); return; }
    setError("");
    createMutation.mutate({
      fullName: formData.fullName.trim(),
      skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
      languages: formData.languages.split(",").map((s) => s.trim()).filter(Boolean),
      experienceYears: formData.experienceYears,
    });
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <a href="/dashboard" style={{ fontSize: 13, color: C.sub, textDecoration: "none", marginBottom: 14, display: "inline-block" }}>← Back</a>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, letterSpacing: "-0.02em", margin: 0 }}>
          Create your profile
        </h1>
        <p style={{ color: C.sub, fontSize: 14, marginTop: 4, lineHeight: 1.5 }}>
          This builds your trust card. Your data is encrypted and you control who sees it.
        </p>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", borderLeft: "3px solid #FF3B30", color: "#FF3B30", padding: "10px 14px", borderRadius: 14, marginBottom: 14, fontSize: 13, border: `1px solid ${C.border}` }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          background: "#fff", borderRadius: 14, padding: 20,
          marginBottom: 14, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Full name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              style={{
                width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`,
                borderRadius: 10, fontSize: 15, boxSizing: "border-box", outline: "none", background: C.bg,
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Skills</label>
            <input
              type="text"
              placeholder="e.g. cooking, cleaning, driving"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              style={{
                width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`,
                borderRadius: 10, fontSize: 15, boxSizing: "border-box", outline: "none", background: C.bg,
              }}
            />
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Separate multiple skills with commas</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Languages</label>
            <input
              type="text"
              placeholder="e.g. Hindi, English, Kannada"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              style={{
                width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`,
                borderRadius: 10, fontSize: 15, boxSizing: "border-box", outline: "none", background: C.bg,
              }}
            />
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Separate multiple languages with commas</div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Years of experience</label>
            <input
              type="number"
              min={0}
              max={50}
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
              style={{
                width: "100%", maxWidth: 120, padding: "12px 14px", border: `1px solid ${C.border}`,
                borderRadius: 10, fontSize: 15, boxSizing: "border-box", outline: "none", background: C.bg,
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          style={{
            width: "100%", padding: 14,
            background: createMutation.isPending ? `${C.amber}66` : C.amber,
            color: "#fff", border: "none", borderRadius: 12, fontSize: 15,
            fontWeight: 700, cursor: createMutation.isPending ? "default" : "pointer",
          }}
        >
          {createMutation.isPending ? "Creating..." : "Create profile"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
          Your profile is encrypted at rest. Only hirers you approve can view your details.
        </div>
      </form>
    </div>
  );
}
