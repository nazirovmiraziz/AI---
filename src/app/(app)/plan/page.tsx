"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { StudyPlan } from "@/lib/types";
import { PLAN_CYCLE } from "@/lib/learning";

const TITLE_TOPICS: Record<string, string> = {
  "линейные уравнения": "linear-eq",
  "системы уравнений": "systems",
  "квадратные уравнения": "quadratic",
  дискриминант: "discriminant",
  "функции и графики": "functions",
  функции: "functions",
  проценты: "percentages",
  тригонометрия: "trigonometry",
  геометрия: "pythagoras",
};

function resolveTopic(topicId?: string, title?: string) {
  if (topicId) return topicId;
  if (!title) return undefined;
  return TITLE_TOPICS[title.toLowerCase()];
}

export default function PlanPage() {
  const { user, studyPlan, setPlan, togglePlanDay } = useApp();
  const loc = user?.language ?? "ru";
  const [goal, setGoal] = useState(studyPlan?.goal || "Подготовиться к экзамену по математике за 30 дней.");
  const [goalErr, setGoalErr] = useState("");
  const [confirmRebuild, setConfirmRebuild] = useState(false);

  function make() {
    const text = goal.trim();
    if (text.length < 8) {
      setGoalErr("Опишите цель: предмет и срок.");
      return;
    }
    setGoalErr("");
    const days = Array.from({ length: 30 }, (_, i) => {
      const item = i === 29 ? { title: "Пробный экзамен", topicId: undefined } : PLAN_CYCLE[i % PLAN_CYCLE.length];
      return { day: i + 1, title: item.title, topicId: item.topicId, done: false, minutes: 30 };
    });
    const plan: StudyPlan = { id: `p-${Date.now()}`, goal: text, days, createdAt: new Date().toISOString() };
    setPlan(plan);
    setConfirmRebuild(false);
  }

  if (!studyPlan) {
    return (
      <div className="max-w-xl space-y-5 pb-16">
        <h1 className="font-serif text-4xl">{t(loc, "plan.title")}</h1>
        <p className="text-sm text-[var(--muted)]">
          План собирается из школьных тем на 30 дней. Каждый день открывает урок или экзамен.
        </p>
        <label className="block text-sm font-medium">
          Цель
          <textarea
            className="mt-2 w-full rounded-2xl border border-[var(--line)] p-4 bg-white dark:bg-[var(--bg-elev)] min-h-24"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </label>
        {goalErr && <p className="text-sm text-red-600">{goalErr}</p>}
        <Button onClick={make}>{t(loc, "plan.make")}</Button>
        <EmptyState title="Плана ещё нет" text="Нажмите «собрать план», чтобы появился календарь занятий." />
      </div>
    );
  }

  const done = studyPlan.days.filter((d) => d.done).length;

  return (
    <div className="space-y-6 pb-16">
      <h1 className="font-serif text-4xl">{t(loc, "plan.title")}</h1>
      <p className="text-sm text-[var(--muted)]">{studyPlan.goal}</p>
      <textarea
        className="w-full rounded-2xl border border-[var(--line)] p-4 bg-white dark:bg-[var(--bg-elev)] min-h-24"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        aria-label="Новая цель плана"
      />
      {goalErr && <p className="text-sm text-red-600">{goalErr}</p>}
      <Button variant="secondary" onClick={() => setConfirmRebuild(true)}>
        Пересобрать план
      </Button>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>
            {done} / {studyPlan.days.length}
          </span>
          <span>{Math.round((done / studyPlan.days.length) * 100)}%</span>
        </div>
        <ProgressBar value={(done / studyPlan.days.length) * 100} />
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        {studyPlan.days.map((d) => (
          <div
            key={d.day}
            className={`rounded-2xl border px-4 py-3 ${d.done ? "border-brand-500 bg-brand-50 dark:bg-brand-950" : "border-[var(--line)] bg-white dark:bg-ink-900"}`}
          >
            <button type="button" onClick={() => togglePlanDay(d.day)} className="text-start w-full min-h-11">
              <div className="text-xs text-ink-400">
                День {d.day} · {d.minutes} {t(loc, "minutes")}
                {d.done ? " · готово" : ""}
              </div>
              <div className="font-medium">{d.title}</div>
            </button>
            <div className="mt-2 flex gap-3 text-sm">
              {resolveTopic(d.topicId, d.title) ? (
                <>
                  <Link className="text-brand-700" href={`/lesson/${resolveTopic(d.topicId, d.title)}`}>
                    Урок
                  </Link>
                  <Link className="text-brand-700" href={`/tests?topic=${resolveTopic(d.topicId, d.title)}`}>
                    Практика
                  </Link>
                </>
              ) : (
                <Link className="text-brand-700" href="/exam">
                  Экзамен
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={confirmRebuild}
        title="Пересобрать план?"
        text="Отметки за 30 дней сбросятся. Цель сохранится из поля выше."
        confirmLabel="Пересобрать"
        danger
        onClose={() => setConfirmRebuild(false)}
        onConfirm={make}
      />
    </div>
  );
}
