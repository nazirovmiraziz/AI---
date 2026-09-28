"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLangSchool } from "@/lib/lang/use-school";
import { findLesson } from "@/lib/lang/curriculum";
import { isLessonOpen } from "@/lib/lang/progress";
import { ExercisePlayer } from "@/components/lang/ExercisePlayer";
import { Button } from "@/components/Button";
import { LockedCard, EmptyLearn } from "@/components/lang/bits";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ls, lang, meta, track, missHeart, completeLesson } = useLangSchool();
  const [done, setDone] = useState<{ correct: number; total: number; xp?: number; next?: string; unitReady?: string } | null>(null);

  const found = useMemo(() => (lang ? findLesson(lang, id) : null), [lang, id]);

  if (!ls.onboarded || !lang || !track) {
    return <EmptyLearn title="Сначала план" text="Урок откроется после выбора языка." href="/learn/start" cta="Начать" />;
  }
  if (!found) return <LockedCard title="Урок не найден" text="Вернись на карту обучения." href="/learn/map" cta="Карта" />;
  if (!isLessonOpen(track, found.lesson.id)) {
    return (
      <LockedCard
        title="Урок закрыт"
        text={`Заверши предыдущий шаг в модуле «${found.unit.title}», чтобы открыть этот урок.`}
        href={`/learn/unit/${found.unit.id}`}
        cta="К модулю"
      />
    );
  }

  const { unit, lesson } = found;
  const acc = done ? Math.round((done.correct / Math.max(1, done.total)) * 100) : 0;

  if (done) {
    return (
      <div className="mx-auto max-w-lg space-y-5 text-center">
        <p className="text-5xl" aria-hidden>
          🎉
        </p>
        <h1 className="text-3xl font-semibold">Урок пройден</h1>
        <p className="xp-pop text-2xl font-semibold text-[#2f6bff]">+{done.xp ?? 25} XP</p>
        <div className="panel-card grid grid-cols-3 gap-3 p-4 text-sm">
          <div>
            <div className="text-[var(--muted)]">Точность</div>
            <b>{acc}%</b>
          </div>
          <div>
            <div className="text-[var(--muted)]">Слова</div>
            <b>{lesson.newWords.length}</b>
          </div>
          <div>
            <div className="text-[var(--muted)]">Тема</div>
            <b>{unit.grammar.titleRu}</b>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {done.unitReady && (
            <Button href={`/learn/test/${unit.id}`} className="w-full">Тест модуля</Button>
          )}
          {done.next && (
            <Button href={`/learn/lesson/${done.next}`} className="w-full" variant={done.unitReady ? "secondary" : "primary"}>
              Следующий урок
            </Button>
          )}
          <Button variant="secondary" onClick={() => router.push(`/learn/unit/${unit.id}`)}>
            К модулю
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        {meta?.flag} {unit.level} · {unit.title}
      </p>
      <h1 className="mt-1 text-2xl font-semibold">{lesson.titleRu}</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {lesson.n}/{unit.lessons.length} · {lesson.minutes} мин
      </p>
      <div className="mt-6">
        <ExercisePlayer
          exercises={lesson.exercises}
          locale={meta?.locale ?? "en-GB"}
          hearts={ls.hearts}
          onHeart={missHeart}
          onFinish={({ correct, total }) => {
            const result = completeLesson(lesson.id, Math.round((correct / Math.max(1, total)) * 100), lesson.minutes);
            setDone({ correct, total, xp: result.xp, next: result.nextLessonId, unitReady: result.unitReady });
          }}
        />
      </div>
    </div>
  );
}
