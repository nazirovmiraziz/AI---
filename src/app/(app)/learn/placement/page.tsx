"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { PLACEMENT, scorePlacement } from "@/lib/lang/placement";
import { speakText } from "@/lib/lang/speech";
import { useLangSchool } from "@/lib/lang/use-school";
import type { LearnLangId, LearnReason } from "@/lib/lang/types";

export default function PlacementPage() {
  const { begin } = useLangSchool();
  const router = useRouter();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const q = PLACEMENT[i];
  const result = done ? scorePlacement(answers) : null;

  function pick(opt: string) {
    if (!q) return;
    const next = { ...answers, [q.id]: opt };
    setAnswers(next);
    if (i + 1 >= PLACEMENT.length) {
      setDone(true);
    } else setI(i + 1);
  }

  function start() {
    if (!result) return;
    let languageId: LearnLangId = "en";
    let reason: LearnReason = "speak";
    let dailyMinutes = 15;
    let daysPerWeek = 7;
    try {
      const raw = JSON.parse(sessionStorage.getItem("ssai-onboard") || "{}");
      if (raw.languageId) languageId = raw.languageId;
      if (raw.reason) reason = raw.reason;
      if (raw.dailyMinutes) dailyMinutes = raw.dailyMinutes;
      if (raw.daysPerWeek) daysPerWeek = raw.daysPerWeek;
    } catch {
      /* ignore */
    }
    begin({ languageId, reason, selfLevel: "unknown", dailyMinutes, daysPerWeek, cefr: result.level, placement: result });
    router.push("/learn");
  }

  if (result) {
    const labels: Record<string, string> = {
      vocabulary: "Слова",
      grammar: "Грамматика",
      reading: "Чтение",
      listening: "Слух",
      sentence: "Предложения",
    };
    return (
      <div className="mx-auto max-w-lg space-y-5">
        <h1 className="text-3xl font-semibold">Ориентировочный уровень: {result.level}</h1>
        <p className="text-[var(--muted)]">Это не экзамен. Так мы понимаем, с какого модуля не скучно и не страшно.</p>
        <div className="panel-card space-y-3 p-5">
          {Object.entries(result.skills).map(([k, v]) => (
            <div key={k}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{labels[k] ?? k}</span>
                <span>{v}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--line)]">
                <div className="h-full rounded-full bg-[#2f6bff]" style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p>
          Слабее всего: <b>{labels[result.weak] ?? result.weak}</b>. Начнём отсюда аккуратно.
        </p>
        <Button onClick={start}>Начать обучение с {result.level}</Button>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        Определение уровня · {i + 1}/{PLACEMENT.length}
      </p>
      <div className="h-1.5 rounded-full bg-[var(--line)]">
        <div className="h-full rounded-full bg-[#2f6bff]" style={{ width: `${(i / PLACEMENT.length) * 100}%` }} />
      </div>
      <h1 className="text-2xl font-semibold">{q.prompt}</h1>
      {q.audio && (
        <Button variant="secondary" onClick={() => speakText(q.audio!, "en-GB")}>
          ▶ Слушать
        </Button>
      )}
      <div className="grid gap-2">
        {q.options.map((o) => (
          <button key={o} type="button" className="ex-opt" onClick={() => pick(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
