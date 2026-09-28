"use client";

import { weekActivity, weekdayKeys } from "@/lib/cabinet";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function StreakWeek({ days, locale }: { days?: string[]; locale: Locale }) {
  const week = weekActivity(days);
  return (
    <div className="streak-week" role="list">
      {week.map((d) => (
        <div key={d.key} className={`streak-day ${d.done ? "on" : ""} ${d.today ? "today" : ""}`} role="listitem">
          <span>{t(locale, `week.${d.key}`)}</span>
          <b>{d.done ? "✓" : "○"}</b>
        </div>
      ))}
    </div>
  );
}

export function WeekBars({ data, labels }: { data: number[]; labels?: string[] }) {
  const max = Math.max(...data, 1);
  const keys = weekdayKeys();
  return (
    <div className="week-bars" aria-hidden={false}>
      {data.map((v, i) => (
        <div key={i} className="week-bar">
          <div className="week-bar-col" style={{ height: `${Math.max(8, (v / max) * 100)}%` }} title={`${v}`} />
          <span>{labels?.[i] ?? keys[i]}</span>
        </div>
      ))}
    </div>
  );
}
