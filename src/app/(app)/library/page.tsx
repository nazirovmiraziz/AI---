"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SUBJECTS, allTopics } from "@/lib/subjects";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { ProgressBar } from "@/components/ProgressBar";
import { EmptyState } from "@/components/EmptyState";
import type { Difficulty } from "@/lib/types";

export default function LibraryPage() {
  const { user, toggleFavorite } = useApp();
  const loc = user?.language ?? "ru";
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [diff, setDiff] = useState<Difficulty | "">("");
  const [tab, setTab] = useState<"all" | "fav" | "recent" | "cards" | "practice">("all");

  const items = useMemo(() => {
    return allTopics().filter((topic) => {
      const name = t(loc, `topic.${topic.id}`).toLowerCase();
      if (q && !name.includes(q.toLowerCase()) && !topic.id.includes(q.toLowerCase())) return false;
      if (subject && topic.subjectId !== subject) return false;
      if (grade && !topic.grade.includes(Number(grade))) return false;
      if (diff && topic.difficulty !== diff) return false;
      if (tab === "fav" && !(user?.favoriteTopics ?? []).includes(topic.id)) return false;
      if (tab === "recent" && !(user?.recentTopics ?? []).includes(topic.id)) return false;
      return true;
    });
  }, [q, subject, grade, diff, loc, tab, user?.favoriteTopics, user?.recentTopics]);

  return (
    <div className="space-y-6 pb-16">
      <h1 className="text-3xl font-semibold">📚 {t(loc, "nav.library")}</h1>
      <div className="flex flex-wrap gap-2">
        {[
          ["all", t(loc, "lib.books")],
          ["fav", t(loc, "lib.fav")],
          ["recent", t(loc, "lib.recent")],
          ["cards", t(loc, "lib.cards")],
          ["practice", t(loc, "lib.practice")],
        ].map(([id, label]) => (
          <button key={id} type="button" className={`chip-btn ${tab === id ? "on" : ""}`} onClick={() => setTab(id as typeof tab)}>
            {label}
          </button>
        ))}
      </div>
      <div className="relative">
        <input className="w-full rounded-2xl border border-[var(--line)] px-4 py-3 bg-white dark:bg-ink-900" placeholder={t(loc, "library.search")} value={q} onChange={(e) => setQ(e.target.value)} />
        {q && (
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]" onClick={() => setQ("")}>
            Очистить
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <select className="rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">Предмет</option>
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              {t(loc, `subject.${s.id}`)}
            </option>
          ))}
        </select>
        <select className="rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option value="">Класс</option>
          {[6, 7, 8, 9, 10, 11].map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select className="rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={diff} onChange={(e) => setDiff(e.target.value as Difficulty | "")}>
          <option value="">Сложность</option>
          {["easy", "medium", "hard", "olympiad", "exam"].map((d) => (
            <option key={d} value={d}>
              {t(loc, `diff.${d}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {items.length === 0 ? (
          <div className="md:col-span-2">
            <EmptyState
              title={t(loc, "lib.empty")}
              text="Измените запрос или сбросьте фильтры — в библиотеке остаются только школьные темы."
            />
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                className="text-sm text-brand-700"
                onClick={() => {
                  setQ("");
                  setSubject("");
                  setGrade("");
                  setDiff("");
                }}
              >
                Сбросить фильтры
              </button>
            </div>
          </div>
        ) : (
          items.map((topic) => (
          <div key={topic.id} className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-5">
            <div className="text-xs text-ink-400">
              {t(loc, `subject.${topic.subjectId}`)} · {t(loc, `diff.${topic.difficulty}`)}
            </div>
            <h2 className="font-medium text-lg mt-1">{t(loc, `topic.${topic.id}`)}</h2>
            <ProgressBar value={user?.learnedTopics.includes(topic.id) ? 100 : 0} className="mt-3" />
            <div className="flex flex-wrap gap-2 mt-4 text-sm">
              <Link className="text-brand-700" href={`/lesson/${topic.id}`}>
                Объяснение
              </Link>
              <Link className="text-brand-700" href={`/tests?topic=${topic.id}`}>
                Практика
              </Link>
              <Link className="text-brand-700" href={`/tutor?topic=${topic.id}`}>
                Репетитор
              </Link>
              <Link className="text-brand-700" href={`/flashcards?topic=${topic.id}`}>
                Карточки
              </Link>
              <button type="button" className="text-brand-700" onClick={() => toggleFavorite(topic.id)}>
                {(user?.favoriteTopics ?? []).includes(topic.id) ? "★ В избранном" : "☆ В избранное"}
              </button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}
