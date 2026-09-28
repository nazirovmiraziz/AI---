import { pickAdaptive } from "./questions";
import { getTopic } from "./subjects";
import type { StudyPlan, TestQuestion } from "./types";

export function buildStarterPlan(opts: {
  goal: string;
  dailyGoalMin: number;
  subjects?: string[];
}): StudyPlan {
  const focus = opts.subjects?.[0];
  const days = PLAN_CYCLE.map((item, i) => ({
    day: i + 1,
    title: item.title,
    topicId: item.topicId,
    done: false,
    minutes: opts.dailyGoalMin,
  }));
  return {
    id: `p-${Date.now()}`,
    goal: opts.goal || (focus ? `Разобраться в предмете: ${focus}` : "Понять школьные темы с нуля"),
    days,
    createdAt: new Date().toISOString(),
  };
}

export const PLAN_CYCLE = [
  { title: "Линейные уравнения", topicId: "linear-eq" },
  { title: "Системы уравнений", topicId: "systems" },
  { title: "Квадратные уравнения", topicId: "quadratic" },
  { title: "Дискриминант", topicId: "discriminant" },
  { title: "Функции", topicId: "functions" },
] as const;

export const EXAM_TOPICS: Record<string, string[]> = {
  math: ["linear-eq", "quadratic", "discriminant", "percentages"],
  physics: ["newton", "ohm", "energy"],
  english: ["tenses"],
};

export function isKnownTopic(id: string) {
  return Boolean(getTopic(id));
}

export function pickExamQuestions(subjectId: string, examType: string): TestQuestion[] {
  const topics = EXAM_TOPICS[subjectId] ?? EXAM_TOPICS.math;
  const count = examType === "olymp" ? 10 : examType === "mid" ? 6 : 8;
  const diff = examType === "olymp" ? 4 : examType === "mid" ? 2 : 3;
  const used: string[] = [];
  const out: TestQuestion[] = [];
  const per = Math.max(1, Math.ceil(count / topics.length));
  for (const topic of topics) {
    const batch = pickAdaptive(topic, diff, used, per);
    out.push(...batch);
    used.push(...batch.map((q) => q.id));
    if (out.length >= count) break;
  }
  return out.slice(0, count);
}

export function mergeTopics(current: string[], incoming: string[], drop: string[] = []) {
  const next = [...incoming.filter(isKnownTopic), ...current.filter((id) => !drop.includes(id) && isKnownTopic(id))];
  return Array.from(new Set(next)).slice(0, 12);
}
