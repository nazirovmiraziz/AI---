import type { ChatMessage, StudentProfile } from "../types";
import { firstName } from "../cabinet";
import { DEMO_EMAIL } from "../demo-data";

const MAX_TURNS = 8;
const MAX_CHARS = 800;

export function compactAiHistory(
  messages: { role: string; content: string }[]
): { role: string; content: string }[] {
  const cleaned = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role,
      content: String(m.content || "").slice(0, MAX_CHARS),
    }))
    .filter((m) => m.content.trim());
  return cleaned.slice(-MAX_TURNS);
}

export function studentContext(profile: StudentProfile | null) {
  if (!profile) return null;
  const demo = profile.email?.toLowerCase() === DEMO_EMAIL;
  const name = demo ? "" : firstName(profile.name);
  return {
    name,
    grade: profile.grade,
    goal: profile.goal,
    language: profile.language,
    lessonLanguage: profile.lessonLanguage,
    subjects: (profile.favoriteSubjects ?? []).slice(0, 6),
    weakTopics: (profile.weakTopics ?? []).slice(0, 6),
    strongTopics: (profile.strongTopics ?? []).slice(0, 4),
    recentTopics: (profile.recentTopics ?? []).slice(0, 4),
    continueTopic: profile.continueLesson?.topicId,
    xp: profile.xp,
    streak: profile.streak,
    dailyGoalMin: profile.dailyGoalMin ?? 20,
  };
}

export function groupChatsByDay<T extends { updatedAt: string }>(items: T[]) {
  const today = new Date().toISOString().slice(0, 10);
  const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const buckets: { label: string; items: T[] }[] = [
    { label: "Сегодня", items: [] },
    { label: "Вчера", items: [] },
    { label: "Раньше", items: [] },
  ];
  for (const item of items) {
    const day = item.updatedAt.slice(0, 10);
    if (day === today) buckets[0].items.push(item);
    else if (day === yest) buckets[1].items.push(item);
    else buckets[2].items.push(item);
  }
  return buckets.filter((b) => b.items.length);
}

export function chatErrorCopy(status?: number, raw?: string) {
  if (status === 401 || status === 403) return "Нет доступа к репетитору. Войди снова.";
  if (status === 404) return "Репетитор временно недоступен.";
  if (status === 413) return "Запрос слишком длинный. Сократи текст или фото.";
  if (status === 429) return "Слишком много запросов. Подожди минуту и попробуй снова.";
  if (status === 504) return "Репетитор думает слишком долго. Задай вопрос короче.";
  if (status && status >= 500) return "Не удалось получить ответ ИИ.";
  if (raw === "stopped") return "Ответ остановлен.";
  return raw || "Не удалось получить ответ ИИ.";
}

export type HistoryMessage = Pick<ChatMessage, "role" | "content">;
