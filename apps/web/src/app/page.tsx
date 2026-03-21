"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("verifyme-token");
    if (token) {
      router.replace("/dashboard");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>SafeHire</h1>
      <p style={{ fontSize: 18, color: "#6B7280", marginBottom: 32 }}>
        Privacy-first worker trust profiles for safer hiring decisions.
      </p>

      <div style={{ display: "grid", gap: 24, marginBottom: 32 }}>
        <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>For Workers</h2>
          <p style={{ color: "#6B7280", fontSize: 14 }}>
            Build a verified trust profile you own and control. Share your credentials with hirers on your terms.
          </p>
        </div>
        <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>For Hirers</h2>
          <p style={{ color: "#6B7280", fontSize: 14 }}>
            Search for workers with verified trust signals. Request access to detailed profiles with worker consent.
          </p>
        </div>
      </div>

      <a
        href="/login"
        style={{
          display: "inline-block", padding: "12px 24px", background: "#2563EB",
          color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 16,
        }}
      >
        Get Started
      </a>
    </div>
  );
}
