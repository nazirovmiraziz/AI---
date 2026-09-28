import { Suspense } from "react";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="panel-card h-32 animate-pulse" />}>{children}</Suspense>;
}
