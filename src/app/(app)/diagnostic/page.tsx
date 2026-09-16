"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pickAdaptive, gradeAnswer } from "@/lib/questions";
import { Button } from "@/components/Button";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { TestQuestion } from "@/lib/types";

export default function DiagnosticPage() {
  const { user, updateUser, addConversation } = useApp();
  const router = useRouter();
  const loc = user?.language ?? "ru";
  const [subject, setSubject] = useState("math");
  const [started, setStarted] = useState(false);
  const [qs, setQs] = useState<TestQuestion[]>([]);
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [ok, setOk] = useState(0);
  const [done, setDone] = useState<number | null>(null);

  function start() {
    setQs(pickAdaptive(subject === "math" ? "quadratic" : "ohm", 2, [], 5));
    setStarted(true);
    setI(0);
    setOk(0);
  }

  function next() {
    const q = qs[i];
    const newOk = ok + (gradeAnswer(q, val) ? 1 : 0);
    if (i + 1 >= qs.length) {
      const score = newOk / qs.length;
      const level = Math.round(score * 100) / 10;
      setDone(level);
      updateUser({
        diagnosticDone: true,
        onboardingDone: true,
        subjectLevels: { ...(user?.subjectLevels ?? {}), [subject]: Math.round(score * 100) },
      });
      return;
    }
    setOk(newOk);
    setI((n) => n + 1);
    setVal("");
  }

  if (done !== null) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="font-serif text-4xl">{t(loc, "diag.result")}: {done} / 10</h1>
        <p>Персональный маршрут: сначала слабые места, затем закрепление сильных тем.</p>
        <Button
          onClick={() => {
            addConversation({ title: "Маршрут после диагностики" });
            router.push("/plan");
          }}
        >
          Открыть план
        </Button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="font-serif text-4xl">🧠 {t(loc, "diag.title")}</h1>
        <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="math">{t(loc, "subject.math")}</option>
          <option value="physics">{t(loc, "subject.physics")}</option>
        </select>
        <Button onClick={start}>{t(loc, "diag.start")}</Button>
      </div>
    );
  }

  const q = qs[i];
  return (
    <div className="max-w-lg space-y-4">
      <div className="text-sm text-ink-500">
        {i + 1}/{qs.length}
      </div>
      <h2 className="text-xl">{q.prompt}</h2>
      {(q.options ?? []).length ? (
        <div className="space-y-2">
          {q.options!.map((o) => (
            <button key={o} onClick={() => setVal(o)} className="block w-full text-start rounded-2xl border border-[var(--line)] px-4 py-3">
              {o}
            </button>
          ))}
        </div>
      ) : (
        <input className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={val} onChange={(e) => setVal(e.target.value)} />
      )}
      <Button onClick={next}>{t(loc, "next")}</Button>
    </div>
  );
}
