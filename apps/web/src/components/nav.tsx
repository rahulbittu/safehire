"use client";

import { useAuth } from "@verifyme/auth";
import { useRouter } from "next/navigation";

export function Nav() {
  const { user, signOut, authMode } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.push("/login");
  };

  return (
    <nav style={{
      borderBottom: "1px solid #E5E7EB",
      padding: "12px 24px",
      display: "flex",
      gap: 16,
      alignItems: "center",
      background: "#fff",
    }}>
      <a href="/" style={{ fontWeight: 700, color: "#1F2937", textDecoration: "none", marginRight: 16 }}>
        SafeHire
      </a>

      {user ? (
        <>
          <a href="/dashboard" style={{ color: "#6B7280", textDecoration: "none", fontSize: 14 }}>Dashboard</a>
          {user.role === "hirer" && (
            <a href="/search" style={{ color: "#6B7280", textDecoration: "none", fontSize: 14 }}>Search</a>
          )}
          <a href="/consent" style={{ color: "#6B7280", textDecoration: "none", fontSize: 14 }}>Consent</a>
          {user.role === "hirer" && (
            <a href="/incidents/report" style={{ color: "#6B7280", textDecoration: "none", fontSize: 14 }}>Report</a>
          )}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>
              {user.role} {authMode === "dev" && "(dev)"}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "4px 12px", background: "transparent", border: "1px solid #D1D5DB",
                borderRadius: 6, fontSize: 13, cursor: "pointer", color: "#6B7280",
              }}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <div style={{ marginLeft: "auto" }}>
          <a href="/login" style={{ color: "#2563EB", textDecoration: "none", fontSize: 14 }}>Login</a>
        </div>
      )}
    </nav>
  );
}
