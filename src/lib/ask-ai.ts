import { buildTutorReply, type Detected } from "./ai-engine";
import type { ChatMessage, ExplainStyle, Locale, StudentProfile } from "./types";

export async function askAi(opts: {
  messages: { role: string; content: string }[];
  profile: StudentProfile | null;
  style: ExplainStyle;
  lessonLanguage: Locale;
  hintOnly: boolean;
  image?: string;
  fallbackText: string;
}): Promise<{ content: string; demo: boolean; error?: string; meta?: ChatMessage["meta"] }> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: opts.messages,
        profile: opts.profile
          ? {
              name: opts.profile.name,
              grade: opts.profile.grade,
              weakTopics: opts.profile.weakTopics,
              strongTopics: opts.profile.strongTopics,
              subjectLevels: opts.profile.subjectLevels,
              goal: opts.profile.goal,
            }
          : null,
        style: opts.style,
        lessonLanguage: opts.lessonLanguage,
        hintOnly: opts.hintOnly,
        image: opts.image,
      }),
    });
    const data = await res.json();
    if (data.demo || res.status === 200 && data.demo !== false && !data.content) {
      const local = buildTutorReply({
        text: opts.fallbackText,
        style: opts.style,
        hintOnly: opts.hintOnly,
        profile: opts.profile,
        locale: opts.lessonLanguage,
        history: [],
      });
      return { content: local.content, demo: true, meta: local.meta };
    }
    if (!res.ok) {
      const local = buildTutorReply({
        text: opts.fallbackText,
        style: opts.style,
        hintOnly: opts.hintOnly,
        profile: opts.profile,
        locale: opts.lessonLanguage,
        history: [],
      });
      return { content: local.content, demo: true, error: data.message, meta: local.meta };
    }
    return { content: data.content, demo: false };
  } catch {
    const local = buildTutorReply({
      text: opts.fallbackText,
      style: opts.style,
      hintOnly: opts.hintOnly,
      profile: opts.profile,
      locale: opts.lessonLanguage,
      history: [],
    });
    return { content: local.content, demo: true, error: "AI временно недоступен. Попробуйте ещё раз.", meta: local.meta };
  }
}

export type { Detected };
