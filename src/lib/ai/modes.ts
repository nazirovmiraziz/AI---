import type { AiMode } from "../types";

export const AI_MODES: { id: AiMode; label: string; hint: string }[] = [
  { id: "tutor", label: "Учитель", hint: "Ведёт и объясняет" },
  { id: "chat", label: "Короткий ответ", hint: "Ясно и по делу" },
  { id: "practice", label: "Практика", hint: "Задача за задачей" },
  { id: "explain", label: "Объяснить", hint: "Сложную тему проще" },
  { id: "homework", label: "Домашка", hint: "Шаг за шагом вместе" },
  { id: "quiz", label: "Тест", hint: "Собрать проверку" },
  { id: "translator", label: "Перевод", hint: "Слово и пример" },
  { id: "coding", label: "Код", hint: "Программирование" },
];

export const MODE_INSTRUCTIONS: Record<AiMode, string> = {
  chat: `Mode: free chat, like Gemini.
Answer any question directly and correctly: school subjects or general.
Keep it short and clear. Give the answer. No extra questions at the end.`,
  tutor: `Mode: teacher.
Explain the answer first, short and clear. Then one tiny example if useful.
Give the result. Do not quiz the student unless they ask.`,
  practice: `Mode: practice.
Only if they want practice: one problem. If they asked a normal question, just answer it.`,
  homework: `Mode: guided homework.
Recognize the problem. Do NOT give the final numeric or closed answer first.
Ask what the student thinks about the first step, then one hint.
Give the full solution only if they ask to see it or after they try.`,
  quiz: `Mode: exam / quiz.
If they ask to create a test, return ONLY a JSON array. No markdown fences. No extra text.
Each item:
{"id":"g1","type":"single","prompt":"...","options":["A","B","C","D"],"answer":"A","explanation":"...","topic":"...","difficulty":2}
Types allowed: single, input, boolean.
boolean options must be ["True","False"] and answer true or false.
If they are answering a problem in exam mode: check the answer, do not give hints before they submit.`,
  translator: `Mode: translator.
Give: translation, short meaning, one example sentence. Keep it short.`,
  coding: `Mode: coding tutor.
Explain with a short code block and comments in the student's language.
Do not invent APIs. If unsure, say so.`,
  explain: `Mode: explain.
Give the idea and one example. Do not ask a follow-up question.`,
};

export function titleFromQuestion(text: string) {
  const q = text.replace(/\s+/g, " ").trim();
  const low = q.toLowerCase();
  if (/newton|physic|force|accelerat|energy|ньютон|физик|сила|ускорен|энерг/.test(low)) return "Физика";
  if (/quadrat|discriminant|ax²|ax2|квадратн|дискриминант/.test(low)) return "Квадратные уравнения";
  if (/linear|3x|2x\s*\+|equation|линейн|уравнен/.test(low)) return "Линейные уравнения";
  if (/percent|процент/.test(low)) return "Проценты";
  if (/english|present simple|англий/.test(low)) return "Английский";
  if (/code|python|javascript|программ|код/.test(low)) return "Программирование";
  if (/translate|перевод/.test(low)) return "Перевод";
  return q.slice(0, 40) || "Новый диалог";
}
