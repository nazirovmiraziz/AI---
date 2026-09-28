"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";

export default function HistoryPage() {
  const { user, conversations } = useApp();
  const loc = user?.language ?? "ru";
  const tests = user?.testHistory ?? [];

  return (
    <div className="space-y-6 pb-16">
      <PageHeader title={t(loc, "nav.history")} text="Все диалоги и проверки знаний в одном месте." />
      <section>
        <h2 className="font-medium mb-3">Диалоги</h2>
        {conversations.length === 0 ? (
          <EmptyState title="История занятий пустая" text="Здесь появится история, как только начнёте диалог." action="Начать занятие" href="/tutor" />
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <Link key={c.id} href={`/tutor?c=${c.id}`} className="block rounded-2xl border border-[var(--line)] bg-white dark:bg-[var(--bg-elev)] px-4 py-3 hover:border-brand-300">
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-[var(--muted)]">{new Date(c.updatedAt).toLocaleString()}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="font-medium mb-3">Проверки знаний</h2>
        {tests.length === 0 ? (
          <EmptyState title="Тестов ещё не было" text="Сначала разберите тему, затем пройдите практику." action="К практике" href="/tests" />
        ) : (
          <div className="space-y-2">
            {tests.map((h) => (
              <div key={h.id} className="rounded-2xl border border-[var(--line)] bg-white dark:bg-[var(--bg-elev)] px-4 py-3">
                <div className="flex justify-between">
                  <span>{h.title}</span>
                  <span>
                    {h.score}/{h.total}
                  </span>
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">{new Date(h.date).toLocaleString()}</div>
                <Link className="text-sm text-brand-700 mt-1 inline-block" href={`/tests?topic=${h.topic}`}>
                  Пройти ещё раз
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
