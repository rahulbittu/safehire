"use client";

import { useAuth } from "@verifyme/auth";
import { useRouter, usePathname } from "next/navigation";

const C = { amber: "#C49A1A", navy: "#0D1B2A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

export function Nav() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => { signOut(); router.push("/login"); };

  return (
    <>
      {/* Top bar — minimal: brand + sign out */}
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
            fontWeight: 800, fontSize: 20, textDecoration: "none",
            color: C.navy, letterSpacing: "-0.03em",
          }}>
            Safe<span style={{ color: C.amber }}>Hire</span>
          </a>

          {user ? (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                padding: "3px 8px", borderRadius: 99,
                background: "#FDF6E8", color: C.amber, letterSpacing: "0.04em",
              }}>
                {user.role}
              </span>
              <button onClick={handleLogout} style={{
                padding: "5px 12px", background: "transparent",
                border: `1px solid ${C.border}`, borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: "pointer", color: C.sub,
              }}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <a href="/login" style={{ color: C.navy, textDecoration: "none", fontSize: 14, fontWeight: 600, padding: "8px 14px" }}>
                Log in
              </a>
              <a href="/login" style={{
                background: C.amber, color: "#fff", textDecoration: "none",
                fontSize: 14, fontWeight: 600, padding: "9px 20px", borderRadius: 12,
              }}>
                Get started
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom tab bar — mobile app style, only for logged-in users */}
      {user && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "#fff", borderTop: `1px solid ${C.border}`,
          zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-around",
            maxWidth: 520, margin: "0 auto", padding: "6px 0 4px",
          }}>
            <TabItem href="/dashboard" icon="🏠" label="Home" active={pathname === "/dashboard"} />
            {user.role === "hirer" && (
              <TabItem href="/search" icon="🔍" label="Search" active={pathname === "/search"} />
            )}
            <TabItem href="/consent" icon="🔐" label="Consent" active={pathname === "/consent"} />
            {user.role === "worker" && (
              <TabItem href="/profile/create" icon="👤" label="Profile" active={pathname === "/profile/create"} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function TabItem({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <a href={href} style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      textDecoration: "none", padding: "4px 16px", gap: 2,
      minWidth: 56,
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{
        fontSize: 10, fontWeight: active ? 800 : 600,
        color: active ? C.amber : C.muted,
        letterSpacing: "0.02em",
      }}>{label}</span>
    </a>
  );
}
