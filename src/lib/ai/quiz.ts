import { askAi } from "../ask-ai";
import { pickAdaptive } from "../questions";
import type { StudentProfile, TestQuestion } from "../types";

function parseQuiz(raw: string): TestQuestion[] {
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start < 0 || end <= start) return [];
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Array<Partial<TestQuestion> & { answer?: unknown }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item, i): TestQuestion | null => {
        const prompt = String(item.prompt ?? "").trim();
        if (!prompt) return null;
        const type = item.type === "input" || item.type === "boolean" || item.type === "single" ? item.type : "single";
        return {
          id: String(item.id || `ai-${i + 1}`),
          type,
          prompt,
          options: Array.isArray(item.options) ? item.options.map(String) : type === "boolean" ? ["Верно", "Неверно"] : undefined,
          answer: (item.answer ?? "") as TestQuestion["answer"],
          explanation: String(item.explanation ?? "Разберём вместе."),
          topic: String(item.topic ?? "mixed"),
          difficulty: Number(item.difficulty) || 2,
        };
      })
      .filter((q): q is TestQuestion => Boolean(q));
  } catch {
    return [];
  }
}

export async function generateQuiz(opts: {
  subject: string;
  topic: string;
  topicLabel: string;
  difficulty: string;
  count: number;
  grade?: string;
  profile: StudentProfile | null;
}): Promise<{ items: TestQuestion[]; source: "gemini" | "bank"; notice?: string }> {
  const count = Math.min(12, Math.max(3, opts.count));
  const prompt = `Составь тест для школы.
Предмет: ${opts.subject}
Тема: ${opts.topicLabel}
Класс: ${opts.grade || "8"}
Сложность: ${opts.difficulty}
Количество вопросов: ${count}
Верни только JSON-массив.`;

  try {
    const res = await askAi({
      messages: [{ role: "user", content: prompt }],
      profile: opts.profile,
      style: "simple",
      lessonLanguage: opts.profile?.lessonLanguage ?? "ru",
      hintOnly: false,
      fallbackText: prompt,
      mode: "quiz",
    });
    const generated = parseQuiz(res.content);
    if (generated.length >= 3) {
      return { items: generated.slice(0, count), source: res.demo ? "bank" : "gemini", notice: res.demo ? "ИИ сейчас без сети — взяли вопросы из школьной базы." : undefined };
    }
  } catch {
    /* bank */
  }

  const bank = pickAdaptive(opts.topic, opts.difficulty === "hard" ? 4 : opts.difficulty === "easy" ? 1 : 2, [], count);
  const extra = bank.length < count ? pickAdaptive("mixed", 2, bank.map((q) => q.id), count - bank.length) : [];
  return {
    items: [...bank, ...extra].slice(0, count),
    source: "bank",
    notice: "ИИ не собрал тест. Открыли вопросы из школьной базы.",
  };
}
