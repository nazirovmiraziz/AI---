import type { CefrLevel, Exercise, LangLesson, LangUnit, LearnLangId, VocabEntry } from "./types";
import { EN_A1, EN_A2, type UnitSeed, type WordSeed } from "./english-a1";

function hash(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(id: string) {
  let s = hash(id) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function shuffle<T>(arr: T[], id: string): T[] {
  const a = [...arr];
  const r = rng(id);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWrong(correct: string, pool: string[], n: number, id: string) {
  const rest = pool.filter((x) => x !== correct);
  return shuffle(rest, id).slice(0, n);
}

function vocabOf(words: WordSeed[], languageId: LearnLangId, unitId: string): VocabEntry[] {
  return words.map(([word, translation, example], i) => ({
    id: `${languageId}-${unitId}-w${i + 1}`,
    word,
    translation,
    example,
  }));
}

function choice(id: string, prompt: string, answer: string, options: string[], hint: string, explain: string, extra?: Partial<Exercise>): Exercise {
  return { id, type: "choice", prompt, options, answer, hint, explain, ...extra };
}

export function buildUnit(languageId: LearnLangId, level: CefrLevel, seed: UnitSeed): LangUnit {
  const vocab = vocabOf(seed.words, languageId, seed.id);
  const words = vocab.map((v) => v.word);
  const trans = vocab.map((v) => v.translation);
  const unitKey = `${languageId}-${level}-${seed.id}`;

  const intro: Exercise[] = vocab.slice(0, 6).flatMap((v, i) => {
    const opts = shuffle([v.translation, ...pickWrong(v.translation, trans, 3, v.id + "c")], v.id + "o");
    return [
      {
        id: `${unitKey}-intro-${i}-see`,
        type: "recall" as const,
        prompt: "Новое слово. Послушай и запомни.",
        word: v.word,
        translation: v.translation,
        example: v.example,
        answer: v.translation,
        hint: "Просто запомни звук и смысл.",
        explain: `${v.word} — ${v.translation}. Пример: ${v.example}`,
        audio: v.word,
      },
      choice(
        `${unitKey}-intro-${i}-mc`,
        `Как переводится «${v.word}»?`,
        v.translation,
        opts,
        "Сначала вспомни звучание.",
        `«${v.word}» значит «${v.translation}».`,
        { word: v.word, audio: v.word },
      ),
    ];
  });

  const grammarEx: Exercise[] = [
    {
      id: `${unitKey}-gr-form`,
      type: "grammar",
      prompt: seed.grammar.formula,
      passage: `${seed.grammar.text}\n\nПримеры:\n${seed.grammar.examples.map((e) => "• " + e).join("\n")}\n\nЧастые ошибки:\n${seed.grammar.mistakes.map((e) => "• " + e).join("\n")}`,
      answer: seed.grammar.examples[0],
      hint: "Прочитай формулу ещё раз.",
      explain: seed.grammar.text,
    },
    ...seed.grammarFix.map((g, i) => ({
      id: `${unitKey}-gr-fix-${i}`,
      type: "grammar" as const,
      prompt: `Исправь: «${g.wrong}»`,
      answer: g.right,
      hint: g.hint,
      explain: `Правильно: ${g.right}. ${g.hint}`,
    })),
  ];

  const mix: Exercise[] = [
    ...seed.blanks.map((b, i) => ({
      id: `${unitKey}-blank-${i}`,
      type: "blank" as const,
      prompt: b.sentence,
      answer: b.answer,
      hint: b.hint,
      explain: `Пропуск: ${b.answer}.`,
    })),
    {
      id: `${unitKey}-order`,
      type: "order",
      prompt: "Собери предложение.",
      answer: seed.grammar.examples[0].replace(/[.?]/g, "").split(" ").filter(Boolean),
      hint: "Сначала подлежащее, потом глагол.",
      explain: seed.grammar.examples[0],
    },
    {
      id: `${unitKey}-match`,
      type: "match",
      prompt: "Соедини слово и перевод.",
      pairs: vocab.slice(0, 5).map((v) => ({ left: v.word, right: v.translation })),
      answer: vocab.slice(0, 5).map((v) => v.word),
      hint: "Начни с тех слов, в которых уверен.",
      explain: "Каждое слово имеет одну пару.",
    },
    {
      id: `${unitKey}-tr`,
      type: "translate",
      prompt: `Переведи: ${vocab[0].translation}`,
      answer: vocab[0].word,
      hint: "Это слово из начала урока.",
      explain: `${vocab[0].translation} — ${vocab[0].word}.`,
    },
    {
      id: `${unitKey}-img`,
      type: "image",
      prompt: `Что значит «${vocab[1].word}»?`,
      answer: vocab[1].translation,
      imageOptions: vocab.slice(1, 5).map((v) => ({ id: v.id, emoji: "✨", label: v.translation })),
      hint: "Выбери смысл, не буквы.",
      explain: `${vocab[1].word} — ${vocab[1].translation}.`,
    },
  ];

  const listenEx: Exercise[] = seed.listen.map((line, i) =>
    choice(
      `${unitKey}-listen-${i}`,
      "Что сказал голос?",
      line,
      shuffle([line, ...pickWrong(line, [...seed.listen, ...seed.grammar.examples], 3, unitKey + "l" + i)], unitKey + "lo" + i),
      "Можно послушать ещё раз.",
      `Фраза: ${line}`,
      { type: "listen", audio: line },
    ),
  );

  const speakEx: Exercise[] = [
    {
      id: `${unitKey}-speak`,
      type: "speak",
      prompt: "Произнеси фразу. Если микрофон недоступен — набери её.",
      answer: seed.grammar.examples[0],
      audio: seed.grammar.examples[0],
      hint: "Говори медленно, слово за словом.",
      explain: "Мы сравниваем текст, который получился, с образцом. Голос на сервере пока не разбираем.",
    },
  ];

  const readEx: Exercise[] = [
    {
      id: `${unitKey}-read`,
      type: "read",
      prompt: seed.reading.q,
      passage: seed.reading.text,
      options: seed.reading.options,
      answer: seed.reading.answer,
      hint: "Найди в тексте одно ключевое слово.",
      explain: `В тексте: ${seed.reading.text}`,
    },
  ];

  const writeEx: Exercise[] = [
    {
      id: `${unitKey}-write`,
      type: "write",
      prompt: seed.writing,
      answer: seed.grammar.examples.join(" "),
      hint: "Короткие предложения лучше длинных ошибок.",
      explain: "Мы сохраним твой текст и покажем более ровный вариант — твой оригинал не пропадёт.",
    },
  ];

  const talkEx: Exercise[] = [
    {
      id: `${unitKey}-talk`,
      type: "talk",
      prompt: seed.talk.line,
      scene: seed.talk.scene,
      answer: "ok",
      hint: "Ответь по ситуации, даже коротко.",
      explain: "После диалога разберём ошибки, не готовый скрипт.",
    },
  ];

  const lessons: LangLesson[] = [
    { id: `${unitKey}-l1`, unitId: seed.id, level, languageId, n: 1, title: "Words", titleRu: "Новые слова", skill: "vocab", minutes: 8, exercises: intro.slice(0, 10), newWords: words.slice(0, 6) },
    { id: `${unitKey}-l2`, unitId: seed.id, level, languageId, n: 2, title: "More words", titleRu: "Ещё слова", skill: "vocab", minutes: 7, exercises: intro.slice(10), newWords: words.slice(6) },
    { id: `${unitKey}-l3`, unitId: seed.id, level, languageId, n: 3, title: seed.grammar.title, titleRu: seed.grammar.titleRu, skill: "grammar", minutes: 10, exercises: grammarEx, newWords: [] },
    { id: `${unitKey}-l4`, unitId: seed.id, level, languageId, n: 4, title: "Practice", titleRu: "Практика", skill: "mix", minutes: 10, exercises: mix, newWords: [] },
    { id: `${unitKey}-l5`, unitId: seed.id, level, languageId, n: 5, title: "Listen", titleRu: "Аудирование", skill: "listen", minutes: 6, exercises: listenEx, newWords: [] },
    { id: `${unitKey}-l6`, unitId: seed.id, level, languageId, n: 6, title: "Speak", titleRu: "Произношение", skill: "speak", minutes: 6, exercises: speakEx, newWords: [] },
    { id: `${unitKey}-l7`, unitId: seed.id, level, languageId, n: 7, title: seed.reading.title, titleRu: "Чтение", skill: "read", minutes: 8, exercises: readEx, newWords: [] },
    { id: `${unitKey}-l8`, unitId: seed.id, level, languageId, n: 8, title: "Write", titleRu: "Письмо", skill: "write", minutes: 8, exercises: writeEx, newWords: [] },
    { id: `${unitKey}-l9`, unitId: seed.id, level, languageId, n: 9, title: "Talk", titleRu: "Разговор", skill: "speak", minutes: 8, exercises: talkEx, newWords: [] },
  ].filter((l) => l.exercises.length > 0) as LangLesson[];

  const test: Exercise[] = [
    ...vocab.slice(0, 4).map((v, i) =>
      choice(`${unitKey}-t-v${i}`, `«${v.word}» — это…`, v.translation, shuffle([v.translation, ...pickWrong(v.translation, trans, 3, v.id + "t")], v.id + "to"), "Это слово из блока.", `${v.word} — ${v.translation}.`),
    ),
    ...seed.grammarFix.slice(0, 2).map((g, i) => ({
      id: `${unitKey}-t-g${i}`,
      type: "grammar" as const,
      prompt: `Как правильно вместо «${g.wrong}»?`,
      answer: g.right,
      hint: g.hint,
      explain: g.right,
    })),
    listenEx[0],
    readEx[0],
  ];

  return {
    id: seed.id,
    languageId,
    level,
    n: seed.n,
    title: seed.title,
    titleRu: seed.titleRu,
    goal: seed.goal,
    vocab,
    grammar: { ...seed.grammar },
    lessons,
    test,
    writing: seed.writing,
    reading: { title: seed.reading.title, text: seed.reading.text },
  };
}

const STARTERS: Record<string, WordSeed[]> = {
  ru: [["привет", "hello", "Привет! Меня зовут Анна."], ["спасибо", "thank you", "Спасибо за помощь."], ["да", "yes", "Да, я готов."], ["нет", "no", "Нет, спасибо."], ["пожалуйста", "please", "Кофе, пожалуйста."], ["имя", "name", "Как тебя зовут?"]],
  de: [["Hallo", "привет", "Hallo! Ich heiße Anna."], ["Danke", "спасибо", "Danke für deine Hilfe."], ["ja", "да", "Ja, ich bin bereit."], ["nein", "нет", "Nein, danke."], ["bitte", "пожалуйста", "Kaffee, bitte."], ["Name", "имя", "Wie ist dein Name?"]],
  es: [["hola", "привет", "¡Hola! Me llamo Ana."], ["gracias", "спасибо", "Gracias por tu ayuda."], ["sí", "да", "Sí, estoy listo."], ["no", "нет", "No, gracias."], ["por favor", "пожалуйста", "Café, por favor."], ["nombre", "имя", "¿Cuál es tu nombre?"]],
  fr: [["bonjour", "привет", "Bonjour ! Je m'appelle Anne."], ["merci", "спасибо", "Merci pour ton aide."], ["oui", "да", "Oui, je suis prêt."], ["non", "нет", "Non, merci."], ["s'il vous plaît", "пожалуйста", "Un café, s'il vous plaît."], ["nom", "имя", "Quel est ton nom ?"]],
  it: [["ciao", "привет", "Ciao! Mi chiamo Anna."], ["grazie", "спасибо", "Grazie per l'aiuto."], ["sì", "да", "Sì, sono pronto."], ["no", "нет", "No, grazie."], ["per favore", "пожалуйста", "Un caffè, per favore."], ["nome", "имя", "Come ti chiami?"]],
  tr: [["merhaba", "привет", "Merhaba! Adım Anna."], ["teşekkürler", "спасибо", "Teşekkürler."], ["evet", "да", "Evet, hazırım."], ["hayır", "нет", "Hayır, teşekkürler."], ["lütfen", "пожалуйста", "Kahve, lütfen."], ["ad", "имя", "Adın ne?"]],
  zh: [["你好", "привет", "你好！我叫安娜。"], ["谢谢", "спасибо", "谢谢你。"], ["是", "да", "是的。"], ["不", "нет", "不，谢谢。"], ["请", "пожалуйста", "请坐。"], ["名字", "имя", "你叫什么名字？"]],
  ja: [["こんにちは", "привет", "こんにちは。"], ["ありがとう", "спасибо", "ありがとうございます。"], ["はい", "да", "はい、そうです。"], ["いいえ", "нет", "いいえ、結構です。"], ["お願いします", "пожалуйста", "コーヒーをお願いします。"], ["名前", "имя", "お名前は？"]],
  ko: [["안녕하세요", "привет", "안녕하세요."], ["감사합니다", "спасибо", "감사합니다."], ["네", "да", "네, 준비됐어요."], ["아니요", "нет", "아니요, 괜찮아요."], ["주세요", "пожалуйста", "커피 주세요."], ["이름", "имя", "이름이 뭐예요?"]],
  ar: [["مرحبا", "привет", "مرحبا، اسمي آنا."], ["شكرا", "спасибо", "شكرا لك."], ["نعم", "да", "نعم."], ["لا", "нет", "لا، شكرا."], ["من فضلك", "пожалуйста", "قهوة من فضلك."], ["اسم", "имя", "ما اسمك؟"]],
};

function starterSeed(lang: LearnLangId): UnitSeed {
  const words = (STARTERS[lang] ?? STARTERS.de) as WordSeed[];
  const first = words[0][0];
  return {
    id: "hello",
    n: 1,
    title: "Hello!",
    titleRu: "Первые слова",
    goal: "Поздороваться и поблагодарить.",
    grammar: {
      id: "first",
      title: "First phrases",
      titleRu: "Первые фразы",
      formula: first,
      text: "Начни с приветствия, «да/нет» и «спасибо». Этого хватит, чтобы вступить в короткий разговор.",
      examples: [words[0][2], words[1][2]],
      mistakes: ["Не пытайся сразу строить длинные фразы."],
    },
    words,
    listen: [words[0][2], words[1][2]],
    reading: {
      title: "Hi",
      text: words[0][2] + " " + words[1][2],
      q: "Это текст про…",
      options: ["знакомство", "математику", "погоду"],
      answer: "знакомство",
    },
    writing: "Напиши приветствие и «спасибо» на изучаемом языке.",
    talk: { scene: "Короткое знакомство", line: words[0][2] },
    blanks: [{ sentence: `${first}!`, answer: first, hint: "Приветствие." }],
    grammarFix: [{ wrong: "???", right: first, hint: "Начни с приветствия." }],
  };
}

const cache = new Map<string, LangUnit[]>();

export function unitsFor(languageId: LearnLangId, level: CefrLevel): LangUnit[] {
  const key = `${languageId}-${level}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let units: LangUnit[] = [];
  if (languageId === "en" && level === "A1") units = EN_A1.map((s) => buildUnit("en", "A1", s));
  else if (languageId === "en" && level === "A2") units = EN_A2.map((s) => buildUnit("en", "A2", s));
  else if (level === "A1") units = [buildUnit(languageId, "A1", starterSeed(languageId))];
  else units = [];
  cache.set(key, units);
  return units;
}

export function allUnits(languageId: LearnLangId): LangUnit[] {
  return [...unitsFor(languageId, "A1"), ...unitsFor(languageId, "A2")];
}

export function findUnit(languageId: LearnLangId, unitId: string) {
  return allUnits(languageId).find((u) => u.id === unitId);
}

export function findLesson(languageId: LearnLangId, lessonId: string) {
  for (const u of allUnits(languageId)) {
    const l = u.lessons.find((x) => x.id === lessonId);
    if (l) return { unit: u, lesson: l };
  }
  return null;
}

export function firstLessonId(languageId: LearnLangId) {
  return allUnits(languageId)[0]?.lessons[0]?.id;
}

export function nextLessonId(languageId: LearnLangId, lessonId: string) {
  const units = allUnits(languageId);
  const flat = units.flatMap((u) => u.lessons);
  const i = flat.findIndex((l) => l.id === lessonId);
  return i >= 0 ? flat[i + 1]?.id : undefined;
}

export function nextUnitAfter(languageId: LearnLangId, unitId: string) {
  const units = allUnits(languageId);
  const i = units.findIndex((u) => u.id === unitId);
  return i >= 0 ? units[i + 1] : undefined;
}
