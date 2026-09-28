"use client";

import { useEffect, useState } from "react";

export type StageMood = "idle" | "listen" | "think" | "speak" | "happy" | "error";
export type BotMood = StageMood;

const SCENES = [
  {
    subject: "Algebra",
    ask: "I don’t get 2x + 5 = 17",
    lines: [
      { eq: "2x + 5 = 17", note: "Keep both sides equal." },
      { eq: "2x = 12", note: "Subtract 5 from each side." },
      { eq: "x = 6", note: "Divide by 2. That’s x." },
    ],
  },
  {
    subject: "English",
    ask: "I ___ to school every day.",
    lines: [
      { eq: "habit → Present Simple", note: "This happens every day." },
      { eq: "I + go", note: "With I we use go, not goes." },
      { eq: "I go to school.", note: "That’s the full sentence." },
    ],
  },
  {
    subject: "Physics",
    ask: "F = ma. m = 2 kg, a = 3 m/s²",
    lines: [
      { eq: "F = m × a", note: "Force is mass times acceleration." },
      { eq: "F = 2 × 3", note: "Put the numbers in." },
      { eq: "F = 6 N", note: "The unit is newtons." },
    ],
  },
];

const TOTAL = SCENES.reduce((n, s) => n + s.lines.length, 0);
const CHIPS = ["π", "Hello", "你好", "Σ", "F=ma"];

function at(tick: number) {
  let n = ((tick % TOTAL) + TOTAL) % TOTAL;
  for (let i = 0; i < SCENES.length; i++) {
    if (n < SCENES[i].lines.length) return { scene: i, step: n };
    n -= SCENES[i].lines.length;
  }
  return { scene: 0, step: 0 };
}

export function AiMark({ mood = "idle" }: { mood?: StageMood }) {
  return (
    <span className={`ai-mark ${mood}`} aria-hidden>
      <i />
      <i />
    </span>
  );
}

export function LessonBoard({
  size = "lg",
  mood = "idle",
  look: _look = true,
}: {
  size?: "sm" | "md" | "lg";
  mood?: StageMood;
  look?: boolean;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (size === "sm") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTick(2);
      return;
    }
    const id = window.setInterval(() => setTick((n) => n + 1), 2200);
    return () => window.clearInterval(id);
  }, [size]);

  if (size === "sm") return <AiMark mood={mood} />;

  const { scene, step } = at(tick);
  const live = SCENES[scene];
  const current = live.lines[step];
  const status =
    mood === "think"
      ? "thinking"
      : mood === "listen"
        ? "listening"
        : mood === "speak"
          ? "explaining"
          : mood === "error"
            ? "retry"
            : "live";

  return (
    <div className={`lb-frame ${size}`}>
      <div className={`lesson-board ${size} ${mood}`}>
        <div className="lb-top">
          <span className={`lb-dot ${mood}`} />
          <strong>AI Tutor</strong>
          <span className="lb-sub">{live.subject}</span>
          <em>{status}</em>
        </div>
        {size === "lg" && (
          <p className="lb-ask">
            <span>You</span>
            {live.ask}
          </p>
        )}
        <div className="lb-slate" aria-live="polite">
          {live.lines.map((line, n) => (
            <p key={`${live.subject}-${line.eq}`} className={`lb-eq ${n < step ? "done" : n === step ? "now" : "wait"}`}>
              {line.eq}
            </p>
          ))}
        </div>
        <p className="lb-say">{current.note}</p>
        <ol className="lb-pips" aria-hidden>
          {SCENES.map((item, n) => (
            <li key={item.subject} className={n === scene ? "on" : ""} />
          ))}
        </ol>
        <div className="lb-chips">
          {CHIPS.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
