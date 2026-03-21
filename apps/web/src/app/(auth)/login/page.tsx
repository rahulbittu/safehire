"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

/**
 * Login page — dual-mode authentication.
 *
 * PRIMARY PATH (Supabase Auth):
 * When Supabase Auth phone OTP is configured (requires SMS provider like Twilio),
 * the login flow uses supabase.auth.signInWithOtp() and supabase.auth.verifyOtp().
 * Session is managed by Supabase Auth and JWT is sent with API requests.
 *
 * DEV FALLBACK:
 * When Supabase Auth phone OTP is not configured, the login flow uses the
 * tRPC auth router with HMAC-signed dev tokens. OTP is always "123456".
 * This is clearly labeled and not suitable for production.
 */
export default function LoginPage() {
  const router = useRouter();
  const { authMode, setDevSession, supabase } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<"worker" | "hirer">("hirer");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Dev auth mutations (fallback path)
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => { setStep("otp"); setError(""); },
    onError: (err) => setError(err.message),
  });

  const verifyMutation = trpc.auth.verifyOtp.useMutation({
    onSuccess: (data) => {
      if (data.success && data.session) {
        setDevSession(data.session);
        router.push("/dashboard");
      } else {
        setError(data.message || "Verification failed");
      }
    },
    onError: (err) => setError(err.message),
  });

  // Supabase Auth path
  async function handleSupabaseSendOtp() {
    if (!supabase) return;
    setLoading(true);
    setError("");
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
      if (otpError) {
        setError(otpError.message);
      } else {
        setStep("otp");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    }
    setLoading(false);
  }

  async function handleSupabaseVerifyOtp() {
    if (!supabase) return;
    setLoading(true);
    setError("");
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });
      if (verifyError) {
        setError(verifyError.message);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    }
    setLoading(false);
  }

  // Send OTP handler
  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Please enter a phone number");
      return;
    }
    if (authMode === "supabase") {
      handleSupabaseSendOtp();
    } else {
      registerMutation.mutate({ phone, role });
    }
  }

  // Verify OTP handler
  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the OTP code");
      return;
    }
    if (authMode === "supabase") {
      handleSupabaseVerifyOtp();
    } else {
      verifyMutation.mutate({ phone, otp });
    }
  }

  const isPending = loading || registerMutation.isPending || verifyMutation.isPending;

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Sign In to SafeHire</h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>Enter your phone number to continue</p>

      {authMode === "dev" && (
        <div style={{ background: "#FEF3C7", padding: 8, borderRadius: 6, marginBottom: 16, fontSize: 12, color: "#92400E" }}>
          DEMO MODE: Use OTP code <strong>123456</strong> to log in. This is a preview — not production auth.
        </div>
      )}

      {authMode === "supabase" && (
        <div style={{ background: "#DCFCE7", padding: 8, borderRadius: 6, marginBottom: 16, fontSize: 12, color: "#166534" }}>
          Supabase Auth: Real OTP will be sent via SMS.
        </div>
      )}

      {error && (
        <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={handleSendOtp}>
          {authMode === "dev" && (
            <>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>I am a</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setRole("hirer")}
                  style={{
                    flex: 1, padding: 10, border: "1px solid #D1D5DB", borderRadius: 6, cursor: "pointer",
                    background: role === "hirer" ? "#2563EB" : "#fff",
                    color: role === "hirer" ? "#fff" : "#1F2937",
                  }}
                >
                  Hirer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("worker")}
                  style={{
                    flex: 1, padding: 10, border: "1px solid #D1D5DB", borderRadius: 6, cursor: "pointer",
                    background: role === "worker" ? "#2563EB" : "#fff",
                    color: role === "worker" ? "#fff" : "#1F2937",
                  }}
                >
                  Worker
                </button>
              </div>
            </>
          )}

          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Phone Number</label>
          <input
            type="tel"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 16, marginBottom: 16, boxSizing: "border-box" }}
          />
          <button
            type="submit"
            disabled={isPending}
            style={{ width: "100%", padding: 12, background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, fontSize: 16, cursor: "pointer" }}
          >
            {isPending ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>OTP Code</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder={authMode === "dev" ? "123456" : "Enter OTP from SMS"}
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 16, marginBottom: 16, boxSizing: "border-box" }}
          />
          <button
            type="submit"
            disabled={isPending}
            style={{ width: "100%", padding: 12, background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, fontSize: 16, cursor: "pointer" }}
          >
            {isPending ? "Verifying..." : "Verify OTP"}
          </button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            style={{ width: "100%", padding: 12, background: "transparent", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 14, cursor: "pointer", marginTop: 8 }}
          >
            Change number
          </button>
        </form>
      )}
    </div>
  );
}
