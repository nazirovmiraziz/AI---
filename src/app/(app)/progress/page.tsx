"use client";

import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { ProgressBar } from "@/components/ProgressBar";
import { levelFromXp } from "@/lib/demo-data";
import { SUBJECTS } from "@/lib/subjects";

function MiniBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((v, i) => (
        <div key={i} className="flex-1 bg-brand-100 dark:bg-brand-900 rounded-t-lg relative" style={{ height: `${(v / max) * 100}%` }}>
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-ink-400">{v}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const { user } = useApp();
  const loc = user?.language ?? "ru";
  const lv = levelFromXp(user?.xp ?? 0);
  const goalPct = Math.min(100, Math.round(((user?.xp ?? 0) / 8000) * 100));
  return (
    <div className="space-y-6 pb-16">
      <h1 className="font-serif text-4xl">{t(loc, "nav.progress")}</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-6">
          <h2 className="font-medium">📈 {t(loc, "chart.week")}</h2>
          <div className="mt-6">
            <MiniBars data={user?.weeklyMinutes ?? [0, 0, 0, 0, 0, 0, 0]} />
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-6">
          <h2 className="font-medium">📊 {t(loc, "chart.time")}</h2>
          <p className="text-4xl font-serif mt-4">{user?.studyMinutes ?? 0}</p>
          <p className="text-sm text-ink-500">{t(loc, "minutes")}</p>
        </div>
        <div className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-6">
          <h2 className="font-medium">📚 {t(loc, "chart.topics")}</h2>
          <p className="text-4xl font-serif mt-4">{user?.learnedTopics.length ?? 0}</p>
          <p className="text-sm text-ink-500">{t(loc, "profile.topics")}</p>
        </div>
        <div className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-6">
          <h2 className="font-medium">🎯 {t(loc, "chart.goals")}</h2>
          <p className="mt-2">{t(loc, `goal.${user?.goal ?? "university"}`)}</p>
          <ProgressBar value={goalPct} className="mt-4" />
          <p className="text-sm mt-2">{goalPct}%</p>
        </div>
      </div>
      <div className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-6">
        <h2 className="font-medium mb-4">{t(loc, "level.title")}</h2>
        {SUBJECTS.map((s) => (
          <div key={s.id} className="mb-3">
            <div className="flex justify-between text-sm">
              <span>{t(loc, `subject.${s.id}`)}</span>
              <span>{user?.subjectLevels[s.id] ?? 0}%</span>
            </div>
            <ProgressBar value={user?.subjectLevels[s.id] ?? 0} />
          </div>
        ))}
        <p className="text-sm text-ink-500 mt-4">
          {user?.xp.toLocaleString("ru-RU")} XP · {Math.round(lv.progress)}% · {lv.next ? `${t(loc, "level.to")} «${t(loc, lv.next.nameKey)}» ${t(loc, "level.left")} ${lv.remaining} XP` : t(loc, "level.master")}
        </p>
      </div>
    </div>
  );
}
