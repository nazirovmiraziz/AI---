"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { Flashcard } from "@/lib/types";

function nextInterval(card: Flashcard, grade: number): Flashcard {
  let ease = card.ease + (grade === 3 ? 0.15 : grade === 2 ? 0 : grade === 1 ? -0.15 : -0.3);
  ease = Math.max(1.3, ease);
  let interval = grade === 0 ? 0.2 : grade === 1 ? 1 : card.interval * ease;
  if (grade >= 2 && card.reps === 0) interval = 1;
  const due = new Date(Date.now() + interval * 86400000).toISOString();
  return { ...card, ease, interval, due, reps: card.reps + 1 };
}

export default function FlashcardsPage() {
  const { user, flashcards, updateFlash } = useApp();
  const loc = user?.language ?? "ru";
  const due = useMemo(
    () => flashcards.filter((c) => new Date(c.due) <= new Date()).sort((a, b) => +new Date(a.due) - +new Date(b.due)),
    [flashcards]
  );
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const card = due[i];

  function rate(g: number) {
    if (!card) return;
    const next = flashcards.map((c) => (c.id === card.id ? nextInterval(c, g) : c));
    updateFlash(next);
    setShow(false);
    setI((n) => (n + 1 >= due.length ? 0 : n + 1));
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-serif text-4xl">{t(loc, "nav.flash")}</h1>
      <p className="text-ink-500">Интервальное повторение: слабые карточки возвращаются раньше.</p>
      {!card ? (
        <p>На сегодня карточек нет — можно открыть урок, чтобы AI создал новые.</p>
      ) : (
        <div className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-8 min-h-56">
          <div className="text-xs text-ink-400">{t(loc, `topic.${card.topic}`)}</div>
          <p className="text-2xl mt-3">{card.front}</p>
          {show && <p className="mt-6 text-ink-700 dark:text-ink-200 leading-relaxed">{card.back}</p>}
          <div className="mt-8 flex flex-wrap gap-2">
            {!show ? (
              <Button onClick={() => setShow(true)}>{t(loc, "flash.show")}</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => rate(0)}>
                  {t(loc, "flash.again")}
                </Button>
                <Button variant="secondary" onClick={() => rate(1)}>
                  {t(loc, "flash.hard")}
                </Button>
                <Button onClick={() => rate(2)}>{t(loc, "flash.good")}</Button>
                <Button variant="ghost" onClick={() => rate(3)}>
                  {t(loc, "flash.easy")}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
