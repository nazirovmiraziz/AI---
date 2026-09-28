"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLangSchool } from "@/lib/lang/use-school";
import { findUnit } from "@/lib/lang/curriculum";
import { isLessonOpen } from "@/lib/lang/progress";
import { Button } from "@/components/Button";
import { LockedCard, EmptyLearn } from "@/components/lang/bits";

export default function UnitPage() {
  const { id } = useParams<{ id: string }>();
  const { ls, lang, track } = useLangSchool();
  if (!ls.onboarded || !lang || !track) {
    return <EmptyLearn title="Сначала язык" text="Модуль откроется после плана." href="/learn/start" cta="Выбрать язык" />;
  }
  const unit = findUnit(lang, id);
  if (!unit) return <LockedCard title="Модуль не найден" text="Вернись на карту." href="/learn/map" cta="Карта" />;
  const open = unit.lessons.some((l) => isLessonOpen(track, l.id));
  if (!open) {
    return (
      <LockedCard
        title="Модуль ещё закрыт"
        text={`Заверши предыдущий модуль, чтобы открыть «${unit.title}».`}
        href="/learn/map"
        cta="К карте"
      />
    );
  }
  const lessonsDone = unit.lessons.every((l) => track.completedLessons.includes(l.id));
  const testOpen = lessonsDone;
  const testDone = track.completedUnits.includes(unit.id);

  return (
    <div className="space-y-5">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        {unit.level} · Unit {unit.n}
      </p>
      <h1 className="text-3xl font-semibold">
        {unit.title} — {unit.titleRu}
      </h1>
      <p className="text-[var(--muted)]">{unit.goal}</p>
      <div className="grid gap-2">
        {unit.lessons.map((l) => {
          const ok = isLessonOpen(track, l.id);
          const done = track.completedLessons.includes(l.id);
          const inner = (
            <div className={`panel-card flex items-center justify-between p-4 ${!ok ? "opacity-60" : ""}`}>
              <div>
                <p className="text-xs text-[var(--muted)]">
                  Урок {l.n} · {l.minutes} мин · {l.skill}
                </p>
                <p className="font-medium">{l.titleRu}</p>
              </div>
              <span>{!ok ? "🔒" : done ? "✓" : "→"}</span>
            </div>
          );
          return ok ? (
            <Link key={l.id} href={`/learn/lesson/${l.id}`}>
              {inner}
            </Link>
          ) : (
            <div key={l.id}>{inner}</div>
          );
        })}
      </div>
      <div className="panel-card p-4">
        <p className="font-medium">Тест модуля</p>
        {!testOpen && <p className="mt-1 text-sm text-[var(--muted)]">Сначала пройди уроки этого модуля.</p>}
        {testOpen && !testDone && (
          <Button href={`/learn/test/${unit.id}`} className="mt-3">Пройти тест</Button>
        )}
        {testDone && (
          <p className="mt-2 text-sm">
            Сдано · {track.unitScores[unit.id] ?? "—"}%{" "}
            <Link href={`/learn/test/${unit.id}`} className="text-[#2f6bff]">
              Повторить
            </Link>
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={`/learn/grammar?unit=${unit.id}`} className="chip-btn">
          Грамматика
        </Link>
        <Link href={`/learn/vocab?unit=${unit.id}`} className="chip-btn">
          Слова
        </Link>
        <Link href="/learn/map" className="chip-btn">
          Карта
        </Link>
      </div>
    </div>
  );
}
