"use client";

import Link from "next/link";
import { CEFR_ORDER, type CefrLevel, type LanguageTrack, type LangUnit } from "@/lib/lang/types";
import { isLessonOpen, unitProgress } from "@/lib/lang/progress";
import { levelMeta } from "@/lib/lang/catalog";

export function LearningMap({
  units,
  track,
  languageId,
}: {
  units: LangUnit[];
  track: LanguageTrack;
  languageId: string;
}) {
  const groups = CEFR_ORDER.map((lv) => ({ lv, units: units.filter((u) => u.level === lv) }));
  return (
    <ol className="lang-map">
      {groups.map(({ lv, units: list }, gi) => {
        const meta = levelMeta(lv);
        const unlocked = isLevelOn(track, lv);
        const here = track.cefr === lv;
        const done = track.completedLevels.includes(lv);
        return (
          <li key={lv} className={`lang-level ${unlocked ? "open" : "lock"} ${here ? "here" : ""}`}>
            <div className="lang-level-head">
              <span className="lang-pin">{done ? "🏆" : unlocked ? (here ? "⭐" : "○") : "🔒"}</span>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{lv}</p>
                <h2 className="text-lg font-semibold">
                  {meta.titleRu} · {meta.title}
                </h2>
                {here && <p className="text-xs text-[#2f6bff]">Ты здесь</p>}
                {!unlocked && (
                  <p className="text-sm text-[var(--muted)]">
                    Сначала заверши {CEFR_ORDER[gi - 1] ?? "старт"}, чтобы открыть этот уровень.
                  </p>
                )}
              </div>
            </div>
            {unlocked && list.length === 0 && (
              <p className="mt-3 text-sm text-[var(--muted)]">Полный курс этого уровня скоро. Пока можно повторять предыдущий.</p>
            )}
            {unlocked && (
              <ul className="mt-4 space-y-3">
                {list.map((u) => {
                  const pct = unitProgress(track, languageId as never, u.id);
                  const open = u.lessons.some((l) => isLessonOpen(track, l.id));
                  const doneU = track.completedUnits.includes(u.id);
                  return (
                    <li key={u.id}>
                      {open ? (
                        <Link href={`/learn/unit/${u.id}`} className="lang-unit-card">
                          <UnitRow u={u} pct={pct} done={doneU} />
                        </Link>
                      ) : (
                        <div className="lang-unit-card lock">
                          <UnitRow u={u} pct={pct} done={false} locked />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function UnitRow({ u, pct, done, locked }: { u: LangUnit; pct: number; done: boolean; locked?: boolean }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--muted)]">
            Unit {u.n} · {u.level}
          </p>
          <p className="font-semibold">
            {u.title} — {u.titleRu}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{u.goal}</p>
        </div>
        <span>{locked ? "🔒" : done ? "✓" : `${pct}%`}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
        <div className="h-full bg-[#2f6bff]" style={{ width: `${pct}%` }} />
      </div>
      {locked && <p className="mt-2 text-xs text-[var(--muted)]">Заверши предыдущий модуль, чтобы открыть этот.</p>}
    </>
  );
}

function isLevelOn(track: LanguageTrack, lv: CefrLevel) {
  const order = CEFR_ORDER.indexOf(lv);
  const cur = CEFR_ORDER.indexOf(track.cefr);
  if (order <= cur) return true;
  if (track.completedLevels.includes(CEFR_ORDER[order - 1])) return true;
  return track.completedLevels.includes(lv);
}
