"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page is at the root (/) in the dashboard group.
// Root page.tsx takes precedence, so this won't normally render.
// Redirect to /dashboard as a safety net.
export default function DashboardGroupRootPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard"); }, [router]);
  return null;
}
