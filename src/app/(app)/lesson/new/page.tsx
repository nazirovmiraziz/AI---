"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECTS } from "@/lib/subjects";
import { Button } from "@/components/Button";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";

export default function NewLessonPage() {
  const { user } = useApp();
  const loc = user?.language ?? "ru";
  const router = useRouter();
  const [subject, setSubject] = useState("math");
  const [grade, setGrade] = useState("9");
  const topics = SUBJECTS.find((s) => s.id === subject)?.topics ?? [];
  const [topic, setTopic] = useState(topics[0]?.id ?? "quadratic");

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="font-serif text-4xl">AI создаёт урок</h1>
      <label className="block text-sm">
        Предмет
        <select className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={subject} onChange={(e) => {
          setSubject(e.target.value);
          const t0 = SUBJECTS.find((s) => s.id === e.target.value)?.topics[0]?.id;
          if (t0) setTopic(t0);
        }}>
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              {t(loc, `subject.${s.id}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Класс
        <select className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={grade} onChange={(e) => setGrade(e.target.value)}>
          {[6, 7, 8, 9, 10, 11].map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Тема
        <select className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent" value={topic} onChange={(e) => setTopic(e.target.value)}>
          {topics.map((tp) => (
            <option key={tp.id} value={tp.id}>
              {t(loc, `topic.${tp.id}`)}
            </option>
          ))}
        </select>
      </label>
      <Button onClick={() => router.push(`/lesson/${topic}`)}>Собрать урок</Button>
    </div>
  );
}
