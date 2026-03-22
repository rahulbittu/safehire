"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@verifyme/auth";

const C = { amber: "#C49A1A", navy: "#0D1B2A", green: "#16A34A", sub: "#636366", muted: "#8E8E93", border: "#E5E5EA", bg: "#F7F6F3" };

type Role = "worker" | "hirer" | "agency";

export default function LoginPage() {
  return <Suspense><LoginPageInner /></Suspense>;
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authMode, setDevSession, supabase } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<Role>("worker");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-select role from URL
  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "worker" || r === "hirer" || r === "agency") setRole(r);
  }, [searchParams]);

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
    // Agency uses hirer role for now (same auth flow)
    const authRole = role === "agency" ? "hirer" : role;
    if (authMode === "supabase") handleSupabaseSendOtp();
    else registerMutation.mutate({ phone, role: authRole });
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) { setError("Please enter the OTP code"); return; }
    if (authMode === "supabase") handleSupabaseVerifyOtp();
    else verifyMutation.mutate({ phone, otp });
  }

  const isPending = loading || registerMutation.isPending || verifyMutation.isPending;

  const DEMO_ACCOUNTS = [
    { name: "Priya Sharma", desc: "Worker · Cook · Koramangala", phone: "+919876543201", role: "worker" as Role },
    { name: "Ramesh Kumar", desc: "Worker · Driver · Indiranagar", phone: "+919876543202", role: "worker" as Role },
    { name: "Ananya Gupta", desc: "Hirer · Homeowner", phone: "+919876543301", role: "hirer" as Role },
    { name: "HomeServe Bangalore", desc: "Agency · 5 categories", phone: "+919876543401", role: "agency" as Role },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 53px)", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.navy, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            {step === "phone" ? "Sign in to SafeHire" : "Enter OTP"}
          </h1>
          <p style={{ color: C.sub, margin: 0, fontSize: 14, lineHeight: 1.5 }}>
            {step === "phone"
              ? "Your data stays private. Only you control access."
              : <>Code sent to <strong>{phone}</strong></>
            }
          </p>
        </div>

        {/* Demo accounts */}
        {authMode === "dev" && step === "phone" && (
          <div style={{
            background: "#fff", border: `1px solid ${C.border}`, padding: "14px 16px",
            borderRadius: 10, marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Demo accounts — tap to auto-fill
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              {DEMO_ACCOUNTS.map((d) => (
                <button key={d.phone} type="button" onClick={() => { setPhone(d.phone); setRole(d.role); }} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "9px 12px", background: phone === d.phone ? "#FDF6E8" : C.bg,
                  border: phone === d.phone ? `1px solid ${C.amber}44` : "1px solid transparent",
                  borderRadius: 8, cursor: "pointer", width: "100%", textAlign: "left",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{d.desc}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{d.phone.replace("+91", "+91 ")}</div>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
              OTP: <strong style={{ color: C.navy }}>123456</strong>
            </div>
          </div>
        )}

        {/* Main form */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "20px", border: `1px solid ${C.border}` }}>

          {error && (
            <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
              {error}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp}>
              {/* Role selector */}
              {authMode === "dev" && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 8 }}>I am a</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    {([
                      { r: "worker" as Role, label: "Worker", sub: "Get verified" },
                      { r: "hirer" as Role, label: "Hirer", sub: "Find help" },
                      { r: "agency" as Role, label: "Agency", sub: "Manage roster" },
                    ]).map((opt) => (
                      <button key={opt.r} type="button" onClick={() => setRole(opt.r)} style={{
                        padding: "12px 8px",
                        border: role === opt.r ? `2px solid ${C.amber}` : `1px solid ${C.border}`,
                        borderRadius: 10, cursor: "pointer",
                        background: role === opt.r ? "#FDF6E8" : "#fff",
                        textAlign: "center",
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: role === opt.r ? C.navy : C.sub }}>{opt.label}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
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
              <div style={{ marginBottom: 14 }}>
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
                width: "100%", padding: 8, background: "transparent", border: "none",
                fontSize: 13, cursor: "pointer", marginTop: 6, color: C.sub,
              }}>
                Use a different number
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
          Your data is encrypted. You control who sees it.
        </div>
      </div>
    </div>
  );
}
