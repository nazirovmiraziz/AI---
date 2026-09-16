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
    <div className="space-y-10 pb-16">
      <div>
        <h1 className="font-serif text-4xl">{t(loc, "nav.subjects")}</h1>
        <p className="text-ink-500 mt-2">Архитектура предметов открыта: новые дисциплины добавляются в одном каталоге.</p>
        <Link href="/lesson/new" className="inline-block mt-4 text-sm text-brand-700">
          Собрать урок с AI →
        </Link>
      </div>
      {CATEGORIES.map((cat) => (
        <section key={cat}>
          <h2 className="text-lg font-medium mb-3">{t(loc, `cat.${cat}`)}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUBJECTS.filter((s) => s.category === cat).map((s) => (
              <Link key={s.id} href={`/subjects/${s.id}`} className="surface hover-lift rounded-[1.6rem] p-5">
                <div className="font-medium text-lg">{t(loc, `subject.${s.id}`)}</div>
                <div className="text-sm text-ink-500 mt-1">{s.topics.length} тем</div>
                <ProgressBar value={user?.subjectLevels[s.id] ?? 40} className="mt-4" />
                <div className="text-sm mt-2">{user?.subjectLevels[s.id] ?? 40}%</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
