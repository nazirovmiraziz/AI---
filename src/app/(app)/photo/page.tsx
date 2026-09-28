"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Formula } from "@/components/Formula";
import { PageHeader } from "@/components/PageHeader";
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
  const [aiText, setAiText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function onFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setErr("Нужен файл изображения.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErr("Фото больше 4 МБ. Сожмите снимок.");
      return;
    }
    setErr("");
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function solve() {
    if (!preview) {
      setErr("Сначала загрузите фото задачи.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await askAi({
        messages: [
          {
            role: "user",
            content:
              "Распознай задачу на фото и объясни по шагам. Не давай только ответ — веди ученика. Если снимок нечитаем, скажи об этом прямо.",
          },
        ],
        profile: user,
        style: user?.explainStyle ?? "steps",
        lessonLanguage: user?.lessonLanguage ?? "ru",
        hintOnly: true,
        image: preview,
        fallbackText: "",
      });
      if (res.demo) setDemoMode(true);
      if (res.content?.trim()) {
        setAiText(res.content);
        setResult(null);
        addXp(XP_REWARDS.task, "Разобрана задача");
      } else {
        setAiText("");
        setResult(photoWalkthrough("2x + 5 = 17"));
        setErr("Снимок не распознан. Показан разбор типового линейного уравнения — это не твоя задача. Загрузи более чёткое фото.");
      }
      if (res.error) setErr(res.error);
    } catch {
      setResult(photoWalkthrough("2x + 5 = 17"));
      setErr(t(loc, "ai.unavailable"));
    }
    setBusy(false);
  }

  return (
    <div className="max-w-3xl space-y-6 pb-16">
      <PageHeader
        title={t(loc, "photo.title")}
        text="Загрузите снимок задачи. Если фото нечитаемо, система скажет об этом и не подменит чужой пример без предупреждения."
      />
      <label className="block rounded-2xl border border-dashed border-brand-300 bg-white dark:bg-[var(--bg-elev)] p-10 text-center cursor-pointer min-h-44">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
        <p>{preview ? "Фото загружено. Можно объяснить." : t(loc, "photo.drop")}</p>
        {preview && <img src={preview} alt="Задача" className="mt-4 max-h-64 mx-auto rounded-2xl" />}
      </label>
      {preview && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={solve} disabled={busy}>{busy ? "Разбираем…" : t(loc, "photo.explain")}</Button>
          <Button variant="secondary" onClick={solve} disabled={busy}>{t(loc, "photo.steps")}</Button>
          <Button variant="ghost" onClick={solve} disabled={busy}>{t(loc, "photo.check")}</Button>
        </div>
      )}
      {!preview && (
        <Button onClick={solve} disabled={busy}>
          {t(loc, "cta.explain")}
        </Button>
      )}
      {err && <p className="text-sm text-amber-800">{err}</p>}
      {aiText && (
        <div className="rounded-2xl border border-[var(--line)] bg-white dark:bg-[var(--bg-elev)] p-6 prose-ui text-sm">
          {aiText}
        </div>
      )}
      {result && !aiText && (
        <div className="rounded-2xl border border-[var(--line)] bg-white dark:bg-[var(--bg-elev)] p-6 space-y-4">
          <div className="text-sm text-[var(--muted)]">Распознано</div>
          <div className="text-lg font-medium">{result.recognized}</div>
          <p className="text-sm text-amber-800">Это запасной пример, не распознанный текст с вашего фото.</p>
          {result.steps.map((s, i) => (
            <div key={s.title} className="rounded-xl bg-ink-50 dark:bg-white/5 p-4">
              <div className="text-xs text-[var(--muted)]">
                {t(loc, "photo.step")} {i + 1}
              </div>
              <div className="mt-1">{s.body}</div>
            </div>
          ))}
          <Formula latex={result.formula} display />
        </div>
      )}
    </div>
  );
}
