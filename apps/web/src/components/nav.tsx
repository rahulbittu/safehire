"use client";

import { useAuth } from "@verifyme/auth";
import { useRouter } from "next/navigation";

export function Nav() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.push("/login");
  };

  const linkStyle = {
    color: "#475569", textDecoration: "none", fontSize: 14, fontWeight: 500 as const,
    padding: "6px 12px", borderRadius: 6,
  };

  return (
    <nav style={{
      borderBottom: "1px solid #E2E8F0",
      padding: "0 24px",
      display: "flex",
      height: 52,
      alignItems: "center",
      background: "#fff",
    }}>
      <a href="/" style={{
        fontWeight: 800, fontSize: 17, color: "#0F172A",
        textDecoration: "none", marginRight: 24, letterSpacing: "-0.02em",
      }}>
        SafeHire
      </a>

      {user ? (
        <>
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            <a href="/dashboard" style={linkStyle}>Dashboard</a>
            {user.role === "hirer" && (
              <a href="/search" style={linkStyle}>Search</a>
            )}
            <a href="/consent" style={linkStyle}>Consent</a>
            {user.role === "hirer" && (
              <a href="/incidents/report" style={linkStyle}>Report</a>
            )}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 12, fontWeight: 600, color: "#1D4ED8",
              background: "#EFF6FF", padding: "3px 10px", borderRadius: 12,
              textTransform: "capitalize",
            }}>
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 14px", background: "transparent", border: "1px solid #E2E8F0",
                borderRadius: 6, fontSize: 13, fontWeight: 500,
                cursor: "pointer", color: "#64748B",
              }}
            >
              Sign out
            </button>
          </div>
        </>
      ) : (
        <div style={{ marginLeft: "auto" }}>
          <a href="/login" style={{
            color: "#fff", background: "#1D4ED8", textDecoration: "none",
            fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 6,
          }}>
            Sign in
          </a>
        </div>
      )}
    </nav>
  );
}
