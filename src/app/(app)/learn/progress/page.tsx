"use client";

import Link from "next/link";
import { useLangSchool } from "@/lib/lang/use-school";
import { EmptyLearn, SkillMeter } from "@/components/lang/bits";
import { weekActivity } from "@/lib/cabinet";
import { allUnits } from "@/lib/lang/curriculum";

export default function LangProgressPage() {
  const { user, ls, lang, meta, track } = useLangSchool();
  if (!ls.onboarded || !track || !lang) {
    return <EmptyLearn title="Прогресс появится здесь" text="После первого урока увидишь график." href="/learn/start" cta="Начать" />;
  }
  const week = weekActivity(user?.activityDays);
  const units = allUnits(lang);
  const doneL = track.completedLessons.length;
  const allL = units.flatMap((u) => u.lessons).length;
  const words = Object.keys(track.vocab).length;
  const overall = Math.round((doneL / Math.max(1, allL)) * 100);
  const weekly = user?.weeklyMinutes ?? [0, 0, 0, 0, 0, 0, 0];
  const maxM = Math.max(30, ...weekly);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Прогресс</h1>
      <section className="panel-card p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
          {meta?.flag} {meta?.name}
        </p>
        <p className="mt-2 text-2xl font-semibold">
          {track.cefr} — {overall}%
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">{words} слов в работе · {doneL} уроков</p>
      </section>
      <section className="panel-card space-y-3 p-5">
        <SkillMeter label="Слова" value={track.skills.vocabulary} />
        <SkillMeter label="Грамматика" value={track.skills.grammar} />
        <SkillMeter label="Слух" value={track.skills.listening} />
        <SkillMeter label="Речь" value={track.skills.speaking} />
        <SkillMeter label="Чтение" value={track.skills.reading} />
        <SkillMeter label="Письмо" value={track.skills.writing} />
      </section>
      <section className="panel-card p-5">
        <h2 className="font-semibold">Последние 7 дней</h2>
        <div className="mt-4 flex items-end gap-2 h-28">
          {weekly.map((m, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t-lg bg-[#2f6bff]/80" style={{ height: `${(m / maxM) * 100}%`, minHeight: m ? 6 : 2 }} />
              <span className="text-[10px] text-[var(--muted)]">{["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][i]}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel-card p-5">
        <h2 className="font-semibold">Серия</h2>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px]">
          {week.map((d) => (
            <div key={d.key} className={`rounded-xl py-2 ${d.done ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-[var(--line)]/50"}`}>
              {d.done ? "✓" : "○"}
            </div>
          ))}
        </div>
      </section>
      <p className="text-sm text-[var(--muted)]">
        Совет: чаще всего проседает {Object.entries(track.skills).sort((a, b) => a[1] - b[1])[0]?.[0]}.{" "}
        <Link href="/learn/ai" className="text-[#2f6bff]">
          Спросить репетитора
        </Link>
      </p>
    </div>
  );
}
