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

  const initial = user?.role === "worker" ? "W" : "H";

  return (
    <nav style={{
      background: "#fff",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      padding: "0 24px",
      display: "flex",
      height: 52,
      alignItems: "center",
      maxWidth: 1128,
      margin: "0 auto",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <a href="/" style={{
          display: "flex", alignItems: "center", gap: 8,
          textDecoration: "none",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 4, background: "#0A66C2",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 18,
          }}>
            S
          </div>
        </a>
      </div>

      {user ? (
        <>
          <div className="nav-links" style={{
            display: "flex", gap: 0, alignItems: "center",
            marginLeft: 24,
          }}>
            <NavItem href="/dashboard" icon="⌂" label="Home" />
            {user.role === "hirer" && (
              <NavItem href="/search" icon="⊕" label="Search" />
            )}
            <NavItem href="/consent" icon="☰" label="Consent" />
            {user.role === "hirer" && (
              <NavItem href="/incidents/report" icon="⚑" label="Report" />
            )}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: user.role === "worker" ? "#057642" : "#0A66C2",
                color: "#fff", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 14, fontWeight: 700,
              }}>
                {initial}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#191919", textTransform: "capitalize" }}>
                  {user.role}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 14px", background: "transparent",
                border: "1px solid #E0E0E0", borderRadius: 16,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                color: "#666",
              }}
            >
              Sign out
            </button>
          </div>
        </>
      ) : (
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/login" style={{
            color: "#0A66C2", textDecoration: "none",
            fontSize: 14, fontWeight: 600, padding: "8px 16px",
          }}>
            Sign in
          </a>
          <a href="/login" style={{
            color: "#0A66C2", background: "transparent",
            border: "2px solid #0A66C2", textDecoration: "none",
            fontSize: 14, fontWeight: 600, padding: "8px 20px", borderRadius: 20,
          }}>
            Join now
          </a>
        </div>
      )}
    </nav>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a href={href} style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "4px 16px", textDecoration: "none", color: "#666",
      fontSize: 10, fontWeight: 500, gap: 2, minWidth: 48,
      borderBottom: "2px solid transparent",
    }}>
      <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
