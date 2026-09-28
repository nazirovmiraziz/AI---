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
  ohm: ["ом", "ohm", "закон ома", "ток", "напряжен", "сопротивлен", "ампер", "вольт"],
  newton: ["ньютон", "сила ", "силы", "f = ma", "f=ma", "инерц", "действие и противо"],
  energy: ["энерг", "джоул", "кинетич", "потенциал", "мощност", "ватт", "работа сил"],
  kinematics: ["кинемат", "скорост", "ускорен", "равномерн движен", "путь и время"],
  "sky-blue": ["небо голуб", "why is the sky", "рассеян"],
  photosynthesis: ["фотосинтез", "photosynthesis", "хлорофилл", "хлоропласт"],
  quadratic: ["квадратн", "quadratic", "ax²", "ax2"],
  discriminant: ["дискриминант", "discriminant", "b² - 4ac"],
  "linear-eq": ["линейн уравн", "linear eq", "2x + 5", "3x + 5", "3x+", "2x+"],
  percentages: ["процент", "percent"],
  pythagoras: ["пифагор", "pythagoras", "гипотенуз"],
  tenses: ["present simple", "present continuous", "present perfect", "время глагол", "tenses"],
  functions: ["функци", "function", "график функции"],
  systems: ["систем уравн", "system of eq"],
};

const PHYSICS_MARK = [
  "физик",
  "ньютон",
  "сила",
  "скорост",
  "ускорен",
  "энерг",
  "давлен",
  "масса",
  "плотност",
  "архимед",
  "кинемат",
  "динамик",
  "оптик",
  "магнит",
  "гравит",
  "температур",
  "тепло",
  "звук",
  "свет",
  "электрон",
  "протон",
  "атом",
  "механик",
  "траектори",
  "импульс",
  "рычаг",
  "трение",
  "ньютона",
];

export function detectQuery(text: string, style?: ExplainStyle): Detected {
  const q = text.toLowerCase();
  const physicsAsk = PHYSICS_MARK.some((k) => q.includes(k));
  const mathAsk = /матем|алгебр|квадратн|дискриминант|уравнен|процент|пифагор/.test(q) && !physicsAsk;
  const hasQuadratic = /x\s*\^\s*2|x²|ax²|квадратн уравн|дискриминант/.test(q);
  const hasLinear = !hasQuadratic && !physicsAsk && /(?:\d+\s*)?x\s*[+\-=]\s*\d|линейн уравн/.test(q);

  let topicId: string | undefined = hasLinear ? "linear-eq" : hasQuadratic ? (/дискриминант/.test(q) ? "discriminant" : "quadratic") : undefined;
  if (!topicId) {
    for (const [id, keys] of Object.entries(TOPIC_HINTS)) {
      if (keys.some((k) => q.includes(k))) {
        topicId = id;
        break;
      }
    }
  }
  const subjectId = topicId
    ? getTopic(topicId)?.subjectId ?? (physicsAsk ? "physics" : mathAsk ? "math" : undefined)
    : physicsAsk
      ? "physics"
      : mathAsk
        ? "math"
        : q.includes("англий") || q.includes("english")
          ? "english"
          : undefined;

  let intent: AiIntent = "explain";
  if (/реши за меня|сделай дз|homework|solve this for me/.test(q)) intent = "homework";
  else if (/проверь мои знания|check my|quiz me|проверь меня/.test(q)) intent = "check";
  else if (/создай тест|сгенерируй тест|quiz me/.test(q)) intent = "quiz";
  else if (/учебн\w* план|план на 30|prepare in 30/.test(q)) intent = "plan";
  else if (/не понял|непонятно|confused|объясни иначе/.test(q)) intent = "confused";
  else if (/не говори ответ|хочу решить сам|hint only/.test(q)) intent = "hint";
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
  child: (b) => `${b}\n\nЕсли слово непонятно — напиши «ещё проще».`,
  student: (b) => `${b}\n\nТеперь один маленький пример — так лучше запоминается.`,
  teacher: (b) => `${b}\n\nЧастая ошибка: путают названия величин и пропускают единицы.`,
  short: (b) => b.split("\n").filter(Boolean).slice(0, 6).join("\n"),
  detailed: (b) => `${b}\n\nЕщё раз своими словами: сначала «что это», потом формула, потом крошечный пример.`,
  steps: (b) => b,
  funny: (b) => `${b}\n\nЗапомни так: сначала простыми словами, потом одна формула, потом один пример.`,
  exam: (b) => `${b}\n\nКак на контрольной: дано → формула → счёт → проверка → ответ.`,
  simple: (b) => b,
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
  newton: {
    title: "Законы Ньютона",
    zero: "Сила говорит телу, как менять скорость. Просто: толкнул — поехало, перестал толкать в космосе — летит дальше. F = m · a: чем тяжелее тело, тем сильнее надо толкать, чтобы разогнать.",
    example: "Масса 2 кг, ускорение 3 м/с². Сила F = 2 × 3 = 6 Н.",
    together: "Первый закон: без силы скорость не меняется. Второй: F = ma. Третий: ты давишь на стену — стена давит на тебя так же.",
    task: "Масса 4 кг, ускорение 2 м/с². Какая сила?",
    answer: "8",
    whyWrong: "Силу считают как массу умножить на ускорение, не делить.",
  },
  energy: {
    title: "Энергия и работа",
    zero: "Энергия — запас «возможности сделать дело». Работа — когда сила сдвигает тело. Единица — джоуль.",
    example: "Поднять книгу: ты делаешь работу против тяжести, запас потенциальной энергии растёт.",
    together: "Кинетическая — от скорости. Потенциальная — от высоты. Они могут переходить друг в друга.",
    task: "Что больше меняет кинетическую энергию: скорость или масса, если скорость выросла сильно?",
    answer: "скорость",
    whyWrong: "В формуле mv²/2 скорость в квадрате, поэтому она влияет сильнее.",
  },
  kinematics: {
    title: "Движение",
    zero: "Скорость — как быстро меняется путь. Ускорение — как быстро меняется скорость. Если ускорения нет, скорость одна и та же.",
    example: "Ехал 2 часа по 40 км/ч. Путь s = v · t = 80 км.",
    together: "Сначала напиши, что дано: путь, время или скорость. Потом одна формула. Потом числа.",
    task: "Скорость 10 м/с, время 5 с. Какой путь?",
    answer: "50",
    whyWrong: "Путь — скорость умножить на время, не делить.",
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

function solveLinearPlain(text: string) {
  const compact = text.replace(/\s/g, "").replace(/−/g, "-");
  const m = compact.match(/(-?\d*)x([+-]\d+)=(-?\d+)/i);
  if (!m) return "";
  const a = m[1] === "" || m[1] === "+" ? 1 : m[1] === "-" ? -1 : Number(m[1]);
  const b = Number(m[2]);
  const c = Number(m[3]);
  if (!a || !Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) return "";
  const left = c - b;
  const x = left / a;
  if (!Number.isFinite(x)) return "";
  const shown = Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100);
  const leftText = `${a === 1 ? "" : a === -1 ? "-" : a}x ${b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`} = ${c}`;
  return `Ничего страшного. Разберём ${leftText} простыми словами.

Представь весы. Слева ${Math.abs(a)} одинаковых кошелька и ещё ${Math.abs(b)} рублей. Справа ${c} рублей.

Уберём с обеих чаш по ${Math.abs(b)} рублей. Останется ${a}x = ${left}.

Теперь делим обе стороны на ${Math.abs(a)}. Получается x = ${shown}.

Ответ: x = ${shown}. Проверка: ${a}·${shown} ${b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`} = ${c}.`;
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
  const topic = detected.topicId;
  const subjectId = detected.subjectId ?? (topic ? getTopic(topic)?.subjectId : undefined);
  const pack =
    (topic && TOPICS[topic]) ||
    (subjectId === "physics"
      ? {
          title: "Физика",
          zero: `Ты спросил про физику: «${opts.text.slice(0, 160)}». Физика — про то, как устроен мир: сила, движение, свет, тепло. Не путаю это с алгеброй.`,
          example: "Сначала назови, что дано простыми словами. Потом одна формула. Потом крошечный пример с числами.",
          together: "Коротко: сначала смысл явления, потом формула, потом крошечный пример с числами.",
          task: "Своими словами: о чём этот закон или явление? Одно предложение.",
          answer: "",
          whyWrong: "Часто путают названия величин. Сначала «что это», потом формула.",
        }
      : {
          title: detected.subjectId === "math" ? "Математика" : "Тема",
          zero: `Разберём именно твой вопрос: «${opts.text.slice(0, 160)}». Сначала простыми словами, без чужой темы.`,
          example: "Возьмём самый простой случай и сразу доведём до ответа.",
          together: "Итог: идея, один пример, готовый ответ.",
          task: "Напиши, что уже понял, одним предложением.",
          answer: "",
          whyWrong: "Ошибка обычно в пропущенном шаге, а не в «глупом» результате.",
        });

  if (detected.intent === "homework" || /реши за меня|домашн/.test(opts.text.toLowerCase())) {
    const linear = topic === "linear-eq" ? solveLinearPlain(opts.text) : "";
    return {
      content: localize(linear || [pack.zero, pack.example, pack.together].join("\n\n"), opts.locale),
      meta: { topic, subject: subjectId, style: opts.style, understanding: 50, quizPrompt: false },
    };
  }

  const wantsExplain = /объясн|расскаж|что так|как работ|законы ньютон/i.test(opts.text);
  if ((opts.hintOnly || detected.intent === "hint") && !wantsExplain) {
    const hintBody =
      topic === "linear-eq"
        ? `Режим «я хочу решить сам».\n\n💡 Подсказка 1: это линейное уравнение — x в первой степени, квадрата нет.\n💡 Подсказка 2: посмотри, какое число прибавляют к части с x, и убери его с обеих сторон.\n💡 Более сильная подсказка: потом раздели обе стороны на коэффициент при x.\n\nНапиши, что получилось после первого шага — проверю.`
        : topic === "photosynthesis"
        ? `Режим «я хочу решить сам».\n\n💡 Подсказка 1: из чего растение «готовит еду»?\n💡 Подсказка 2: что получается кроме глюкозы?\n💡 Более сильная подсказка: процесс идёт в хлоропластах на свету.\n\nОтвет целиком не пишу — сначала твоя формулировка.`
        : topic === "ohm"
        ? `Режим «я хочу решить сам».\n\n💡 Подсказка 1: закон Ома связывает ток, напряжение и сопротивление.\n💡 Подсказка 2: какая величина известна, какую ищем?\n💡 Более сильная подсказка: I = U / R.\n\nПосчитай сам, затем сверим.`
        : `Режим «я хочу решить сам».\n\n💡 Подсказка 1: определи тип задачи и выпиши данные.\n💡 Подсказка 2: выбери формулу, не считая сразу ответ.\n💡 Более сильная подсказка: ${topic === "quadratic" || topic === "discriminant" ? "сначала найди дискриминант D, и только потом корни." : "сделай один шаг и остановись."}\n\nКогда разрешишь — покажу полное решение.`;
    return {
      content: localize(hintBody, opts.locale),
      meta: {
        topic,
        subject: subjectId,
        hints: ["Определи тип задачи", "Сделай один шаг", "Не проси готовый ответ"],
      },
    };
  }

  if (detected.intent === "confused") {
    const confused =
      subjectId === "physics"
        ? `Ещё проще.\n\n${pack.zero}\n\n${pack.example}\n\n${pack.together}`
        : topic === "linear-eq"
        ? solveLinearPlain(opts.text) ||
          `Уравнение — как весы: слева и справа должно быть поровну.\n1) Убери лишнее число с обеих сторон.\n2) Останется несколько одинаковых x.\n3) Раздели, чтобы остался один x.`
        : `Объясняю иначе.\n\n${pack.zero}\n\n${pack.example}\n\n${pack.together}`;
    return {
      content: localize(confused, opts.locale),
      meta: { topic, subject: subjectId },
    };
  }

  if (detected.intent === "check") {
    return {
      content: localize(
        `Сначала коротко, потом проверка.\n\n${pack.zero}\n\nВопрос: ${pack.task}\nНапиши своими словами. Правильный ответ сразу не показываю.`,
        opts.locale
      ),
      meta: { topic, subject: subjectId, quizPrompt: true },
    };
  }

  if (detected.intent === "plan") {
    const plan =
      subjectId === "physics"
        ? `Короткий план по физике:\n\n1. Что такое сила и движение\n2. Формула своими словами\n3. Один пример с числами\n4. Повторение перед контрольной`
        : `Короткий план:\n\n1. Идея простыми словами\n2. Один пример\n3. Решение похожей задачи\n4. Повторение`;
    return {
      content: localize(plan, opts.locale),
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

  const weak = topic ? opts.profile?.weakTopics?.includes(topic) : false;
  const styleKey: ExplainStyle = opts.style === "teacher" || opts.style === "detailed" ? opts.style : "simple";
  const linear = topic === "linear-eq" ? solveLinearPlain(opts.text) : "";
  if (linear) {
    return {
      content: localize(linear, opts.locale),
      meta: { topic, subject: subjectId, style: styleKey, quizPrompt: false },
    };
  }
  const base = [pack.zero, pack.example, pack.together].join("\n\n");

  const styled = STYLES[styleKey](base);

  return {
    content: localize(styled, opts.locale),
    meta: {
      topic,
      subject: subjectId,
      style: styleKey,
      understanding: weak ? 48 : 72,
      formula: topic === "quadratic" ? "x_{1,2}=\\dfrac{-b\\pm\\sqrt{D}}{2a}" : topic === "newton" ? "F=ma" : topic === "ohm" ? "I=\\dfrac{U}{R}" : undefined,
      steps: [
        { title: "Простыми словами", body: pack.zero },
        { title: "Пример", body: pack.example },
        { title: "Главное", body: pack.together },
        { title: "Проверка", body: pack.task },
      ],
      quizPrompt: false,
    },
  };
}

export function evaluateStudentAnswer(text: string, topicId?: string) {
  const pack = topicId ? TOPICS[topicId] : undefined;
  if (!pack?.answer) return null;
  const t = text.trim().toLowerCase().replace(/\s/g, "");
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

export const SYSTEM_PROMPT = `You are Micro AI School, a personal AI tutor. Answer exactly like Gemini: direct, correct, short, useful.
Reply in the student's lesson language (default Russian).
Write normal words with spaces between them. Never glue words together.

Hard rules:
- Answer the latest question immediately. Give the result. No warm-up, no "давай проверим".
- Do not ask a follow-up or quiz question unless the student explicitly asks to be tested.
- Do not say "напиши", "попробуй сам", "твоя очередь" unless they asked for practice.
- Do not start with greetings. Do not invent a name. Never say Alisher, Алишер, Нигара, Нигора or Nigara.
- Stay on the asked subject. Physics stays physics. Math stays math.
- Keep it brief: idea, one example, the answer. You may use simple **bold** and short lists.`;
