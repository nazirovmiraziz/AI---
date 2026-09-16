"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";

const LEXICON: Record<string, { ru: string; ipa: string; ex: string }> = {
  acceleration: { ru: "ускорение", ipa: "/əkˌseləˈreɪʃn/", ex: "The car has acceleration." },
  photosynthesis: { ru: "фотосинтез", ipa: "/ˌfəʊtəʊˈsɪnθəsɪs/", ex: "Plants use photosynthesis." },
  discriminant: { ru: "дискриминант", ipa: "/dɪˈskrɪmɪnənt/", ex: "Find the discriminant first." },
};

export default function TranslatorPage() {
  const { user } = useApp();
  const loc = user?.language ?? "ru";
  const [q, setQ] = useState("acceleration");
  const [sel, setSel] = useState("acceleration");
  const item = LEXICON[sel.toLowerCase()] ?? {
    ru: "перевод по контексту урока",
    ipa: "",
    ex: "Highlight a word in a lesson to see meaning, pronunciation and an example.",
  };

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="font-serif text-4xl">{t(loc, "translator")}</h1>
      <input
        className="w-full rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onMouseUp={() => {
          const s = window.getSelection()?.toString().trim();
          if (s) setSel(s);
        }}
      />
      <Button onClick={() => setSel(q.trim() || "acceleration")}>Показать</Button>
      <div className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-6">
        <div className="text-3xl font-serif">{sel}</div>
        <div className="text-xl mt-2">{item.ru}</div>
        <div className="text-sm text-ink-500 mt-2">{item.ipa}</div>
        <p className="mt-4">{item.ex}</p>
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
