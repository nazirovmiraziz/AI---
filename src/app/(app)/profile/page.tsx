"use client";

import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { ProgressBar } from "@/components/ProgressBar";
import { EmptyState } from "@/components/EmptyState";
import { StreakWeek } from "@/components/WeekChart";
import { SUBJECTS } from "@/lib/subjects";
import { levelFromXp } from "@/lib/demo-data";
import { accuracy, tasksDone } from "@/lib/cabinet";
import { ensureLangSchool } from "@/lib/lang/progress";
import { langById } from "@/lib/lang/catalog";
import Link from "next/link";

export default function ProfilePage() {
  const { user, displayName, logout } = useApp();
  const loc = user?.language ?? "ru";
  const lv = levelFromXp(user?.xp ?? 0);
  const strong = [...SUBJECTS].sort((a, b) => (user?.subjectLevels[b.id] ?? 0) - (user?.subjectLevels[a.id] ?? 0))[0];
  const weak = [...SUBJECTS].sort((a, b) => (user?.subjectLevels[a.id] ?? 0) - (user?.subjectLevels[b.id] ?? 0))[0];
  const hours = Math.round(((user?.studyMinutes ?? 0) / 60) * 10) / 10;

  return (
    <div className="max-w-2xl space-y-6 pb-16">
      <div className="panel-card p-6 flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-600 text-white text-2xl font-semibold">
          {(displayName || "S").trim().slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold truncate">{displayName || "Ученик"}</h1>
          <p className="text-sm text-[var(--muted)]">Level {lv.number} · {t(loc, lv.current.nameKey)} · 🔥 {user?.streak}</p>
          <ProgressBar value={lv.progress} className="mt-2 w-48" />
        </div>
      </div>

      {user?.langSchool?.onboarded && user.langSchool.activeLanguage && (
        <div className="panel-card p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Язык обучения</p>
          <p className="mt-2 text-lg font-semibold">
            {langById(user.langSchool.activeLanguage).flag} {langById(user.langSchool.activeLanguage).name} ·{" "}
            {ensureLangSchool(user.langSchool).tracks[user.langSchool.activeLanguage]?.cefr}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            ⭐ {user.xp} XP · 🔥 {user.streak} дн. · 🪙 {user.langSchool.coins}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/learn/certificates" className="text-[#2f6bff]">
              Сертификаты
            </Link>
            <Link href="/learn/progress" className="text-[#2f6bff]">
              Статистика
            </Link>
            <Link href="/achievements" className="text-[#2f6bff]">
              Награды
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="stat-tile"><div className="k">Задач решено</div><div className="v">{tasksDone(user)}</div></div>
        <div className="stat-tile"><div className="k">Тестов</div><div className="v">{user?.testHistory.length ?? 0}</div></div>
        <div className="stat-tile"><div className="k">Часов</div><div className="v">{hours}</div></div>
        <div className="stat-tile"><div className="k">Точность</div><div className="v">{accuracy(user)}%</div></div>
      </div>

      <div className="panel-card p-5 space-y-3">
        <Row k={t(loc, "profile.goal")} v={t(loc, `goal.${user?.goal ?? "university"}`)} />
        <Row k="Класс" v={`${user?.grade}`} />
        <Row k={t(loc, "profile.xp")} v={(user?.xp ?? 0).toLocaleString("ru-RU")} />
        <Row k={t(loc, "profile.strong")} v={`🟢 ${t(loc, `subject.${strong.id}`)}`} />
        <Row k={t(loc, "profile.repeat")} v={t(loc, `subject.${weak.id}`)} />
        <Row k="Страна" v={user?.country || "—"} />
        <StreakWeek days={user?.activityDays} locale={loc} />
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/settings" className="chip-btn">Настройки</Link>
          <Link href="/achievements" className="chip-btn">Награды</Link>
          <button type="button" className="chip-btn" onClick={() => { if (window.confirm("Выйти из аккаунта?")) logout(); }}>
            {t(loc, "logout")}
          </button>
        </div>
      </div>

      <div className="panel-card p-5">
        <h2 className="font-medium mb-3">{t(loc, "nav.history")}</h2>
        {(user?.testHistory ?? []).length === 0 ? (
          <EmptyState title="Проверок ещё не было" text="Пройдите практику — результаты появятся в профиле." action="К тестам" href="/tests" />
        ) : (
          <div className="space-y-3">
            {(user?.testHistory ?? []).map((h) => (
              <div key={h.id} className="text-sm">
                <div className="flex justify-between">
                  <span>{h.title}</span>
                  <span>{h.score}/{h.total}</span>
                </div>
                <ProgressBar value={(h.score / h.total) * 100} className="mt-1" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-[var(--muted)]">{k}</span>
      <span className="font-medium text-end">{v}</span>
    </div>
  );
}
