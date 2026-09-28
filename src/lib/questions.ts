import type { TestQuestion } from "./types";

export const QUESTION_BANK: TestQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "Квадратное уравнение имеет вид:",
    options: ["ax + b = 0", "ax² + bx + c = 0, a ≠ 0", "a/x + b = 0", "x³ + a = 0"],
    answer: "ax² + bx + c = 0, a ≠ 0",
    explanation: "Старший коэффициент a не равен нулю, иначе уравнение станет линейным.",
    topic: "quadratic",
    difficulty: 1,
  },
  {
    id: "q2",
    type: "single",
    prompt: "Дискриминант уравнения ax² + bx + c = 0 равен:",
    options: ["b² + 4ac", "b² − 4ac", "2a + b", "−b / 2a"],
    answer: "b² − 4ac",
    explanation: "D = b² − 4ac. Знак D определяет число действительных корней.",
    topic: "discriminant",
    difficulty: 2,
  },
  {
    id: "q3",
    type: "boolean",
    prompt: "Если D < 0, у квадратного уравнения два действительных корня.",
    options: ["Верно", "Неверно"],
    answer: false,
    explanation: "При D < 0 действительных корней нет.",
    topic: "discriminant",
    difficulty: 2,
  },
  {
    id: "q4",
    type: "input",
    prompt: "Найдите дискриминант: x² − 5x + 6 = 0",
    answer: "1",
    explanation: "D = 25 − 24 = 1.",
    topic: "discriminant",
    difficulty: 3,
  },
  {
    id: "q5",
    type: "solve",
    prompt: "Решите: x² − 5x + 6 = 0. Запишите корни через запятую (меньший, больший).",
    answer: "2, 3",
    explanation: "D = 1, x = (5 ± 1)/2 → x = 2 и x = 3.",
    topic: "quadratic",
    difficulty: 3,
  },
  {
    id: "q6",
    type: "multiple",
    prompt: "Выберите верные утверждения.",
    options: [
      "При D = 0 корень один (кратный)",
      "При D > 0 два различных корня",
      "a может быть равен 0",
      "Формула корней: (−b ± √D) / 2a",
    ],
    answer: ["При D = 0 корень один (кратный)", "При D > 0 два различных корня", "Формула корней: (−b ± √D) / 2a"],
    explanation: "Если a = 0, уравнение уже не квадратное.",
    topic: "quadratic",
    difficulty: 4,
  },
  {
    id: "q7",
    type: "match",
    prompt: "Сопоставьте значение D и число корней.",
    options: ["D > 0", "D = 0", "D < 0"],
    matchPairs: [
      { left: "D > 0", right: "два корня" },
      { left: "D = 0", right: "один корень" },
      { left: "D < 0", right: "нет действительных корней" },
    ],
    answer: ["два корня", "один корень", "нет действительных корней"],
    explanation: "Это базовое правило работы с дискриминантом.",
    topic: "discriminant",
    difficulty: 2,
  },
  {
    id: "q8",
    type: "single",
    prompt: "Решите 2x + 5 = 17. Чему равен x?",
    options: ["5", "6", "7", "12"],
    answer: "6",
    explanation: "2x = 12, x = 6.",
    topic: "linear-eq",
    difficulty: 1,
  },
  {
    id: "q9",
    type: "single",
    prompt: "Закон Ома: сила тока I равна",
    options: ["U · R", "U / R", "R / U", "U + R"],
    answer: "U / R",
    explanation: "I = U / R.",
    topic: "ohm",
    difficulty: 1,
  },
  {
    id: "q10",
    type: "boolean",
    prompt: "Present Perfect описывает действие, которое важно сейчас.",
    options: ["Верно", "Неверно"],
    answer: true,
    explanation: "Связь прошлого с настоящим — ключ Present Perfect.",
    topic: "tenses",
    difficulty: 2,
  },
  {
    id: "q11",
    type: "single",
    prompt: "Теорема Пифагора:",
    options: ["a + b = c", "a² + b² = c²", "a² − b² = c", "2a + 2b = c"],
    answer: "a² + b² = c²",
    explanation: "В прямоугольном треугольнике квадрат гипотенузы равен сумме квадратов катетов.",
    topic: "pythagoras",
    difficulty: 1,
  },
  {
    id: "q12",
    type: "input",
    prompt: "Сколько процентов составляет 15 от 60?",
    answer: "25",
    explanation: "15/60 = 0.25 = 25%.",
    topic: "percentages",
    difficulty: 2,
  },
  {
    id: "q13",
    type: "single",
    prompt: "Фотосинтез происходит в:",
    options: ["Митохондриях", "Хлоропластах", "Ядре", "Вакуоли"],
    answer: "Хлоропластах",
    explanation: "Хлорофилл в хлоропластах улавливает свет.",
    topic: "photosynthesis",
    difficulty: 1,
  },
  {
    id: "q14",
    type: "solve",
    prompt: "Найдите ток, если U = 12 В, R = 4 Ом.",
    answer: "3",
    explanation: "I = 12 / 4 = 3 А.",
    topic: "ohm",
    difficulty: 2,
  },
  {
    id: "q15",
    type: "single",
    prompt: "Choose the correct sentence:",
    options: ["She go to school", "She goes to school", "She going to school", "She gone to school"],
    answer: "She goes to school",
    explanation: "Present Simple, 3rd person singular: verb + s.",
    topic: "tenses",
    difficulty: 1,
  },
  {
    id: "q16",
    type: "single",
    prompt: "Почему небо голубое?",
    options: [
      "Отражение океана",
      "Рассеяние солнечного света на молекулах воздуха",
      "Свечение азота",
      "Поляризация облаков",
    ],
    answer: "Рассеяние солнечного света на молекулах воздуха",
    explanation: "Это рассеяние Рэлея: короткие (синие) волны рассеиваются сильнее.",
    topic: "sky-blue",
    difficulty: 2,
  },
  {
    id: "q17",
    type: "input",
    prompt: "Корни x² − 9 = 0. Запишите через запятую.",
    answer: "-3, 3",
    explanation: "x² = 9, x = ±3.",
    topic: "quadratic",
    difficulty: 2,
  },
  {
    id: "q18",
    type: "boolean",
    prompt: "Если D = 0, корней нет.",
    options: ["Верно", "Неверно"],
    answer: false,
    explanation: "При D = 0 есть один (кратный) корень x = −b / 2a.",
    topic: "discriminant",
    difficulty: 1,
  },
  {
    id: "q19",
    type: "single",
    prompt: "15% от 80 равно",
    options: ["8", "10", "12", "15"],
    answer: "12",
    explanation: "0.15 × 80 = 12.",
    topic: "percentages",
    difficulty: 2,
  },
  {
    id: "q20",
    type: "single",
    prompt: "В формуле I = U/R при увеличении R ток:",
    options: ["растёт", "не меняется", "уменьшается", "становится нулём"],
    answer: "уменьшается",
    explanation: "Ток обратно пропорционален сопротивлению.",
    topic: "ohm",
    difficulty: 3,
  },
  {
    id: "q21",
    type: "single",
    prompt: "Второй закон Ньютона: сила F равна",
    options: ["m / a", "m + a", "m · a", "a / m"],
    answer: "m · a",
    explanation: "Сила — масса умножить на ускорение. F = ma.",
    topic: "newton",
    difficulty: 1,
  },
  {
    id: "q22",
    type: "input",
    prompt: "Масса 4 кг, ускорение 2 м/с². Чему равна сила в ньютонах?",
    answer: "8",
    explanation: "F = 4 × 2 = 8 Н.",
    topic: "newton",
    difficulty: 2,
  },
  {
    id: "q23",
    type: "boolean",
    prompt: "Если на тело не действует сила, его скорость всё равно меняется.",
    options: ["Верно", "Неверно"],
    answer: false,
    explanation: "Без силы скорость не меняется. Это первый закон Ньютона.",
    topic: "newton",
    difficulty: 1,
  },
  {
    id: "q24",
    type: "single",
    prompt: "Кинетическая энергия больше зависит от",
    options: ["цвета тела", "скорости", "названия", "температуры воздуха"],
    answer: "скорости",
    explanation: "В формуле mv²/2 скорость в квадрате, поэтому она влияет сильнее.",
    topic: "energy",
    difficulty: 2,
  },
  {
    id: "q25",
    type: "boolean",
    prompt: "Работа есть, когда сила сдвигает тело.",
    options: ["Верно", "Неверно"],
    answer: true,
    explanation: "Если тело не сдвинулось, работы нет.",
    topic: "energy",
    difficulty: 1,
  },
];

export function pickAdaptive(topic: string, difficulty: number, used: string[], count: number) {
  const pool = QUESTION_BANK.filter(
    (q) => (q.topic === topic || topic === "mixed") && !used.includes(q.id)
  );
  const nearby = pool.sort(
    (a, b) => Math.abs(a.difficulty - difficulty) - Math.abs(b.difficulty - difficulty)
  );
  const selected = nearby.slice(0, count);
  return selected;
}

export function gradeAnswer(q: TestQuestion, value: unknown): boolean {
  if (q.type === "boolean") {
    const v = value === true || value === "true" || value === "Верно" || value === "True";
    return v === q.answer;
  }
  if (q.type === "multiple") {
    const a = [...((value as string[]) ?? [])].sort().join("|");
    const b = [...(q.answer as string[])].sort().join("|");
    return a === b;
  }
  if (q.type === "match") {
    const a = ((value as string[]) ?? []).join("|");
    const b = (q.answer as string[]).join("|");
    return a === b;
  }
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  const expected = String(q.answer)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (raw === expected) return true;
  const norm = (s: string) => s.replace(/[−–]/g, "-").replace(/\s/g, "");
  return norm(raw) === norm(expected);
}
