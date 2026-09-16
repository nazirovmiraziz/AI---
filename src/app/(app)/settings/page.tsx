"use client";

import { Button } from "@/components/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { ExplainStyle } from "@/lib/types";

const STYLES: ExplainStyle[] = ["child", "student", "teacher", "short", "detailed", "steps", "funny", "exam", "simple"];
const GOALS = ["exam", "math", "english", "university", "grades"] as const;

export default function SettingsPage() {
  const { user, setTheme, updateUser } = useApp();
  const loc = user?.language ?? "ru";
  return (
    <div className="max-w-xl space-y-6 pb-16">
      <h1 className="font-serif text-4xl">{t(loc, "nav.settings")}</h1>
      <section className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-6 space-y-4">
        <label className="block text-sm">
          {t(loc, "auth.name")}
          <input
            className="input-lux mt-2"
            value={user?.name ?? ""}
            onChange={(e) => updateUser({ name: e.target.value })}
          />
        </label>
        <div>
          <div className="text-sm mb-2">{t(loc, "settings.lang")}</div>
          <LanguageSwitcher />
        </div>
        <div>
          <div className="text-sm mb-2">🌐 {t(loc, "settings.lessonLang")}</div>
          <LanguageSwitcher lesson />
        </div>
        <div>
          <div className="text-sm mb-2">{t(loc, "settings.theme")}</div>
          <div className="flex gap-2">
            <Button variant={user?.theme === "light" ? "primary" : "secondary"} onClick={() => setTheme("light")}>
              {t(loc, "settings.light")}
            </Button>
            <Button variant={user?.theme === "dark" ? "primary" : "secondary"} onClick={() => setTheme("dark")}>
              {t(loc, "settings.dark")}
            </Button>
          </div>
        </div>
        <div>
          <div className="text-sm mb-2">{t(loc, "settings.style")}</div>
          <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={user?.explainStyle} onChange={(e) => updateUser({ explainStyle: e.target.value as ExplainStyle })}>
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {t(loc, `style.${s}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-sm mb-2">{t(loc, "profile.goal")}</div>
          <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={user?.goal} onChange={(e) => updateUser({ goal: e.target.value })}>
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {t(loc, `goal.${g}`)}
              </option>
            ))}
          </select>
        </div>
      </section>
    </div>
  );
}
