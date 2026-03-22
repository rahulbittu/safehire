"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

const C = { amber: "#C49A1A", navy: "#0D1B2A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA" };

export default function ReportIncidentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ workerId: "", type: "", severity: "", description: "" });
  const [error, setError] = useState("");

  const reportMutation = trpc.incident.reportIncident.useMutation({
    onSuccess: () => router.push("/dashboard"),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workerId || !formData.type || !formData.severity || !formData.description) {
      setError("All fields are required"); return;
    }
    if (formData.description.length < 10) {
      setError("Description must be at least 10 characters"); return;
    }
    setError("");
    reportMutation.mutate({
      workerId: formData.workerId,
      type: formData.type as any,
      severity: formData.severity as any,
      description: formData.description,
    });
  };

  const inputStyle = {
    width: "100%" as const, padding: "12px 14px",
    border: `1px solid ${C.border}`, borderRadius: 8,
    fontSize: 15, boxSizing: "border-box" as const, outline: "none",
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <a href="/dashboard" style={{ fontSize: 13, color: C.sub, textDecoration: "none", marginBottom: 16, display: "inline-block" }}>
        ← Back
      </a>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Report an incident
        </h1>
        <p style={{ color: C.sub, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
          The worker will be notified and can appeal. All reports are reviewed.
        </p>
      </div>

      <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "14px 18px", marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: "#DC2626", margin: 0, lineHeight: 1.5 }}>
          <strong>Fair reporting:</strong> SafeHire is not a blacklist. False or malicious reports may result in account restrictions.
        </p>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Worker ID</label>
            <input type="text" placeholder="Worker UUID from their trust card" value={formData.workerId}
              onChange={(e) => setFormData({ ...formData, workerId: e.target.value })} style={inputStyle} />
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Find this on the worker&apos;s trust card page</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }} className="grid-2col">
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={{ ...inputStyle, background: "#fff" }}>
                <option value="">Select...</option>
                <option value="theft">Theft</option>
                <option value="misconduct">Misconduct</option>
                <option value="property_damage">Property Damage</option>
                <option value="harassment">Harassment</option>
                <option value="safety_concern">Safety Concern</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Severity</label>
              <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} style={{ ...inputStyle, background: "#fff" }}>
                <option value="">Select...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Description</label>
            <textarea rows={4} placeholder="Describe what happened. Be specific and factual." value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} maxLength={10000}
              style={{ ...inputStyle, resize: "vertical" as const }} />
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Minimum 10 characters. Be factual.</div>
          </div>
        </div>

        <button type="submit" disabled={reportMutation.isPending} style={{
          width: "100%", padding: 14, background: reportMutation.isPending ? "#FCA5A5" : "#DC2626",
          color: "#fff", border: "none", borderRadius: 10, fontSize: 15,
          fontWeight: 700, cursor: reportMutation.isPending ? "default" : "pointer",
        }}>
          {reportMutation.isPending ? "Submitting..." : "Submit report"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
          Reports are encrypted and reviewed fairly. The worker will be notified.
        </div>
      </form>
    </div>
  );
}
