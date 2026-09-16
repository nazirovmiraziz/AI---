import type { ChatMessage, ExplainStyle, Locale, StudentProfile } from "./types";
import { getTopic, getSubject } from "./subjects";

export type AiIntent =
  | "explain"
  | "homework"
  | "quiz"
  | "check"
  | "plan"
  | "photo"
  | "hint"
  | "confused"
  | "search"
  | "chat"
  | "essay"
  | "exam"
  | "translate";

export interface Detected {
  intent: AiIntent;
  topicId?: string;
  subjectId?: string;
  style?: ExplainStyle;
  query: string;
}

const TOPIC_HINTS: Record<string, string[]> = {
  quadratic: ["квадратн", "quadratic", "ax²", "ax2"],
  discriminant: ["дискриминант", "discriminant", "b² - 4ac", "d ="],
  "linear-eq": ["линейн", "linear", "2x + 5", "уравнен"],
  percentages: ["процент", "percent"],
  photosynthesis: ["фотосинтез", "photosynthesis"],
  ohm: ["ом", "ohm", "ток", "напряжен"],
  pythagoras: ["пифагор", "pythagoras", "гипотенуз"],
  tenses: ["present", "время", "tenses", "perfect"],
  "sky-blue": ["небо голуб", "why is the sky", "рассеян"],
  functions: ["функци", "function", "график"],
  systems: ["систем", "system of"],
};

export function detectQuery(text: string, style?: ExplainStyle): Detected {
  const q = text.toLowerCase();
  let topicId: string | undefined;
  for (const [id, keys] of Object.entries(TOPIC_HINTS)) {
    if (keys.some((k) => q.includes(k))) {
      topicId = id;
      break;
    }
  }
  const subjectId = topicId ? getTopic(topicId)?.subjectId : q.includes("физик") ? "physics" : q.includes("матем") ? "math" : undefined;

  let intent: AiIntent = "explain";
  if (/реши за меня|сделай дз|homework|solve this for me/.test(q)) intent = "homework";
  else if (/проверь мои знания|check my|quiz me|проверь меня/.test(q)) intent = "check";
  else if (/тест|quiz|создай тест/.test(q)) intent = "quiz";
  else if (/план|30 дней|prepare in/.test(q)) intent = "plan";
  else if (/не понял|непонятно|confused|объясни иначе/.test(q)) intent = "confused";
  else if (/не говори ответ|хочу решить сам|hint only|подсказ/.test(q)) intent = "hint";
  else if (/сочинен|essay|проверь текст/.test(q)) intent = "essay";
  else if (/экзамен|exam/.test(q)) intent = "exam";
  else if (/перевод|translate|acceleration/.test(q)) intent = "translate";
  else if (/почему небо|what is|почему/.test(q) && !topicId) intent = "search";

  let detectedStyle = style;
  if (/как ребёнк|like a child/.test(q)) detectedStyle = "child";
  if (/как школьник|like a student/.test(q)) detectedStyle = "student";
  if (/коротко|brief/.test(q)) detectedStyle = "short";
  if (/подробн|in depth/.test(q)) detectedStyle = "detailed";
  if (/шутк|joke/.test(q)) detectedStyle = "funny";
  if (/экзамен/.test(q) && /объясн/.test(q)) detectedStyle = "exam";

  return { intent, topicId, subjectId, style: detectedStyle, query: text };
}

const STYLES: Record<ExplainStyle, (body: string) => string> = {
  child: (b) => `Представь, что это история.\n\n${b}\n\nЕсли что-то звучит сложно — остановись и спроси. Я объясню ещё проще.`,
  student: (b) => `${b}\n\nДавай после этого решим маленький пример вместе — так лучше запоминается.`,
  teacher: (b) => `Краткий методический конспект:\n\n${b}\n\nТипичные ошибки учеников: путают знак b, забывают, что a ≠ 0, считают D ответом уравнения.`,
  short: (b) => b.split("\n").filter(Boolean).slice(0, 4).join("\n"),
  detailed: (b) => `${b}\n\nДополнительно: проверь единицы, подставь корни обратно в уравнение и сравни с графиком функции — это три независимых способа убедиться, что решение верное.`,
  steps: (b) => b,
  funny: (b) => `${b}\n\nДискриминант — как погода перед прогулкой: он не гуляет за тебя, но говорит, брать ли зонт (то есть сколько корней искать).`,
  exam: (b) => `Формулировка «на экзамен»:\n\n${b}\n\nОформи решение: дано → формула → вычисления → проверка → ответ. Без проверки балл часто снижают.`,
  simple: (b) => b.replace(/дискриминант/gi, "индикатор числа корней").replace(/коэффициент/gi, "число перед x"),
};

const TOPICS: Record<string, { title: string; zero: string; example: string; together: string; task: string; answer: string; whyWrong: string }> = {
  quadratic: {
    title: "Квадратные уравнения",
    zero: "С нуля: это уравнение вида ax² + bx + c = 0, где a ≠ 0. «Квадратное» — потому что неизвестное в квадрате. Если a = 0, квадрата нет, и это уже другое уравнение.",
    example: "Простой пример: x² − 5x + 6 = 0. Здесь a = 1, b = −5, c = 6.",
    together: "Считаем вместе. D = b² − 4ac = 25 − 24 = 1. Корни: x = (5 ± 1)/2. Получаем 3 и 2. Проверка: 4 − 10 + 6 = 0. Сходится.",
    task: "Теперь твоя очередь. Реши x² − 9 = 0. Напиши оба корня.",
    answer: "-3 и 3",
    whyWrong: "Частая ошибка — забыть отрицательный корень. x² = 9 означает и 3, и −3.",
  },
  discriminant: {
    title: "Дискриминант",
    zero: "Дискриминант — не корень и не ответ. Это индикатор: D = b² − 4ac. Он говорит, сколько действительных решений искать.",
    example: "Для x² + 4x + 4 = 0: D = 16 − 16 = 0 → один корень.",
    together: "Разберём x² − x + 1 = 0: D = 1 − 4 = −3 < 0. Действительных корней нет. Это нормальный ответ, не ошибка.",
    task: "Найди D для 2x² − 4x + 2 = 0.",
    answer: "0",
    whyWrong: "Не забудь множитель 4ac целиком: 4·2·2 = 16, а b² = 16, значит D = 0.",
  },
  photosynthesis: {
    title: "Фотосинтез",
    zero: "Растение готовит себе еду из света, воды и углекислого газа. Кислород — побочный продукт, которым мы дышим.",
    example: "Уравнение: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (на свету, в хлоропластах).",
    together: "Свет попадает на хлорофилл → энергия запасается → из CO₂ собирается глюкоза. Без света «фабрика» почти останавливается.",
    task: "Где именно в клетке идёт фотосинтез?",
    answer: "хлоропласты",
    whyWrong: "Митохондрии отвечают за дыхание, а не за сборку глюкозы на свету.",
  },
  ohm: {
    title: "Закон Ома",
    zero: "Ток — это «поток», напряжение — «давление», сопротивление — «узкое место». I = U / R.",
    example: "U = 12 В, R = 4 Ом → I = 3 А.",
    together: "Если сопротивление растёт, ток падает. Если напряжение растёт — ток растёт.",
    task: "U = 9 В, R = 3 Ом. Чему равен ток?",
    answer: "3",
    whyWrong: "Делим напряжение на сопротивление, не наоборот.",
  },
  pythagoras: {
    title: "Теорема Пифагора",
    zero: "В прямоугольном треугольнике квадрат самой длинной стороны (гипотенузы) равен сумме квадратов двух других.",
    example: "Катеты 3 и 4 → c² = 9 + 16 = 25 → c = 5.",
    together: "Это работает только если угол между катетами — 90°.",
    task: "Катеты 6 и 8. Найди гипотенузу.",
    answer: "10",
    whyWrong: "Сначала возводим в квадрат, складываем, затем извлекаем корень — не складываем стороны как есть.",
  },
  percentages: {
    title: "Проценты",
    zero: "Процент — это сотая часть. 1% = 1/100. Чтобы найти p% от числа, умножь число на p/100.",
    example: "15% от 80: 80 × 0.15 = 12.",
    together: "«Найти сколько процентов составляет A от B» = (A/B)×100.",
    task: "Сколько процентов составляет 15 от 60?",
    answer: "25",
    whyWrong: "Делим часть на целое: 15/60, затем умножаем на 100.",
  },
  "linear-eq": {
    title: "Линейные уравнения",
    zero: "Линейное уравнение — неизвестное в первой степени: ax + b = 0. Цель — оставить x в одиночестве.",
    example: "2x + 5 = 17.",
    together: "Вычитаем 5: 2x = 12. Делим на 2: x = 6. Проверка: 12 + 5 = 17.",
    task: "Реши 3x − 4 = 11.",
    answer: "5",
    whyWrong: "Сначала переносим число без x, потом делим. Не делить всё сразу на 3, забыв про −4.",
  },
  tenses: {
    title: "English tenses",
    zero: "Present Simple — факты и привычки (She goes). Present Continuous — прямо сейчас (She is going). Present Perfect — прошлое, которое важно сейчас (She has gone).",
    example: "I have finished my homework — работа уже сделана, и это важно в настоящем.",
    together: "Сигналы Perfect: already, yet, ever, never, just.",
    task: "Choose: She ___ to school every day. (go / goes / is going)",
    answer: "goes",
    whyWrong: "Every day = Present Simple, 3rd person → goes.",
  },
  "sky-blue": {
    title: "Почему небо голубое",
    zero: "Солнечный свет состоит из разных цветов. Воздух сильнее рассеивает короткие волны — синие.",
    example: "Это рассеяние Рэлея, не «отражение океана».",
    together: "На закате путь света длиннее, синий рассеивается ещё сильнее, остаются красные тона.",
    task: "Какой физический процесс делает небо голубым?",
    answer: "рассеяние света",
    whyWrong: "Океан не красит небо: в пустыне небо тоже голубое.",
  },
};

function localize(text: string, lang: Locale) {
  if (lang === "en") {
    return text
      .replace("Начнём с нуля", "Let's start from zero")
      .replace("Твоя очередь", "Your turn");
  }
  if (lang === "tg") {
    return `【Тоҷикӣ】\n${text}\n\nАгар хоҳӣ, қадами навбатиро бо ҳам ҳал мекунем.`;
  }
  if (lang === "zh") return `【中文讲解】\n${text}`;
  if (lang === "ko") return `【한국어 설명】\n${text}`;
  if (lang === "ar") return `【شرح بالعربية】\n${text}`;
  return text;
}

export function buildTutorReply(opts: {
  text: string;
  style: ExplainStyle;
  hintOnly: boolean;
  profile: StudentProfile | null;
  locale: Locale;
  history: ChatMessage[];
}): { content: string; meta: ChatMessage["meta"] } {
  const detected = detectQuery(opts.text, opts.style);
  const topic = detected.topicId ?? "quadratic";
  const pack = TOPICS[topic] ?? {
    title: "Тема",
    zero: `Разберём запрос: «${opts.text}». Сначала выясним, что уже известно, затем объясним с нуля, потом посчитаем пример.`,
    example: "Возьмём самый простой случай и не будем прыгать к ответу.",
    together: "Я покажу первый шаг. Следующий — твоя очередь.",
    task: "Попробуй сформулировать, что именно нужно найти.",
    answer: "",
    whyWrong: "Ошибка обычно в пропущенном шаге, а не в «глупом» результате.",
  };
  const subjectId = detected.subjectId ?? getTopic(topic)?.subjectId ?? "math";

  if (detected.intent === "homework" || /реши за меня|домашн/.test(opts.text.toLowerCase())) {
    return {
      content: localize(
        `Давай решим вместе, а не за тебя. Я покажу первый шаг, а следующий попробуешь ты.\n\nПервый шаг: выпиши, что дано и что нужно найти. Если это уравнение — оставь неизвестное с одной стороны.\n\nНапиши, что получилось — продолжим.`,
        opts.locale
      ),
      meta: { topic, subject: subjectId, style: opts.style, understanding: 50 },
    };
  }

  if (opts.hintOnly || detected.intent === "hint") {
    return {
      content: localize(
        `Режим «я хочу решить сам».\n\n💡 Подсказка 1: определи тип задачи и выпиши данные.\n💡 Подсказка 2: выбери формулу, не считая сразу ответ.\n💡 Более сильная подсказка: для квадратного уравнения сначала найди D, и только потом корни.\n\nКогда разрешишь — покажу полное решение.`,
        opts.locale
      ),
      meta: {
        topic,
        subject: subjectId,
        hints: ["Определи тип задачи", "Выпиши формулу", "Для квадратного: сначала D"],
      },
    };
  }

  if (detected.intent === "confused") {
    return {
      content: localize(
        `Хорошо, объясняю иначе.\n\n🔹 С примером из жизни: дискриминант как прогноз погоды — он не гуляет за тебя, но говорит, сколько «дней» (корней) будет.\n🔹 Через аналогию: a, b, c — ингредиенты, D — проба, готово ли блюдо.\n🔹 Пошагово: 1) узнай a, b, c  2) посчитай D  3) посмотри знак  4) только потом формула корней.\n🔹 Очень коротко: D = b² − 4ac решает, сколько корней искать.\n\nКакой способ зашёл лучше?`,
        opts.locale
      ),
      meta: { topic, subject: subjectId },
    };
  }

  if (detected.intent === "check") {
    return {
      content: localize(
        `Проверяю знания — правильный ответ сразу не показываю.\n\nВопрос 1. Что показывает дискриминант?\nНапиши своими словами.\n\nПосле твоего ответа разберём, где понимание твёрдое, а где стоит повторить.`,
        opts.locale
      ),
      meta: { topic, subject: subjectId, quizPrompt: true },
    };
  }

  if (detected.intent === "plan") {
    return {
      content: localize(
        `Персональный план на 30 дней (математика):\n\nДень 1 — Линейные уравнения\nДень 2 — Системы уравнений\nДень 3 — Квадратные уравнения\nДень 4 — Дискриминант (слабое место)\n…\nДень 30 — Пробный экзамен\n\nСлабые темы по профилю будут встречаться чаще. Открой раздел «План», чтобы отметить дни.`,
        opts.locale
      ),
      meta: { topic, subject: subjectId },
    };
  }

  if (detected.intent === "search") {
    return {
      content: localize(
        `Определил запрос.\n\n**Предмет:** Физика\n**Тема:** Рассеяние света\n\n🌤️ Могу объяснить за 3 минуты.\n\n${pack.zero}\n\n${pack.example}`,
        opts.locale
      ),
      meta: { topic: "sky-blue", subject: "physics" },
    };
  }

  if (detected.intent === "translate") {
    return {
      content: `**acceleration** — ускорение\n\nПроизношение: /əkˌseləˈreɪʃn/\n\nПример: The car has acceleration — у машины есть ускорение.\n\nВ физике a = Δv / Δt.`,
      meta: { subject: "english" },
    };
  }

  const who = opts.profile?.name?.trim().split(/\s+/)[0];
  const weak = opts.profile?.weakTopics?.includes(topic);
  const base = [
    who ? `${who}, разберём это с твоего уровня.` : "Разберём это с твоего уровня.",
    `Шаг 1. Возможно, ещё не закреплено: ${weak ? "дискриминант и знак D" : "роль коэффициента a"}.`,
    `Шаг 2. ${pack.zero}`,
    `Шаг 3. ${pack.example}`,
    `Шаг 4. ${pack.together}`,
    `Шаг 5. ${pack.task}`,
    `Шаг 6. Когда напишешь ответ — проверю.`,
    `Шаг 7. Если ошибёшься, разберём причину, а не просто скажем «неправильно».`,
    `Шаг 8. После нескольких заданий оценим, усвоена ли идея.`,
    `\n🧠 Когда будешь готов: хочешь пройти мини-тест из 5 вопросов?`,
  ].join("\n\n");

  const styled = STYLES[opts.style](base);

  return {
    content: localize(styled, opts.locale),
    meta: {
      topic: pack.title,
      subject: subjectId,
      style: opts.style,
      understanding: weak ? 48 : 72,
      formula: topic === "quadratic" ? "x_{1,2}=\\dfrac{-b\\pm\\sqrt{D}}{2a}" : undefined,
      steps: [
        { title: "С нуля", body: pack.zero },
        { title: "Пример", body: pack.example },
        { title: "Вместе", body: pack.together },
        { title: "Твоя задача", body: pack.task },
      ],
      quizPrompt: true,
    },
  };
}

export function evaluateStudentAnswer(text: string, topicId?: string) {
  const t = text.trim().toLowerCase().replace(/\s/g, "");
  const pack = topicId ? TOPICS[topicId] : undefined;
  if (!pack?.answer) {
    return {
      ok: /да|верно|2\s*,\s*3|-3|хлоропласт|goes|3/.test(text.toLowerCase()),
      explanation: "Сверяю ход решения, а не только финальную строку.",
    };
  }
  const ans = pack.answer.toLowerCase().replace(/\s/g, "");
  const ok = t.includes(ans.replace(/,/g, "")) || t.includes(ans) || text.toLowerCase().includes(pack.answer.toLowerCase());
  return {
    ok,
    explanation: ok
      ? `Верно. ${pack.together}`
      : `Почти, но есть типичная ловушка. ${pack.whyWrong}\n\nПравильный ориентир: ${pack.answer}. Давай ещё одну похожую — уже без подсказки в начале.`,
  };
}

export function photoWalkthrough(raw?: string) {
  const src = raw || "2x + 5 = 17";
  if (/2x\s*\+\s*5\s*=\s*17/.test(src.replace(/\s/g, " ")) || !raw) {
    return {
      recognized: "2x + 5 = 17",
      find: "x",
      steps: [
        { title: "Первый шаг", body: "2x = 17 − 5" },
        { title: "Второй шаг", body: "2x = 12" },
        { title: "Третий шаг", body: "x = 6" },
      ],
      answer: "x = 6",
      why: "Мы изолировали x: сначала убрали +5 (вычли 5 из обеих частей), затем убрали множитель 2 (разделили на 2). Проверка: 2·6 + 5 = 17.",
      formula: "2x + 5 = 17",
    };
  }
  return {
    recognized: src.slice(0, 80),
    find: "неизвестное",
    steps: [
      { title: "Первый шаг", body: "Выписать данные и что требуется найти." },
      { title: "Второй шаг", body: "Выбрать формулу или преобразование." },
      { title: "Третий шаг", body: "Выполнить вычисление и проверить подстановкой." },
    ],
    answer: "Решение зависит от распознанного условия. В Demo Mode показан разбор линейного уравнения.",
    why: "AI не показывает только ответ: каждый шаг должен быть понятен.",
    formula: src,
  };
}

export function essayReview(text: string) {
  const len = text.trim().length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const issues: { type: string; excerpt: string; why: string; fix: string }[] = [];
  if (/(очень очень|типа|короче)/i.test(text)) {
    issues.push({
      type: "Стиль",
      excerpt: "разговорные слова",
      why: "В сочинении они снижают официальный регистр.",
      fix: "Замените на нейтральные формулировки.",
    });
  }
  if (!/[А-ЯA-Z]/.test(text.slice(0, 1))) {
    issues.push({
      type: "Грамматика",
      excerpt: text.slice(0, 24),
      why: "Предложение лучше начинать с заглавной буквы.",
      fix: "Проверьте начало абзацев.",
    });
  }
  if (sentences.length < 3) {
    issues.push({
      type: "Структура",
      excerpt: "слишком коротко",
      why: "Нет введения, основной части и заключения.",
      fix: "Добавьте три смысловых блока.",
    });
  }
  if (!issues.length) {
    issues.push({
      type: "Структура",
      excerpt: "можно усилить тезис",
      why: "Идея есть, но связки между абзацами слабые.",
      fix: "В начале каждого абзаца добавьте тему-предложение.",
    });
  }
  return {
    score: Math.max(55, Math.min(96, 60 + Math.min(20, Math.floor(len / 80)) - issues.length * 4)),
    issues,
    strengths: sentences.length >= 4 ? ["Есть развитие мысли", "Достаточный объём"] : ["Тема обозначена"],
    recommendation: "Исправьте отмеченные места и пришлите вторую версию — разберём уже стиль, не базовую грамотность.",
  };
}

export const SYSTEM_PROMPT = `You are SMART SCHOOL AI, a personal tutor inside a school product.
Always address the student by the name from their profile. Never invent a name and never call them Alisher unless that is exactly their profile name.
Never dump final homework answers first. Propose to solve together.
Detect gaps, explain from zero, give an example, solve together, give a similar task, check, explain the cause of mistakes, then assess understanding.
Adapt to the student's profile, weak topics, explain style, and lesson language.
If the student wants to solve alone, give graded hints only.
If they say they don't understand, use a completely different analogy.
Be a teacher, not a chatbot that finishes the work.`;
