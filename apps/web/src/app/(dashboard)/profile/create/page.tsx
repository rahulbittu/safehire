"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

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
    width: "100%" as const,
    padding: "12px 14px",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    fontSize: 15,
    boxSizing: "border-box" as const,
    outline: "none",
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: 13,
    fontWeight: 600 as const,
    color: "#334155",
    marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.025em", margin: 0 }}>
          Create your profile
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>
          This information builds your trust card. Your data is encrypted and you control who sees it.
        </p>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          border: "1px solid #E2E8F0", borderRadius: 12, padding: 24,
          background: "#fff", marginBottom: 20,
        }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Full name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Skills</label>
            <input
              type="text"
              placeholder="e.g. cooking, cleaning, driving"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              style={inputStyle}
            />
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>Separate multiple skills with commas</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Languages</label>
            <input
              type="text"
              placeholder="e.g. Hindi, English, Kannada"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              style={inputStyle}
            />
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>Separate multiple languages with commas</div>
          </div>

          <div>
            <label style={labelStyle}>Years of experience</label>
            <input
              type="number"
              min={0}
              max={50}
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
              style={{ ...inputStyle, maxWidth: 120 }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          style={{
            width: "100%", padding: 14,
            background: createMutation.isPending ? "#93C5FD" : "#1D4ED8",
            color: "#fff", border: "none", borderRadius: 8, fontSize: 15,
            fontWeight: 600, cursor: createMutation.isPending ? "default" : "pointer",
          }}
        >
          {createMutation.isPending ? "Creating..." : "Create profile"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>
          Your profile is encrypted at rest. Only hirers you approve can view your details.
        </div>
      </form>
    </div>
  );
}
