"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLangSchool } from "@/lib/lang/use-school";
import { allUnits, findUnit } from "@/lib/lang/curriculum";
import { speakText } from "@/lib/lang/speech";
import { EmptyLearn } from "@/components/lang/bits";
import { Button } from "@/components/Button";
import Link from "next/link";

export default function VocabPage() {
  const { ls, lang, meta, track, rateWord } = useLangSchool();
  const sp = useSearchParams();
  const unitId = sp.get("unit");
  const [box, setBox] = useState<"all" | "learning" | "known" | "review">("all");

  const words = useMemo(() => {
    if (!lang) return [];
    const units = unitId ? [findUnit(lang, unitId)].filter(Boolean) : allUnits(lang);
    return units.flatMap((u) => u!.vocab);
  }, [lang, unitId]);

  if (!ls.onboarded || !track || !lang) {
    return <EmptyLearn title="Слова появятся здесь" text="Выбери язык и пройди первый урок." href="/learn/start" cta="Выбрать язык" />;
  }
  if (!words.length) {
    return <EmptyLearn title="Пока пусто" text="Здесь появятся слова для повторения." href="/learn/map" cta="К урокам" />;
  }

  const filtered = words.filter((w) => {
    if (box === "all") return true;
    return (track.vocab[w.id]?.box ?? "new") === box;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold">Словарь</h1>
        <p className="mt-1 text-[var(--muted)]">{meta?.name} · {words.length} слов в курсе</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["all", "learning", "known", "review"] as const).map((b) => (
          <button key={b} type="button" className={`chip-btn ${box === b ? "on" : ""}`} onClick={() => setBox(b)}>
            {b === "all" ? "Все" : b === "learning" ? "Учу" : b === "known" ? "Знаю" : "Повтор"}
          </button>
        ))}
        <Link href="/learn/review" className="chip-btn">
          Сегодняшний повтор
        </Link>
        <Link href="/learn/flash" className="chip-btn">
          Карточки
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((w) => {
          const st = track.vocab[w.id];
          return (
            <article key={w.id} className="panel-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold">{w.word}</p>
                  <p className="text-[var(--muted)]">{w.translation}</p>
                </div>
                <button type="button" className="chip-btn" onClick={() => speakText(w.word, meta?.locale ?? "en-GB")} aria-label="Слушать">
                  🔊
                </button>
              </div>
              <p className="mt-2 text-sm italic">«{w.example}»</p>
              <p className="mt-2 text-xs text-[var(--muted)]">{st?.box === "known" ? "Знаю" : st ? "Учу" : "Новое"}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                <button type="button" className="chip-btn" onClick={() => rateWord(w.id, "again")}>Again</button>
                <button type="button" className="chip-btn" onClick={() => rateWord(w.id, "hard")}>Hard</button>
                <button type="button" className="chip-btn" onClick={() => rateWord(w.id, "good")}>Good</button>
                <button type="button" className="chip-btn" onClick={() => rateWord(w.id, "easy")}>Easy</button>
              </div>
            </article>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="text-sm text-[var(--muted)]">В этой папке пока пусто.</p>}
    </div>
  );
}
