"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Formula } from "@/components/Formula";
import { photoWalkthrough } from "@/lib/ai-engine";
import { askAi } from "@/lib/ask-ai";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { XP_REWARDS } from "@/lib/demo-data";

export default function PhotoPage() {
  const { user, addXp, setDemoMode } = useApp();
  const loc = user?.language ?? "ru";
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof photoWalkthrough> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function onFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function solve() {
    setBusy(true);
    setErr("");
    const local = photoWalkthrough("2x + 5 = 17");
    try {
      const res = await askAi({
        messages: [{ role: "user", content: "Распознай задачу на фото и объясни по шагам. Не давай только ответ." }],
        profile: user,
        style: user?.explainStyle ?? "steps",
        lessonLanguage: user?.lessonLanguage ?? "ru",
        hintOnly: false,
        image: preview ?? undefined,
        fallbackText: "2x + 5 = 17",
      });
      if (res.demo) setDemoMode(true);
      setResult(local);
      addXp(XP_REWARDS.task, "Решена задача");
      if (res.error) setErr(res.error);
    } catch {
      setResult(local);
      setErr(t(loc, "ai.unavailable"));
    }
    setBusy(false);
  }

  return (
    <div className="max-w-3xl space-y-6 pb-16">
      <h1 className="font-serif text-4xl">{t(loc, "photo.title")}</h1>
      <label className="block rounded-3xl border border-dashed border-brand-300 bg-white dark:bg-ink-900 p-10 text-center cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
        <p>{t(loc, "photo.drop")}</p>
        {preview && <img src={preview} alt="task" className="mt-4 max-h-64 mx-auto rounded-2xl" />}
      </label>
      <Button onClick={solve} disabled={busy}>
        {busy ? "…" : t(loc, "cta.explain")}
      </Button>
      {err && <p className="text-sm text-amber-800">{err}</p>}
      {result && (
        <div className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-6 space-y-4 animate-fadeUp">
          <div className="text-sm text-ink-500">Распознано</div>
          <div className="text-lg font-medium">{result.recognized}</div>
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-400">{t(loc, "photo.find")}</div>
            <div className="text-2xl font-serif mt-1">{result.find}</div>
          </div>
          {result.steps.map((s, i) => (
            <div key={s.title} className="rounded-2xl bg-ink-50 dark:bg-ink-800 p-4">
              <div className="text-xs text-ink-500">
                {t(loc, "photo.step")} {i + 1}
              </div>
              <div className="mt-1">{s.body}</div>
            </div>
          ))}
          <div>
            <div className="text-xs uppercase tracking-wider">{t(loc, "photo.answer")}</div>
            <div className="text-3xl font-serif mt-1">{result.answer}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider">{t(loc, "photo.why")}</div>
            <p className="mt-2 leading-relaxed">{result.why}</p>
          </div>
          <Formula latex={result.formula} display />
        </div>
      )}
    </div>
  );
}
