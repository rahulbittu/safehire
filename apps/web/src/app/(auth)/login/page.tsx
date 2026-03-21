"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

export default function LoginPage() {
  const router = useRouter();
  const { authMode, setDevSession, supabase } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<"worker" | "hirer">("hirer");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function handleSupabaseSendOtp() {
    if (!supabase) return;
    setLoading(true); setError("");
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
      if (otpError) setError(otpError.message); else setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    }
    setLoading(false);
  }

  async function handleSupabaseVerifyOtp() {
    if (!supabase) return;
    setLoading(true); setError("");
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (verifyError) setError(verifyError.message); else router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    }
    setLoading(false);
  }

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) { setError("Please enter a phone number"); return; }
    if (authMode === "supabase") handleSupabaseSendOtp();
    else registerMutation.mutate({ phone, role });
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) { setError("Please enter the OTP code"); return; }
    if (authMode === "supabase") handleSupabaseVerifyOtp();
    else verifyMutation.mutate({ phone, otp });
  }

  const isPending = loading || registerMutation.isPending || verifyMutation.isPending;

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFBFC" }}>
      <div style={{
        width: "100%", maxWidth: 400, margin: "0 auto", padding: 32,
        background: "#fff", borderRadius: 14,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0F766E", letterSpacing: "-0.03em" }}>
            safe<span style={{ color: "#D97706" }}>hire</span>
          </div>
          <p style={{ color: "#64748B", marginTop: 6, fontSize: 15 }}>
            {step === "phone" ? "Sign in to your account" : "Enter verification code"}
          </p>
        </div>

        {authMode === "dev" && (
          <div style={{
            background: "#FFF7ED", border: "1px solid #FDE68A", padding: "14px 16px",
            borderRadius: 10, marginBottom: 20, fontSize: 13, color: "#92400E", lineHeight: 1.6,
          }}>
            <strong>Demo mode</strong> — OTP is always <strong>123456</strong>
            <div style={{ marginTop: 8, fontSize: 12, color: "#A16207" }}>Try these accounts:</div>
            <div style={{ marginTop: 4, fontSize: 12, display: "grid", gap: 2 }}>
              <div><strong>+919876543201</strong> — Priya (worker, enhanced trust)</div>
              <div><strong>+919876543301</strong> — Ananya (hirer)</div>
            </div>
          </div>
        )}

        {authMode === "supabase" && (
          <div style={{
            background: "#F0FDF9", border: "1px solid #D1FAE5", padding: "10px 14px",
            borderRadius: 10, marginBottom: 20, fontSize: 13, color: "#166534",
          }}>
            A verification code will be sent via SMS.
          </div>
        )}

        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626",
            padding: "10px 14px", borderRadius: 10, marginBottom: 20, fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp}>
            {authMode === "dev" && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>I am a</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["hirer", "worker"] as const).map((r) => (
                    <button key={r} type="button" onClick={() => setRole(r)} style={{
                      padding: "10px 0",
                      border: role === r ? "2px solid #0F766E" : "1.5px solid #F1F5F9",
                      borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700,
                      background: role === r ? "#F0FDF9" : "#fff",
                      color: role === r ? "#0F766E" : "#64748B",
                      textTransform: "capitalize",
                    }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>Phone number</label>
              <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} style={{
                width: "100%", padding: "12px 14px", border: "1.5px solid #F1F5F9",
                borderRadius: 10, fontSize: 16, boxSizing: "border-box", outline: "none",
              }} />
            </div>
            <button type="submit" disabled={isPending} style={{
              width: "100%", padding: 14,
              background: isPending ? "#99F6E4" : "#0F766E",
              color: "#fff", border: "none", borderRadius: 10, fontSize: 15,
              fontWeight: 700, cursor: isPending ? "default" : "pointer",
            }}>
              {isPending ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>Verification code</label>
              <input type="text" inputMode="numeric" placeholder={authMode === "dev" ? "123456" : "Enter 6-digit code"}
                maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} autoFocus style={{
                  width: "100%", padding: "12px 14px", border: "1.5px solid #F1F5F9",
                  borderRadius: 10, fontSize: 20, letterSpacing: "0.15em",
                  textAlign: "center", boxSizing: "border-box", outline: "none",
                }} />
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>Sent to {phone}</div>
            </div>
            <button type="submit" disabled={isPending} style={{
              width: "100%", padding: 14,
              background: isPending ? "#99F6E4" : "#0F766E",
              color: "#fff", border: "none", borderRadius: 10, fontSize: 15,
              fontWeight: 700, cursor: isPending ? "default" : "pointer",
            }}>
              {isPending ? "Verifying..." : "Verify"}
            </button>
            <button type="button" onClick={() => { setStep("phone"); setOtp(""); setError(""); }} style={{
              width: "100%", padding: 12, background: "transparent", border: "none",
              borderRadius: 10, fontSize: 13, cursor: "pointer", marginTop: 8, color: "#64748B",
            }}>
              Use a different number
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>
          Your data is encrypted and you control who sees it.
        </div>
      </div>
    </div>
  );
}
