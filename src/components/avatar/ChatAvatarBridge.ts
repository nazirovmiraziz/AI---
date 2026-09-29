"use client";

import { useEffect } from "react";
import { getAvatar, type AvatarMode } from "./AvatarController";
import type { AvatarReaction } from "./protocol";

const RE = {
  greet: /^(привет|здравств|салам|ассалом|добр(ое|ый|ого)\s|хай\b|hello|hi\b|hey\b)/i,
  bye: /(^|\s)(пока|до свидания|до завтра|до встречи|всё на сегодня|все на сегодня|урок окончен|bye|goodbye)(\s|[!.]|$)/i,
  lost: /(не понима|не понял|не поняла|непонятно|сложно|трудно|запутал|не получается|не могу понять|помоги)/i,
  got: /(^|\s)(понял|поняла|ясно|теперь понятно|дошло|спасибо|круто|супер)(\s|[!.]|$)/i,
  wow: /(ого|вау|wow|серьёзно\?|неужели)/i,
  aiRight: /(правильно|верно|отлично|молодец|точно так|браво|умница|великолепно|excellent|correct|well done)/i,
  aiWrong: /(неправильно|неверно|ошибк|почти|не совсем|не так|попробуй ещё|incorrect)/i,
  aiBig: /(отлично|молодец|великолепно|блестяще|браво|идеально)/i,
  aiBye: /(до встречи|до завтра|пока!|удачи на|хорошего дня)/i,
  aiGreet: /^(привет|здравствуй|салам|hello|hi)/i,
};

/** What the avatar does right after the student sends a message. */
export function reactToUserMessage(text: string): { reaction: AvatarReaction | null; mode: AvatarMode } {
  const t = text.trim();
  if (RE.greet.test(t)) return { reaction: { emotion: "greeting", animation: "wave", intensity: 0.9 }, mode: "thinking" };
  if (RE.bye.test(t)) return { reaction: { emotion: "goodbye", animation: "goodbye", intensity: 0.8 }, mode: "thinking" };
  if (RE.lost.test(t)) return { reaction: { emotion: "worried", animation: "headTilt", intensity: 0.6 }, mode: "thinking" };
  if (RE.got.test(t)) return { reaction: { emotion: "happy", animation: "nod", intensity: 0.8 }, mode: "thinking" };
  if (RE.wow.test(t)) return { reaction: { emotion: "surprised", intensity: 0.6 }, mode: "thinking" };
  return { reaction: { emotion: "listening", animation: "listenNod", intensity: 0.8 }, mode: "thinking" };
}

/** Context-based reaction to the tutor's reply, used when the AI did not send one. */
export function inferReaction(userText: string, aiText: string, evaluation?: boolean | null): AvatarReaction {
  const u = userText.trim();
  const a = aiText.slice(0, 400);
  if (evaluation === true) return { emotion: RE.aiBig.test(a) ? "celebrating" : "proud", animation: RE.aiBig.test(a) ? "celebrate" : "thumbsUp", intensity: 0.9 };
  if (evaluation === false) return { emotion: "encouraging", animation: "comfort", intensity: 0.75 };
  if (RE.greet.test(u) || RE.aiGreet.test(a)) return { emotion: "greeting", animation: "wave", intensity: 0.9 };
  if (RE.bye.test(u) || RE.aiBye.test(a)) return { emotion: "goodbye", animation: "goodbye", intensity: 0.8 };
  if (RE.aiWrong.test(a) && !RE.aiRight.test(a.replace(RE.aiWrong, ""))) return { emotion: "encouraging", animation: "comfort", intensity: 0.75 };
  if (RE.aiRight.test(a)) {
    return RE.aiBig.test(a)
      ? { emotion: "celebrating", animation: "celebrate", intensity: 0.9 }
      : { emotion: "happy", animation: "thumbsUp", intensity: 0.8 };
  }
  if (RE.lost.test(u)) return { emotion: "encouraging", animation: "explainOpen", intensity: 0.7 };
  if (RE.got.test(u)) return { emotion: "happy", animation: "nod", intensity: 0.8 };
  return { emotion: "explaining", animation: a.length > 280 ? "explainOpen" : "explainPoint", intensity: 0.7 };
}

export function avatarOnUserMessage(text: string) {
  const avatar = getAvatar();
  const { reaction, mode } = reactToUserMessage(text);
  if (reaction) avatar.react(reaction, 1.6);
  window.setTimeout(() => {
    if (avatar.mode !== "speaking") avatar.setMode(mode);
  }, reaction?.emotion === "greeting" || reaction?.emotion === "goodbye" ? 1400 : 700);
}

export function avatarOnReply(reaction: AvatarReaction) {
  getAvatar().react(reaction, 5.5);
}

export function avatarOnError() {
  getAvatar().react({ emotion: "sad", animation: "comfort", intensity: 0.6 }, 3.5);
}

/** Keeps the avatar's mode in sync with the chat UI state. */
export function useChatAvatarBridge(state: { busy: boolean; streaming: boolean; listening: boolean; speaking: boolean; composing: boolean }) {
  const { busy, streaming, listening, speaking, composing } = state;
  useEffect(() => {
    const avatar = getAvatar();
    const mode: AvatarMode = speaking ? "speaking" : listening ? "listening" : streaming ? "typing" : busy ? "thinking" : composing ? "listening" : "idle";
    if (avatar.mode === "speaking" && mode !== "speaking" && avatar.lipSync.speaking) return;
    avatar.setMode(mode);
  }, [busy, streaming, listening, speaking, composing]);
}
