"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { essayReview } from "@/lib/ai-engine";
import { askAi } from "@/lib/ask-ai";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";

export default function WritingPage() {
  const { user, addXp, setDemoMode } = useApp();
  const loc = user?.language ?? "ru";
  const [text, setText] = useState("");
  const [local, setLocal] = useState<ReturnType<typeof essayReview> | null>(null);
  const [ai, setAi] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    const body = text.trim();
    if (body.length < 20) {
      setLocal(null);
      setAi("Вставьте хотя бы пару предложений — так разбор будет честным.");
      return;
    }
    setBusy(true);
    setLocal(essayReview(body));
    const res = await askAi({
      messages: [{ role: "user", content: `Проверь сочинение: грамматика, структура, стиль и слабые места. Не переписывай целиком за меня.\n\n${body}` }],
      profile: user,
      style: "teacher",
      lessonLanguage: user?.lessonLanguage ?? "ru",
      hintOnly: false,
      fallbackText: body,
    });
    if (res.demo) setDemoMode(true);
    setAi(res.content);
    addXp(20, "Разобран текст");
    setBusy(false);
  }

  return (
    <div className="max-w-2xl space-y-4 pb-16">
      <PageHeader title={t(loc, "writing.title")} text="Вставьте текст. Получите разбор ошибок и как исправить, а не готовую работу." />
      <textarea
        className="w-full min-h-48 rounded-2xl border border-[var(--line)] p-4 bg-white dark:bg-[var(--bg-elev)]"
        placeholder={t(loc, "writing.ph")}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button onClick={run} disabled={busy || !text.trim()}>
        {busy ? "Проверяем…" : t(loc, "writing.run")}
      </Button>
      {local && (
        <div className="rounded-2xl border border-[var(--line)] bg-white dark:bg-[var(--bg-elev)] p-6 space-y-3">
          <div className="text-3xl font-semibold">{local.score}/100</div>
          <p className="text-xs text-[var(--muted)]">Черновой разбор по правилам. Ниже — комментарий репетитора.</p>
          <ul className="list-disc ps-5 text-sm">
            {local.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {ai && <div className="rounded-2xl border border-[var(--line)] bg-white dark:bg-[var(--bg-elev)] p-6 prose-ui text-sm">{ai}</div>}
    </div>
  );
}
