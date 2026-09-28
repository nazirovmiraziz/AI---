import type { CefrLevel, PlacementQuestion, PlacementResult } from "./types";
import { CEFR_ORDER } from "./types";

export const PLACEMENT: PlacementQuestion[] = [
  {
    id: "v1",
    skill: "vocabulary",
    prompt: "Что значит hello?",
    options: ["пока", "привет", "спасибо", "пожалуйста"],
    answer: "привет",
    weight: "A1",
  },
  {
    id: "v2",
    skill: "vocabulary",
    prompt: "Apple — это…",
    options: ["яблоко", "хлеб", "вода", "сыр"],
    answer: "яблоко",
    weight: "A1",
  },
  {
    id: "v3",
    skill: "vocabulary",
    prompt: "Как сказать «станция»?",
    options: ["kitchen", "station", "garden", "window"],
    answer: "station",
    weight: "A1",
  },
  {
    id: "g1",
    skill: "grammar",
    prompt: "Выбери верное: I ___ a student.",
    options: ["is", "are", "am", "be"],
    answer: "am",
    weight: "A1",
  },
  {
    id: "g2",
    skill: "grammar",
    prompt: "She ___ to school every day.",
    options: ["go", "goes", "going", "gone"],
    answer: "goes",
    weight: "A2",
  },
  {
    id: "g3",
    skill: "grammar",
    prompt: "I ___ to London last year.",
    options: ["go", "goed", "went", "gone"],
    answer: "went",
    weight: "A2",
  },
  {
    id: "g4",
    skill: "grammar",
    prompt: "If I ___ time, I would travel more.",
    options: ["have", "had", "has", "having"],
    answer: "had",
    weight: "B1",
  },
  {
    id: "r1",
    skill: "reading",
    prompt: "Текст: «My name is Sara. I am from Italy.» Откуда Сара?",
    options: ["Франция", "Италия", "Испания", "Германия"],
    answer: "Италия",
    weight: "A1",
  },
  {
    id: "r2",
    skill: "reading",
    prompt: "Текст: «Tom gets up at seven, then he goes to work by bus.» Как Том добирается?",
    options: ["пешком", "на автобусе", "на поезде", "на машине"],
    answer: "на автобусе",
    weight: "A2",
  },
  {
    id: "r3",
    skill: "reading",
    prompt: "Текст: «Although the weather was poor, they decided to continue the trip.» Они…",
    options: ["остались дома", "продолжили поездку", "купили билет позже", "отменили всё"],
    answer: "продолжили поездку",
    weight: "B1",
  },
  {
    id: "l1",
    skill: "listening",
    prompt: "Послушай и выбери, что сказано.",
    audio: "Hello, my name is Tom.",
    options: ["Hello, my name is Tom.", "Goodbye, see you tomorrow.", "How much is this?", "I am hungry."],
    answer: "Hello, my name is Tom.",
    weight: "A1",
  },
  {
    id: "l2",
    skill: "listening",
    prompt: "Послушай и выбери фразу.",
    audio: "Where is the station?",
    options: ["Where is the station?", "What time is it?", "Can I have a coffee?", "This is my sister."],
    answer: "Where is the station?",
    weight: "A1",
  },
  {
    id: "s1",
    skill: "sentence",
    prompt: "Собери смысл: «Меня зовут Анна.»",
    options: ["I name Anna.", "My name is Anna.", "I am name Anna.", "Name I Anna."],
    answer: "My name is Anna.",
    weight: "A1",
  },
  {
    id: "s2",
    skill: "sentence",
    prompt: "Как спросить цену?",
    options: ["How many you cost?", "What price this?", "How much is this?", "Is cost how?"],
    answer: "How much is this?",
    weight: "A2",
  },
  {
    id: "s3",
    skill: "sentence",
    prompt: "Вежливый заказ в кафе:",
    options: ["Give coffee.", "I want coffee now.", "Can I have a coffee, please?", "Coffee to me."],
    answer: "Can I have a coffee, please?",
    weight: "A2",
  },
];

const SKILL_KEYS = ["vocabulary", "grammar", "reading", "listening", "sentence"] as const;

export function scorePlacement(answers: Record<string, string>): PlacementResult {
  const bySkill: Record<string, { ok: number; all: number }> = {};
  let points = 0;
  let max = 0;
  for (const q of PLACEMENT) {
    const slot = (bySkill[q.skill] ??= { ok: 0, all: 0 });
    slot.all += 1;
    max += 1;
    if (answers[q.id] === q.answer) {
      slot.ok += 1;
      points += 1;
    }
  }
  const skills: Record<string, number> = {};
  for (const k of SKILL_KEYS) {
    const s = bySkill[k] ?? { ok: 0, all: 1 };
    skills[k] = Math.round((s.ok / Math.max(1, s.all)) * 100);
  }
  const ratio = points / Math.max(1, max);
  let level: CefrLevel = "A1";
  if (ratio >= 0.92) level = "B2";
  else if (ratio >= 0.78) level = "B1";
  else if (ratio >= 0.55) level = "A2";
  else level = "A1";

  const weak = (Object.entries(skills).sort((a, b) => a[1] - b[1])[0] ?? ["grammar", 0])[0];
  return { level, skills, weak, answers };
}

export function selfToCefr(self: "zero" | "beginner" | "intermediate" | "advanced" | "unknown"): CefrLevel {
  if (self === "beginner") return "A2";
  if (self === "intermediate") return "B1";
  if (self === "advanced") return "B2";
  return "A1";
}

export function nextCefr(level: CefrLevel): CefrLevel | null {
  const i = CEFR_ORDER.indexOf(level);
  return CEFR_ORDER[i + 1] ?? null;
}
