"use client";

import { useApp } from "@/lib/store";
import { LOCALES } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function LanguageSwitcher({ lesson = false }: { lesson?: boolean }) {
  const { user, setLanguage, setLessonLanguage } = useApp();
  const current = lesson ? user?.lessonLanguage : user?.language;
  return (
    <select
      aria-label={lesson ? "Lesson language" : "UI language"}
      className="rounded-full border border-[var(--line)] bg-[var(--bg-elev)] px-3 py-1.5 text-sm"
      value={current ?? "ru"}
      onChange={(e) => (lesson ? setLessonLanguage : setLanguage)(e.target.value as Locale)}
    >
      {LOCALES.map((l) => (
        <option key={l.id} value={l.id}>
          {l.flag} {l.native}
        </option>
      ))}
    </select>
  );
}
