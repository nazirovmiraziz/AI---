"use client";

import { Button } from "@/components/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { InstallApp } from "@/components/InstallApp";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { ExplainStyle } from "@/lib/types";
import { SUBJECTS } from "@/lib/subjects";

const STYLES: ExplainStyle[] = ["short", "student", "detailed", "steps"];
const GOALS = ["exam", "math", "english", "university", "grades"] as const;

export default function SettingsPage() {
  const { user, setTheme, updateUser, resetLocalData, conversations, logout } = useApp();
  const loc = user?.language ?? "ru";
  const fav = user?.favoriteSubjects ?? [];

  return (
    <div className="max-w-xl space-y-5 pb-16">
      <h1 className="text-3xl font-semibold">{t(loc, "nav.settings")}</h1>

      <section className="panel-card p-5 space-y-4">
        <h2 className="font-medium">{t(loc, "settings.general")}</h2>
        <label className="block text-sm">
          {t(loc, "auth.name")}
          <input className="input-lux mt-2" value={user?.name ?? ""} onChange={(e) => updateUser({ name: e.target.value })} />
        </label>
        <label className="block text-sm">
          Класс
          <select className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={user?.grade} onChange={(e) => updateUser({ grade: e.target.value })}>
            {[6, 7, 8, 9, 10, 11].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        <div>
          <div className="text-sm mb-2">{t(loc, "profile.goal")}</div>
          <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={user?.goal} onChange={(e) => updateUser({ goal: e.target.value })}>
            {GOALS.map((g) => (
              <option key={g} value={g}>{t(loc, `goal.${g}`)}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="panel-card p-5 space-y-4">
        <h2 className="font-medium">{t(loc, "settings.appear")}</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant={user?.theme === "light" ? "primary" : "secondary"} onClick={() => setTheme("light")}>{t(loc, "settings.light")}</Button>
          <Button variant={user?.theme === "dark" ? "primary" : "secondary"} onClick={() => setTheme("dark")}>{t(loc, "settings.dark")}</Button>
          <Button variant={user?.theme === "system" ? "primary" : "secondary"} onClick={() => setTheme("system")}>Как в телефоне</Button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={user?.animationsOn !== false} onChange={(e) => updateUser({ animationsOn: e.target.checked })} />
          Плавные движения
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={user?.soundOn === true} onChange={(e) => updateUser({ soundOn: e.target.checked })} />
          Звук в кабинете
        </label>
        <div>
          <div className="text-sm mb-2">{t(loc, "settings.lang")}</div>
          <LanguageSwitcher />
        </div>
      </section>

      <section className="panel-card p-5 space-y-4">
        <h2 className="font-medium">{t(loc, "settings.ai")}</h2>
        <div className="text-sm mb-2">{t(loc, "settings.style")}</div>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button key={s} type="button" className={`chip-btn ${user?.explainStyle === s ? "on" : ""}`} onClick={() => updateUser({ explainStyle: s })}>
              {t(loc, `style.${s}`)}
            </button>
          ))}
        </div>
        <div>
          <div className="text-sm mb-2">{t(loc, "settings.lessonLang")}</div>
          <LanguageSwitcher lesson />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!user?.hintOnly} onChange={(e) => updateUser({ hintOnly: e.target.checked })} />
          Не давать готовый ответ
        </label>
      </section>

      <section className="panel-card p-5 space-y-3">
        <h2 className="font-medium">Языковая школа</h2>
        <p className="text-sm text-[var(--muted)]">Язык экрана и язык учёбы — разные вещи. Учёбу переключай в «Мои языки».</p>
        <a href="/learn/languages" className="text-sm text-[#2f6bff]">Мои языки →</a>
      </section>

      <section className="panel-card p-5 space-y-3">
        <h2 className="font-medium">Цель дня</h2>
        <div className="flex flex-wrap gap-2">
          {[5, 10, 20, 30].map((m) => (
            <button
              key={m}
              type="button"
              className={`chip-btn ${(user?.dailyGoalMin ?? 20) === m ? "on" : ""}`}
              onClick={() => updateUser({ dailyGoalMin: m })}
            >
              {m === 30 ? "30+ мин" : `${m} мин`}
            </button>
          ))}
        </div>
      </section>

      <section className="panel-card p-5 space-y-3">
        <h2 className="font-medium">{t(loc, "settings.learn")}</h2>
        <p className="text-sm text-[var(--muted)]">Предметы для персонализации</p>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.slice(0, 8).map((s) => {
            const on = fav.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                className={`chip-btn ${on ? "on" : ""}`}
                onClick={() => updateUser({ favoriteSubjects: on ? fav.filter((id) => id !== s.id) : [...fav, s.id] })}
              >
                {t(loc, `subject.${s.id}`)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel-card p-5 space-y-3">
        <h2 className="font-medium">{t(loc, "settings.voice")}</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={user?.voiceOn !== false} onChange={(e) => updateUser({ voiceOn: e.target.checked })} />
          Разрешить микрофон и озвучку
        </label>
      </section>

      <section className="panel-card p-5 space-y-3">
        <h2 className="font-medium">{t(loc, "settings.notify")}</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={user?.notifyOn !== false} onChange={(e) => updateUser({ notifyOn: e.target.checked })} />
          Подсказки о серии, наградах и слабых темах
        </label>
      </section>

      <section className="panel-card p-5 space-y-3">
        <h2 className="font-medium">Приложение</h2>
        <p className="text-sm text-[var(--muted)]">Школа работает как сайт и как приложение на телефоне.</p>
        <InstallApp compact />
      </section>

      <section className="panel-card p-5 space-y-3">
        <h2 className="font-medium">Данные на этом устройстве</h2>
        <p className="text-sm text-[var(--muted)]">Чатов сейчас: {conversations.length}. Сброс не удаляет аккаунт.</p>
        <Button
          variant="secondary"
          onClick={() => {
            if (window.confirm("Очистить чаты, план и карточки на этом устройстве?")) resetLocalData();
          }}
        >
          Очистить чаты
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            if (window.confirm("Выйти из аккаунта?")) logout();
          }}
        >
          {t(loc, "logout")}
        </Button>
      </section>
    </div>
  );
}
