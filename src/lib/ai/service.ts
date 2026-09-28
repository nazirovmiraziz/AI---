import { askAi } from "../ask-ai";
import type { AiMode, ChatMessage, ExplainStyle, Locale, StudentProfile } from "../types";

export async function askSchoolAi(opts: {
  messages: { role: string; content: string }[];
  profile: StudentProfile | null;
  style?: ExplainStyle;
  lessonLanguage?: Locale;
  hintOnly?: boolean;
  image?: string;
  fallbackText: string;
  mode?: AiMode;
  signal?: AbortSignal;
}): Promise<{ content: string; demo: boolean; error?: string; meta?: ChatMessage["meta"] }> {
  return askAi({
    messages: opts.messages,
    profile: opts.profile,
    style: opts.style ?? "simple",
    lessonLanguage: opts.lessonLanguage ?? "ru",
    hintOnly: opts.hintOnly ?? false,
    image: opts.image,
    fallbackText: opts.fallbackText,
    mode: opts.mode,
    signal: opts.signal,
  });
}

export { askAi } from "../ask-ai";
