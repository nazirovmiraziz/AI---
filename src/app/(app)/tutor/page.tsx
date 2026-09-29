"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { Camera, Mic, Paperclip, Pause, Play, Plus, Send, Square, Volume2, VolumeX, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Formula } from "@/components/Formula";
import { askSchoolAi } from "@/lib/ai/service";
import { AI_MODES, titleFromQuestion } from "@/lib/ai/modes";
import { groupChatsByDay } from "@/lib/ai/context";
import { evaluateStudentAnswer } from "@/lib/ai-engine";
import { DEMO_EMAIL, XP_REWARDS } from "@/lib/demo-data";
import { ChatText } from "@/components/ChatText";
import { VoiceWave } from "@/components/VoiceWave";
import { firstName, stripFakeNames } from "@/lib/cabinet";
import { useChatViewport } from "@/lib/use-chat-viewport";
import type { AiMode } from "@/lib/types";
import { AiFace, AiFaceStatus } from "@/components/avatar/AiFace";
import { getAvatar } from "@/components/avatar/AvatarController";
import {
  avatarOnError,
  avatarOnReply,
  avatarOnUserMessage,
  inferReaction,
  useChatAvatarBridge,
} from "@/components/avatar/ChatAvatarBridge";

const QUICK = [
  { id: "math", label: "Квадратные уравнения", prompt: "Объясни квадратные уравнения простыми словами. Коротко и по делу." },
  { id: "en", label: "Практика английского", prompt: "Дай одно короткое упражнение на Present Simple и проверь меня." },
  { id: "hw", label: "Помощь с домашкой", prompt: "Застрял на задаче. Спроси про первый шаг, ответ пока не давай." },
  { id: "exam", label: "К экзамену", prompt: "Подготовь меня к короткой проверке по теме, которую я назову." },
  { id: "quiz", label: "Собрать тест", prompt: "Собери короткий тест из 5 вопросов по теме, которую я назову." },
];

function clock(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

function subjectTag(text: string) {
  return text;
}

function TutorInner() {
  const {
    user,
    conversations,
    activeConversationId,
    addConversation,
    setActiveConversation,
    appendMessage,
    patchMessage,
    deleteMessage,
    renameConversation,
    pinConversation,
    deleteConversation,
    setConversationMode,
    addXp,
    demoMode,
    setDemoMode,
    unlockAchievement,
  } = useApp();
  const loc = user?.language ?? "ru";
  const params = useSearchParams();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voicePhase, setVoicePhase] = useState<"off" | "listen" | "understand">("off");
  const [voiceErr, setVoiceErr] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mobileChats, setMobileChats] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [streamId, setStreamId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [voiceAuto, setVoiceAuto] = useState(false);
  const voiceAutoRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const stopRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);
  const greeted = useRef(false);
  const who = user?.email?.toLowerCase() === DEMO_EMAIL ? "" : firstName(user?.name);

  useEffect(() => {
    if (!user || greeted.current) return;
    if (user.email.toLowerCase() === DEMO_EMAIL) return;
    if (conversations.length > 0) return;
    if (sessionStorage.getItem("ssai-seed")) return;
    const greetKey = `ssai-greeted-${user.id}`;
    if (sessionStorage.getItem(greetKey)) return;
    greeted.current = true;
    sessionStorage.setItem(greetKey, "1");
    const id = addConversation({ title: who ? `Диалог · ${who}` : t(loc, "tutor.new.chat") });
    appendMessage(id, {
      role: "assistant",
      content: who
        ? `Привет, ${who}! Что хочешь разобрать сегодня?`
        : "Привет! Что хочешь разобрать сегодня?",
    });
  }, [user, conversations.length, addConversation, appendMessage, who, loc]);

  useEffect(() => {
    const c = params.get("c");
    const seed = sessionStorage.getItem("ssai-seed");
    if (seed) {
      sessionStorage.removeItem("ssai-seed");
      const id = c || addConversation({ title: seed.slice(0, 42) });
      if (c) setActiveConversation(c);
      setTimeout(() => send(seed, id), 200);
    } else if (c) {
      setActiveConversation(c);
    } else if (params.get("topic")) {
      const topicId = params.get("topic")!;
      const id = addConversation({ title: topicId, topicId });
      setTimeout(() => send("Объясни эту тему простыми словами, коротко и по делу.", id), 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const conv = conversations.find((c) => c.id === activeConversationId) ?? conversations[0];
  const filtered = conversations
    .filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt));

  useChatViewport(feedRef);
  useChatAvatarBridge({
    busy,
    streaming: !!streamId,
    listening,
    speaking: speaking && !paused,
    composing: input.trim().length > 0,
  });

  useEffect(() => {
    const on = localStorage.getItem("ssai-voice-auto") === "1";
    setVoiceAuto(on);
    voiceAutoRef.current = on;
  }, []);

  function toggleVoiceAuto() {
    const next = !voiceAuto;
    setVoiceAuto(next);
    voiceAutoRef.current = next;
    localStorage.setItem("ssai-voice-auto", next ? "1" : "0");
    if (!next) stopVoice();
  }

  useEffect(() => {
    const feed = feedRef.current;
    if (feed) feed.scrollTop = feed.scrollHeight;
  }, [conv?.messages.length, busy, streamId]);

  function grow() {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(160, el.scrollHeight)}px`;
  }

  function readFile(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      setVoiceErr("Файл больше 4 МБ. Сожмите снимок и загрузите снова.");
      return;
    }
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setImage(String(reader.result));
      reader.readAsDataURL(file);
      setFileName(file.name);
      return;
    }
    setFileName(file.name);
    setImage(null);
  }

  async function reveal(id: string, mid: string, full: string, meta?: (typeof conv)["messages"][0]["meta"]) {
    stopRef.current = false;
    const skip =
      typeof window !== "undefined" &&
      (window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (skip) {
      patchMessage(id, mid, { content: full, meta: { ...meta, status: "sent" } });
      return;
    }
    setStreamId(mid);
    const step = Math.max(8, Math.ceil(full.length / 24));
    for (let i = 0; i < full.length; i += step) {
      if (stopRef.current) break;
      patchMessage(id, mid, { content: full.slice(0, i + step), meta: { ...meta, status: "sent" } });
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
    patchMessage(id, mid, {
      content: stopRef.current ? full.slice(0, Math.max(24, full.length / 2)) + "…" : full,
      meta: { ...meta, status: "sent" },
    });
    setStreamId(null);
  }

  async function send(text: string, forceId?: string, extraImage?: string) {
    const content = text.trim();
    const pic = extraImage ?? image;
    if (!content && !pic && !fileName) return;
    let id = forceId ?? conv?.id;
    if (!id) id = addConversation({ title: titleFromQuestion(content || fileName || "Фото"), mode: conv?.mode ?? "chat" });
    if (editId) {
      deleteMessage(id, editId);
      setEditId(null);
    }
    appendMessage(id, {
      role: "user",
      content: content || (pic ? "Разбери это фото по шагам, без готового ответа." : `Файл: ${fileName}`),
      meta: { image: pic ?? undefined, fileName: fileName || undefined, status: "sent" },
    });
    setInput("");
    setImage(null);
    setFileName("");
    if (areaRef.current) areaRef.current.style.height = "auto";
    setBusy(true);
    setVoiceErr("");
    avatarOnUserMessage(content);
    const mid = appendMessage(id, { role: "assistant", content: "", meta: { status: "thinking" } });
    const tagged = subjectTag(content || "Разбери вложение");
    const history = [
      ...(conv?.messages ?? []).map((m) => ({
        role: m.role,
        content: m.role === "user" ? subjectTag(m.content) : m.content,
      })),
      { role: "user", content: tagged },
    ];
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const res = await askSchoolAi({
        messages: history,
        profile: user,
        style: user?.explainStyle === "teacher" || user?.explainStyle === "detailed" ? user.explainStyle : "simple",
        lessonLanguage: user?.lessonLanguage ?? "ru",
        hintOnly: false,
        image: pic ?? undefined,
        fallbackText: content || "фото задачи",
        mode: conv?.mode ?? "chat",
        signal: abortRef.current.signal,
      });
      if (res.demo) setDemoMode(true);
      else setDemoMode(false);
      if (res.error === "stopped" || stopRef.current) {
        patchMessage(id, mid, { content: t(loc, "tutor.stop"), meta: { status: "sent" } });
        setBusy(false);
        setStreamId(null);
        return;
      }
      const last = conv?.messages.filter((m) => m.role === "assistant").slice(-1)[0];
      let extra = "";
      let evalOk: boolean | null = null;
      if (last?.meta?.quizPrompt) {
        const topicId = typeof last.meta.topic === "string" ? last.meta.topic : undefined;
        const ev = evaluateStudentAnswer(content, topicId);
        if (ev) {
          evalOk = ev.ok;
          extra = `\n\n${ev.ok ? "✅ " : "⚠️ "}${ev.explanation}`;
          if (ev.ok) {
            addXp(XP_REWARDS.task, "Решена задача");
            unlockAchievement("hundred-tasks");
          }
        }
      }
      if (res.error) {
        avatarOnError();
        patchMessage(id, mid, { content: res.content || t(loc, "tutor.fail"), meta: { ...res.meta, status: "error", error: res.error } });
      } else {
        const full = (res.content || t(loc, "tutor.fail")) + extra;
        avatarOnReply(evalOk !== null ? inferReaction(content, full, evalOk) : res.avatar ?? inferReaction(content, full), full);
        await reveal(id, mid, full, res.meta);
        if (voiceAutoRef.current && !stopRef.current) startSpeech(full);
      }
      unlockAchievement("first-topic");
    } catch {
      avatarOnError();
      patchMessage(id, mid, { content: t(loc, "tutor.fail"), meta: { status: "error" } });
    }
    setBusy(false);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function voiceIn() {
    const SR =
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition ||
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition;
    if (!SR) {
      setVoiceErr(t(loc, "tutor.voice.off"));
      setListening(false);
      return;
    }
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      setVoicePhase("off");
      return;
    }
    const rec = new SR();
    rec.lang = user?.language === "en" ? "en-US" : user?.language === "tg" ? "tg-TG" : "ru-RU";
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const said = ev.results[0][0].transcript;
      const merged = input ? `${input} ${said}` : said;
      setInput(merged);
      setListening(false);
      setVoicePhase("understand");
      window.setTimeout(() => {
        setVoicePhase("off");
        send(merged);
      }, 450);
    };
    rec.onerror = () => {
      setVoiceErr("Не удалось распознать голос. Разреши микрофон или напиши текстом.");
      setListening(false);
      setVoicePhase("off");
    };
    rec.onend = () => {
      setListening(false);
    };
    recRef.current = rec;
    setListening(true);
    setVoicePhase("listen");
    setVoiceErr("");
    rec.start();
  }

  async function copyText(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 1200);
    } catch {
      setCopied("");
    }
  }

  function speakOut(text: string) {
    if (!("speechSynthesis" in window)) {
      setVoiceErr("Голос ответа в этом браузере недоступен.");
      return;
    }
    if (speaking && !paused) {
      window.speechSynthesis.pause();
      getAvatar().speechEnd();
      setPaused(true);
      return;
    }
    if (speaking && paused) {
      window.speechSynthesis.resume();
      getAvatar().setMode("speaking");
      setPaused(false);
      return;
    }
    startSpeech(text);
  }

  function startSpeech(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const spoken = stripFakeNames(text, who)
      .replace(/[*_#`>$\\]/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 500);
    const u = new SpeechSynthesisUtterance(spoken);
    u.lang = user?.language === "en" ? "en-US" : "ru-RU";
    const avatar = getAvatar();
    u.onstart = () => avatar.speechStart(spoken, u.rate || 1);
    u.onboundary = (e) => avatar.speechBoundary(e.charIndex);
    u.onend = () => {
      avatar.speechEnd();
      setSpeaking(false);
      setPaused(false);
    };
    u.onerror = () => {
      avatar.speechEnd();
      setSpeaking(false);
      setPaused(false);
    };
    setSpeaking(true);
    setPaused(false);
    window.speechSynthesis.speak(u);
  }

  function stopVoice() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    getAvatar().speechEnd();
    setSpeaking(false);
    setPaused(false);
  }

  const msgs = conv?.messages ?? [];
  const empty = msgs.length === 0;
  const onlyWelcome = msgs.length > 0 && msgs.every((m) => m.role === "assistant");
  const status = listening
    ? "Слушаю"
    : voicePhase === "understand"
      ? "Разбираю речь…"
      : busy
        ? "Думаю"
        : speaking
          ? paused
            ? "Пауза"
            : "Говорю"
          : "На связи";

  return (
    <div className="chat-studio gpt-chat">
      <aside className={`chat-rail chat-rail-list flex-col ${mobileChats ? "open" : ""}`}>
        <div className="p-3 sm:p-4">
          <Button className="w-full" onClick={() => { addConversation(); setMobileChats(false); }}>
            <Plus size={14} /> Новый чат
          </Button>
          <input
            className="mt-3 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-[#121826]"
            placeholder="Найти чат"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-3">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-sm text-[var(--muted)]">Пока пусто. Напиши первый вопрос.</p>
          ) : (
            groupChatsByDay(filtered).map((bucket) => (
              <div key={bucket.label} className="mb-2">
                <p className="px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">{bucket.label}</p>
                {bucket.items.map((c) => (
                  <div key={c.id} className={`group rounded-xl px-3 py-2 text-sm cursor-pointer ${c.id === conv?.id ? "bg-white shadow-sm" : "hover:bg-white/70"}`}>
                    <button type="button" className="block w-full text-start truncate font-medium text-[#121826]" onClick={() => { setActiveConversation(c.id); setMobileChats(false); }}>
                      {c.title}
                    </button>
                    <div className="flex gap-2 mt-1 text-[11px] text-[var(--muted)]">
                      <button type="button" onClick={() => setRenameId(c.id)}>Имя</button>
                      <button type="button" onClick={() => pinConversation(c.id)}>Закрепить</button>
                      <button type="button" onClick={() => setConfirmDelete(c.id)}>Удалить</button>
                    </div>
                    {renameId === c.id && (
                      <input
                        autoFocus
                        className="mt-1 w-full bg-white border border-[var(--line)] rounded-lg px-2 py-1 text-sm text-[#121826]"
                        defaultValue={c.title}
                        onBlur={(e) => {
                          renameConversation(c.id, e.target.value);
                          setRenameId(null);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
        <div className="chat-rail-foot">
          <Link href="/dashboard">Главная</Link>
          <Link href="/subjects">Курсы</Link>
          <Link href="/practice">Практика</Link>
          <Link href="/progress">Прогресс</Link>
        </div>
      </aside>

      {mobileChats && <button type="button" className="chat-dim chat-mobile-only" aria-label="Закрыть" onClick={() => setMobileChats(false)} />}

      <section className="chat-stage">
        <div className="gpt-top">
          <button type="button" className="chat-mobile-only gpt-top-btn" onClick={() => setMobileChats(true)}>
            Чаты
          </button>
          <AiFace size="xs" />
          <div className="gpt-head-copy">
            <p className="gpt-top-title">AI-репетитор</p>
            <p className="gpt-top-live">
              <span className={`live-dot ${listening ? "listen" : busy ? "think" : ""}`} aria-hidden />
              {status}
            </p>
          </div>
          <button
            type="button"
            className="gpt-top-btn"
            onClick={toggleVoiceAuto}
            aria-pressed={voiceAuto}
            aria-label={voiceAuto ? "Выключить озвучку ответов" : "Озвучивать ответы"}
            title={voiceAuto ? "Озвучка ответов включена" : "Озвучка ответов выключена"}
          >
            {voiceAuto ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button type="button" className="gpt-top-btn" onClick={() => addConversation({ mode: conv?.mode ?? "chat" })} aria-label="Новый чат">
            +
          </button>
        </div>
        <div className="gpt-modes" role="tablist" aria-label="Режим ИИ">
          {AI_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={(conv?.mode ?? "chat") === m.id}
              className={(conv?.mode ?? "chat") === m.id ? "on" : ""}
              title={m.hint}
              onClick={() => {
                if (!conv) addConversation({ mode: m.id as AiMode });
                else setConversationMode(conv.id, m.id as AiMode);
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div ref={feedRef} className="flex-1 min-h-0 overflow-y-auto gpt-feed">
          {!(empty || onlyWelcome) && (
            <div className="gpt-face-dock">
              <AiFace size="md" />
              <AiFaceStatus />
            </div>
          )}
          {(empty || onlyWelcome) && (
            <div className="gpt-hero">
              <div className="gpt-hero-face">
                <AiFace size="lg" />
                <AiFaceStatus />
              </div>
              <h1>{who ? `Привет, ${who}. Что разберём?` : "Привет! Что хочешь разобрать сегодня?"}</h1>
              <p>Напиши вопрос, отправь фото или нажми на микрофон.</p>
              <div className="gpt-quick">
                {QUICK.map((q) => (
                  <button key={q.id} type="button" onClick={() => send(q.prompt)}>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!(empty || onlyWelcome) && msgs.map((m) => (
            <div key={m.id} className={`gpt-row ${m.role === "user" ? "me" : "bot"}`}>
              {m.role !== "user" && (
                <span className="gpt-ava">
                  <AiFace size="xs" live={false} emotion={m.meta?.status === "thinking" ? "thinking" : m.meta?.status === "error" ? "worried" : "neutral"} />
                </span>
              )}
              <div className="gpt-col">
                <div className={`gpt-bubble ${m.role === "user" ? "me" : "bot"}`}>
                  {m.meta?.status === "thinking" && !m.content ? (
                    <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                      Репетитор думает
                      <span className="ai-think" aria-hidden />
                    </span>
                  ) : (
                    <ChatText text={stripFakeNames(m.content, who)} />
                  )}
                  {m.meta?.image && <img src={m.meta.image} alt="" className="mt-3 max-h-48 rounded-xl" />}
                  {m.meta?.formula && (
                    <div className="mt-3 rounded-xl bg-white p-3">
                      <Formula latex={m.meta.formula} display />
                    </div>
                  )}
                </div>
                {m.role === "assistant" && m.content && (
                  <div className="gpt-meta">
                    <button type="button" onClick={() => speakOut(m.content)} aria-label={speaking && !paused ? "Пауза" : "Озвучить"}>
                      {speaking && !paused ? <Pause size={14} /> : <Play size={14} />} {speaking && !paused ? "Пауза" : "Голос"}
                    </button>
                    {speaking && (
                      <button type="button" onClick={stopVoice} aria-label="Стоп">Стоп</button>
                    )}
                    <button type="button" onClick={() => copyText(m.id, stripFakeNames(m.content, who))}>{copied === m.id ? "Скопировано" : "Копировать"}</button>
                    <button type="button" onClick={() => send("Объясни ещё проще и короче")}>Ещё проще</button>
                    <button type="button" onClick={() => send("Объясни подробнее, с ещё одним примером")}>Подробнее</button>
                    <button type="button" onClick={() => send("Дай одно упражнение по этой теме")}>Практика</button>
                    <button type="button" onClick={() => send("Переведи объяснение на английский, коротко")}>Перевод</button>
                    <button type="button" onClick={() => send(conv?.messages.filter((x) => x.role === "user").slice(-1)[0]?.content || input)}>Ещё раз</button>
                    <button type="button" aria-label="Хорошо" onClick={() => patchMessage(conv!.id, m.id, { meta: { feedback: "up" } })}>{m.meta?.feedback === "up" ? "✓" : "Да"}</button>
                    <button type="button" aria-label="Плохо" onClick={() => patchMessage(conv!.id, m.id, { meta: { feedback: "down" } })}>{m.meta?.feedback === "down" ? "✕" : "Нет"}</button>
                    {m.meta?.status === "error" && (
                      <button type="button" onClick={() => send(conv?.messages.filter((x) => x.role === "user").slice(-1)[0]?.content || input)}>Повторить</button>
                    )}
                    <span className="time">{clock(m.createdAt)}</span>
                  </div>
                )}
                {m.role === "user" && (
                  <div className="gpt-meta right">
                    <button type="button" onClick={() => { setInput(m.content); setEditId(m.id); areaRef.current?.focus(); }}>Изменить</button>
                    <button type="button" onClick={() => deleteMessage(conv!.id, m.id)}>Удалить</button>
                    <span className="time">{clock(m.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="composer-box gpt-composer"
        >
          {image && (
            <div className="gpt-attach">
              <img src={image} alt="Вложение" />
              <button type="button" onClick={() => { setImage(null); setFileName(""); }} aria-label="Убрать фото">
                <X size={14} /> Убрать
              </button>
            </div>
          )}
          {fileName && !image && (
            <p className="px-2 text-xs text-[var(--muted)] flex items-center justify-between gap-2">
              {fileName}
              <button type="button" onClick={() => setFileName("")}>Убрать</button>
            </p>
          )}
          {demoMode && <p className="px-2 pb-1 text-[11px] text-amber-800">Сейчас без сети — ответы из школьной базы.</p>}
          <div className="flex items-end gap-1">
            <button type="button" className="icon-chip shrink-0" onClick={() => fileRef.current?.click()} aria-label="Вложение">
              <Paperclip size={16} />
            </button>
            <button type="button" className="icon-chip shrink-0" onClick={() => camRef.current?.click()} aria-label="Фото задачи">
              <Camera size={16} />
            </button>
            <textarea
              ref={areaRef}
              value={input}
              rows={1}
              enterKeyHint="send"
              className="min-w-0 flex-1"
              onChange={(e) => { setInput(e.target.value); grow(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Спроси репетитора…"
              aria-label="Сообщение"
            />
            <button
              type="button"
              className={`mic-orb shrink-0 ${listening ? "listen" : ""} ${voicePhase === "understand" ? "wait" : ""}`}
              onClick={voiceIn}
              aria-label={listening ? "Остановить микрофон" : "Говорить"}
            >
              {listening ? <span className="wave"><b /><b /><b /><b /></span> : <Mic size={16} />}
            </button>
            {busy ? (
              <button type="button" className="btn-secondary !px-3 shrink-0" onClick={() => { stopRef.current = true; abortRef.current?.abort(); setBusy(false); }} aria-label="Стоп">
                <Square size={14} />
              </button>
            ) : (
              <Button type="submit" className="!px-3 sm:!px-5 shrink-0" disabled={!input.trim() && !image && !fileName} aria-label="Отправить">
                <Send size={16} />
              </Button>
            )}
          </div>
          {listening && (
            <p className="px-2 pt-1 text-xs text-[#2b90d9] flex items-center gap-2">
              Слушаю… <VoiceWave active={listening} />
            </p>
          )}
          {voicePhase === "understand" && (
            <p className="px-2 pt-1 text-xs text-[#2b90d9]">Понимаю…</p>
          )}
          {voiceErr && (
            <p className="px-2 pt-1 text-xs text-amber-800">
              {voiceErr}{" "}
              <button type="button" className="underline" onClick={voiceIn}>Ещё раз</button>
            </p>
          )}
          <input ref={fileRef} type="file" accept="image/*,.pdf,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ""; }} />
          <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ""; }} />
        </form>
      </section>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Удалить диалог?"
        text="История этого разговора пропадёт с этого устройства."
        confirmLabel="Удалить"
        danger
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) deleteConversation(confirmDelete);
          setConfirmDelete(null);
        }}
      />
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
