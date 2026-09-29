"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { getAvatar, type AvatarState } from "./AvatarController";
import type { Emotion } from "./emotions";

const AIAvatar = dynamic(() => import("./AIAvatar"), {
  ssr: false,
  loading: () => <div className="ai-avatar ai-avatar-loading" aria-hidden />,
});

const EMOTION_RU: Record<Emotion, string> = {
  neutral: "Спокоен",
  happy: "Рад",
  excited: "Воодушевлён",
  thinking: "Думает",
  explaining: "Объясняет",
  confused: "Удивлён вопросом",
  surprised: "Удивлён",
  worried: "Переживает",
  sad: "Грустит",
  encouraging: "Поддерживает",
  proud: "Гордится",
  celebrating: "Празднует",
  listening: "Слушает",
  greeting: "Здоровается",
  goodbye: "Прощается",
};

const MODE_RU: Record<AvatarState["mode"], string> = {
  idle: "На связи",
  listening: "Слушает",
  thinking: "Думает",
  typing: "Пишет ответ",
  speaking: "Говорит",
};

function useStored(key: string, initial: boolean) {
  const [v, setV] = useState(initial);
  useEffect(() => {
    const s = localStorage.getItem(key);
    if (s === "1" || s === "0") setV(s === "1");
  }, [key]);
  const set = (next: boolean) => {
    setV(next);
    localStorage.setItem(key, next ? "1" : "0");
  };
  return [v, set] as const;
}

export function TutorAvatarPanel({ voiceOn, onToggleVoice }: { voiceOn: boolean; onToggleVoice: () => void }) {
  const [collapsed, setCollapsed] = useStored("ssai-avatar-collapsed", false);
  const [animOn, setAnimOn] = useStored("ssai-avatar-anim", true);
  const [full, setFull] = useState(false);
  const [state, setState] = useState<AvatarState>({ mode: "idle", emotion: "neutral", enabled: true });

  useEffect(() => getAvatar().subscribe(setState), []);
  useEffect(() => getAvatar().setEnabled(animOn), [animOn]);

  useEffect(() => {
    const key = "ssai-avatar-greeted";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const id = window.setTimeout(() => getAvatar().react({ emotion: "greeting", animation: "wave", intensity: 0.9 }, 3), 900);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.add("avatar-full");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("avatar-full");
    };
  }, [full]);

  const label = state.mode === "idle" || state.emotion !== "neutral" ? EMOTION_RU[state.emotion] : MODE_RU[state.mode];
  const showStage = !collapsed || full;

  const panel = (
    <div className={`tutor-avatar ${collapsed && !full ? "collapsed" : ""} ${full ? "is-full" : ""}`} data-mode={state.mode} data-emotion={state.emotion}>
      {showStage && <AIAvatar framing={full ? "full" : "auto"} />}
      <div className="tutor-avatar-bar">
        <span className="tutor-avatar-status">
          <i aria-hidden />
          <b>{MODE_RU[state.mode]}</b>
          {label !== MODE_RU[state.mode] && <em>· {label}</em>}
        </span>
        <span className="tutor-avatar-tools">
          <button type="button" onClick={onToggleVoice} aria-pressed={voiceOn} aria-label={voiceOn ? "Выключить голос" : "Включить голос"} title={voiceOn ? "Голос включён" : "Голос выключен"}>
            {voiceOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          {showStage && (
            <button type="button" onClick={() => setAnimOn(!animOn)} aria-pressed={animOn} aria-label={animOn ? "Остановить анимации" : "Включить анимации"} title={animOn ? "Анимации включены" : "Анимации выключены"}>
              {animOn ? <Pause size={15} /> : <Play size={15} />}
            </button>
          )}
          <button type="button" onClick={() => setFull(!full)} aria-label={full ? "Выйти из полного экрана" : "Во весь экран"} title={full ? "Свернуть" : "Во весь экран"}>
            {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          {!full && (
            <button type="button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Показать репетитора" : "Скрыть репетитора"} title={collapsed ? "Показать" : "Скрыть"}>
              {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
          )}
        </span>
      </div>
    </div>
  );

  return full ? createPortal(panel, document.body) : panel;
}
