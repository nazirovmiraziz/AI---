"use client";

import Link from "next/link";
import { ACHIEVEMENTS } from "@/lib/demo-data";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { EmptyState } from "@/components/EmptyState";

const COPY: Record<string, string> = {
  "first-lesson": "Первый языковой урок",
  "first-unit": "Первый модуль",
  "first-word": "Первое слово в словаре",
  "a1-complete": "Уровень A1",
  "challenge-day": "Задание дня",
  "first-topic": "Первый разобранный урок",
  "streak-7": "7 дней подряд",
  "streak-30": "30 дней подряд",
  "hundred-tasks": "Первые верные задачи",
  "fifty-topics": "10 часов обучения",
  "first-exam": "Первый экзамен",
  "perfect-test": "90%+ на проверке",
  "three-langs": "Три языка интерфейса",
  "master": "Мастер математики",
};

export default function AchievementsPage() {
  const { user } = useApp();
  const loc = user?.language ?? "ru";
  const unlocked = ACHIEVEMENTS.filter((a) => user?.achievements.includes(a.id));
  const locked = ACHIEVEMENTS.filter((a) => !user?.achievements.includes(a.id));

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="gold-kicker">{t(loc, "nav.achievements")}</p>
        <h1 className="mt-2 text-3xl font-semibold">{unlocked.length} / {ACHIEVEMENTS.length}</h1>
      </div>
      {unlocked.length === 0 && (
        <EmptyState title={t(loc, "ach.empty")} text="Пройди урок — награда появится сама." action="К учёбе" href="/learn" />
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {unlocked.map((a) => (
          <div key={a.id} className="panel-card p-5">
            <div className="text-3xl">{a.icon}</div>
            <div className="font-medium mt-2">{t(loc, `ach.${a.id}`)}</div>
            <div className="text-xs text-[var(--muted)] mt-1">{COPY[a.id] ?? "Открыто"}</div>
          </div>
        ))}
        {locked.map((a) => (
          <div key={a.id} className="panel-card p-5 opacity-60">
            <div className="text-3xl">{a.icon}</div>
            <div className="font-medium mt-2">{t(loc, `ach.${a.id}`)}</div>
            <div className="text-xs mt-1">Ещё впереди · {COPY[a.id] ?? ""}</div>
          </div>
        ))}
      </div>
      <Link href="/tutor" className="text-sm text-brand-700">{t(loc, "insights.start")} →</Link>
    </div>
  );
}
