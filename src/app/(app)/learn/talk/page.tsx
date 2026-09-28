"use client";

import { useState } from "react";
import { useLangSchool } from "@/lib/lang/use-school";
import { talkReply } from "@/lib/lang/ai-service";
import { allUnits } from "@/lib/lang/curriculum";
import { Button } from "@/components/Button";
import { EmptyLearn } from "@/components/lang/bits";
import { startRecognition } from "@/lib/lang/speech";

export default function TalkPage() {
  const { ls, lang, track } = useLangSchool();
  const units = lang ? allUnits(lang) : [];
  const scenes = units.map((u) => u.lessons.find((l) => l.exercises.some((e) => e.type === "talk"))?.exercises.find((e) => e.type === "talk")).filter(Boolean);
  const [scene, setScene] = useState(0);
  const [log, setLog] = useState<{ role: "ai" | "you"; text: string }[]>([]);
  const [text, setText] = useState("");
  const [turn, setTurn] = useState(0);
  const [score, setScore] = useState<{ vocabulary: number; grammar: number; fluency: number; notes: string[] } | null>(null);
  const current = scenes[scene];

  if (!ls.onboarded || !track) {
    return <EmptyLearn title="Сначала язык" text="Разговор откроется после плана." href="/learn/start" cta="Начать" />;
  }
  if (!current) {
    return <EmptyLearn title="Пока нет сцен" text="Пройди первый модуль — появится диалог." href="/learn/map" cta="Карта" />;
  }

  const sceneEx = current;

  function start() {
    const r = talkReply("", sceneEx.scene || sceneEx.prompt, 0);
    setLog([{ role: "ai", text: r.ai }]);
    setTurn(1);
    setScore(null);
  }

  function say(line: string) {
    const r = talkReply(line, sceneEx.scene || "", turn);
    setLog([...log, { role: "you", text: line }, { role: "ai", text: r.ai }]);
    setTurn(turn + 1);
    setText("");
    if (r.score) setScore(r.score);
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-semibold">Разговор</h1>
      <div className="flex flex-wrap gap-2">
        {scenes.map((s, i) => (
          <button
            key={i}
            type="button"
            className={`chip-btn ${scene === i ? "on" : ""}`}
            onClick={() => {
              setScene(i);
              setLog([]);
              setTurn(0);
              setScore(null);
            }}
          >
            {s?.scene}
          </button>
        ))}
      </div>
      {log.length === 0 ? (
        <div className="panel-card p-5">
          <p className="text-sm text-[var(--muted)]">{current.scene}</p>
          <p className="mt-2 font-medium">{current.prompt}</p>
          <Button className="mt-4" onClick={start}>
            Начать
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {log.map((m, i) => (
            <div key={i} className={`rounded-2xl px-4 py-3 text-sm ${m.role === "ai" ? "bg-[var(--brand-soft)]" : "border border-[var(--line)]"}`}>
              {m.text}
            </div>
          ))}
        </div>
      )}
      {log.length > 0 && !score && (
        <div className="flex gap-2">
          <input className="auth-field flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ответ" />
          <Button onClick={() => text.trim() && say(text.trim())}>Сказать</Button>
          <Button variant="secondary" onClick={() => startRecognition("en-GB", (t) => say(t), () => say(text || "Hello"))}>
            🎤
          </Button>
        </div>
      )}
      {score && (
        <div className="panel-card space-y-2 p-5">
          <p>
            Слова {score.vocabulary}% · Грамматика {score.grammar}% · Беглость {score.fluency}%
          </p>
          {score.notes.map((n) => (
            <p key={n} className="text-sm text-[var(--muted)]">
              {n}
            </p>
          ))}
          <p className="text-xs text-[var(--muted)]">Голос, если был, распознало устройство. Сервер школы его не разбирал.</p>
          <Button onClick={start}>Попробовать снова</Button>
        </div>
      )}
    </div>
  );
}
