"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { XP_REWARDS } from "@/lib/demo-data";

const PRESETS = [
  { id: "25", work: 25 * 60, rest: 5 * 60, label: "25 / 5" },
  { id: "50", work: 50 * 60, rest: 10 * 60, label: "50 / 10" },
];

export function FocusTimer({ compact = false }: { compact?: boolean }) {
  const { addStudyMinutes, addXp, pushNotice, user } = useApp();
  const loc = user?.language ?? "ru";
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState(PRESETS[0]);
  const [custom, setCustom] = useState(25);
  const [left, setLeft] = useState(PRESETS[0].work);
  const [on, setOn] = useState(false);
  const [done, setDone] = useState(false);
  const credited = useRef(false);

  useEffect(() => {
    const openIt = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("ssai-timer", openIt);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("ssai-timer", openIt);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setOn(false);
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [on]);

  useEffect(() => {
    if (!done || credited.current) return;
    credited.current = true;
    const minutes = Math.max(1, Math.round(preset.work / 60));
    addStudyMinutes(minutes);
    addXp(XP_REWARDS.focus, "Фокус-сессия");
    pushNotice({ kind: "task", title: t(loc, "focus.done"), text: `${minutes} мин в фокусе`, href: "/progress" });
  }, [done, addStudyMinutes, addXp, pushNotice, preset.work, loc]);

  function pick(p: (typeof PRESETS)[0]) {
    setPreset(p);
    setLeft(p.work);
    setOn(false);
    setDone(false);
    credited.current = false;
  }

  function startCustom() {
    const work = Math.max(5, custom) * 60;
    setPreset({ id: "c", work, rest: 5 * 60, label: `${custom} / 5` });
    setLeft(work);
    setOn(false);
    setDone(false);
    credited.current = false;
  }

  const m = String(Math.floor(left / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");

  return (
    <>
      <button
        type="button"
        className={compact ? "icon-chip" : "hidden sm:inline-flex items-center rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)]"}
        onClick={() => setOpen(true)}
        aria-label={t(loc, "focus.title")}
      >
        {on ? `${m}:${s}` : "Фокус"}
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink-950/40 p-4" onClick={() => setOpen(false)}>
          <div className="panel-card w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="focus-title">
            <p className="gold-kicker">{t(loc, "focus.title")}</p>
            <p id="focus-title" className="mt-4 font-mono text-6xl tracking-tight">{m}:{s}</p>
            {done && <p className="mt-3 text-sm text-[var(--ok)]">{t(loc, "focus.done")}</p>}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {PRESETS.map((p) => (
                <button key={p.id} type="button" className={`chip-btn ${preset.id === p.id ? "on" : ""}`} onClick={() => pick(p)}>
                  {p.label}
                </button>
              ))}
              <label className="chip-btn">
                Custom
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={custom}
                  onChange={(e) => setCustom(Number(e.target.value))}
                  onBlur={startCustom}
                  className="ml-2 w-12 bg-transparent outline-none"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-center gap-2">
              <button type="button" className="btn-primary px-5 py-2.5" onClick={() => { setDone(false); setOn((v) => !v); if (left === 0) { setLeft(preset.work); credited.current = false; } }}>
                {on ? t(loc, "focus.pause") : t(loc, "focus.start")}
              </button>
              <button type="button" className="btn-secondary px-5 py-2.5" onClick={() => setOpen(false)}>
                {t(loc, "cta.continue")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
