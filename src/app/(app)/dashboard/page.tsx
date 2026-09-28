"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { firstName, dayGreeting, accuracy, tasksDone } from "@/lib/cabinet";
import { DEMO_EMAIL, levelFromXp, XP_REWARDS } from "@/lib/demo-data";
import { SUBJECTS, getTopic } from "@/lib/subjects";
import { t } from "@/lib/i18n";
import { ProgressBar } from "@/components/ProgressBar";
import { StreakWeek } from "@/components/WeekChart";
import { EmptyState } from "@/components/EmptyState";

export default function DashboardPage() {
  const { user, conversations, displayName } = useApp();
  const loc = user?.language ?? "ru";
  const who = user?.email?.toLowerCase() === DEMO_EMAIL ? "" : displayName || firstName(user?.name);
  const [hour, setHour] = useState(12);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  const lv = levelFromXp(user?.xp ?? 0);
  const dailyGoal = user?.dailyGoalMin ?? 20;
  const todayMin = user?.weeklyMinutes?.[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] ?? 0;
  const goalPct = Math.min(100, Math.round((todayMin / Math.max(1, dailyGoal)) * 100));
  const favFirst = user?.favoriteSubjects?.[0]
    ? SUBJECTS.find((s) => s.id === user.favoriteSubjects[0])?.topics[0]?.id
    : undefined;
  const continueTopic = user?.continueLesson?.topicId || user?.weakTopics?.[0] || favFirst || "linear-eq";
  const topic = getTopic(continueTopic);
  const recent = [...conversations].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 4);
  const favIds = user?.favoriteSubjects?.length ? user.favoriteSubjects : [];
  const fav = (favIds.length ? favIds : []).map((id) => SUBJECTS.find((s) => s.id === id)).filter(Boolean);
  const recs = [
    user?.weakTopics?.[0] && { href: `/review`, title: `Повтори: ${t(loc, `topic.${user.weakTopics[0]}`)}`, why: "Тема в слабых." },
    user?.continueLesson && { href: `/lesson/${user.continueLesson.topicId}`, title: `Продолжи: ${t(loc, `topic.${user.continueLesson.topicId}`)}`, why: "Ты остановился здесь." },
    { href: `/lesson/${continueTopic}`, title: "Новый шаг по текущей теме", why: "Дальше по плану." },
  ].filter(Boolean) as { href: string; title: string; why: string }[];
  const uniqueRecs = recs.filter((r, i, arr) => arr.findIndex((x) => x.href === r.href) === i).slice(0, 3);

  return (
    <div className="dash-page space-y-6 pb-16">
      <header className="dash-hero">
        <p className="gold-kicker">Главная</p>
        <h1>{dayGreeting(loc, who, hour)}</h1>
        <p>Готов разобрать что-то новое — или закрыть слабую тему.</p>
      </header>

      {!user?.diagnosticDone && (
        <section className="panel-card p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Определи уровень</h2>
            <p className="text-sm text-[var(--muted)]">Пять вопросов. Слабые темы попадут в повтор.</p>
          </div>
          <Link href="/diagnostic" className="btn-primary !px-4">Начать срез</Link>
        </section>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-tile"><div className="k">Серия</div><div className="v">{user?.streak ?? 0} дн.</div></div>
        <div className="stat-tile"><div className="k">XP</div><div className="v">{(user?.xp ?? 0).toLocaleString("ru-RU")}</div></div>
        <div className="stat-tile"><div className="k">Точность</div><div className="v">{accuracy(user)}%</div></div>
        <div className="stat-tile"><div className="k">Уровень</div><div className="v">{lv.number}</div></div>
      </div>

      <section className="panel-card p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--muted)]">Цель дня</p>
            <h2 className="text-lg font-semibold">{Math.min(todayMin, dailyGoal)} / {dailyGoal} мин</h2>
          </div>
          <Link href="/settings" className="text-sm text-[#163068]">Изменить</Link>
        </div>
        <ProgressBar value={goalPct} />
      </section>

      <section className="panel-card p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--muted)]">Продолжить</p>
            <h2 className="text-lg font-semibold">{t(loc, `topic.${continueTopic}`)}</h2>
            {topic && <p className="text-sm text-[var(--muted)]">{t(loc, `subject.${topic.subjectId}`)}</p>}
          </div>
          <Link href={`/lesson/${continueTopic}`} className="btn-primary !px-4">Продолжить урок</Link>
        </div>
        <ProgressBar value={user?.continueLesson?.progress ?? user?.subjectLevels[topic?.subjectId ?? "math"] ?? 0} />
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href={`/practice?topic=${continueTopic}`} className="chip-btn">Практика</Link>
          <Link href={`/tests?topic=${continueTopic}`} className="chip-btn">Тест</Link>
          <Link href={`/tutor?topic=${continueTopic}`} className="chip-btn">Спросить ИИ</Link>
        </div>
      </section>

      <section className="panel-card p-5 space-y-3">
        <div className="flex justify-between items-baseline">
          <h2 className="font-semibold">XP</h2>
          <span className="text-sm text-[var(--muted)]">{lv.remaining} XP до уровня {lv.number + 1}</span>
        </div>
        <ProgressBar value={lv.progress} />
        <p className="text-sm text-[var(--muted)]">+{XP_REWARDS.lesson} XP за урок · +{XP_REWARDS.task} за задачу</p>
      </section>

      <section className="panel-card p-5 space-y-3">
        <h2 className="font-semibold">Рекомендуем</h2>
        {uniqueRecs.length === 0 ? (
          <EmptyState title="План ещё пуст" text="Пройди срез или первый урок." action="К предметам" href="/subjects" />
        ) : (
          uniqueRecs.map((r) => (
            <Link key={r.href} href={r.href} className="block rounded-xl border border-[var(--line)] px-3 py-2 hover:bg-white/70">
              <b className="block">{r.title}</b>
              <span className="text-sm text-[var(--muted)]">{r.why}</span>
            </Link>
          ))
        )}
      </section>

      <section className="grid lg:grid-cols-2 gap-3">
        <div className="panel-card p-5 space-y-3">
          <h2 className="font-semibold">Курсы</h2>
          {fav.length === 0 ? (
            <EmptyState title="Предметы не выбраны" text="Отметь любимые в настройках — здесь появится прогресс." action="Настройки" href="/settings" />
          ) : fav.map((s) => s && (
            <Link key={s.id} href={`/subjects/${s.id}`} className="block rounded-xl border border-[var(--line)] px-3 py-2 hover:bg-white/70">
              <div className="flex justify-between text-sm">
                <span>{t(loc, `subject.${s.id}`)}</span>
                <span className="text-[var(--muted)]">{user?.subjectLevels[s.id] ?? 0}%</span>
              </div>
              <ProgressBar value={user?.subjectLevels[s.id] ?? 0} className="mt-2" />
            </Link>
          ))}
          <Link href="/subjects" className="text-sm text-[#163068]">Все курсы →</Link>
        </div>
        <div className="panel-card p-5 space-y-3">
          <h2 className="font-semibold">Серия</h2>
          <StreakWeek days={user?.activityDays} locale={loc} />
          <p className="text-sm text-[var(--muted)]">Решено задач: {tasksDone(user)} · дней подряд: {user?.streak ?? 0}</p>
        </div>
      </section>

      <section className="panel-card p-5 space-y-3">
        <div className="flex justify-between">
          <h2 className="font-semibold">Недавние чаты</h2>
          <Link href="/tutor" className="text-sm text-[#163068]">Открыть чат</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState title="Чатов ещё нет" text="Задай первый вопрос — история появится здесь." action="К репетитору" href="/tutor" />
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {recent.map((c) => (
              <Link key={c.id} href={`/tutor?c=${c.id}`} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm">
                <b className="block truncate">{c.title}</b>
                <span className="text-[var(--muted)]">{c.messages.length} сообщ.</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
