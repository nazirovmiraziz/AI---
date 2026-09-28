"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function FlashcardsInner() {
  const router = useRouter();
  const q = useSearchParams();
  useEffect(() => {
    const topic = q.get("topic");
    router.replace(topic ? `/learn/flash?topic=${encodeURIComponent(topic)}` : "/learn/flash");
  }, [router, q]);
  return <div className="panel-card h-24 animate-pulse" />;
}

export default function FlashcardsRedirect() {
  return (
    <Suspense fallback={<div className="panel-card h-24 animate-pulse" />}>
      <FlashcardsInner />
    </Suspense>
  );
}
