"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { pickAdaptive, gradeAnswer } from "@/lib/questions";
import type { TestQuestion } from "@/lib/types";
import { Button } from "@/components/Button";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { getTopic } from "@/lib/subjects";
import { getLessonByTopic } from "@/lib/lessons";
import Link from "next/link";

function isEmptyAnswer(value: unknown) {
  if (value === "" || value === undefined || value === null) return true;
  if (Array.isArray(value) && value.filter(Boolean).length === 0) return true;
  return false;
}

function TestsInner() {
  const params = useSearchParams();
  const { user, addTest } = useApp();
  const loc = user?.language ?? "ru";
  const [topic, setTopic] = useState(params.get("topic") || user?.weakTopics?.[0] || "linear-eq");
  const [started, setStarted] = useState(false);
  const [taught, setTaught] = useState(false);
  const [idx, setIdx] = useState(0);
  const [diff, setDiff] = useState(2);
  const [used, setUsed] = useState<string[]>([]);
  const [items, setItems] = useState<TestQuestion[]>([]);
  const [value, setValue] = useState<unknown>("");
  const [log, setLog] = useState<{ q: TestQuestion; ok: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const [needAnswer, setNeedAnswer] = useState("");
  const [subject, setSubject] = useState("math");
  const [hardness, setHardness] = useState("2");
  const [total, setTotal] = useState(10);

  function start() {
    setDiff(Number(hardness) || 2);
    const first = pickAdaptive(topic, Number(hardness) || 2, [], 1);
    setItems(first);
    setUsed(first.map((q) => q.id));
    setStarted(true);
    setIdx(0);
    setLog([]);
    setDone(false);
    setValue("");
    setNeedAnswer("");
  }

  function submit() {
    const q = items[idx];
    if (!q) return;
    if (isEmptyAnswer(value)) {
      setNeedAnswer("Сначала выберите или введите ответ.");
      return;
    }
    setNeedAnswer("");
    const ok = gradeAnswer(q, value);
    const nextDiff = ok ? Math.min(5, diff + 1) : Math.max(1, diff - 1);
    const nextLog = [...log, { q, ok }];
    setLog(nextLog);
    setDiff(nextDiff);
    if (idx + 1 >= total) {
      setDone(true);
      const weak = nextLog.filter((x) => !x.ok).map((x) => x.q.topic);
      const strong = nextLog.filter((x) => x.ok).map((x) => x.q.topic);
      addTest({
        id: `tr-${Date.now()}`,
        title: t(loc, `topic.${topic}`),
        subjectId: getTopic(topic)?.subjectId ?? "math",
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

  const lesson = getLessonByTopic(topic);

  if (!started) {
    return (
      <div className="max-w-xl space-y-4">
        <p className="gold-kicker">{t(loc, "nav.tests")}</p>
        <h1 className="text-3xl font-semibold">Сначала урок, потом проверка</h1>
        <p className="text-[var(--muted)]">
          Сначала коротко разберём тему. Тест откроется в конце.
        </p>
        <label className="block text-sm">
          Предмет
          <select className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-white text-[#121826] min-h-11" value={subject} onChange={(e) => { setSubject(e.target.value); setTaught(false); }}>
            {["math", "physics", "english"].map((id) => (
              <option key={id} value={id}>{t(loc, `subject.${id}`)}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Тема
          <select className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-white text-[#121826] min-h-11" value={topic} onChange={(e) => { setTopic(e.target.value); setTaught(false); }}>
            {(subject === "physics" ? ["newton", "ohm", "energy"] : subject === "english" ? ["tenses"] : ["linear-eq", "quadratic", "discriminant", "percentages"]).map((id) => (
              <option key={id} value={id}>{t(loc, `topic.${id}`)}</option>
            ))}
          </select>
        </label>
        <div className="rounded-3xl border border-[var(--line)] bg-white p-5 space-y-3">
          <p className="font-medium">{t(loc, `topic.${topic}`)}</p>
          <p className="leading-relaxed">{lesson?.sections.simple || "Сначала идея простыми словами. Потом один пример. Потом проверка."}</p>
          <ul className="list-disc ps-5 text-sm space-y-1">
            {(lesson?.sections.learn ?? ["Главная идея", "Один пример", "Маленькая проверка"]).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          {lesson?.sections.examples[0] && <p className="text-sm text-[var(--muted)]">Пример: {lesson.sections.examples[0].body}</p>}
          <Link href={`/lesson/${topic}`} className="text-sm text-[#2f6bff]">Открыть полный урок →</Link>
        </div>
        {!taught ? (
          <Button onClick={() => setTaught(true)}>Я прочитал — можно тест</Button>
        ) : (
          <>
            <label className="block text-sm">
              Сложность
              <select className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-white text-[#121826] min-h-11" value={hardness} onChange={(e) => setHardness(e.target.value)}>
                <option value="1">Лёгкая</option>
                <option value="2">Средняя</option>
                <option value="4">Сложная</option>
              </select>
            </label>
            <label className="block text-sm">
              Количество вопросов
              <select className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-white text-[#121826] min-h-11" value={total} onChange={(e) => setTotal(Number(e.target.value))}>
                {[5, 8, 10, 15].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <Button onClick={start}>Начать тест</Button>
          </>
        )}
      </div>
    );
  }

  if (done) {
    const weak = Array.from(new Set(log.filter((x) => !x.ok).map((x) => x.q.topic)));
    const strong = Array.from(new Set(log.filter((x) => x.ok).map((x) => x.q.topic)));
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="text-5xl font-semibold">
          {score}/{total}
        </h1>
        <p className="text-2xl font-medium">{Math.round((score / total) * 100)}%</p>
        <p>
          {t(loc, "test.level")}: <strong>{level}</strong>
        </p>
        <p>
          {t(loc, "test.know")}: {strong.map((s) => t(loc, `topic.${s}`)).join(", ") || "—"}
        </p>
        <p>
          {t(loc, "test.need")}: {weak.map((s) => t(loc, `topic.${s}`)).join(", ") || "—"}
        </p>
        <p className="text-ink-600">
          {t(loc, "test.rec")}: {weak.length ? `Повтори ${t(loc, `topic.${weak[0]}`)} и пройди проверку ещё раз.` : "Можно переходить к следующей теме."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={start}>Ещё раз</Button>
          <Button href={`/lesson/${weak[0] ?? topic}`} variant="secondary">К уроку</Button>
          <Button href="/tutor" variant="ghost">Спросить репетитора</Button>
        </div>
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
              className={`block w-full text-start rounded-2xl border px-4 py-3 min-h-11 ${value === o || (q.type === "boolean" && value === (o === "Верно")) ? "border-brand-600 bg-brand-50" : "border-[var(--line)]"}`}
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
                className={`block w-full text-start rounded-2xl border px-4 py-3 min-h-11 ${on ? "border-brand-600 bg-brand-50" : "border-[var(--line)]"}`}
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
                className="flex-1 rounded-xl border border-[var(--line)] px-2 py-2 bg-transparent min-h-11"
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
        <input className="w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent min-h-11" value={String(value ?? "")} onChange={(e) => setValue(e.target.value)} />
      )}
      {needAnswer && <p className="text-sm text-red-600">{needAnswer}</p>}
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
