"use client";

import { useEffect, useState } from "react";
import { pickAdaptive, gradeAnswer } from "@/lib/questions";
import { Button } from "@/components/Button";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { XP_REWARDS } from "@/lib/demo-data";
import type { ExamSession } from "@/lib/types";

export default function ExamPage() {
  const { user, setExam, exam, addXp, unlockAchievement, addTest } = useApp();
  const loc = user?.language ?? "ru";
  const [country, setCountry] = useState(user?.country ?? "TJ");
  const [grade, setGrade] = useState(user?.grade ?? "9");
  const [subjectId, setSubjectId] = useState("math");
  const [examType, setExamType] = useState("final");
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(25 * 60);
  const [warn, setWarn] = useState(false);
  const [finished, setFinished] = useState<null | {
    score: number;
    total: number;
    time: number;
    details: { prompt: string; ok: boolean; explanation: string }[];
  }>(null);

  useEffect(() => {
    if (!exam || finished) return;
    const tmr = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tmr);
  }, [exam, finished]);

  useEffect(() => {
    if (left === 0 && exam && !finished) finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  function start() {
    const questions = pickAdaptive("mixed", 3, [], 8);
    const session: ExamSession = {
      id: `ex-${Date.now()}`,
      country,
      grade,
      subjectId,
      examType,
      questions,
      answers: {},
      skipped: [],
      startedAt: new Date().toISOString(),
      durationSec: 25 * 60,
    };
    setExam(session);
    setIdx(0);
    setLeft(25 * 60);
    setFinished(null);
  }

  function updateAnswer(v: unknown) {
    if (!exam) return;
    setExam({ ...exam, answers: { ...exam.answers, [exam.questions[idx].id]: v } });
  }

  function skip() {
    if (!exam) return;
    const id = exam.questions[idx].id;
    setExam({ ...exam, skipped: Array.from(new Set([...exam.skipped, id])) });
    setIdx((i) => Math.min(exam.questions.length - 1, i + 1));
  }

  function finish(force = false) {
    if (!exam) return;
    const unanswered = exam.questions.filter((q) => exam.answers[q.id] === undefined);
    if (unanswered.length && !force) {
      setWarn(true);
      return;
    }
    const details = exam.questions.map((q) => ({
      prompt: q.prompt,
      ok: gradeAnswer(q, exam.answers[q.id]),
      explanation: q.explanation,
    }));
    const score = details.filter((d) => d.ok).length;
    const total = details.length;
    const spent = exam.durationSec - left;
    setFinished({ score, total, time: spent, details });
    addXp(XP_REWARDS.exam, "Экзамен завершён");
    unlockAchievement("first-exam");
    addTest({
      id: exam.id,
      title: "Экзамен",
      subjectId,
      topic: "quadratic",
      score,
      total,
      date: new Date().toISOString(),
      strong: details.filter((d) => d.ok).map((d) => d.prompt.slice(0, 24)),
      weak: details.filter((d) => !d.ok).map((d) => d.prompt.slice(0, 24)),
      durationSec: spent,
    });
    setExam(null);
    setWarn(false);
  }

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  if (finished) {
    const pct = Math.round((finished.score / finished.total) * 100);
    const pass = Math.min(97, Math.max(35, pct + 6));
    return (
      <div className="max-w-2xl space-y-5 pb-16">
        <h1 className="font-serif text-5xl">{pct} / 100</h1>
        <p>
          {t(loc, "exam.est")}: <strong>{pct >= 80 ? "Отличный" : pct >= 65 ? t(loc, "test.good") : "Требуется подготовка"}</strong>
        </p>
        <p>
          {t(loc, "exam.prob")}: <strong>{pass}%</strong>
        </p>
        <p className="text-sm text-ink-500">{t(loc, "exam.note")}</p>
        <p>
          {t(loc, "exam.time")}: {Math.floor(finished.time / 60)}:{String(finished.time % 60).padStart(2, "0")}
        </p>
        <div>
          <h2 className="font-medium">⚠️ {t(loc, "exam.weak")}</h2>
          <ol className="list-decimal ps-5 mt-2 text-sm space-y-1">
            <li>Квадратные уравнения</li>
            <li>Дискриминант</li>
            <li>Системы уравнений</li>
          </ol>
        </div>
        <div className="space-y-3">
          {finished.details.map((d, i) => (
            <div key={i} className="rounded-2xl border border-[var(--line)] p-4">
              <div className="text-sm">{d.ok ? "✅" : "❌"} {d.prompt}</div>
              <p className="text-sm text-ink-500 mt-1">{d.explanation}</p>
            </div>
          ))}
        </div>
        <Button onClick={() => setFinished(null)}>Новая попытка</Button>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="font-serif text-4xl">🎓 {t(loc, "exam.title")}</h1>
        <label className="block text-sm">
          {t(loc, "exam.country")}
          <select className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="TJ">{t(loc, "country.TJ")}</option>
            <option value="RU">{t(loc, "country.RU")}</option>
          </select>
        </label>
        <label className="block text-sm">
          {t(loc, "exam.grade")}
          <select className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={grade} onChange={(e) => setGrade(e.target.value)}>
            {[8, 9, 10, 11].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          {t(loc, "exam.subject")}
          <select className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="math">{t(loc, "subject.math")}</option>
            <option value="physics">{t(loc, "subject.physics")}</option>
            <option value="english">{t(loc, "subject.english")}</option>
          </select>
        </label>
        <label className="block text-sm">
          {t(loc, "exam.type")}
          <select className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={examType} onChange={(e) => setExamType(e.target.value)}>
            <option value="final">{t(loc, "exam.final")}</option>
            <option value="mid">{t(loc, "exam.mid")}</option>
            <option value="olymp">{t(loc, "exam.olymp")}</option>
          </select>
        </label>
        <p className="text-sm text-ink-500">
          {t(loc, "country.TJ")} → {grade} {t(loc, "grade.n")} → {t(loc, `subject.${subjectId}`)} → {t(loc, "exam.final")}
        </p>
        <Button onClick={start}>{t(loc, "exam.start")}</Button>
      </div>
    );
  }

  const q = exam.questions[idx];
  return (
    <div className="max-w-2xl space-y-4 pb-16">
      <div className="flex items-center justify-between text-sm">
        <span>
          {idx + 1} / {exam.questions.length}
        </span>
        <span className="font-mono text-lg">{mm}:{ss}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {exam.questions.map((item, i) => {
          const skipped = exam.skipped.includes(item.id);
          const answered = exam.answers[item.id] !== undefined;
          return (
            <button
              key={item.id}
              onClick={() => setIdx(i)}
              className={`h-8 w-8 rounded-lg text-xs border ${i === idx ? "border-brand-700 bg-brand-50" : skipped ? "border-amber-400" : answered ? "border-brand-400" : "border-[var(--line)]"}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <h2 className="text-xl font-medium">{q.prompt}</h2>
      {(q.options ?? []).length ? (
        <div className="space-y-2">
          {q.options!.map((o) => (
            <button key={o} onClick={() => updateAnswer(q.type === "boolean" ? o === "Верно" : o)} className="block w-full text-start rounded-2xl border border-[var(--line)] px-4 py-3">
              {o}
            </button>
          ))}
        </div>
      ) : (
        <input className="w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" onChange={(e) => updateAnswer(e.target.value)} />
      )}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setIdx(Math.max(0, idx - 1))}>
          {t(loc, "back")}
        </Button>
        <Button variant="secondary" onClick={() => setIdx(Math.min(exam.questions.length - 1, idx + 1))}>
          {t(loc, "next")}
        </Button>
        <Button variant="ghost" onClick={skip}>
          {t(loc, "skip")}
        </Button>
        <Button onClick={() => finish(false)}>{t(loc, "exam.finish")}</Button>
      </div>
      {warn && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <p>{t(loc, "exam.warn")}</p>
          <div className="flex gap-2 mt-3">
            <Button onClick={() => finish(true)}>Да</Button>
            <Button variant="secondary" onClick={() => setWarn(false)}>
              {t(loc, "cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
