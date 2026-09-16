"use client";

import { ACHIEVEMENTS } from "@/lib/demo-data";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";

export default function AchievementsPage() {
  const { user } = useApp();
  const loc = user?.language ?? "ru";
  return (
    <div className="space-y-6 pb-16">
      <h1 className="font-serif text-4xl">{t(loc, "nav.achievements")}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const on = user?.achievements.includes(a.id);
          return (
            <div key={a.id} className={`rounded-3xl border p-5 ${on ? "border-brand-400 bg-white dark:bg-ink-900" : "border-[var(--line)] opacity-60"}`}>
              <div className="text-3xl">{a.icon}</div>
              <div className="font-medium mt-2">{t(loc, `ach.${a.id}`)}</div>
              <div className="text-xs mt-1">{on ? "Открыто" : "Ещё впереди"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
