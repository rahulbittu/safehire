"use client";

import { useAuth } from "@verifyme/auth";
import { useRouter, usePathname } from "next/navigation";

export function Nav() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    signOut();
    router.push("/login");
  };

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid #F1F5F9",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "0 24px",
        display: "flex",
        height: 56,
        alignItems: "center",
      }}>
        <a href="/" style={{
          fontWeight: 800, fontSize: 20, color: "#0F766E",
          textDecoration: "none", letterSpacing: "-0.03em",
        }}>
          safe<span style={{ color: "#D97706" }}>hire</span>
        </a>

        {user ? (
          <>
            <div className="nav-links" style={{
              display: "flex", gap: 4, alignItems: "center",
              marginLeft: 32,
            }}>
              <NavLink href="/dashboard" label="Home" active={pathname === "/dashboard"} />
              {user.role === "hirer" && (
                <NavLink href="/search" label="Find Workers" active={pathname === "/search"} />
              )}
              <NavLink href="/consent" label="Consent" active={pathname === "/consent"} />
              {user.role === "hirer" && (
                <NavLink href="/incidents/report" label="Report" active={pathname?.startsWith("/incidents") ?? false} />
              )}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                padding: "4px 12px", borderRadius: 6,
                background: user.role === "worker" ? "#F0FDF9" : "#FFF7ED",
                color: user.role === "worker" ? "#0F766E" : "#D97706",
                fontSize: 12, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}>
                {user.role}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: "7px 16px", background: "transparent",
                  border: "1.5px solid #E2E8F0", borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  color: "#64748B",
                }}
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <a href="/login" style={{
              color: "#1E293B", textDecoration: "none",
              fontSize: 14, fontWeight: 600, padding: "8px 16px",
            }}>
              Log in
            </a>
            <a href="/login" style={{
              color: "#fff", background: "#0F766E",
              textDecoration: "none",
              fontSize: 14, fontWeight: 600, padding: "9px 20px", borderRadius: 8,
            }}>
              Get started
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a href={href} style={{
      padding: "8px 14px", textDecoration: "none",
      color: active ? "#0F766E" : "#64748B",
      fontSize: 14, fontWeight: active ? 700 : 500,
      borderRadius: 8,
      background: active ? "#F0FDF9" : "transparent",
    }}>
      {label}
    </a>
  );
}
