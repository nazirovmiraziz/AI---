import { buildTutorReply, type Detected } from "./ai-engine";
import { chatErrorCopy, compactAiHistory, studentContext } from "./ai/context";
import { firstName, stripFakeNames } from "./cabinet";
import { DEMO_EMAIL } from "./demo-data";
import type { AiMode, ChatMessage, ExplainStyle, Locale, StudentProfile } from "./types";
import { extractAvatarTag, toReaction, type AvatarReaction } from "@/components/avatar/protocol";

function safeProfile(profile: StudentProfile | null): StudentProfile | null {
  if (!profile) return null;
  const demo = profile.email?.toLowerCase() === DEMO_EMAIL;
  return { ...profile, name: demo ? "" : firstName(profile.name) };
}

function safeName(profile: StudentProfile | null) {
  if (!profile || profile.email?.toLowerCase() === DEMO_EMAIL) return "";
  return firstName(profile.name);
}

export async function askAi(opts: {
  messages: { role: string; content: string }[];
  profile: StudentProfile | null;
  style: ExplainStyle;
  lessonLanguage: Locale;
  hintOnly: boolean;
  image?: string;
  fallbackText: string;
  mode?: AiMode;
  signal?: AbortSignal;
}): Promise<{ content: string; demo: boolean; error?: string; meta?: ChatMessage["meta"]; avatar?: AvatarReaction | null }> {
  const local = () =>
    buildTutorReply({
      text: opts.fallbackText,
      style: opts.style,
      hintOnly: opts.hintOnly,
      profile: safeProfile(opts.profile),
      locale: opts.lessonLanguage,
      history: [],
    });

  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: compactAiHistory(opts.messages),
        profile: studentContext(safeProfile(opts.profile)),
        style: opts.style,
        lessonLanguage: opts.lessonLanguage,
        hintOnly: opts.hintOnly,
        image: opts.image,
        mode: opts.mode ?? "chat",
      }),
      signal: opts.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (opts.mode === "quiz") {
      if (!res.ok || data.demo || !data.content) {
        return { content: String(data.content || ""), demo: true, error: chatErrorCopy(res.status, data.message) };
      }
      return { content: String(data.content), demo: false };
    }
    if (data.demo || (res.status === 200 && data.demo !== false && !data.content)) {
      const pack = local();
      return { content: stripFakeNames(pack.content, safeName(opts.profile)), demo: true, meta: pack.meta };
    }
    if (!res.ok) {
      const pack = local();
      return {
        content: stripFakeNames(pack.content, safeName(opts.profile)),
        demo: true,
        error: chatErrorCopy(res.status, data.message),
        meta: pack.meta,
      };
    }
    const tagged = extractAvatarTag(String(data.content || ""));
    return {
      content: stripFakeNames(tagged.content, safeName(opts.profile)),
      demo: false,
      avatar: toReaction(data.avatar) ?? tagged.reaction,
    };
  } catch (e) {
    if (opts.signal?.aborted || (e instanceof DOMException && e.name === "AbortError")) {
      return { content: "", demo: false, error: "stopped" };
    }
    if (opts.mode === "quiz") {
      return { content: "", demo: true, error: "AI временно недоступен." };
    }
    const pack = local();
    return { content: stripFakeNames(pack.content, safeName(opts.profile)), demo: true, meta: pack.meta };
  }
}

export type { Detected };
