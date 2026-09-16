"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Mic, Pin, Plus, Search, Send, Volume2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { Formula } from "@/components/Formula";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { askAi } from "@/lib/ask-ai";
import { evaluateStudentAnswer } from "@/lib/ai-engine";
import type { ExplainStyle } from "@/lib/types";
import { XP_REWARDS } from "@/lib/demo-data";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const STYLES: ExplainStyle[] = ["child", "student", "teacher", "short", "detailed", "steps", "funny", "exam", "simple"];

function TutorInner() {
  const {
    user,
    conversations,
    activeConversationId,
    addConversation,
    setActiveConversation,
    appendMessage,
    renameConversation,
    pinConversation,
    deleteConversation,
    updateUser,
    addXp,
    demoMode,
    setDemoMode,
  } = useApp();
  const loc = user?.language ?? "ru";
  const params = useSearchParams();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = params.get("c");
    if (c) setActiveConversation(c);
    const seed = sessionStorage.getItem("ssai-seed");
    if (seed) {
      sessionStorage.removeItem("ssai-seed");
      setTimeout(() => send(seed), 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const conv = conversations.find((c) => c.id === activeConversationId) ?? conversations[0];
  const filtered = conversations
    .filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv?.messages.length, busy]);

  async function send(text: string) {
    const content = text.trim();
    if (!content) return;
    let id = conv?.id;
    if (!id) id = addConversation({ title: content.slice(0, 42) });
    appendMessage(id, { role: "user", content });
    setInput("");
    setBusy(true);
    const history = [
      ...(conv?.messages ?? []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content },
    ];
    const res = await askAi({
      messages: history,
      profile: user,
      style: user?.explainStyle ?? "student",
      lessonLanguage: user?.lessonLanguage ?? "ru",
      hintOnly: user?.hintOnly ?? false,
      fallbackText: content,
    });
    if (res.demo) setDemoMode(true);
    else setDemoMode(false);

    const last = conv?.messages.filter((m) => m.role === "assistant").slice(-1)[0];
    const topicId = typeof last?.meta?.topic === "string" ? last.meta.topic : undefined;
    let extra = "";
    if (last && conv && conv.messages.filter((m) => m.role === "user").length > 1) {
      const ev = evaluateStudentAnswer(content, topicId);
      extra = `\n\n${ev.ok ? "✅ " : "⚠️ "}${ev.explanation}`;
      if (ev.ok) addXp(XP_REWARDS.task, "Решена задача");
    }

    appendMessage(id, {
      role: "assistant",
      content: res.content + extra,
      meta: res.meta,
    });
    if (res.error) {
      appendMessage(id, { role: "system", content: res.error });
    }
    addXp(4, "");
    setBusy(false);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function voiceIn() {
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition
      || (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition;
    if (!SR) {
      setInput((v) => v || "Объясни мне теорему Пифагора.");
      return;
    }
    const rec = new SR();
    rec.lang = user?.language === "en" ? "en-US" : "ru-RU";
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const said = ev.results[0][0].transcript;
      setInput(said);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  function speak(text: string) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text.slice(0, 400));
    u.lang = user?.lessonLanguage === "en" ? "en-US" : "ru-RU";
    window.speechSynthesis.speak(u);
  }

  const understanding = conv?.messages.map((m) => m.meta?.understanding).filter(Boolean).slice(-1)[0] ?? 72;

  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-[560px] rounded-[1.8rem] border border-white/12 bg-[#10131c] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,.45)]">
      <aside className="hidden md:flex w-64 flex-col border-e border-[var(--line)]">
        <div className="p-3 flex gap-2">
          <Button className="flex-1" onClick={() => addConversation()}>
            <Plus size={14} /> {t(loc, "tutor.new")}
          </Button>
        </div>
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-2">
            <Search size={14} className="text-ink-400" />
            <input className="py-2 text-sm flex-1 bg-transparent outline-none" placeholder={t(loc, "tutor.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {filtered.map((c) => (
            <div key={c.id} className={`group rounded-xl px-2 py-2 text-sm cursor-pointer ${c.id === conv?.id ? "bg-white/10" : "hover:bg-white/5"}`}>
              <div className="flex items-center gap-1" onClick={() => setActiveConversation(c.id)}>
                {c.pinned && <Pin size={12} />}
                {renameId === c.id ? (
                  <input
                    autoFocus
                    className="flex-1 bg-transparent outline-none"
                    defaultValue={c.title}
                    onBlur={(e) => {
                      renameConversation(c.id, e.target.value);
                      setRenameId(null);
                    }}
                  />
                ) : (
                  <span className="flex-1 truncate">{c.title}</span>
                )}
              </div>
              <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 text-xs text-ink-500">
                <button onClick={() => setRenameId(c.id)}>{t(loc, "tutor.rename")}</button>
                <button onClick={() => pinConversation(c.id)}>{t(loc, "tutor.pin")}</button>
                <button onClick={() => deleteConversation(c.id)}>{t(loc, "tutor.delete")}</button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex-1 min-w-0 flex flex-col">
        <div className="px-4 py-3 border-b border-[var(--line)] flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{conv?.title ?? t(loc, "nav.tutor")}</span>
          {demoMode && <span className="text-[10px] uppercase tracking-wider text-amber-700">{t(loc, "demo")}</span>}
          <div className="flex-1" />
          <label className="text-xs flex items-center gap-1">
            <input type="checkbox" checked={!!user?.hintOnly} onChange={(e) => updateUser({ hintOnly: e.target.checked })} />
            {t(loc, "no.answer")}
          </label>
          <LanguageSwitcher lesson />
        </div>
        <div className="px-4 py-2 flex gap-2 overflow-x-auto text-xs border-b border-[var(--line)]">
          {STYLES.map((s) => (
            <button
              key={s}
              onClick={() => updateUser({ explainStyle: s })}
              className={`whitespace-nowrap rounded-full px-3 py-1 border ${user?.explainStyle === s ? "border-gold-400 bg-gold-400/10 text-gold-400" : "border-white/15 text-white/60"}`}
            >
              {t(loc, `style.${s}`)}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!(conv?.messages ?? []).length && (
            <div className="h-full min-h-[220px] grid place-items-center text-center px-6">
              <div>
                <p className="font-serif italic text-3xl">{user?.name}, я уже знаю, как к тебе обращаться.</p>
                <p className="text-sm text-ink-500 mt-3 max-w-md mx-auto">
                  Задай вопрос — объясню с твоего уровня, по шагам, и назову тебя по имени из аккаунта.
                </p>
              </div>
            </div>
          )}
          {(conv?.messages ?? []).map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === "user"
                    ? "bg-white text-ink-950 rounded-tr-sm"
                    : m.role === "system"
                    ? "bg-amber-500/15 text-amber-200"
                    : "bg-[#151826] border border-white/10 rounded-tl-sm"
                }`}
              >
                {m.content}
                {m.meta?.formula && (
                  <div className="mt-3 bg-white/70 dark:bg-ink-900/50 rounded-xl p-3">
                    <Formula latex={m.meta.formula} display />
                  </div>
                )}
                {m.role === "assistant" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="text-xs text-gold-400" onClick={() => speak(m.content)}>
                      <Volume2 size={12} className="inline" /> {t(loc, "pronounce")}
                    </button>
                    <button className="text-xs" onClick={() => send("Я не понял")}>
                      {t(loc, "dont.understand")}
                    </button>
                    <button className="text-xs" onClick={() => send("Объясни иначе")}>
                      {t(loc, "explain.again")}
                    </button>
                    {m.meta?.quizPrompt && (
                      <button className="text-xs" onClick={() => (window.location.href = "/tests?topic=quadratic")}>
                        {t(loc, "test.check")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="text-sm text-ink-500 flex gap-1">
              <span className="animate-pulseSoft">●</span>
              <span className="animate-pulseSoft [animation-delay:150ms]">●</span>
              <span className="animate-pulseSoft [animation-delay:300ms]">●</span>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={onSubmit} className="p-3 border-t border-[var(--line)] flex gap-2">
          <button type="button" className={`rounded-xl px-3 ${listening ? "text-red-500" : ""}`} onClick={voiceIn}>
            <Mic size={18} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t(loc, "tutor.placeholder")}
            className="flex-1 rounded-xl border border-[var(--line)] px-3 py-2 bg-transparent"
          />
          <Button type="submit" disabled={busy}>
            <Send size={16} />
          </Button>
        </form>
      </section>

      <aside className="hidden xl:block w-64 border-s border-[var(--line)] p-4">
        <div className="text-xs uppercase tracking-wider text-ink-400">{t(loc, "tutor.progress")}</div>
        <div className="mt-3 text-sm">
          {t(loc, "tutor.topic")}
          <div className="font-medium mt-1">{conv?.topicId ? t(loc, `topic.${conv.topicId}`) : "Квадратные уравнения"}</div>
        </div>
        <div className="mt-4 text-sm">{t(loc, "tutor.understanding")}</div>
        <div className="text-2xl font-medium mt-1">{understanding}%</div>
        <ProgressBar value={Number(understanding)} className="mt-2" />
        <p className="text-xs text-ink-500 mt-4">Слабые темы появляются в рекомендациях чаще.</p>
      </aside>
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96" />}>
      <TutorInner />
    </Suspense>
  );
}
