"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { essayReview } from "@/lib/ai-engine";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";

export default function WritingPage() {
  const { user, addXp } = useApp();
  const loc = user?.language ?? "ru";
  const [text, setText] = useState("");
  const [res, setRes] = useState<ReturnType<typeof essayReview> | null>(null);

  return (
    <div className="max-w-2xl space-y-4 pb-16">
      <h1 className="font-serif text-4xl">✍️ {t(loc, "writing.title")}</h1>
      <textarea className="w-full min-h-48 rounded-3xl border border-[var(--line)] p-4 bg-white dark:bg-ink-900" placeholder={t(loc, "writing.ph")} value={text} onChange={(e) => setText(e.target.value)} />
      <Button
        onClick={() => {
          setRes(essayReview(text || "очень очень короткий текст типа"));
          addXp(20, "Разобран текст");
        }}
      >
        {t(loc, "writing.run")}
      </Button>
      {res && (
        <div className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-6 space-y-3">
          <div className="text-3xl font-serif">{res.score}/100</div>
          <div>
            <div className="text-sm font-medium">Сильные стороны</div>
            <ul className="list-disc ps-5 text-sm mt-1">
              {res.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          {res.issues.map((i) => (
            <div key={i.type + i.excerpt} className="rounded-2xl bg-ink-50 dark:bg-ink-800 p-4 text-sm">
              <div className="font-medium">{i.type}</div>
              <p className="mt-1">{i.excerpt}</p>
              <p className="text-ink-600 mt-1">Почему: {i.why}</p>
              <p className="mt-1">Как исправить: {i.fix}</p>
            </div>
          ))}
          <p>{res.recommendation}</p>
        </div>
      )}
    </div>
  );
}
