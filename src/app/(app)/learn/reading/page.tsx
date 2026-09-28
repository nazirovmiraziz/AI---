"use client";

import { useState } from "react";
import { useLangSchool } from "@/lib/lang/use-school";
import { allUnits } from "@/lib/lang/curriculum";
import { EmptyLearn } from "@/components/lang/bits";
import { Button } from "@/components/Button";
import { ExercisePlayer } from "@/components/lang/ExercisePlayer";

export default function ReadingPage() {
  const { ls, lang, meta, track, missHeart, completeLesson } = useLangSchool();
  const [u, setU] = useState(0);
  if (!ls.onboarded || !lang || !track) {
    return <EmptyLearn title="Тексты появятся здесь" text="Сначала выбери язык." href="/learn/start" cta="Начать" />;
  }
  const units = allUnits(lang);
  const unit = units[u];
  const lesson = unit?.lessons.find((l) => l.skill === "read");
  if (!unit || !lesson) {
    return <EmptyLearn title="Пока нет текстов" text="Пройди модуль — появится чтение." href="/learn/map" cta="Карта" />;
  }
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-semibold">Чтение</h1>
      <div className="flex flex-wrap gap-2">
        {units.map((x, i) => (
          <button key={x.id} type="button" className={`chip-btn ${u === i ? "on" : ""}`} onClick={() => setU(i)}>
            {x.title}
          </button>
        ))}
      </div>
      <p className="text-sm text-[var(--muted)]">{unit.level} · нажми слово в тексте, если оно новое.</p>
      <ExercisePlayer
        exercises={lesson.exercises}
        locale={meta?.locale ?? "en-GB"}
        hearts={ls.hearts}
        onHeart={missHeart}
        onFinish={({ correct, total }) => {
          completeLesson(lesson.id, Math.round((correct / Math.max(1, total)) * 100), lesson.minutes);
        }}
      />
    </div>
  );
}
