"use client";

import { useMemo, useState } from "react";
import { useLangSchool } from "@/lib/lang/use-school";
import { allUnits } from "@/lib/lang/curriculum";
import { speakText } from "@/lib/lang/speech";
import { EmptyLearn } from "@/components/lang/bits";
import { Button } from "@/components/Button";
import type { SrsRating } from "@/lib/lang/types";

export default function FlashPage() {
  const { ls, lang, meta, track, rateWord } = useLangSchool();
  const words = useMemo(() => (lang ? allUnits(lang).flatMap((u) => u.vocab) : []), [lang]);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [star, setStar] = useState<string[]>([]);
  const w = words[i];

  if (!ls.onboarded || !track) {
    return <EmptyLearn title="Карточки появятся здесь" text="Сначала выбери язык." href="/learn/start" cta="Начать" />;
  }
  if (!w) {
    return <EmptyLearn title="Нет слов" text="Пройди урок — слова появятся на карточках." href="/learn/map" cta="К урокам" />;
  }

  function rate(r: SrsRating) {
    rateWord(w.id, r);
    setFlip(false);
    setI((i + 1) % words.length);
  }

  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <h1 className="text-3xl font-semibold">Карточки</h1>
      <p className="text-sm text-[var(--muted)]">
        {i + 1}/{words.length}
      </p>
      <button type="button" className="panel-card w-full p-10" onClick={() => setFlip((v) => !v)}>
        <p className="text-3xl font-semibold">{flip ? w.translation : w.word}</p>
        {flip && <p className="mt-4 text-sm italic">«{w.example}»</p>}
        <p className="mt-6 text-xs text-[var(--muted)]">Нажми, чтобы перевернуть</p>
      </button>
      <div className="flex justify-center gap-2">
        <Button variant="secondary" onClick={() => speakText(w.word, meta?.locale ?? "en-GB")}>
          🔊
        </Button>
        <Button variant="secondary" onClick={() => setStar(star.includes(w.id) ? star.filter((x) => x !== w.id) : [...star, w.id])}>
          {star.includes(w.id) ? "★" : "☆"}
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Button variant="secondary" onClick={() => rate("again")}>Again</Button>
        <Button variant="secondary" onClick={() => rate("hard")}>Hard</Button>
        <Button variant="secondary" onClick={() => rate("good")}>Good</Button>
        <Button onClick={() => rate("easy")}>Easy</Button>
      </div>
    </div>
  );
}
