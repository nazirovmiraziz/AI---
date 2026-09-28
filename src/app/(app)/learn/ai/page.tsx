"use client";

import { FormEvent, useState } from "react";
import { useLangSchool } from "@/lib/lang/use-school";
import { languageTutorAsk, LANG_TUTOR_NAME } from "@/lib/lang/ai-service";
import { Button } from "@/components/Button";
import { EmptyLearn } from "@/components/lang/bits";
import { findLesson } from "@/lib/lang/curriculum";
import Link from "next/link";

export default function LangAiPage() {
  const { user, ls, lang, meta, track, addChat, rec } = useLangSchool();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const recLesson = rec?.lessonId && lang ? findLesson(lang, rec.lessonId) : null;

  if (!ls.onboarded || !track) {
    return <EmptyLearn title="Сначала выбери язык" text="Репетитор появляется после плана." href="/learn/start" cta="Начать" />;
  }

  async function send(e?: FormEvent, preset?: string) {
    e?.preventDefault();
    const msg = (preset ?? text).trim();
    if (!msg || busy) return;
    setText("");
    setErr("");
    addChat("user", msg);
    setBusy(true);
    const history = (track?.chat ?? []).map((c) => ({ role: c.role, content: c.content }));
    try {
      const reply = await languageTutorAsk({
        message: msg,
        history,
        track,
        localeName: meta?.name ?? "English",
        student: user,
      });
      addChat("assistant", reply);
    } catch {
      setErr("Не удалось получить ответ.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> {LANG_TUTOR_NAME} на связи
          </p>
          <h1 className="text-2xl font-semibold">Разберёмся вместе</h1>
        </div>
      </div>
      {rec && (
        <p className="mt-3 rounded-2xl bg-[var(--brand-soft)] px-4 py-3 text-sm">
          {rec.why}{" "}
          {recLesson && (
            <Link href={`/learn/lesson/${recLesson.lesson.id}`} className="text-[#2f6bff]">
              Открыть урок
            </Link>
          )}
        </p>
      )}
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
        {track.chat.length === 0 && (
          <div className="panel-card p-5 text-sm text-[var(--muted)]">
            Напиши, что неясно. Например: «Я не понимаю Present Simple». Сразу готовый ответ не дам — сначала шаг.
            <div className="mt-3 flex flex-wrap gap-2">
              {["Я не понимаю Present Simple.", "Проверь: I goed home yesterday.", "Дай короткую практику на to be."].map((p) => (
                <button key={p} type="button" className="chip-btn" onClick={() => send(undefined, p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {track.chat.map((m) => (
          <div key={m.id} className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm ${m.role === "assistant" ? "bg-[var(--brand-soft)]" : "ml-auto border border-[var(--line)]"}`}>
            {m.content}
          </div>
        ))}
        {busy && <p className="text-sm text-[var(--muted)]">Печатает…</p>}
        {err && (
          <div className="text-sm">
            {err}{" "}
            <button type="button" className="text-[#2f6bff]" onClick={() => send(undefined, track.chat.filter((c) => c.role === "user").at(-1)?.content)}>
              Повторить
            </button>
          </div>
        )}
      </div>
      <form onSubmit={send} className="mt-4 flex gap-2">
        <input className="auth-field flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Напиши вопрос" aria-label="Сообщение репетитору" />
        <Button disabled={busy}>Отправить</Button>
      </form>
    </div>
  );
}
