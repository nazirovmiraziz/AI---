"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { LEARN_LANGUAGES, REASONS, SELF_LEVELS } from "@/lib/lang/catalog";
import { useLangSchool } from "@/lib/lang/use-school";
import { firstName } from "@/lib/cabinet";
import type { LearnLangId, LearnReason, SelfLevel } from "@/lib/lang/types";

const MINUTES = [5, 10, 15, 30, 60];
const DAYS = [
  { n: 7, label: "Каждый день" },
  { n: 5, label: "5 дней в неделю" },
  { n: 3, label: "3 дня в неделю" },
];

export default function OnboardPage() {
  const { user, begin } = useLangSchool();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [languageId, setLanguage] = useState<LearnLangId>("en");
  const [reason, setReason] = useState<LearnReason>("speak");
  const [selfLevel, setLevel] = useState<SelfLevel>("zero");
  const [dailyMinutes, setMin] = useState(15);
  const [daysPerWeek, setDays] = useState(7);
  const who = firstName(user?.name);

  function next() {
    if (step === 3 && selfLevel === "unknown") {
      sessionStorage.setItem(
        "ssai-onboard",
        JSON.stringify({ languageId, reason, dailyMinutes, daysPerWeek }),
      );
      router.push("/learn/placement");
      return;
    }
    if (step < 6) setStep(step + 1);
    else {
      begin({ languageId, reason, selfLevel, dailyMinutes, daysPerWeek });
      router.push("/learn");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
        Шаг {step} из 6 {who ? `· ${who}` : ""}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
        <div className="h-full bg-[#2f6bff] transition-all" style={{ width: `${(step / 6) * 100}%` }} />
      </div>

      {step === 1 && (
        <>
          <h1 className="text-3xl font-semibold">Какой язык хочешь изучать?</h1>
          <p className="text-[var(--muted)]">Язык экрана можно сменить отдельно. Сейчас выбираем, чему учиться.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {LEARN_LANGUAGES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLanguage(l.id)}
                className={`panel-card p-4 text-left transition ${languageId === l.id ? "ring-2 ring-[#2f6bff]" : ""}`}
              >
                <span className="text-2xl">{l.flag}</span>
                <p className="mt-2 font-semibold">{l.name}</p>
                <p className="text-xs text-[var(--muted)]">{l.native}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-3xl font-semibold">Зачем тебе этот язык?</h1>
          <div className="grid gap-2 sm:grid-cols-2">
            {REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReason(r.id)}
                className={`panel-card p-4 text-left ${reason === r.id ? "ring-2 ring-[#2f6bff]" : ""}`}
              >
                {r.icon} {r.label}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="text-3xl font-semibold">Какой у тебя уровень?</h1>
          <div className="space-y-2">
            {SELF_LEVELS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setLevel(s.id)}
                className={`panel-card w-full p-4 text-left ${selfLevel === s.id ? "ring-2 ring-[#2f6bff]" : ""}`}
              >
                <b>{s.label}</b>
                <p className="text-sm text-[var(--muted)]">{s.text}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h1 className="text-3xl font-semibold">Сколько минут в день?</h1>
          <div className="flex flex-wrap gap-2">
            {MINUTES.map((m) => (
              <button key={m} type="button" onClick={() => setMin(m)} className={`chip-btn ${dailyMinutes === m ? "on" : ""}`}>
                {m} мин
              </button>
            ))}
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <h1 className="text-3xl font-semibold">Как часто?</h1>
          <div className="space-y-2">
            {DAYS.map((d) => (
              <button
                key={d.n}
                type="button"
                onClick={() => setDays(d.n)}
                className={`panel-card w-full p-4 text-left ${daysPerWeek === d.n ? "ring-2 ring-[#2f6bff]" : ""}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 6 && (
        <div className="panel-card p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">План готов</p>
          <h1 className="mt-2 text-3xl font-semibold">
            {LEARN_LANGUAGES.find((l) => l.id === languageId)?.flag} {LEARN_LANGUAGES.find((l) => l.id === languageId)?.name}{" "}
            {selfLevel === "zero" ? "A1" : selfLevel === "beginner" ? "A2" : selfLevel === "intermediate" ? "B1" : "B2"}
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            {dailyMinutes} минут · {DAYS.find((d) => d.n === daysPerWeek)?.label.toLowerCase()}
          </p>
          <p className="mt-2">Цель: {REASONS.find((r) => r.id === reason)?.label}.</p>
          <p className="mt-4 text-sm text-[var(--muted)]">Начнём с короткого урока. Репетитор не будет выдавать готовые ответы — будет помогать понять.</p>
        </div>
      )}

      <div className="flex gap-2">
        {step > 1 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)}>
            Назад
          </Button>
        )}
        <Button onClick={next}>{step === 6 ? "Начать обучение" : selfLevel === "unknown" && step === 3 ? "Пройти тест" : "Дальше"}</Button>
      </div>
    </div>
  );
}
