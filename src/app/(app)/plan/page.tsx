"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { StudyPlan } from "@/lib/types";
import { demoPlan } from "@/lib/demo-data";

export default function PlanPage() {
  const { user, studyPlan, setPlan, togglePlanDay } = useApp();
  const loc = user?.language ?? "ru";
  const [goal, setGoal] = useState("Хочу подготовиться к экзамену по математике за 30 дней.");

  function make() {
    const days = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      title:
        i === 29
          ? "Пробный экзамен"
          : ["Линейные уравнения", "Системы уравнений", "Квадратные уравнения", "Дискриминант", "Функции"][i % 5],
      done: false,
      minutes: 30,
    }));
    const plan: StudyPlan = { id: `p-${Date.now()}`, goal, days, createdAt: new Date().toISOString() };
    setPlan(plan);
  }

  const plan = studyPlan ?? demoPlan;
  const done = plan.days.filter((d) => d.done).length;

  return (
    <div className="space-y-6 pb-16">
      <h1 className="font-serif text-4xl">🎯 {t(loc, "plan.title")}</h1>
      <textarea className="w-full rounded-2xl border border-[var(--line)] p-4 bg-white dark:bg-ink-900 min-h-24" value={goal} onChange={(e) => setGoal(e.target.value)} />
      <Button onClick={make}>{t(loc, "plan.make")}</Button>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>{done} / {plan.days.length}</span>
          <span>{Math.round((done / plan.days.length) * 100)}%</span>
        </div>
        <ProgressBar value={(done / plan.days.length) * 100} />
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        {plan.days.map((d) => (
          <button
            key={d.day}
            onClick={() => togglePlanDay(d.day)}
            className={`text-start rounded-2xl border px-4 py-3 ${d.done ? "border-brand-500 bg-brand-50 dark:bg-brand-950" : "border-[var(--line)] bg-white dark:bg-ink-900"}`}
          >
            <div className="text-xs text-ink-400">День {d.day} · {d.minutes} {t(loc, "minutes")}</div>
            <div className="font-medium">{d.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
