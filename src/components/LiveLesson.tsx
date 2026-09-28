"use client";

import { FormEvent, useState } from "react";
import { askAi } from "@/lib/ask-ai";
import { Button } from "@/components/Button";

const STARTER = [
  {
    role: "user" as const,
    text: "Не понимаю, как решать 3x + 5 = 20",
  },
  {
    role: "assistant" as const,
    text: "Давай вместе, без готового ответа.\n\nСначала скажи: что в уравнении нужно «убрать», чтобы x остался один? Можно начать с числа, которое прибавляют к 3x.",
  },
];

export function LiveLesson() {
  const [messages, setMessages] = useState(STARTER);
  const [input, setInput] = useState("Вычесть 5 с обеих сторон?");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    const history = [...messages, { role: "user" as const, text }].map((m) => ({
      role: m.role,
      content: m.text,
    }));
    const res = await askAi({
      messages: history,
      profile: null,
      style: "steps",
      lessonLanguage: "ru",
      hintOnly: true,
      fallbackText: text,
    });
    setMessages((m) => [...m, { role: "assistant", text: res.content }]);
    setBusy(false);
  }

  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Живой урок</p>
          <p className="text-xs text-[var(--muted)]">Математика · 7 класс · только подсказки</p>
        </div>
        <span className="rounded-full bg-[#0c9b78]/12 px-2.5 py-1 text-[11px] font-medium text-[#0c9b78]">онлайн</span>
      </div>
      <div className="space-y-3 p-4 min-h-[280px] max-h-[360px] overflow-y-auto bg-[#f5f7fb] text-[#121826]">
        {messages.map((m, i) => (
          <div key={i} className={`answer-stream flex ${m.role === "user" ? "justify-end" : "justify-start"}`} style={{ animationDelay: `${i * 70}ms` }}>
            <div
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-[#163068] text-white rounded-tr-md" : "bg-white border border-[var(--line)] rounded-tl-md shadow-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <p className="text-sm text-[var(--muted)] flex gap-1">
            <span className="animate-pulseSoft">●</span>
            <span className="animate-pulseSoft [animation-delay:150ms]">●</span>
            <span className="animate-pulseSoft [animation-delay:300ms]">●</span>
          </p>
        )}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 border-t border-[var(--line)] p-3 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-lux mt-0 flex-1"
          placeholder="Ответь репетитору…"
        />
        <Button type="submit" disabled={busy}>
          Ответить
        </Button>
      </form>
    </div>
  );
}
