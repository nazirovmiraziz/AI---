"use client";

import { useState } from "react";
import { useLangSchool } from "@/lib/lang/use-school";
import { allUnits } from "@/lib/lang/curriculum";
import { ExercisePlayer } from "@/components/lang/ExercisePlayer";
import { EmptyLearn } from "@/components/lang/bits";

export default function ListenPage() {
  const { ls, lang, meta, track, missHeart, completeLesson } = useLangSchool();
  const [u, setU] = useState(0);
  if (!ls.onboarded || !lang || !track) {
    return <EmptyLearn title="Аудирование появится здесь" text="Сначала выбери язык." href="/learn/start" cta="Начать" />;
  }
  const units = allUnits(lang);
  const unit = units[u];
  const lesson = unit?.lessons.find((l) => l.skill === "listen");
  if (!unit || !lesson) {
    return <EmptyLearn title="Пока нет записей" text="Открой модуль на карте." href="/learn/map" cta="Карта" />;
  }
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-semibold">Аудирование</h1>
      <p className="text-sm text-[var(--muted)]">Озвучка идёт голосом устройства. Это не живой разбор сервером.</p>
      <div className="flex flex-wrap gap-2">
        {units.map((x, i) => (
          <button key={x.id} type="button" className={`chip-btn ${u === i ? "on" : ""}`} onClick={() => setU(i)}>
            {x.title}
          </button>
        ))}
      </div>
      <ExercisePlayer
        exercises={lesson.exercises}
        locale={meta?.locale ?? "en-GB"}
        hearts={ls.hearts}
        onHeart={missHeart}
        onFinish={({ correct, total }) => completeLesson(lesson.id, Math.round((correct / Math.max(1, total)) * 100), lesson.minutes)}
      />
    </div>
  );
}
