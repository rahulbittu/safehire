"use client";

// TODO: Fetch disclosure requests via tRPC (admin.getDisclosureRequests)

/**
 * Disclosure request management for admins.
 * Review and process requests for worker data disclosure.
 *
 * TODO: Fetch real data from API.
 * TODO: Add document viewer for legal basis evidence.
 * TODO: Add approve/deny workflow with notes.
 */
export default function DisclosuresPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Disclosure Requests
      </h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>
        Review and process data disclosure requests. Each request must include
        valid legal basis documentation.
      </p>

      {/* Status filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["All", "Pending", "Approved", "Denied"].map((tab) => (
          <button
            key={tab}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #D1D5DB",
              background: tab === "All" ? "#2563EB" : "#FFFFFF",
              color: tab === "All" ? "#FFFFFF" : "#374151",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Disclosure requests table */}
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#FFFFFF", borderRadius: 8 }}>
        <thead>
          <tr>
            {["Requested", "Requester", "Type", "Worker", "Legal Basis", "Status", "Actions"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  borderBottom: "2px solid #E5E7EB",
                  fontSize: 13,
                  color: "#6B7280",
                  fontWeight: 600,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* TODO: Map over disclosure requests from API */}
          <tr>
            <td
              colSpan={7}
              style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}
            >
              No disclosure requests.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
