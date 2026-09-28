"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getSubject } from "@/lib/subjects";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/Button";

const DIFF = ["easy", "medium", "hard", "olympiad", "exam"] as const;

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useApp();
  const loc = user?.language ?? "ru";
  const subject = getSubject(id);
  if (!subject) return <p>Предмет не найден.</p>;
  return (
    <div className="space-y-6 pb-16">
      <div>
        <Link href="/subjects" className="text-sm text-brand-700">← {t(loc, "nav.subjects")}</Link>
        <h1 className="font-serif text-4xl mt-2">{t(loc, `subject.${subject.id}`)}</h1>
        <p className="text-ink-500 mt-2">Уровень: {user?.subjectLevels[subject.id] ?? 40}%</p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {DIFF.map((d) => (
          <span key={d} className="rounded-full border border-[var(--line)] px-3 py-1">
            {t(loc, `diff.${d}`)}
          </span>
        ))}
      </div>
      <ol className="learn-path">
        {subject.topics.map((topic, i) => {
          const done = user?.learnedTopics.includes(topic.id);
          const current = user?.continueLesson?.topicId === topic.id;
          return (
            <li key={topic.id} className={`learn-path-item ${done ? "done" : ""} ${current ? "now" : ""}`}>
              <span className="learn-path-dot" aria-hidden>{done ? "✓" : i + 1}</span>
              <div className="rounded-3xl border border-[var(--line)] bg-white dark:bg-[var(--bg-elev)] p-5">
                <div className="text-xs text-[var(--muted)]">{topic.grade.join(", ")} {t(loc, "grade.n")} · {topic.minutes} {t(loc, "minutes")}</div>
                <h2 className="text-lg font-medium mt-1">{t(loc, `topic.${topic.id}`)}</h2>
                <ProgressBar value={done ? 100 : user?.weakTopics.includes(topic.id) ? 45 : current ? 60 : 20} className="mt-3" />
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button href={`/lesson/${topic.id}`}>{t(loc, "cta.learn")}</Button>
                  <Button href={`/practice?topic=${topic.id}&subject=${subject.id}`} variant="secondary">Практика</Button>
                  <Button href={`/tests?topic=${topic.id}`} variant="secondary">{t(loc, "nav.tests")}</Button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
