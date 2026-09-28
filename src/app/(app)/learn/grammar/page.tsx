"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLangSchool } from "@/lib/lang/use-school";
import { allUnits, findUnit } from "@/lib/lang/curriculum";
import { EmptyLearn } from "@/components/lang/bits";
import { isLessonOpen } from "@/lib/lang/progress";

export default function GrammarPage() {
  const { ls, lang, track } = useLangSchool();
  const unitId = useSearchParams().get("unit");
  if (!ls.onboarded || !lang || !track) {
    return <EmptyLearn title="Грамматика появится здесь" text="Сначала выбери язык." href="/learn/start" cta="Начать" />;
  }
  const units = unitId ? [findUnit(lang, unitId)].filter(Boolean) : allUnits(lang);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Грамматика</h1>
      {units.map((u) => {
        if (!u) return null;
        const g = u.grammar;
        const lesson = u.lessons.find((l) => l.skill === "grammar");
        const open = lesson ? isLessonOpen(track, lesson.id) : false;
        return (
          <article key={u.id} className="panel-card p-5">
            <p className="text-xs text-[var(--muted)]">
              {u.level} · {u.title}
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {g.title} — {g.titleRu}
            </h2>
            <p className="mt-2 font-mono text-sm">{g.formula}</p>
            <p className="mt-3 text-sm leading-relaxed">{g.text}</p>
            <ul className="mt-3 list-disc space-y-1 ps-5 text-sm">
              {g.examples.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs uppercase tracking-wide text-[var(--muted)]">Частые ошибки</p>
            <ul className="mt-1 list-disc space-y-1 ps-5 text-sm">
              {g.mistakes.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            {open && lesson ? (
              <Link href={`/learn/lesson/${lesson.id}`} className="mt-4 inline-block text-sm text-[#2f6bff]">
                Практика →
              </Link>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">🔒 Сначала открой этот модуль на карте.</p>
            )}
          </article>
        );
      })}
    </div>
  );
}
