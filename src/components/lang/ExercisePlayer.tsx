"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import type { Exercise } from "@/lib/lang/types";
import { speakText, startRecognition, stopSpeak } from "@/lib/lang/speech";
import { talkReply, writingFeedback } from "@/lib/lang/ai-service";

const EMOJI: Record<string, string> = {
  hello: "👋", hi: "👋", goodbye: "👋", please: "🙏", "thank you": "🙏", yes: "✅", no: "❌",
  apple: "🍎", coffee: "☕", tea: "🍵", bread: "🍞", water: "💧", food: "🍽️",
  family: "👨‍👩‍👧", mother: "👩", father: "👨", sister: "👧", brother: "👦",
  home: "🏠", room: "🚪", kitchen: "🍳", bed: "🛏️", table: "🪑",
  bus: "🚌", train: "🚆", station: "🚉", ticket: "🎫", map: "🗺️", airport: "✈️",
  shop: "🛍️", money: "💶", clock: "🕐", morning: "🌅", evening: "🌆",
};

function norm(s: string) {
  return s.trim().toLowerCase().replace(/[.,!?'’]/g, "").replace(/\s+/g, " ");
}

function asText(a: string | string[]) {
  return Array.isArray(a) ? a.join(" ") : a;
}

function shuffle<T>(arr: T[], seed: string) {
  const a = [...arr];
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  for (let i = a.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ExercisePlayer({
  exercises,
  locale,
  hearts,
  onHeart,
  onFinish,
}: {
  exercises: Exercise[];
  locale: string;
  hearts: number;
  onHeart: () => void;
  onFinish: (r: { correct: number; total: number }) => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [built, setBuilt] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "hint" | "ok" | "bad">("idle");
  const [correct, setCorrect] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showScript, setShowScript] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState("");
  const [talk, setTalk] = useState<{ role: "ai" | "you"; text: string }[]>([]);
  const [talkTurn, setTalkTurn] = useState(0);
  const [talkScore, setTalkScore] = useState<{ vocabulary: number; grammar: number; fluency: number; notes: string[] } | null>(null);
  const [writeView, setWriteView] = useState<ReturnType<typeof writingFeedback> | null>(null);

  const ex = exercises[i];
  const total = exercises.length;
  const bank = useMemo(() => {
    if (!ex || ex.type !== "order") return [];
    const words = Array.isArray(ex.answer) ? ex.answer : asText(ex.answer).split(" ");
    return shuffle(words, ex.id);
  }, [ex]);
  const rightBank = useMemo(() => {
    if (!ex?.pairs) return [];
    return shuffle(ex.pairs.map((p) => p.right), ex.id + "r");
  }, [ex]);

  if (!ex) return null;

  function resetLocal() {
    setPicked(null);
    setTyped("");
    setBuilt([]);
    setMatched([]);
    setLeftPick(null);
    setStatus("idle");
    setShowScript(false);
    setVoiceNote("");
    setWriteView(null);
    setTalk([]);
    setTalkTurn(0);
    setTalkScore(null);
  }

  function goNext(ok: boolean) {
    const n = correct + (ok ? 1 : 0);
    setCorrect(n);
    if (i + 1 >= total) {
      onFinish({ correct: n, total });
      return;
    }
    setI(i + 1);
    resetLocal();
  }

  function judge(ok: boolean) {
    if (ok) setStatus("ok");
    else {
      setStatus(status === "hint" ? "bad" : "hint");
      if (status !== "bad") onHeart();
    }
  }

  function checkChoice(val?: string) {
    const v = val ?? picked ?? typed;
    const ans = asText(ex.answer);
    const ok = norm(v) === norm(ans) || (Array.isArray(ex.answer) && norm(v) === norm(ex.answer.join(" ")));
    judge(ok);
  }

  function play(text?: string) {
    stopSpeak();
    const t = text || ex.audio || ex.word || asText(ex.answer);
    const u = window.speechSynthesis?.getVoices?.();
    void u;
    const utter = t;
    if (!speakText(utter, locale, speed)) setVoiceNote("На этом устройстве нет озвучки. Прочитай фразу сам.");
  }

  function listenMic() {
    setListening(true);
    setVoiceNote("Слушаю…");
    const stop = startRecognition(
      locale,
      (text) => {
        setListening(false);
        setTyped(text);
        setVoiceNote("Распознано устройством, не сервером школы.");
      },
      () => {
        setListening(false);
        setVoiceNote("Голос недоступен. Набери фразу руками — так тоже считается.");
      },
    );
    window.setTimeout(() => stop(), 8000);
  }

  const heartsRow = "❤".repeat(Math.max(0, hearts)) + "♡".repeat(Math.max(0, 5 - hearts));

  return (
    <div className="lang-ex">
      <div className="flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
        <span>
          {i + 1}/{total}
        </span>
        <span className="tabular-nums tracking-widest text-rose-500" aria-label="Попытки">
          {heartsRow}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
        <div className="h-full rounded-full bg-[#2f6bff] transition-all" style={{ width: `${((i + (status === "ok" ? 1 : 0)) / total) * 100}%` }} />
      </div>

      <h2 className="mt-5 text-xl font-semibold leading-snug sm:text-2xl">{ex.prompt}</h2>
      {ex.scene && <p className="mt-1 text-sm text-[var(--muted)]">{ex.scene}</p>}

      {ex.word && (
        <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-5 text-center">
          <p className="text-3xl font-semibold tracking-tight">{ex.word}</p>
          {ex.translation && <p className="mt-2 text-[var(--muted)]">{ex.translation}</p>}
          {ex.example && <p className="mt-3 text-sm italic">«{ex.example}»</p>}
          <button type="button" className="btn-secondary mt-4" onClick={() => play(ex.word)}>
            🔊 Слушать
          </button>
        </div>
      )}

      {ex.passage && ex.type !== "grammar" && (
        <ReadPassage text={ex.passage} />
      )}
      {ex.type === "grammar" && ex.passage && (
        <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-4 text-sm leading-relaxed">
          {ex.passage}
        </div>
      )}

      {ex.type === "listen" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => play(ex.audio)}>
            ▶ Слушать
          </Button>
          <button type="button" className="chip-btn" onClick={() => setSpeed((s) => (s === 1 ? 0.75 : s === 0.75 ? 1.25 : 1))}>
            {speed}×
          </button>
          <button type="button" className="chip-btn" onClick={() => play(ex.audio)}>
            Ещё раз
          </button>
          <button type="button" className="chip-btn" onClick={() => setShowScript((v) => !v)}>
            {showScript ? "Скрыть текст" : "Показать текст"}
          </button>
        </div>
      )}
      {showScript && ex.audio && <p className="mt-2 text-sm text-[var(--muted)]">{ex.audio}</p>}

      {(ex.type === "choice" || ex.type === "listen" || ex.type === "read" || ex.type === "image") && ex.options && (
        <div className={`mt-5 grid gap-2 ${ex.type === "image" ? "grid-cols-2" : ""}`}>
              {(ex.imageOptions?.length ? ex.imageOptions : (ex.options ?? []).map((label) => ({ id: label, emoji: EMOJI[ex.word ?? ""] || "✨", label }))).map((opt) => (
            <button
              key={typeof opt === "string" ? opt : opt.label}
              type="button"
              disabled={status === "ok"}
              onClick={() => setPicked(typeof opt === "string" ? opt : opt.label)}
              className={`ex-opt ${picked === (typeof opt === "string" ? opt : opt.label) ? "on" : ""}`}
            >
              {ex.type === "image" && <span className="mr-2 text-xl">{typeof opt === "string" ? "✨" : opt.emoji}</span>}
              {typeof opt === "string" ? opt : opt.label}
            </button>
          ))}
        </div>
      )}

      {(ex.type === "translate" || ex.type === "blank" || ex.type === "grammar" || ex.type === "speak") && !ex.options && (
        <div className="mt-4">
          <input
            className="auth-field"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={ex.type === "blank" ? "Слово в пропуск" : "Твой ответ"}
            aria-label="Ответ"
          />
          {ex.type === "speak" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={listenMic}>
                🎤 {listening ? "Слушаю…" : "Нажми и говори"}
              </Button>
              <button type="button" className="chip-btn" onClick={() => play(asText(ex.answer))}>
                🔊 Образец
              </button>
            </div>
          )}
          {voiceNote && <p className="mt-2 text-xs text-[var(--muted)]">{voiceNote}</p>}
        </div>
      )}

      {ex.type === "order" && (
        <div className="mt-4 space-y-3">
          <div className="flex min-h-12 flex-wrap gap-2 rounded-2xl border border-dashed border-[var(--line)] p-3">
            {built.length === 0 && <span className="text-sm text-[var(--muted)]">Собери фразу</span>}
            {built.map((w, idx) => (
              <button key={`${w}-${idx}`} type="button" className="chip-btn" onClick={() => setBuilt(built.filter((_, j) => j !== idx))}>
                {w}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {bank.map((w, idx) => (
              <button
                key={`${w}-${idx}`}
                type="button"
                className="chip-btn"
                disabled={built.filter((x) => x === w).length >= bank.filter((x) => x === w).length && built.includes(w) && built.filter((x) => x === w).length >= bank.filter((x) => x === w).length}
                onClick={() => setBuilt([...built, w])}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      {ex.type === "match" && ex.pairs && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="space-y-2">
            {ex.pairs.map((p) => (
              <button
                key={p.left}
                type="button"
                disabled={matched.includes(p.left)}
                className={`ex-opt ${leftPick === p.left ? "on" : ""} ${matched.includes(p.left) ? "ok" : ""}`}
                onClick={() => setLeftPick(p.left)}
              >
                {p.left}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {rightBank.map((r) => (
              <button
                key={r}
                type="button"
                className="ex-opt"
                disabled={matched.some((l) => ex.pairs?.find((p) => p.left === l)?.right === r)}
                onClick={() => {
                  if (!leftPick) return;
                  const pair = ex.pairs?.find((p) => p.left === leftPick);
                  if (pair?.right === r) {
                    setMatched([...matched, leftPick]);
                    setLeftPick(null);
                    if (matched.length + 1 >= (ex.pairs?.length ?? 0)) setStatus("ok");
                  } else {
                    judge(false);
                    setLeftPick(null);
                  }
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {ex.type === "write" && !writeView && (
        <textarea className="auth-field mt-4 min-h-32" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Пиши своими словами" />
      )}
      {ex.type === "write" && writeView && (
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-2xl border border-[var(--line)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Твой текст</p>
            <p className="mt-1">{writeView.original}</p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Более ровный вариант</p>
            <p className="mt-1">{writeView.better}</p>
            <p className="mt-2 text-[var(--muted)]">{writeView.explain}</p>
          </div>
        </div>
      )}

      {ex.type === "talk" && (
        <div className="mt-4 space-y-3">
          {talk.length === 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const r = talkReply("", ex.scene || "", 0);
                setTalk([{ role: "ai", text: r.ai }]);
                setTalkTurn(1);
              }}
            >
              Начать разговор
            </button>
          )}
          {talk.map((m, idx) => (
            <div key={idx} className={`rounded-2xl px-4 py-3 text-sm ${m.role === "ai" ? "bg-[var(--brand-soft)]" : "border border-[var(--line)]"}`}>
              <span className="text-xs text-[var(--muted)]">{m.role === "ai" ? "Репетитор" : "Ты"}</span>
              <p className="mt-1">{m.text}</p>
            </div>
          ))}
          {talk.length > 0 && !talkScore && (
            <div className="flex gap-2">
              <input className="auth-field flex-1" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Ответь по ситуации" />
              <Button
                onClick={() => {
                  if (!typed.trim()) return;
                  const r = talkReply(typed, ex.scene || "", talkTurn);
                  setTalk([...talk, { role: "you", text: typed }, { role: "ai", text: r.ai }]);
                  setTyped("");
                  setTalkTurn(talkTurn + 1);
                  if (r.score) {
                    setTalkScore(r.score);
                    setStatus("ok");
                  }
                }}
              >
                Сказать
              </Button>
            </div>
          )}
          {talkScore && (
            <div className="rounded-2xl border border-[var(--line)] p-4 text-sm">
              <p>Слова {talkScore.vocabulary}% · Грамматика {talkScore.grammar}% · Беглость {talkScore.fluency}%</p>
              {talkScore.notes[0] && <p className="mt-2 text-[var(--muted)]">{talkScore.notes[0]} Не копируй слепо — скажи ещё раз своими словами.</p>}
            </div>
          )}
        </div>
      )}

      {ex.type === "recall" && status === "idle" && (
        <p className="mt-4 text-sm text-[var(--muted)]">Когда запомнишь — жми дальше.</p>
      )}

      {status === "hint" && (
        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
          Подсказка: {ex.hint}
        </p>
      )}
      {status === "bad" && (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-950 dark:bg-rose-950/30 dark:text-rose-100">
          {ex.explain} Можно повторить этот шаг ещё раз позже.
        </p>
      )}
      {status === "ok" && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-100">
          Верно. {ex.explain}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {status === "idle" || status === "hint" ? (
          <Button
            onClick={() => {
              if (ex.type === "recall") {
                setStatus("ok");
                return;
              }
              if (ex.type === "match") {
                if (matched.length >= (ex.pairs?.length ?? 0)) setStatus("ok");
                else judge(false);
                return;
              }
              if (ex.type === "order") {
                judge(norm(built.join(" ")) === norm(asText(ex.answer)));
                return;
              }
              if (ex.type === "write") {
                if (typed.trim().length < 8) {
                  judge(false);
                  return;
                }
                setWriteView(writingFeedback(typed, ex.prompt));
                setStatus("ok");
                return;
              }
              if (ex.type === "talk") {
                if (talkScore) setStatus("ok");
                else judge(talk.length > 2);
                return;
              }
              if (ex.type === "image" && ex.imageOptions) {
                judge(norm(picked || "") === norm(asText(ex.answer)));
                return;
              }
              checkChoice();
            }}
          >
            Проверить
          </Button>
        ) : (
          <Button onClick={() => goNext(status === "ok")}>{i + 1 >= total ? "Завершить" : "Дальше"}</Button>
        )}
        {status === "hint" && (
          <Button variant="secondary" onClick={() => goNext(false)}>
            Показать и идти дальше
          </Button>
        )}
      </div>
    </div>
  );
}

function ReadPassage({ text }: { text: string }) {
  const [tip, setTip] = useState<string | null>(null);
  const words = text.split(/(\s+)/);
  return (
    <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-4 leading-relaxed">
      {words.map((w, i) =>
        /\s+/.test(w) ? (
          <span key={i}>{w}</span>
        ) : (
          <button
            key={i}
            type="button"
            className="rounded px-0.5 hover:bg-[#2f6bff]/10"
            onClick={() => setTip(w.replace(/[.,!?]/g, "").toLowerCase())}
          >
            {w}
          </button>
        ),
      )}
      {tip && (
        <div className="mt-3 rounded-xl bg-[var(--brand-soft)] px-3 py-2 text-sm">
          <b>{tip}</b>
          <p className="text-[var(--muted)]">Нажми «В словарь» на странице слов, если хочешь повторять это слово.</p>
          <button type="button" className="mt-1 text-xs text-[#2f6bff]" onClick={() => setTip(null)}>
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
}
