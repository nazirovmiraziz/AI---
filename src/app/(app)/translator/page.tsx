"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { askAi } from "@/lib/ask-ai";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";

const LEXICON: Record<string, { ru: string; ipa: string; ex: string }> = {
  acceleration: { ru: "ускорение", ipa: "/əkˌseləˈreɪʃn/", ex: "The car has acceleration." },
  photosynthesis: { ru: "фотосинтез", ipa: "/ˌfəʊtəʊˈsɪnθəsɪs/", ex: "Plants use photosynthesis." },
  discriminant: { ru: "дискриминант", ipa: "/dɪˈskrɪmɪnənt/", ex: "Find the discriminant first." },
};

export default function TranslatorPage() {
  const { user, setDemoMode } = useApp();
  const loc = user?.language ?? "ru";
  const [q, setQ] = useState("acceleration");
  const [sel, setSel] = useState("acceleration");
  const [ai, setAi] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const item = LEXICON[sel.toLowerCase()];

  async function show() {
    const word = q.trim();
    if (word.length < 2) {
      setErr("Введите термин — например acceleration.");
      return;
    }
    setErr("");
    setSel(word);
    const known = LEXICON[word.toLowerCase()];
    if (known) {
      setAi("");
      return;
    }
    setBusy(true);
    const res = await askAi({
      messages: [{ role: "user", content: `Переведи школьный термин «${word}»: значение, произношение и один пример в предложении.` }],
      profile: user,
      style: "short",
      lessonLanguage: user?.lessonLanguage ?? "ru",
      hintOnly: false,
      fallbackText: word,
    });
    if (res.demo) setDemoMode(true);
    setAi(res.content);
    setBusy(false);
  }

  return (
    <div className="max-w-lg space-y-4">
      <PageHeader title={t(loc, "translator")} text="Школьный словарь: значение, звучание и пример." />
      <input
        className="w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-white dark:bg-[var(--bg-elev)]"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <Button onClick={show} disabled={busy}>
        {busy ? "Ищем…" : "Показать"}
      </Button>
      <div className="rounded-2xl border border-[var(--line)] bg-white dark:bg-[var(--bg-elev)] p-6">
        <div className="text-2xl font-semibold">{sel}</div>
        {item && (
          <>
            <div className="text-xl mt-2">{item.ru}</div>
            <div className="text-sm text-[var(--muted)] mt-2">{item.ipa}</div>
            <p className="mt-4">{item.ex}</p>
          </>
        )}
        {ai && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{ai}</p>}
        <button
          className="text-sm text-brand-700 mt-4"
          onClick={() => {
            const u = new SpeechSynthesisUtterance(sel);
            u.lang = "en-US";
            window.speechSynthesis.speak(u);
          }}
        >
          {t(loc, "pronounce")}
        </button>
      </div>
    </div>
  );
}
