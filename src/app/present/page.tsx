"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export default function PresentPage() {
  const { loginDemo, hydrated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    loginDemo();
    router.replace("/tutor?tour=1");
  }, [hydrated, loginDemo, router]);

  return (
    <div className="min-h-screen grid place-items-center">
      <p className="text-[var(--muted)]">Открываем демо-занятие для учителя…</p>
    </div>
  );
}
