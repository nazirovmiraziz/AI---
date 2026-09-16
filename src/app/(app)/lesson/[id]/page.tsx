"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getLessonByTopic } from "@/lib/lessons";
import { getTopic } from "@/lib/subjects";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/Button";
import { Formula } from "@/components/Formula";
import { XP_REWARDS } from "@/lib/demo-data";

const ALT = [
  { k: "explain.life", p: "Объясни с примером из жизни" },
  { k: "explain.analogy", p: "Объясни через аналогию" },
  { k: "explain.picture", p: "Объясни через картинку" },
  { k: "explain.step", p: "Объясни пошагово" },
  { k: "explain.short", p: "Объясни очень коротко" },
];

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const { user, addXp, markTopicProgress, addConversation, updateUser } = useApp();
  const router = useRouter();
  const loc = user?.language ?? "ru";
  const lesson = getLessonByTopic(id);
  const topic = getTopic(id);
  const [alt, setAlt] = useState("");
  const [practice, setPractice] = useState<Record<number, string>>({});
  const [show, setShow] = useState<Record<number, boolean>>({});
  const [diff, setDiff] = useState(topic?.difficulty ?? "medium");

  const title = t(loc, `topic.${id}`);

  const content = useMemo(() => {
    if (!lesson) {
      return {
        learn: ["Ключевая идея темы", "Базовый пример", "Короткая практика"],
        simple: `Разберём «${title}» с нуля — без прыжка к ответу.`,
        theory: "Сначала определение, затем один пример, затем твоя попытка.",
        examples: [{ title: "Пример", body: "Начнём с самого простого случая." }],
        practice: [{ prompt: "Сформулируй главную идею своими словами", hint: "Одно предложение", answer: title }],
        summary: ["Идея", "Пример", "Проверка"],
        next: "quadratic",
      };
    }
    return lesson.sections;
  }, [lesson, title]);

  function notUnderstood() {
    setAlt("Объяснить ещё проще?");
  }

  function openTutor(prompt: string) {
    const cid = addConversation({ title, topicId: id, subjectId: topic?.subjectId });
    sessionStorage.setItem("ssai-seed", prompt);
    router.push(`/tutor?c=${cid}`);
  }

  if (!topic && !lesson) {
    return <p>Тема не найдена.</p>;
  }

  return (
    <div className="space-y-8 pb-20 max-w-3xl">
      <div>
        <Link href={topic ? `/subjects/${topic.subjectId}` : "/subjects"} className="text-sm text-brand-700">
          ← {topic ? t(loc, `subject.${topic.subjectId}`) : t(loc, "nav.subjects")}
        </Link>
        <h1 className="font-serif text-4xl mt-2">{title}</h1>
        <p className="text-ink-500 mt-1">
          {t(loc, `diff.${diff}`)} · {t(loc, "settings.lessonLang")}: {user?.lessonLanguage}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["easy", "medium", "hard", "olympiad", "exam"] as const).map((d) => (
          <button key={d} onClick={() => setDiff(d)} className={`rounded-full px-3 py-1 text-xs border ${diff === d ? "border-brand-600 bg-brand-50" : "border-[var(--line)]"}`}>
            {t(loc, `diff.${d}`)}
          </button>
        ))}
      </div>

      <section className="rounded-3xl bg-white dark:bg-ink-900 border border-[var(--line)] p-6">
        <h2 className="font-medium">{t(loc, "lesson.learn")}</h2>
        <ul className="mt-3 list-disc ps-5 text-sm space-y-1">
          {content.learn.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-white dark:bg-ink-900 border border-[var(--line)] p-6">
        <h2 className="font-medium">{t(loc, "lesson.simple")}</h2>
        <p className="mt-3 leading-relaxed">{content.simple}</p>
      </section>

      <section className="rounded-3xl bg-white dark:bg-ink-900 border border-[var(--line)] p-6">
        <h2 className="font-medium">{t(loc, "lesson.theory")}</h2>
        <p className="mt-3 leading-relaxed">{content.theory}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">{t(loc, "lesson.examples")}</h2>
        {content.examples.map((ex) => (
          <div key={ex.title} className="rounded-3xl border border-[var(--line)] p-6 bg-white dark:bg-ink-900">
            <div className="text-sm text-ink-500">{ex.title}</div>
            <p className="mt-2">{ex.body}</p>
            {ex.formula && (
              <div className="mt-3">
                <Formula latex={ex.formula} display />
              </div>
            )}
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-medium mb-3">{t(loc, "lesson.practice")}</h2>
        {content.practice.map((p, i) => (
          <div key={i} className="rounded-3xl border border-[var(--line)] p-6 bg-white dark:bg-ink-900 mb-3">
            <p>{p.prompt}</p>
            <input className="mt-3 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={practice[i] ?? ""} onChange={(e) => setPractice({ ...practice, [i]: e.target.value })} />
            <div className="flex gap-2 mt-3">
              <Button variant="secondary" onClick={() => setShow({ ...show, [i]: true })}>
                {t(loc, "hint")}
              </Button>
              <Button
                onClick={() => {
                  const ok = (practice[i] ?? "").toLowerCase().includes(p.answer.toLowerCase());
                  if (ok) addXp(XP_REWARDS.task, "Решена задача");
                  setShow({ ...show, [i]: true });
                }}
              >
                {t(loc, "submit")}
              </Button>
            </div>
            {show[i] && <p className="text-sm text-ink-600 mt-3">{p.hint} · Ориентир: {p.answer}</p>}
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={notUnderstood}>
          ❓ {t(loc, "dont.understand")}
        </Button>
        <Button variant="secondary" onClick={() => openTutor("Объясни иначе")}>
          🔄 {t(loc, "explain.again")}
        </Button>
        <Link href={`/tests?topic=${id}`}>
          <Button>{t(loc, "lesson.mini")}</Button>
        </Link>
        <Button
          variant="secondary"
          onClick={() => {
            addXp(XP_REWARDS.lesson, "Прочитан урок");
            markTopicProgress(id, topic?.subjectId ?? "math", 100);
            updateUser({
              learnedTopics: Array.from(new Set([...(user?.learnedTopics ?? []), id])),
            });
          }}
        >
          Отметить как изученное
        </Button>
      </div>

      {alt && (
        <div className="rounded-3xl border border-brand-200 bg-brand-50 dark:bg-brand-950 p-6">
          <p className="font-medium">{alt}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {ALT.map((a) => (
              <button key={a.k} className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-sm" onClick={() => openTutor(a.p)}>
                {t(loc, a.k)}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="rounded-3xl bg-white dark:bg-ink-900 border border-[var(--line)] p-6">
        <h2 className="font-medium">{t(loc, "lesson.summary")}</h2>
        <ul className="mt-3 list-disc ps-5 text-sm space-y-1">
          {content.summary.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          {t(loc, "lesson.next")}:{" "}
          <Link className="text-brand-700" href={`/lesson/${content.next}`}>
            {t(loc, `topic.${content.next}`)}
          </Link>
        </p>
      </section>
    </div>
  );
}
