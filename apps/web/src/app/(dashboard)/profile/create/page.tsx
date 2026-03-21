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
    onSuccess: () => router.push("/"),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) { setError("Name is required"); return; }
    createMutation.mutate({
      fullName: formData.fullName,
      skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
      languages: formData.languages.split(",").map((s) => s.trim()).filter(Boolean),
      experienceYears: formData.experienceYears,
    });
  };

  return (
    <div style={{ maxWidth: 600, padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Create Your Profile</h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>
        Set up your worker profile to start building your trust card.
      </p>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            style={{ width: "100%", padding: 10, border: "1px solid #D1D5DB", borderRadius: 6, boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Skills (comma-separated)</label>
          <input
            type="text"
            placeholder="cooking, cleaning, driving"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            style={{ width: "100%", padding: 10, border: "1px solid #D1D5DB", borderRadius: 6, boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Languages (comma-separated)</label>
          <input
            type="text"
            placeholder="Hindi, English, Kannada"
            value={formData.languages}
            onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
            style={{ width: "100%", padding: 10, border: "1px solid #D1D5DB", borderRadius: 6, boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Years of Experience</label>
          <input
            type="number"
            min={0}
            value={formData.experienceYears}
            onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
            style={{ width: "100%", padding: 10, border: "1px solid #D1D5DB", borderRadius: 6, boxSizing: "border-box" }}
          />
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending}
          style={{ padding: 12, background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, fontSize: 16, cursor: "pointer" }}
        >
          {createMutation.isPending ? "Creating..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
