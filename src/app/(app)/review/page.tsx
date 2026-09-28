"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { getTopic } from "@/lib/subjects";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";

export default function ReviewHubPage() {
  const { user } = useApp();
  const loc = user?.language ?? "ru";
  const hist = user?.testHistory ?? [];
  const weak = user?.weakTopics ?? [];
  const rows = weak.map((topic) => {
    const recs = hist.filter((h) => h.topic === topic || h.weak.includes(topic));
    const score = recs.reduce((a, r) => a + r.score, 0);
    const total = recs.reduce((a, r) => a + r.total, 0);
    const mistakes = recs.reduce((a, r) => a + Math.max(0, r.total - r.score), 0);
    const acc = total ? Math.round((score / total) * 100) : user?.subjectLevels[getTopic(topic)?.subjectId ?? ""] ?? 0;
    return { topic, mistakes, acc, subject: getTopic(topic)?.subjectId };
  });

  return (
    <div className="max-w-2xl space-y-5 pb-16">
      <header>
        <p className="gold-kicker">Повтор</p>
        <h1 className="mt-2 text-3xl font-semibold">Темы, которые стоит вернуть</h1>
        <p className="mt-2 text-[var(--muted)]">Список из слабых тем и ошибок в тестах. Не витрина.</p>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title="Пока повторять нечего"
          text="Пройди урок или практику — ошибки появятся здесь."
          action="К практике"
          href="/practice"
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.topic} className="panel-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{t(loc, `topic.${r.topic}`)}</h2>
                  <p className="text-sm text-[var(--muted)]">
                    {r.mistakes > 0 ? `${r.mistakes} ошибок в проверках` : "Тема отмечена как слабая"}
                    {r.subject ? ` · ${t(loc, `subject.${r.subject}`)}` : ""}
                  </p>
                </div>
                <span className="text-sm text-[var(--muted)]">{r.acc}%</span>
              </div>
              <ProgressBar value={r.acc} />
              <p className="text-sm text-[var(--muted)]">
                {r.acc < 60
                  ? "Часто путаешь первый шаг. Сначала разбор, потом ещё одна попытка."
                  : "Тема почти держится. Короткое закрепление."}
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link href={`/practice?topic=${r.topic}`} className="chip-btn">Практика</Link>
                <Link href={`/lesson/${r.topic}`} className="chip-btn">Объяснение</Link>
                <Link href={`/tutor?topic=${r.topic}`} className="chip-btn">Спросить ИИ</Link>
                <Link href="/learn/review" className="chip-btn">Слова</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
