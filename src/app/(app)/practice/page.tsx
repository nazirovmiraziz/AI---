"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { SUBJECTS, getTopic } from "@/lib/subjects";
import { pickAdaptive, gradeAnswer } from "@/lib/questions";
import { generateQuiz } from "@/lib/ai/quiz";
import type { TestQuestion } from "@/lib/types";
import { XP_REWARDS } from "@/lib/demo-data";

function isEmpty(value: unknown) {
  if (value === "" || value === undefined || value === null) return true;
  if (Array.isArray(value) && value.filter(Boolean).length === 0) return true;
  return false;
}

function PracticeInner() {
  const params = useSearchParams();
  const { user, addTest, addXp, unlockAchievement } = useApp();
  const loc = user?.language ?? "ru";
  const [subject, setSubject] = useState(params.get("subject") || "math");
  const topics = useMemo(() => SUBJECTS.find((s) => s.id === subject)?.topics ?? [], [subject]);
  const [topic, setTopic] = useState(params.get("topic") || topics[0]?.id || "linear-eq");
  const [count, setCount] = useState(8);
  const [hard, setHard] = useState("medium");
  const [useAi, setUseAi] = useState(false);
  const [items, setItems] = useState<TestQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState<unknown>("");
  const [checked, setChecked] = useState<{ ok: boolean; why: string } | null>(null);
  const [log, setLog] = useState<{ ok: boolean }[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [tries, setTries] = useState(0);
  const startedAt = useMemo(() => Date.now(), [started, items.length]);

  const q = items[idx];
  const score = log.filter((x) => x.ok).length;

  async function start() {
    setBusy(true);
    setNotice("");
    setDone(false);
    setChecked(null);
    setLog([]);
    setIdx(0);
    setTries(0);
    setValue("");
    const label = t(loc, `topic.${topic}`);
    if (useAi) {
      const quiz = await generateQuiz({
        subject: t(loc, `subject.${subject}`),
        topic,
        topicLabel: label,
        difficulty: hard,
        count,
        grade: user?.grade,
        profile: user,
      });
      setItems(quiz.items);
      if (quiz.notice) setNotice(quiz.notice);
    } else {
      const bank = pickAdaptive(topic, hard === "hard" ? 4 : hard === "easy" ? 1 : 2, [], count);
      const extra = bank.length < count ? pickAdaptive("mixed", 2, bank.map((x) => x.id), count - bank.length) : [];
      setItems([...bank, ...extra].slice(0, count));
    }
    setStarted(true);
    setBusy(false);
  }

  function check() {
    if (!q || isEmpty(value)) {
      setNotice("Сначала напиши или выбери ответ.");
      return;
    }
    const ok = gradeAnswer(q, value);
    const nextTries = tries + 1;
    setTries(nextTries);
    if (ok) {
      setChecked({ ok: true, why: q.explanation });
      setNotice("");
      if (log.length === idx) setLog((prev) => [...prev, { ok: true }]);
      else setLog((prev) => prev.map((row, i) => (i === idx ? { ok: true } : row)));
      addXp(XP_REWARDS.task, "Практика");
      return;
    }
    if (nextTries === 1) {
      setChecked(null);
      setNotice(q.explanation ? `Почти. Подсказка: ${q.explanation.split(".")[0]}.` : "Почти. Посмотри ещё раз на условие.");
      return;
    }
    setChecked({ ok: false, why: q.explanation });
    setNotice("");
    if (log.length === idx) setLog((prev) => [...prev, { ok: false }]);
    else setLog((prev) => prev.map((row, i) => (i === idx ? { ok: false } : row)));
  }

  function go(next: number) {
    const n = Math.max(0, Math.min(items.length - 1, next));
    setIdx(n);
    setValue("");
    setTries(0);
    setChecked(log[n] ? { ok: log[n].ok, why: items[n]?.explanation ?? "" } : null);
    setNotice("");
  }

  function finish() {
    setDone(true);
    addTest({
      id: `pr-${Date.now()}`,
      title: `Практика · ${t(loc, `topic.${topic}`)}`,
      subjectId: getTopic(topic)?.subjectId ?? subject,
      topic,
      score,
      total: items.length,
      date: new Date().toISOString(),
      strong: score >= items.length * 0.7 ? [topic] : [],
      weak: score < items.length * 0.7 ? [topic] : [],
      durationSec: Math.max(10, Math.round((Date.now() - startedAt) / 1000)),
    });
    if (score === items.length && items.length > 0) unlockAchievement("perfect-test");
    unlockAchievement("hundred-tasks");
  }

  if (done) {
    return (
      <div className="max-w-xl space-y-4 pb-16">
        <h1 className="text-3xl font-semibold">Результат</h1>
        <div className="panel-card p-5 space-y-2">
          <p className="text-2xl font-semibold">{score} / {items.length}</p>
          <p className="text-sm text-[var(--muted)]">Тема: {t(loc, `topic.${topic}`)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { setStarted(false); setDone(false); setItems([]); }}>Ещё раз</Button>
          <Link href={`/lesson/${topic}`} className="btn-secondary">К уроку</Link>
          <Link href="/progress" className="btn-secondary">Прогресс</Link>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-xl space-y-5 pb-16">
        <div>
          <p className="gold-kicker">Практика</p>
          <h1 className="mt-2 text-3xl font-semibold">Решай по одной задаче</h1>
          <p className="mt-2 text-[var(--muted)]">Счёт настоящий. Вопросы из школьной базы или от ИИ.</p>
        </div>
        <label className="block text-sm">Предмет
          <select className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-[var(--bg-elev)]" value={subject} onChange={(e) => {
            setSubject(e.target.value);
            const next = SUBJECTS.find((s) => s.id === e.target.value)?.topics[0]?.id;
            if (next) setTopic(next);
          }}>
            {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{t(loc, `subject.${s.id}`)}</option>)}
          </select>
        </label>
        <label className="block text-sm">Тема
          <select className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-[var(--bg-elev)]" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {topics.map((tp) => <option key={tp.id} value={tp.id}>{t(loc, `topic.${tp.id}`)}</option>)}
          </select>
        </label>
        <label className="block text-sm">Сложность
          <select className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-[var(--bg-elev)]" value={hard} onChange={(e) => setHard(e.target.value)}>
            <option value="easy">Легко</option>
            <option value="medium">Средне</option>
            <option value="hard">Сложнее</option>
          </select>
        </label>
        <label className="block text-sm">Вопросов
          <input type="number" min={3} max={12} className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-[var(--bg-elev)]" value={count} onChange={(e) => setCount(Number(e.target.value) || 8)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} />
          Собрать вопросы через ИИ
        </label>
        {notice && <p className="text-sm text-amber-800">{notice}</p>}
        <Button onClick={start} disabled={busy}>{busy ? "Собираю…" : "Начать"}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4 pb-16">
      <p className="text-sm text-[var(--muted)]">Вопрос {idx + 1} / {items.length} · верно {score}</p>
      <h1 className="text-2xl font-semibold">{q?.prompt}</h1>
      {q?.options ? (
        <div className="grid gap-2">
          {q.options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`rounded-xl border px-3 py-2 text-start ${value === opt || (Array.isArray(value) && value.includes(opt)) ? "border-[#163068] bg-white" : "border-[var(--line)]"}`}
              onClick={() => setValue(q.type === "boolean" ? opt === "Верно" : opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <input className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={String(value ?? "")} onChange={(e) => setValue(e.target.value)} placeholder="Ответ" />
      )}
      {checked && (
        <p className={checked.ok ? "text-[#0c9b78]" : "text-[#c2410c]"}>
          {checked.ok ? "Верно. " : "Пока нет. "}{checked.why}
        </p>
      )}
      {notice && <p className="text-sm text-amber-800">{notice}</p>}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => go(idx - 1)} disabled={idx === 0}>Назад</Button>
        {!checked ? (
          <Button onClick={check}>{tries === 0 ? "Проверить" : "Попробовать снова"}</Button>
        ) : idx + 1 < items.length ? (
          <Button onClick={() => go(idx + 1)}>Дальше</Button>
        ) : (
          <Button onClick={finish}>Результат</Button>
        )}
        {tries >= 2 && !checked?.ok && (
          <Link href={`/lesson/${topic}`} className="btn-secondary">Объяснить тему</Link>
        )}
        <button type="button" className="text-sm text-[var(--muted)]" onClick={() => { setStarted(false); setItems([]); }}>Сначала</button>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="panel-card h-40 animate-pulse" />}>
      <PracticeInner />
    </Suspense>
  );
}
