"use client";

import { useAuth } from "@verifyme/auth";
import { useRouter, usePathname } from "next/navigation";

const C = { amber: "#C49A1A", navy: "#0D1B2A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA" };

export function Nav() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => { signOut(); router.push("/login"); };

  return (
    <>
      {/* Top bar */}
      <nav style={{
        background: "#fff",
        borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 520, margin: "0 auto", padding: "0 20px",
          display: "flex", height: 52, alignItems: "center",
        }}>
          <a href="/" style={{
            fontWeight: 800, fontSize: 18, textDecoration: "none",
            color: C.navy, letterSpacing: "-0.02em",
          }}>
            SafeHire
          </a>

          {user ? (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                color: C.muted, letterSpacing: "0.04em",
              }}>
                {user.role}
              </span>
              <button onClick={handleLogout} style={{
                padding: "5px 12px", background: "transparent",
                border: `1px solid ${C.border}`, borderRadius: 6,
                fontSize: 12, fontWeight: 600, cursor: "pointer", color: C.sub,
              }}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <a href="/login" style={{
                color: C.navy, textDecoration: "none", fontSize: 14,
                fontWeight: 600, padding: "8px 14px",
              }}>
                Log in
              </a>
              <a href="/login" style={{
                background: C.amber, color: "#fff", textDecoration: "none",
                fontSize: 14, fontWeight: 600, padding: "8px 18px", borderRadius: 8,
              }}>
                Sign up
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom tab bar — logged-in users only */}
      {user && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "#fff", borderTop: `1px solid ${C.border}`,
          zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-around",
            maxWidth: 520, margin: "0 auto", padding: "8px 0 6px",
          }}>
            <Tab href="/dashboard" label="Home" active={pathname === "/dashboard"} />
            {user.role === "hirer" && (
              <Tab href="/search" label="Search" active={pathname === "/search"} />
            )}
            <Tab href="/consent" label="Consent" active={pathname === "/consent"} />
          </div>
        </div>
      )}
    </>
  );
}

function Tab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a href={href} style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      textDecoration: "none", padding: "6px 20px",
      fontSize: 13, fontWeight: active ? 700 : 500,
      color: active ? C.amber : C.muted,
      borderTop: active ? `2px solid ${C.amber}` : "2px solid transparent",
      marginTop: -1,
    }}>
      {label}
    </a>
  );
}
