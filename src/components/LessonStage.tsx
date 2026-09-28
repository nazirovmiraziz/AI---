"use client";

import { useEffect, useState } from "react";

const BEATS = [
  { who: "you" as const, text: "Не понимаю, как решать 3x + 5 = 20" },
  { who: "ai" as const, text: "Ответ не дам. Скажи: что прибавляют к 3x?" },
  { who: "you" as const, text: "Пятёрку." },
  { who: "ai" as const, text: "Верно. Убери её с обеих сторон. Что останется?" },
];

const BOARD = ["3x + 5 = 20", "3x = 15", "x = ?"];

export function LessonStage() {
  const [beat, setBeat] = useState(0);
  const [typed, setTyped] = useState(BEATS[0].text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBeat(BEATS.length - 1);
      setTyped(BEATS[BEATS.length - 1].text);
      return;
    }
    const next = window.setInterval(() => {
      setBeat((n) => {
        const i = n + 1 >= BEATS.length ? 0 : n + 1;
        setTyped("");
        return i;
      });
    }, 2600);
    return () => window.clearInterval(next);
  }, []);

  useEffect(() => {
    const full = BEATS[beat].text;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(full);
      return;
    }
    let i = 0;
    setTyped("");
    const id = window.setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 22);
    return () => window.clearInterval(id);
  }, [beat]);

  const shown = BEATS.slice(0, beat + 1);
  const board = BOARD[Math.min(beat, BOARD.length - 1)];

  return (
    <div className="lesson-stage">
      <div className="lesson-stage-top">
        <div>
          <p className="text-[11px] font-semibold text-[#163068]">Урок идёт сейчас</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Математика · 7 класс · без готового ответа</p>
        </div>
        <span className="live-dot live-dot-gold">live</span>
      </div>
      <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-0">
        <div className="space-y-3 p-4 min-h-[280px]">
          {shown.map((m, i) => {
            const last = i === shown.length - 1;
            return (
              <div key={`${m.who}-${i}`} className={`flex ${m.who === "you" ? "justify-end" : "justify-start"}`}>
                <div className={m.who === "you" ? "bubble-you" : "bubble-ai"}>
                  {last ? typed : m.text}
                  {last && typed.length < m.text.length ? <span className="caret" aria-hidden /> : null}
                </div>
              </div>
            );
          })}
        </div>
        <aside className="board-pane">
          <p className="text-[10px] font-semibold text-[#163068]">доска</p>
          <p className="font-display mt-4 text-3xl leading-tight text-[var(--text)]">{board}</p>
          <p className="mt-6 text-sm text-[#5c6573]">Следующий шаг — твой. Репетитор ждёт ход, не списывание.</p>
        </aside>
      </div>
    </div>
  );
}
