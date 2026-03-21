export default function IncidentsPage() {
  // TODO: Fetch hirer's reported incidents via tRPC

  return (
    <div>
      <h1>Incidents</h1>
      <p>View and manage incidents you have reported.</p>

      <div style={{ marginBottom: 16 }}>
        <a href="/dashboard/incidents/report">
          <button>Report New Incident</button>
        </a>
      </div>

      {/* TODO: Render incident list with status badges */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Date</th>
            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Type</th>
            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Severity</th>
            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* TODO: Map over incidents */}
          <tr>
            <td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#888" }}>
              No incidents reported yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
