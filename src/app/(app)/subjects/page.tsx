"use client";

import Link from "next/link";
import { SUBJECTS, CATEGORIES } from "@/lib/subjects";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { ProgressBar } from "@/components/ProgressBar";

export default function SubjectsPage() {
  const { user } = useApp();
  const loc = user?.language ?? "ru";
  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="gold-kicker">Курсы</p>
        <h1 className="mt-2 text-3xl font-semibold">Мои предметы</h1>
        <p className="mt-2 text-[var(--muted)]">Прогресс считается по твоим тестам и урокам.</p>
        <Link href="/lesson/new" className="inline-block mt-4 text-sm text-[#163068]">
          Собрать свой урок →
        </Link>
      </div>
      {CATEGORIES.map((cat) => (
        <section key={cat}>
          <h2 className="text-lg font-medium mb-3">{t(loc, `cat.${cat}`)}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUBJECTS.filter((s) => s.category === cat).map((s) => {
              const progress = user?.subjectLevels[s.id] ?? 0;
              const last = s.topics.find((tp) => user?.continueLesson?.topicId === tp.id) || s.topics[0];
              return (
                <article key={s.id} className="surface hover-lift rounded-[1.4rem] p-5 flex flex-col gap-3">
                  <div>
                    <div className="font-medium text-lg">{t(loc, `subject.${s.id}`)}</div>
                    <div className="text-sm text-[var(--muted)] mt-1">{s.topics.length} тем · {progress}%</div>
                  </div>
                  <ProgressBar value={progress} />
                  <p className="text-sm text-[var(--muted)]">Дальше: {last ? t(loc, `topic.${last.id}`) : "—"}</p>
                  <div className="mt-auto flex flex-wrap gap-2 text-sm">
                    <Link href={`/subjects/${s.id}`} className="btn-primary !px-3 !py-2">Открыть</Link>
                    {last && <Link href={`/lesson/${last.id}`} className="btn-secondary !px-3 !py-2">Продолжить</Link>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
