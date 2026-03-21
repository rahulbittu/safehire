"use client";

// TODO: Fetch pending appeals via tRPC (admin.getPendingReviews)

/**
 * Appeals review queue for admins.
 * Lists all worker appeals pending review.
 *
 * TODO: Fetch real data from API.
 * TODO: Add appeal detail view with original incident context.
 * TODO: Add accept/reject actions.
 */
export default function AppealsReviewPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Appeals Review Queue
      </h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>
        Review worker appeals for incident determinations.
      </p>

      {/* Appeals table */}
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#FFFFFF", borderRadius: 8 }}>
        <thead>
          <tr>
            {["Submitted", "Worker", "Original Incident", "Status", "Actions"].map((h) => (
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
          {/* TODO: Map over appeals from API */}
          <tr>
            <td
              colSpan={5}
              style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}
            >
              No appeals pending review.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
