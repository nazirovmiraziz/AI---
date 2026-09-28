"use client";

import { useMemo, useState } from "react";
import { useLangSchool } from "@/lib/lang/use-school";
import { allUnits } from "@/lib/lang/curriculum";
import { EmptyLearn } from "@/components/lang/bits";
import { Button } from "@/components/Button";
import { speakText } from "@/lib/lang/speech";
import type { SrsRating } from "@/lib/lang/types";

export default function ReviewPage() {
  const { ls, lang, meta, track, due, rateWord } = useLangSchool();
  const words = useMemo(() => {
    if (!lang || !track) return [];
    const all = allUnits(lang).flatMap((u) => u.vocab);
    const dueSet = new Set(due);
    const listed = all.filter((w) => dueSet.has(w.id));
    return listed.length ? listed : all.slice(0, 10);
  }, [lang, track, due]);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const w = words[i];

  if (!ls.onboarded || !track) {
    return <EmptyLearn title="Повтор появится здесь" text="Слова для повторения копятся после уроков." href="/learn/start" cta="Начать" />;
  }
  if (!w) {
    return <EmptyLearn title="Сегодня повторять нечего" text="Пройди урок — слова вернутся по расписанию." href="/learn" cta="На главную" />;
  }

  function rate(r: SrsRating) {
    rateWord(w.id, r);
    setShow(false);
    if (i + 1 >= words.length) setI(0);
    else setI(i + 1);
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-3xl font-semibold">Повтор на сегодня</h1>
      <p className="text-[var(--muted)]">{words.length} слов</p>
      <div className="panel-card p-6 text-center">
        <p className="text-3xl font-semibold">{w.word}</p>
        <button type="button" className="chip-btn mt-3" onClick={() => speakText(w.word, meta?.locale ?? "en-GB")}>
          🔊
        </button>
        {show && (
          <div className="mt-4">
            <p className="text-lg">{w.translation}</p>
            <p className="mt-2 text-sm italic">«{w.example}»</p>
          </div>
        )}
        {!show && (
          <Button className="mt-6" onClick={() => setShow(true)}>
            Показать ответ
          </Button>
        )}
      </div>
      {show && (
        <div className="grid grid-cols-4 gap-2">
          <Button variant="secondary" onClick={() => rate("again")}>Again</Button>
          <Button variant="secondary" onClick={() => rate("hard")}>Hard</Button>
          <Button variant="secondary" onClick={() => rate("good")}>Good</Button>
          <Button onClick={() => rate("easy")}>Easy</Button>
        </div>
      )}
    </div>
  );
}
