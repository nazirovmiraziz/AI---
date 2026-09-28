"use client";

import { useMemo, useState } from "react";
import { useLangSchool } from "@/lib/lang/use-school";
import { allUnits } from "@/lib/lang/curriculum";
import { ExercisePlayer } from "@/components/lang/ExercisePlayer";
import { EmptyLearn } from "@/components/lang/bits";
import { Button } from "@/components/Button";
import type { Exercise } from "@/lib/lang/types";

export default function ChallengePage() {
  const { ls, lang, meta, track, missHeart, markChallenge } = useLangSchool();
  const [done, setDone] = useState(false);
  const exercises = useMemo(() => {
    if (!lang || !track) return [];
    const unit = allUnits(lang).find((u) => u.lessons.some((l) => track.unlockedLessons.includes(l.id))) ?? allUnits(lang)[0];
    return (unit?.lessons[0]?.exercises.filter((e) => e.type === "choice").slice(0, 5) ?? []) as Exercise[];
  }, [lang, track]);

  if (!ls.onboarded || !track || !lang) {
    return <EmptyLearn title="Задание дня появится здесь" text="Сначала выбери язык." href="/learn/start" cta="Начать" />;
  }
  if (track.daily.challengeDone || done) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <p className="text-5xl">🎉</p>
        <h1 className="text-3xl font-semibold">Задание дня готово</h1>
        <p className="text-[var(--muted)]">+50 XP. Завтра будет новое.</p>
        <Button onClick={() => (window.location.href = "/learn")}>На главную</Button>
      </div>
    );
  }
  if (!exercises.length) {
    return <EmptyLearn title="Пока нет вопросов" text="Открой первый урок." href="/learn/map" cta="Карта" />;
  }
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-semibold">Задание дня</h1>
      <p className="text-[var(--muted)]">5 коротких вопросов · +50 XP</p>
      <ExercisePlayer
        exercises={exercises}
        locale={meta?.locale ?? "en-GB"}
        hearts={ls.hearts}
        onHeart={missHeart}
        onFinish={() => {
          markChallenge(false);
          setDone(true);
        }}
      />
    </div>
  );
}
