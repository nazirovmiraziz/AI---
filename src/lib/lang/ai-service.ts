import { askAi } from "@/lib/ask-ai";
import type { StudentProfile } from "@/lib/types";
import type { LanguageTrack as Track } from "./types";
import { isInventedName } from "@/lib/cabinet";

const TUTOR = "Языковой репетитор";

function localCoach(message: string, track?: Track | null) {
  const q = message.trim();
  const low = q.toLowerCase();
  const weak = track?.weakTags?.[0];
  const nameNote = weak ? `Я вижу, что тебе пока трудно с темой «${weak}». ` : "";

  if (/past simple|прошл/i.test(low)) {
    return `${nameNote}Давай разберём Past Simple без готового ответа сразу.\n\nПодумай: действие уже закончилось вчера? Тогда обычно нужен второй столбец глагола: go → went.\n\nПопробуй теперь одно предложение про вчера. Напиши его сюда — я не исправлю всё сразу, а спрошу, где время.`;
  }
  if (/present simple|present/i.test(low)) {
    return `Конечно. Present Simple — для привычек и фактов.\n\nI play football every Sunday.\nShe plays — после he/she/it появляется -s.\n\nСоставь одно предложение о том, что ты делаешь каждый день. Пока не подсматривай правило полностью.`;
  }
  if (/не понимаю|объясн|что такое/i.test(low)) {
    return `${nameNote}Давай по шагам. Скажи, что именно неясно: слово, время глагола или вопрос?\n\nПока подсказка: найди в предложении время — yesterday, every day, now. От этого зависит форма.`;
  }
  if (q.length < 40 && /i |am |is |are /.test(low)) {
    return `Хорошая попытка. Не даю готовый вариант сразу.\n\nПосмотри: есть ли подлежащее и глагол? Если говоришь о себе в настоящем — чаще I am или I + глагол без am.\n\nНапиши ту же мысль ещё раз, чуть медленнее.`;
  }
  return `${nameNote}Я рядом. Мы не выдаём готовый ответ — сначала короткий шаг.\n\n1) Что ты хочешь сказать?\n2) Это сейчас, каждый день или вчера?\n\nОтветь на второй вопрос — и мы соберём фразу вместе.\n\nТвоё сообщение: «${q.slice(0, 180)}»`;
}

export async function languageTutorAsk(opts: {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  track?: Track | null;
  localeName: string;
  student: StudentProfile | null;
}) {
  const rawName = opts.student?.name?.split(/\s+/)[0] || "";
  const name = isInventedName(rawName) ? "друг" : rawName;
  const sys = [
    `Ты ${TUTOR} в Smart School. Ученика зовут ${name}. Изучает ${opts.localeName}.`,
    "Говори просто, по-русски, коротко.",
    "НЕ давай сразу правильный ответ. Сначала наводящий вопрос или маленькая подсказка.",
    "Потом пример. Потом попроси ученика составить свою фразу.",
    opts.track?.weakTags?.length ? `Слабые темы: ${opts.track.weakTags.join(", ")}.` : "",
    opts.track ? `Уровень ${opts.track.cefr}. Цель: ${opts.track.reason}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const res = await askAi({
      messages: [
        { role: "system", content: sys },
        ...opts.history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: opts.message },
      ],
      profile: opts.student,
      style: "simple",
      lessonLanguage: "ru",
      hintOnly: true,
      fallbackText: opts.message,
    });
    if (res.content?.trim()) return res.content.trim();
  } catch {
    /* mock */
  }
  return localCoach(opts.message, opts.track);
}

export function writingFeedback(original: string, topic: string) {
  const t = original.trim() || "…";
  const lines = t
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const better = lines.length
    ? lines.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(". ") + "."
    : "I am a student. I live in a city. I like English.";
  return {
    original: t,
    corrected: better,
    explain: `Тема: ${topic}. Смотри на заглавную букву и точку. Если про себя — I с большой буквы. Не копируй мой вариант слепо: оставь свои факты.`,
    better,
    scores: {
      grammar: Math.min(92, 55 + lines.length * 6),
      vocabulary: Math.min(90, 50 + t.split(/\s+/).length),
      structure: lines.length >= 3 ? 78 : 60,
      spelling: /[а-я]/i.test(t) ? 62 : 80,
    },
  };
}

export function talkReply(userLine: string, scene: string, turn: number) {
  const low = userLine.toLowerCase();
  if (turn === 0) return { ai: `Ситуация: ${scene}. Я начинаю. Ответь коротко, своими словами.`, score: null };
  let ai = "Good. Can you say a little more?";
  if (/hello|hi|привет/.test(low)) ai = "Nice to meet you. Where are you from?";
  else if (/from|live/.test(low)) ai = "That is interesting. What do you like to eat?";
  else if (/coffee|tea|pizza|eat/.test(low)) ai = "Sure. And what do you do every morning?";
  else if (/name/.test(low)) ai = "Nice name. How are you today?";
  else if (turn > 3) ai = "Thank you. Let us stop here and look at one sentence together.";
  const issues: string[] = [];
  if (/\bi want order\b/i.test(userLine)) issues.push("I want order pizza. → лучше I want to order pizza.");
  if (/\bi is\b/i.test(userLine)) issues.push("I is → I am.");
  if (/\bshe go\b/i.test(userLine)) issues.push("she go → she goes.");
  return {
    ai,
    score:
      turn >= 4
        ? {
            vocabulary: 78 + (userLine.length > 12 ? 6 : 0),
            grammar: issues.length ? 64 : 82,
            fluency: Math.min(88, 60 + turn * 5),
            notes: issues,
          }
        : null,
  };
}

export { TUTOR as LANG_TUTOR_NAME };
