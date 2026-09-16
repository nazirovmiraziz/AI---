import type { StudentProfile, Flashcard, Conversation, StudyPlan, TestRecord } from "./types";

export const DEMO_EMAIL = "alisher@smartschool.ai";
export const DEMO_PASSWORD = "demo1234";

const tests: TestRecord[] = [
  {
    id: "t1",
    title: "Квадратные уравнения",
    subjectId: "math",
    topic: "quadratic",
    score: 8,
    total: 10,
    date: new Date(Date.now() - 86400000).toISOString(),
    strong: ["Формула корней"],
    weak: ["Дискриминант"],
    durationSec: 720,
  },
  {
    id: "t2",
    title: "English tenses",
    subjectId: "english",
    topic: "tenses",
    score: 9,
    total: 10,
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    strong: ["Present Simple", "Present Continuous"],
    weak: ["Present Perfect"],
    durationSec: 540,
  },
  {
    id: "t3",
    title: "Закон Ома",
    subjectId: "physics",
    topic: "ohm",
    score: 6,
    total: 10,
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    strong: ["Формула I = U/R"],
    weak: ["Последовательное соединение"],
    durationSec: 600,
  },
];

export const demoUser: StudentProfile = {
  id: "u-alisher",
  name: "Алишер",
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
  grade: "9",
  country: "TJ",
  language: "ru",
  lessonLanguage: "ru",
  goal: "university",
  favoriteSubjects: ["math", "english", "cs"],
  subjectLevels: {
    math: 82,
    physics: 61,
    chemistry: 73,
    cs: 70,
    biology: 68,
    geography: 74,
    history: 65,
    russian: 80,
    tajik: 86,
    english: 88,
    chinese: 40,
    korean: 22,
    arabic: 35,
  },
  learnedTopics: [
    "percentages",
    "linear-eq",
    "functions",
    "photosynthesis",
    "tenses",
    "pythagoras",
    "ohm",
  ],
  weakTopics: ["discriminant", "quadratic", "ohm", "tenses"],
  strongTopics: ["percentages", "linear-eq", "functions", "english"],
  xp: 4820,
  streak: 12,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  achievements: ["first-topic", "streak-7", "first-exam", "hundred-tasks"],
  testHistory: tests,
  explainStyle: "student",
  hintOnly: false,
  theme: "dark",
  onboardingDone: true,
  diagnosticDone: true,
  continueLesson: { topicId: "quadratic", subjectId: "math", progress: 72 },
  lastStudy: { topic: "quadratic", date: new Date(Date.now() - 86400000).toISOString() },
  weeklyMinutes: [35, 48, 20, 62, 40, 55, 28],
  topicsThisWeek: 6,
  studyMinutes: 1240,
};

export const demoFlashcards: Flashcard[] = [
  {
    id: "fc1",
    topic: "discriminant",
    subjectId: "math",
    front: "Что такое дискриминант?",
    back: "D = b² − 4ac. Он показывает, сколько действительных корней у квадратного уравнения.",
    ease: 2.1,
    interval: 1,
    due: new Date().toISOString(),
    reps: 2,
  },
  {
    id: "fc2",
    topic: "ohm",
    subjectId: "physics",
    front: "Закон Ома для участка цепи",
    back: "I = U / R. Сила тока прямо пропорциональна напряжению и обратно пропорциональна сопротивлению.",
    ease: 2.0,
    interval: 1,
    due: new Date().toISOString(),
    reps: 1,
  },
  {
    id: "fc3",
    topic: "tenses",
    subjectId: "english",
    front: "When do we use Present Perfect?",
    back: "For actions that started in the past and still matter now: I have finished the homework.",
    ease: 2.3,
    interval: 3,
    due: new Date().toISOString(),
    reps: 4,
  },
  {
    id: "fc4",
    topic: "quadratic",
    subjectId: "math",
    front: "Формула корней квадратного уравнения",
    back: "x = (−b ± √D) / 2a, где D = b² − 4ac.",
    ease: 2.5,
    interval: 4,
    due: new Date(Date.now() + 86400000).toISOString(),
    reps: 5,
  },
];

export const demoPlan: StudyPlan = {
  id: "plan-30",
  goal: "Хочу подготовиться к экзамену по математике за 30 дней.",
  createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  days: [
    { day: 1, title: "Линейные уравнения", topicId: "linear-eq", done: true, minutes: 25 },
    { day: 2, title: "Системы уравнений", topicId: "systems", done: true, minutes: 30 },
    { day: 3, title: "Квадратные уравнения", topicId: "quadratic", done: true, minutes: 35 },
    { day: 4, title: "Дискриминант", topicId: "discriminant", done: false, minutes: 20 },
    { day: 5, title: "Функции и графики", topicId: "functions", done: false, minutes: 30 },
    { day: 6, title: "Практика: смешанные уравнения", done: false, minutes: 30 },
    { day: 7, title: "Мини-тест недели", done: false, minutes: 25 },
    ...Array.from({ length: 22 }, (_, i) => ({
      day: i + 8,
      title:
        i === 21
          ? "Пробный экзамен"
          : ["Геометрия", "Проценты", "Тригонометрия", "Повторение слабых тем", "Текстовые задачи"][i % 5],
      done: false,
      minutes: 30,
    })),
  ],
};

export const demoConversation: Conversation = {
  id: "c-quad",
  title: "Квадратные уравнения",
  pinned: true,
  subjectId: "math",
  topicId: "quadratic",
  lessonLanguage: "ru",
  updatedAt: new Date().toISOString(),
  messages: [
    {
      id: "m1",
      role: "user",
      content: "Объясни квадратные уравнения.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "m2",
      role: "assistant",
      content:
        "Начнём с нуля. Квадратное уравнение — это уравнение вида ax² + bx + c = 0, где a ≠ 0. Сегодня разберём, откуда берётся формула корней и как не путать дискриминант.",
      createdAt: new Date(Date.now() - 3590000).toISOString(),
      meta: { topic: "quadratic", subject: "math", understanding: 72 },
    },
  ],
};

export const ACHIEVEMENTS = [
  { id: "first-topic", icon: "🏆" },
  { id: "streak-7", icon: "🔥" },
  { id: "streak-30", icon: "🔥" },
  { id: "hundred-tasks", icon: "🧠" },
  { id: "fifty-topics", icon: "📚" },
  { id: "first-exam", icon: "🎓" },
  { id: "perfect-test", icon: "💯" },
  { id: "three-langs", icon: "🌎" },
  { id: "master", icon: "⭐" },
] as const;

export const LEVELS = [
  { id: 5, nameKey: "level.novice", min: 0 },
  { id: 4, nameKey: "level.student", min: 800 },
  { id: 3, nameKey: "level.advanced", min: 2200 },
  { id: 2, nameKey: "level.excellent", min: 4000 },
  { id: 1, nameKey: "level.expert", min: 5500 },
  { id: 0, nameKey: "level.master", min: 8000 },
] as const;

export function levelFromXp(xp: number) {
  const sorted = [...LEVELS].sort((a, b) => b.min - a.min);
  const current = sorted.find((l) => xp >= l.min) ?? LEVELS[0];
  const idx = LEVELS.findIndex((l) => l.id === current.id);
  const next = idx > 0 ? LEVELS[idx - 1] : null;
  const prevMin = current.min;
  const nextMin = next?.min ?? current.min;
  const span = Math.max(1, nextMin - prevMin);
  const progress = next ? Math.min(100, ((xp - prevMin) / span) * 100) : 100;
  return { current, next, progress, remaining: next ? Math.max(0, next.min - xp) : 0 };
}

export const XP_REWARDS = {
  lesson: 10,
  task: 20,
  test: 50,
  topic: 100,
  exam: 200,
  plan: 500,
} as const;
