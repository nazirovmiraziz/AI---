"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { accuracy, tasksDone, weekActivity } from "@/lib/cabinet";
import { SUBJECTS } from "@/lib/subjects";
import { t } from "@/lib/i18n";
import { ProgressBar } from "@/components/ProgressBar";
import { StreakWeek } from "@/components/WeekChart";
import { EmptyState } from "@/components/EmptyState";

export default function ProgressPage() {
  const { user } = useApp();
  const loc = user?.language ?? "ru";
  const hist = user?.testHistory ?? [];
  const week = weekActivity(user?.activityDays);
  const weekDone = week.filter((d) => d.done).length;
  const monthTests = hist.filter((r) => Date.now() - +new Date(r.date) < 30 * 86400000);
  const hours = Math.round(((user?.studyMinutes ?? 0) / 60) * 10) / 10;

  return (
    <div className="space-y-6 pb-16 max-w-3xl">
      <div>
        <p className="gold-kicker">Прогресс</p>
        <h1 className="mt-2 text-3xl font-semibold">Что уже сделано</h1>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-tile"><div className="k">Сегодня</div><div className="v">{week.find((d) => d.today)?.done ? "есть занятие" : "ещё нет"}</div></div>
        <div className="stat-tile"><div className="k">Неделя</div><div className="v">{weekDone}/7</div></div>
        <div className="stat-tile"><div className="k">Месяц тестов</div><div className="v">{monthTests.length}</div></div>
        <div className="stat-tile"><div className="k">Часы</div><div className="v">{hours}</div></div>
      </div>
      <section className="panel-card p-5 space-y-3">
        <h2 className="font-semibold">Серия</h2>
        <StreakWeek days={user?.activityDays} locale={loc} />
        <p className="text-sm text-[var(--muted)]">🔥 {user?.streak ?? 0} дней · задач {tasksDone(user)} · точность {accuracy(user)}%</p>
      </section>
      <section className="panel-card p-5 space-y-3">
        <h2 className="font-semibold">Предметы</h2>
        {SUBJECTS.slice(0, 8).map((s) => (
          <div key={s.id}>
            <div className="flex justify-between text-sm">
              <span>{t(loc, `subject.${s.id}`)}</span>
              <span>{user?.subjectLevels[s.id] ?? 0}%</span>
            </div>
            <ProgressBar value={user?.subjectLevels[s.id] ?? 0} className="mt-1" />
          </div>
        ))}
      </section>
      <section className="panel-card p-5">
        <h2 className="font-semibold mb-3">Последние проверки</h2>
        {hist.length === 0 ? (
          <EmptyState title="Проверок нет" text="Пройди практику — результат появится здесь." action="К практике" href="/practice" />
        ) : (
          <ul className="space-y-2 text-sm">
            {hist.slice(0, 8).map((r) => (
              <li key={r.id} className="flex justify-between gap-3 border-b border-[var(--line)] pb-2">
                <span className="truncate">{r.title}</span>
                <span>{r.score}/{r.total}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Link href="/learn/progress" className="text-sm text-[#163068]">Прогресс по языкам →</Link>
    </div>
  );
}
