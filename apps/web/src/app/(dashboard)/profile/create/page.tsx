"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

const C = { amber: "#C49A1A", navy: "#0D1B2A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA" };

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

  const inputStyle = {
    width: "100%" as const, padding: "12px 14px",
    border: `1px solid ${C.border}`, borderRadius: 8,
    fontSize: 15, boxSizing: "border-box" as const, outline: "none",
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <a href="/dashboard" style={{ fontSize: 13, color: C.sub, textDecoration: "none", marginBottom: 16, display: "inline-block" }}>← Back</a>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Create your trust card
        </h1>
        <p style={{ color: C.sub, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
          Add your details. This is what hirers see when they check your trust card.
        </p>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ background: "#fff", borderRadius: 12, padding: "20px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Full name</label>
            <input type="text" placeholder="Your full name" value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Job types / Skills</label>
            <input type="text" placeholder="e.g. cook, driver, housekeeper" value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })} style={inputStyle} />
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Separate with commas</div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Languages</label>
            <input type="text" placeholder="e.g. Hindi, English, Kannada" value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })} style={inputStyle} />
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Separate with commas</div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Years of experience</label>
            <input type="number" min={0} max={50} value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
              style={{ ...inputStyle, maxWidth: 120 }} />
          </div>
        </div>

        <button type="submit" disabled={createMutation.isPending} style={{
          width: "100%", padding: 14,
          background: createMutation.isPending ? `${C.amber}66` : C.amber,
          color: "#fff", border: "none", borderRadius: 10, fontSize: 15,
          fontWeight: 700, cursor: createMutation.isPending ? "default" : "pointer",
        }}>
          {createMutation.isPending ? "Creating..." : "Create trust card"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
          Your data is encrypted. Only hirers you approve can see your details.
        </div>
      </form>
    </div>
  );
}
