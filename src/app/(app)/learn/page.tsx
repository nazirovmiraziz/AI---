"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLangSchool } from "@/lib/lang/use-school";
import { Button } from "@/components/Button";
import { SkillMeter, EmptyLearn, Hearts } from "@/components/lang/bits";
import { REASON_LABEL } from "@/lib/lang/progress";
import { findLesson } from "@/lib/lang/curriculum";
import { dayGreeting, firstName, weekActivity } from "@/lib/cabinet";
import { allUnits } from "@/lib/lang/curriculum";

export default function LearnHomePage() {
  const { user, ls, lang, meta, track, nextId, due, rec } = useLangSchool();
  const [hour, setHour] = useState(12);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  if (!ls.onboarded || !track || !lang || !meta) {
    return <EmptyLearn title="Выбери язык, чтобы начать" text="Короткий план — и сразу первый урок." href="/learn/start" cta="Выбрать язык" />;
  }
  const loc = user?.language ?? "ru";
  const found = nextId ? findLesson(lang, nextId) : null;
  const recFound = rec?.lessonId ? findLesson(lang, rec.lessonId) : null;
  const week = weekActivity(user?.activityDays);
  const goal = Math.min(100, Math.round((track.daily.minutes / Math.max(1, track.daily.goalMinutes)) * 100));
  const units = allUnits(lang);
  const currentUnit = found?.unit ?? units.find((u) => u.lessons.some((l) => track.unlockedLessons.includes(l.id)));

  return (
    <div className="space-y-5">
      <section className="panel-card p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{meta.flag} {meta.name} · {track.cefr}</p>
        <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-semibold">{dayGreeting(loc, user?.name, hour)} 👋</h1>
        <p className="mt-2 text-[var(--muted)]">
          {firstName(user?.name)
            ? `${firstName(user?.name)}, сегодня ${track.daily.goalMinutes} минут. Цель: ${REASON_LABEL[track.reason]}.`
            : `Сегодня ${track.daily.goalMinutes} минут. Цель: ${REASON_LABEL[track.reason]}.`}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span>🔥 {user?.streak ?? 0} дн.</span>
          <span>⭐ {user?.xp ?? 0} XP</span>
          <Hearts n={ls.hearts} />
          <span>🪙 {ls.coins}</span>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
            <span>Цель дня {track.daily.minutes}/{track.daily.goalMinutes} мин</span>
            <span>{goal}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
            <div className="h-full bg-[#2f6bff] transition-all" style={{ width: `${goal}%` }} />
          </div>
        </div>
        {found && (
          <div className="mt-5 rounded-2xl border border-[var(--line)] p-4">
            <p className="text-xs text-[var(--muted)]">Сегодняшний урок · {found.lesson.minutes} мин</p>
            <p className="mt-1 text-lg font-semibold">
              {found.unit.title} · {found.lesson.titleRu}
            </p>
            <Button href={`/learn/lesson/${found.lesson.id}`} className="mt-3">Продолжить обучение →</Button>
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="panel-card p-5">
          <h2 className="font-semibold">Неделя</h2>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px]">
            {week.map((d) => (
              <div key={d.key} className={`rounded-xl py-2 ${d.done ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100" : "bg-[var(--line)]/40"} ${d.today ? "ring-1 ring-[#2f6bff]" : ""}`}>
                <div className="uppercase">{d.key}</div>
                <div>{d.done ? "✓" : "○"}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="panel-card space-y-3 p-5">
          <h2 className="font-semibold">Навыки</h2>
          <SkillMeter label="Слова" value={track.skills.vocabulary} />
          <SkillMeter label="Грамматика" value={track.skills.grammar} />
          <SkillMeter label="Речь" value={track.skills.speaking} />
          <SkillMeter label="Слух" value={track.skills.listening} />
        </section>
      </div>

      <section className="panel-card p-5">
        <h2 className="font-semibold">Совет репетитора</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{rec?.why}</p>
        {due.length > 0 && <p className="mt-2 text-sm">Сегодня к повторению {due.length} слов.</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {recFound && (
            <Button href={`/learn/lesson/${recFound.lesson.id}`} variant="secondary">Открыть урок</Button>
          )}
          {due.length > 0 && (
            <Button href="/learn/review" variant="secondary">Повторить слова</Button>
          )}
          <Button href="/learn/challenge" variant="secondary">{track.daily.challengeDone ? "Задание дня ✓" : "Задание дня +50 XP"}</Button>
        </div>
      </section>

      {currentUnit && (
        <section className="panel-card p-5">
          <h2 className="font-semibold">
            {currentUnit.title} — {currentUnit.titleRu}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{currentUnit.goal}</p>
          <Link href={`/learn/unit/${currentUnit.id}`} className="mt-3 inline-block text-sm text-[#2f6bff]">
            Открыть модуль →
          </Link>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ["/learn/map", "Карта"],
          ["/learn/ai", "Репетитор"],
          ["/learn/vocab", "Слова"],
          ["/learn/talk", "Разговор"],
          ["/learn/languages", "Мои языки"],
          ["/learn/progress", "Прогресс"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="panel-card p-4 text-center text-sm font-medium">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
