"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Auth modes:
 * - "supabase": Real Supabase Auth (phone OTP via SMS provider)
 * - "dev": HMAC-signed dev tokens (accepts OTP "123456", no real SMS)
 *
 * The mode is determined by whether Supabase Auth phone OTP is configured.
 * In dev mode, auth goes through the tRPC auth router.
 * In supabase mode, auth goes directly through the Supabase client.
 */

interface AuthUser {
  id: string;
  phone: string | null;
  role: "worker" | "hirer" | "admin";
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  authMode: "supabase" | "dev";
  /** Get the current access token for API calls */
  getToken: () => string | null;
  /** Set session from dev auth (tRPC verifyOtp response) */
  setDevSession: (session: { userId: string; role: string; token: string }) => void;
  /** Sign out */
  signOut: () => void;
  /** Supabase client (for direct Supabase Auth calls when in supabase mode) */
  supabase: SupabaseClient | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function createSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

/**
 * Auth provider — dual mode (Supabase Auth primary, dev auth fallback).
 *
 * In Supabase Auth mode:
 * - Uses supabase.auth.onAuthStateChange to track session
 * - Token comes from Supabase Auth session
 * - User role is stored in user_metadata or looked up from users table
 *
 * In dev auth mode:
 * - Token is stored in localStorage as "verifyme-token"
 * - Role is stored in localStorage as "verifyme-role"
 * - Session is managed manually through tRPC auth router
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState<SupabaseClient | null>(() => createSupabaseClient());

  // Determine auth mode: if we have a supabase client, try supabase auth first
  const authMode: "supabase" | "dev" = supabase ? "supabase" : "dev";

  // Initialize from existing session
  useEffect(() => {
    if (supabase) {
      // Try Supabase Auth session first
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUserFromSupabase(session.user);
        } else {
          // Fall back to dev token
          loadDevSession();
        }
        setLoading(false);
      });

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUserFromSupabase(session.user);
        } else if (!hasDevSession()) {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      loadDevSession();
      setLoading(false);
    }
  }, [supabase]);

  function setUserFromSupabase(supabaseUser: SupabaseUser) {
    setUser({
      id: supabaseUser.id,
      phone: supabaseUser.phone ?? null,
      role: (supabaseUser.user_metadata?.role as "worker" | "hirer" | "admin") ?? "worker",
    });
  }

  function hasDevSession(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("verifyme-token");
  }

  function loadDevSession() {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("verifyme-token");
    const role = localStorage.getItem("verifyme-role");
    const userId = localStorage.getItem("verifyme-userId");
    if (token && role && userId) {
      setUser({
        id: userId,
        phone: null,
        role: role as "worker" | "hirer" | "admin",
      });
    }
  }

  const getToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    // Dev token from localStorage
    return localStorage.getItem("verifyme-token");
  }, []);

  const setDevSession = useCallback((session: { userId: string; role: string; token: string }) => {
    localStorage.setItem("verifyme-token", session.token);
    localStorage.setItem("verifyme-role", session.role);
    localStorage.setItem("verifyme-userId", session.userId);
    setUser({
      id: session.userId,
      phone: null,
      role: session.role as "worker" | "hirer" | "admin",
    });
  }, []);

  const signOut = useCallback(() => {
    // Clear dev session
    localStorage.removeItem("verifyme-token");
    localStorage.removeItem("verifyme-role");
    localStorage.removeItem("verifyme-userId");

    // Sign out of Supabase Auth if active
    if (supabase) {
      supabase.auth.signOut();
    }

    setUser(null);
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading, authMode, getToken, setDevSession, signOut, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state. Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
