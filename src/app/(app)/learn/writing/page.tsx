"use client";

import { useState } from "react";
import { useLangSchool } from "@/lib/lang/use-school";
import { allUnits } from "@/lib/lang/curriculum";
import { writingFeedback } from "@/lib/lang/ai-service";
import { EmptyLearn, SkillMeter } from "@/components/lang/bits";
import { Button } from "@/components/Button";

export default function WritingPage() {
  const { ls, lang, track, completeLesson } = useLangSchool();
  const [u, setU] = useState(0);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState("");
  const [fb, setFb] = useState<ReturnType<typeof writingFeedback> | null>(null);
  if (!ls.onboarded || !lang || !track) {
    return <EmptyLearn title="Письмо появится здесь" text="Сначала выбери язык." href="/learn/start" cta="Начать" />;
  }
  const units = allUnits(lang);
  const unit = units[u];
  const lesson = unit?.lessons.find((l) => l.skill === "write");
  if (!unit || !lesson) {
    return <EmptyLearn title="Пока нет заданий" text="Открой модуль на карте." href="/learn/map" cta="Карта" />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-semibold">Письмо</h1>
      <div className="flex flex-wrap gap-2">
        {units.map((x, i) => (
          <button key={x.id} type="button" className={`chip-btn ${u === i ? "on" : ""}`} onClick={() => { setU(i); setFb(null); setText(""); setSaved(""); }}>
            {x.title}
          </button>
        ))}
      </div>
      <p className="panel-card p-4">{unit.writing}</p>
      <textarea className="auth-field min-h-40" value={text} onChange={(e) => setText(e.target.value)} placeholder="Пиши своими словами. Мы сохраним твой текст." />
      <Button
        onClick={() => {
          setSaved(text);
          const r = writingFeedback(text, unit.writing);
          setFb(r);
          completeLesson(lesson.id, Math.round((r.scores.grammar + r.scores.structure) / 2), lesson.minutes);
        }}
      >
        Проверить
      </Button>
      {fb && (
        <div className="space-y-3">
          <div className="panel-card p-4 text-sm">
            <p className="text-xs uppercase text-[var(--muted)]">Твой оригинал</p>
            <p className="mt-1">{saved}</p>
          </div>
          <div className="panel-card p-4 text-sm">
            <p className="text-xs uppercase text-[var(--muted)]">Исправленный и более ровный</p>
            <p className="mt-1">{fb.corrected}</p>
            <p className="mt-2 text-[var(--muted)]">{fb.explain}</p>
          </div>
          <div className="panel-card space-y-2 p-4">
            <SkillMeter label="Грамматика" value={fb.scores.grammar} />
            <SkillMeter label="Слова" value={fb.scores.vocabulary} />
            <SkillMeter label="Структура" value={fb.scores.structure} />
            <SkillMeter label="Орфография" value={fb.scores.spelling} />
          </div>
        </div>
      )}
    </div>
  );
}
