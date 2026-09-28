"use client";

import Link from "next/link";
import { useLangSchool } from "@/lib/lang/use-school";
import { LearningMap } from "@/components/lang/LearningMap";
import { EmptyLearn } from "@/components/lang/bits";

export default function MapPage() {
  const { ls, lang, track, units, meta } = useLangSchool();
  if (!ls.onboarded || !track || !lang) {
    return <EmptyLearn title="Сначала выбери язык" text="Карта появится после короткого плана." href="/learn/start" cta="Начать" />;
  }
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{meta?.flag} {meta?.name}</p>
        <h1 className="mt-1 text-3xl font-semibold">Учебный путь</h1>
        <p className="mt-2 text-[var(--muted)]">Уровни открываются по одному. Внутри — модули, уроки и тест.</p>
      </div>
      <LearningMap units={units} track={track} languageId={lang} />
      <Link href="/learn" className="text-sm text-[#2f6bff]">
        ← На главную
      </Link>
    </div>
  );
}
