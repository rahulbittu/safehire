import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <div style={{ maxWidth: 700, padding: 24 }}>{children}</div>;
}
