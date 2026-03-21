"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function ReportIncidentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    workerId: "",
    type: "",
    severity: "",
    description: "",
  });
  const [error, setError] = useState("");

  const reportMutation = trpc.incident.reportIncident.useMutation({
    onSuccess: () => router.push("/dashboard"),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workerId || !formData.type || !formData.severity || !formData.description) {
      setError("All fields are required");
      return;
    }
    if (formData.description.length < 10) {
      setError("Description must be at least 10 characters");
      return;
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
      <a href="/dashboard" style={{ fontSize: 13, color: "#64748B", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>
        &larr; Back to dashboard
      </a>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1E293B", letterSpacing: "-0.025em", margin: 0 }}>
          Report an Incident
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>
          The worker will be notified and has the right to appeal. All reports are reviewed.
        </p>
      </div>

      {/* Accountability notice */}
      <div style={{
        background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12,
        padding: "14px 18px", marginBottom: 20,
      }}>
        <div style={{ fontWeight: 700, color: "#92400E", fontSize: 13, marginBottom: 4 }}>Fair reporting</div>
        <p style={{ fontSize: 13, color: "#A16207", margin: 0, lineHeight: 1.5 }}>
          SafeHire is not a blacklist. False or malicious reports are reviewed and can result in your account being restricted.
          Workers can appeal any report.
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
            <label style={labelStyle}>Worker ID</label>
            <input
              type="text"
              placeholder="Worker UUID from their profile"
              value={formData.workerId}
              onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
              style={inputStyle}
            />
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
              Find this on the worker&apos;s trust card page
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }} className="grid-2col">
            <div>
              <label style={labelStyle}>Incident type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ ...inputStyle, background: "#fff" }}
              >
                <option value="">Select type...</option>
                <option value="theft">Theft</option>
                <option value="misconduct">Misconduct</option>
                <option value="property_damage">Property Damage</option>
                <option value="harassment">Harassment</option>
                <option value="safety_concern">Safety Concern</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                style={{ ...inputStyle, background: "#fff" }}
              >
                <option value="">Select severity...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              rows={4}
              placeholder="Describe what happened. Be specific and factual."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={10000}
              style={{ ...inputStyle, resize: "vertical" as const }}
            />
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
              Minimum 10 characters. Be factual — this report is reviewed by our team.
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={reportMutation.isPending}
          style={{
            width: "100%", padding: 14,
            background: reportMutation.isPending ? "#FCA5A5" : "#DC2626",
            color: "#fff", border: "none", borderRadius: 8, fontSize: 15,
            fontWeight: 600, cursor: reportMutation.isPending ? "default" : "pointer",
          }}
        >
          {reportMutation.isPending ? "Submitting..." : "Submit Report"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>
          Reports are encrypted and reviewed fairly. The worker will be notified and can appeal.
        </div>
      </form>
    </div>
  );
}
