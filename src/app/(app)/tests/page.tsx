"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { pickAdaptive, gradeAnswer } from "@/lib/questions";
import type { TestQuestion } from "@/lib/types";
import { Button } from "@/components/Button";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";

function TestsInner() {
  const params = useSearchParams();
  const topic = params.get("topic") || "quadratic";
  const { user, addTest } = useApp();
  const loc = user?.language ?? "ru";
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [diff, setDiff] = useState(2);
  const [used, setUsed] = useState<string[]>([]);
  const [items, setItems] = useState<TestQuestion[]>([]);
  const [value, setValue] = useState<unknown>("");
  const [correct, setCorrect] = useState(0);
  const [log, setLog] = useState<{ q: TestQuestion; ok: boolean }[]>([]);
  const [done, setDone] = useState(false);

  const total = 10;

  function start() {
    const first = pickAdaptive(topic, 2, [], 1);
    setItems(first);
    setUsed(first.map((q) => q.id));
    setStarted(true);
    setIdx(0);
    setCorrect(0);
    setLog([]);
    setDone(false);
    setValue("");
  }

  function submit() {
    const q = items[idx];
    const ok = gradeAnswer(q, value);
    const nextDiff = ok ? Math.min(5, diff + 1) : Math.max(1, diff - 1);
    const nextLog = [...log, { q, ok }];
    setLog(nextLog);
    setDiff(nextDiff);
    if (ok) setCorrect((c) => c + 1);
    if (idx + 1 >= total) {
      setDone(true);
      const weak = nextLog.filter((x) => !x.ok).map((x) => x.q.topic);
      const strong = nextLog.filter((x) => x.ok).map((x) => x.q.topic);
      addTest({
        id: `tr-${Date.now()}`,
        title: t(loc, `topic.${topic}`),
        subjectId: "math",
        topic,
        score: nextLog.filter((x) => x.ok).length,
        total,
        date: new Date().toISOString(),
        strong: Array.from(new Set(strong)),
        weak: Array.from(new Set(weak)),
        durationSec: 300,
      });
      return;
    }
    const next = pickAdaptive(topic, nextDiff, [...used], 1);
    setUsed((u) => [...u, ...next.map((n) => n.id)]);
    setItems((arr) => [...arr, ...next]);
    setIdx((i) => i + 1);
    setValue(q.type === "multiple" || q.type === "match" ? [] : "");
  }

  const q = items[idx];
  const score = log.filter((x) => x.ok).length;
  const level = score >= 9 ? "Отличный" : score >= 7 ? t(loc, "test.good") : "Нужно повторение";

  if (!started) {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="font-serif text-4xl">{t(loc, "test.check")}</h1>
        <p className="text-ink-500">
          {t(loc, `topic.${topic}`)} — {total} вопросов. Сложность подстраивается под ответы.
        </p>
        <Button onClick={start}>{t(loc, "test.create")}</Button>
      </div>
    );
  }

  if (done) {
    const weak = Array.from(new Set(log.filter((x) => !x.ok).map((x) => x.q.topic)));
    const strong = Array.from(new Set(log.filter((x) => x.ok).map((x) => x.q.topic)));
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="font-serif text-5xl">
          {score}/{total} 🎉
        </h1>
        <p>
          {t(loc, "test.level")}: <strong>{level}</strong>
        </p>
        <p>
          🟢 {t(loc, "test.know")}: {strong.map((s) => t(loc, `topic.${s}`)).join(", ") || "—"}
        </p>
        <p>
          🟠 {t(loc, "test.need")}: {weak.map((s) => t(loc, `topic.${s}`)).join(", ") || "—"}
        </p>
        <p className="text-ink-600">
          {t(loc, "test.rec")}: {weak.length ? `Повтори ${t(loc, `topic.${weak[0]}`)} и пройди проверку ещё раз.` : "Можно переходить к следующей теме."}
        </p>
        <Button onClick={start}>Ещё раз</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="text-sm text-ink-500">
        {idx + 1} / {total} · адаптивная сложность {diff}/5
      </div>
      <h1 className="text-2xl font-medium">{q?.prompt}</h1>
      {q?.type === "single" || q?.type === "boolean" ? (
        <div className="space-y-2">
          {(q.options ?? []).map((o) => (
            <button
              key={String(o)}
              onClick={() => setValue(q.type === "boolean" ? o === "Верно" || o === "True" : o)}
              className={`block w-full text-start rounded-2xl border px-4 py-3 ${value === o || (q.type === "boolean" && value === (o === "Верно")) ? "border-brand-600 bg-brand-50" : "border-[var(--line)]"}`}
            >
              {o}
            </button>
          ))}
        </div>
      ) : q?.type === "multiple" ? (
        <div className="space-y-2">
          {(q.options ?? []).map((o) => {
            const arr = (value as string[]) || [];
            const on = arr.includes(o);
            return (
              <button
                key={o}
                onClick={() => setValue(on ? arr.filter((x) => x !== o) : [...arr, o])}
                className={`block w-full text-start rounded-2xl border px-4 py-3 ${on ? "border-brand-600 bg-brand-50" : "border-[var(--line)]"}`}
              >
                {o}
              </button>
            );
          })}
        </div>
      ) : q?.type === "match" ? (
        <div className="space-y-2">
          {(q.matchPairs ?? []).map((p, i) => (
            <div key={p.left} className="flex gap-2 items-center">
              <span className="w-28 text-sm">{p.left}</span>
              <select
                className="flex-1 rounded-xl border border-[var(--line)] px-2 py-2 bg-transparent"
                onChange={(e) => {
                  const next = Array.isArray(value) ? [...(value as string[])] : new Array(q.matchPairs?.length).fill("");
                  next[i] = e.target.value;
                  setValue(next);
                }}
              >
                <option value="">—</option>
                {(q.answer as string[]).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : (
        <input className="w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={String(value ?? "")} onChange={(e) => setValue(e.target.value)} />
      )}
      <Button onClick={submit}>{t(loc, "submit")}</Button>
    </div>
  );
}

export default function TestsPage() {
  return (
    <Suspense fallback={<div className="skeleton h-40" />}>
      <TestsInner />
    </Suspense>
  );
}
