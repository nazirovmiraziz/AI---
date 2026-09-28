"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLangSchool } from "@/lib/lang/use-school";
import { findUnit } from "@/lib/lang/curriculum";
import { ExercisePlayer } from "@/components/lang/ExercisePlayer";
import { Button } from "@/components/Button";
import { LockedCard, EmptyLearn } from "@/components/lang/bits";

export default function UnitTestPage() {
  const { unitId } = useParams<{ unitId: string }>();
  const { ls, lang, meta, track, missHeart, completeUnitTest } = useLangSchool();
  const [done, setDone] = useState<{ pct: number; pass: boolean; next?: string; level?: string } | null>(null);

  if (!ls.onboarded || !lang || !track) {
    return <EmptyLearn title="Сначала язык" text="Тест появится после плана." href="/learn/start" cta="Начать" />;
  }
  const unit = findUnit(lang, unitId);
  if (!unit) return <LockedCard title="Тест не найден" text="Вернись на карту." href="/learn/map" cta="Карта" />;
  const ready = unit.lessons.every((l) => track.completedLessons.includes(l.id));
  if (!ready) {
    return (
      <LockedCard
        title="Тест ещё закрыт"
        text={`Сначала заверши уроки модуля «${unit.title}».`}
        href={`/learn/unit/${unit.id}`}
        cta="К урокам"
      />
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-3xl font-semibold">{done.pass ? "Модуль сдан" : "Пока не сдано"}</h1>
        <p className="text-4xl font-semibold">{done.pct}%</p>
        <p className="text-[var(--muted)]">
          {done.pass
            ? "Можно идти дальше. Слабые места всё равно стоит повторить."
            : "Ничего страшного. Давай повторим слабые темы и попробуем снова."}
        </p>
        {done.level && (
          <p className="panel-card p-4">
            Уровень {done.level} закрыт. Открыт сертификат.
            <Link href="/learn/certificates" className="mt-2 block text-[#2f6bff]">
              Смотреть сертификат
            </Link>
          </p>
        )}
        <div className="flex flex-col gap-2">
          {done.pass && done.next && (
            <Button href={`/learn/lesson/${done.next}`} className="w-full">Следующий модуль</Button>
          )}
          {!done.pass && (
            <Button href={`/learn/unit/${unit.id}`} className="w-full">Повторить ошибки</Button>
          )}
          <Button href="/learn/map" variant="secondary" className="w-full">
            Карта
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Тест модуля</p>
      <h1 className="mt-1 text-2xl font-semibold">
        {unit.title} — {unit.titleRu}
      </h1>
      <div className="mt-6">
        <ExercisePlayer
          exercises={unit.test}
          locale={meta?.locale ?? "en-GB"}
          hearts={ls.hearts}
          onHeart={missHeart}
          onFinish={({ correct, total }) => {
            const pct = Math.round((correct / Math.max(1, total)) * 100);
            const r = completeUnitTest(unit.id, pct);
            setDone({ pct, pass: pct >= 70, next: r.nextLessonId, level: r.levelDone });
          }}
        />
      </div>
    </div>
  );
}
