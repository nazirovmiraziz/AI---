"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";

export default function HistoryPage() {
  const { user, conversations } = useApp();
  const loc = user?.language ?? "ru";
  return (
    <div className="space-y-6 pb-16">
      <h1 className="font-serif text-4xl">{t(loc, "nav.history")}</h1>
      <section>
        <h2 className="font-medium mb-3">Диалоги</h2>
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link key={c.id} href={`/tutor?c=${c.id}`} className="block rounded-2xl border border-[var(--line)] bg-white dark:bg-ink-900 px-4 py-3">
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-ink-400">{new Date(c.updatedAt).toLocaleString()}</div>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-medium mb-3">Проверки знаний</h2>
        <div className="space-y-2">
          {(user?.testHistory ?? []).map((h) => (
            <div key={h.id} className="rounded-2xl border border-[var(--line)] bg-white dark:bg-ink-900 px-4 py-3">
              <div className="flex justify-between">
                <span>{h.title}</span>
                <span>
                  {h.score}/{h.total}
                </span>
              </div>
              <div className="text-xs text-ink-400 mt-1">{new Date(h.date).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
