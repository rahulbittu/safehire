"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function ReportIncidentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    workerId: "",
    type: "" as any,
    severity: "" as any,
    description: "",
  });
  const [error, setError] = useState("");

  const reportMutation = trpc.incident.reportIncident.useMutation({
    onSuccess: () => router.push("/incidents"),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = () => {
    if (!formData.workerId || !formData.type || !formData.severity || !formData.description) {
      setError("All fields are required");
      return;
    }
    reportMutation.mutate(formData);
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Report an Incident</h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>
        The worker will be notified and has the right to appeal. All reports are reviewed by our team.
      </p>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 600 }}>
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Worker ID (UUID)</label>
          <input
            type="text"
            placeholder="Worker UUID"
            value={formData.workerId}
            onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
            style={{ width: "100%", padding: 10, border: "1px solid #D1D5DB", borderRadius: 6, boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Incident Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            style={{ width: "100%", padding: 10, border: "1px solid #D1D5DB", borderRadius: 6 }}
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
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Severity</label>
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            style={{ width: "100%", padding: 10, border: "1px solid #D1D5DB", borderRadius: 6 }}
          >
            <option value="">Select severity...</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Description</label>
          <textarea
            rows={6}
            placeholder="Describe the incident..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: "100%", padding: 10, border: "1px solid #D1D5DB", borderRadius: 6, boxSizing: "border-box", resize: "vertical" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={reportMutation.isPending}
          style={{ padding: 12, background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, fontSize: 16, cursor: "pointer" }}
        >
          {reportMutation.isPending ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
}
