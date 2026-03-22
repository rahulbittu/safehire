"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

const C = { amber: "#C49A1A", navy: "#0D1B2A", green: "#16A34A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

export default function LoginPage() {
  const router = useRouter();
  const { authMode, setDevSession, supabase } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<"worker" | "hirer">("worker");
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
    <div style={{ minHeight: "calc(100vh - 53px)", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.navy, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            {step === "phone" ? "Sign in to SafeHire" : "Enter OTP"}
          </h1>
          <p style={{ color: C.sub, margin: 0, fontSize: 14, lineHeight: 1.5 }}>
            {step === "phone"
              ? "Your trust card and data stay private. Only you control access."
              : <>Code sent to <strong>{phone}</strong></>
            }
          </p>
        </div>

        {/* Demo mode — professional UAT banner */}
        {authMode === "dev" && step === "phone" && (
          <div style={{
            background: "#fff", border: `1px solid ${C.border}`, padding: "14px 16px",
            borderRadius: 10, marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Demo accounts
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <button type="button" onClick={() => { setPhone("+919876543201"); setRole("worker"); }} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", background: C.bg, border: "none", borderRadius: 8,
                cursor: "pointer", width: "100%", textAlign: "left",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Priya Sharma</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Worker · Cook, Housekeeper</div>
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>+91 98765 43201</div>
              </button>
              <button type="button" onClick={() => { setPhone("+919876543301"); setRole("hirer"); }} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", background: C.bg, border: "none", borderRadius: 8,
                cursor: "pointer", width: "100%", textAlign: "left",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Ananya Gupta</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Hirer · Homeowner</div>
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>+91 98765 43301</div>
              </button>
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>
              OTP for all demo accounts: <strong style={{ color: C.navy }}>123456</strong>
            </div>
          </div>
        )}

        {/* Main form card */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "24px 20px",
          border: `1px solid ${C.border}`,
        }}>

          {error && (
            <div style={{
              background: "#FEF2F2", color: "#DC2626",
              padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp}>
              {/* Role selector — clear, descriptive */}
              {authMode === "dev" && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 8 }}>I want to</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button key="worker" type="button" onClick={() => setRole("worker")} style={{
                      padding: "14px 12px",
                      border: role === "worker" ? `2px solid ${C.amber}` : `1px solid ${C.border}`,
                      borderRadius: 10, cursor: "pointer", background: role === "worker" ? "#FDF6E8" : "#fff",
                      textAlign: "left",
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: role === "worker" ? C.navy : C.sub }}>Get hired</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>I&apos;m a domestic worker</div>
                    </button>
                    <button key="hirer" type="button" onClick={() => setRole("hirer")} style={{
                      padding: "14px 12px",
                      border: role === "hirer" ? `2px solid ${C.amber}` : `1px solid ${C.border}`,
                      borderRadius: 10, cursor: "pointer", background: role === "hirer" ? "#FDF6E8" : "#fff",
                      textAlign: "left",
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: role === "hirer" ? C.navy : C.sub }}>Hire someone</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>I&apos;m looking for help</div>
                    </button>
                  </div>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Phone number</label>
                <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} style={{
                  width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`,
                  borderRadius: 8, fontSize: 16, boxSizing: "border-box", outline: "none",
                }} />
              </div>
              <button type="submit" disabled={isPending} style={{
                width: "100%", padding: 14,
                background: isPending ? `${C.amber}66` : C.amber,
                color: "#fff", border: "none", borderRadius: 10, fontSize: 15,
                fontWeight: 700, cursor: isPending ? "default" : "pointer",
              }}>
                {isPending ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Verification code</label>
                <input type="text" inputMode="numeric" placeholder={authMode === "dev" ? "123456" : "Enter 6-digit code"}
                  maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} autoFocus style={{
                    width: "100%", padding: "14px", border: `1px solid ${C.border}`,
                    borderRadius: 8, fontSize: 22, letterSpacing: "0.2em",
                    textAlign: "center", boxSizing: "border-box", outline: "none",
                  }} />
              </div>
              <button type="submit" disabled={isPending} style={{
                width: "100%", padding: 14,
                background: isPending ? `${C.amber}66` : C.amber,
                color: "#fff", border: "none", borderRadius: 10, fontSize: 15,
                fontWeight: 700, cursor: isPending ? "default" : "pointer",
              }}>
                {isPending ? "Verifying..." : "Verify & sign in"}
              </button>
              <button type="button" onClick={() => { setStep("phone"); setOtp(""); setError(""); }} style={{
                width: "100%", padding: 10, background: "transparent", border: "none",
                fontSize: 13, cursor: "pointer", marginTop: 8, color: C.sub,
              }}>
                Use a different number
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
          Your data is encrypted. You control who sees it.
        </div>
      </div>
    </div>
  );
}
