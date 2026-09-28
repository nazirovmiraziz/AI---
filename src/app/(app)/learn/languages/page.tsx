"use client";

import { useLangSchool } from "@/lib/lang/use-school";
import { LEARN_LANGUAGES } from "@/lib/lang/catalog";
import { allUnits } from "@/lib/lang/curriculum";
import { Button } from "@/components/Button";
import { EmptyLearn } from "@/components/lang/bits";

export default function LanguagesPage() {
  const { ls, lang, switchLang, track } = useLangSchool();
  const ids = Object.keys(ls.tracks) as (keyof typeof ls.tracks)[];
  if (!ls.onboarded) {
    return <EmptyLearn title="Выбери язык, чтобы начать" text="Можно учиться нескольким языкам по очереди." href="/learn/start" cta="Выбрать язык" />;
  }
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Мои языки</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {ids.map((id) => {
          const meta = LEARN_LANGUAGES.find((l) => l.id === id);
          const t = ls.tracks[id];
          if (!meta || !t) return null;
          const units = allUnits(id);
          const pct = Math.round((t.completedLessons.length / Math.max(1, units.flatMap((u) => u.lessons).length)) * 100);
          return (
            <button
              key={id}
              type="button"
              onClick={() => switchLang(id)}
              className={`panel-card p-5 text-left ${lang === id ? "ring-2 ring-[#2f6bff]" : ""}`}
            >
              <p className="text-2xl">{meta.flag}</p>
              <p className="mt-2 font-semibold">{meta.name}</p>
              <p className="text-sm text-[var(--muted)]">
                {t.cefr} · {pct}%
              </p>
            </button>
          );
        })}
      </div>
      <Button href="/learn/start">+ Добавить язык</Button>
      {track && <p className="text-sm text-[var(--muted)]">Сейчас активен путь {track.cefr}. Карта и уроки переключаются вместе с языком.</p>}
    </div>
  );
}
