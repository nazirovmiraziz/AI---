import type { CefrLevel, LearnLangId, LearnLanguage, LevelMeta } from "./types";

export const LEARN_LANGUAGES: LearnLanguage[] = [
  { id: "en", name: "English", native: "English", flag: "🇬🇧", locale: "en-GB", dir: "ltr", ready: true },
  { id: "ru", name: "Русский", native: "Русский", flag: "🇷🇺", locale: "ru-RU", dir: "ltr", ready: true },
  { id: "de", name: "Deutsch", native: "Deutsch", flag: "🇩🇪", locale: "de-DE", dir: "ltr", ready: true },
  { id: "es", name: "Español", native: "Español", flag: "🇪🇸", locale: "es-ES", dir: "ltr", ready: true },
  { id: "fr", name: "Français", native: "Français", flag: "🇫🇷", locale: "fr-FR", dir: "ltr", ready: true },
  { id: "it", name: "Italiano", native: "Italiano", flag: "🇮🇹", locale: "it-IT", dir: "ltr", ready: true },
  { id: "tr", name: "Türkçe", native: "Türkçe", flag: "🇹🇷", locale: "tr-TR", dir: "ltr", ready: true },
  { id: "zh", name: "中文", native: "中文", flag: "🇨🇳", locale: "zh-CN", dir: "ltr", ready: true },
  { id: "ja", name: "日本語", native: "日本語", flag: "🇯🇵", locale: "ja-JP", dir: "ltr", ready: true },
  { id: "ko", name: "한국어", native: "한국어", flag: "🇰🇷", locale: "ko-KR", dir: "ltr", ready: true },
  { id: "ar", name: "العربية", native: "العربية", flag: "🇸🇦", locale: "ar-SA", dir: "rtl", ready: true },
];

export function langById(id: LearnLangId) {
  return LEARN_LANGUAGES.find((l) => l.id === id) ?? LEARN_LANGUAGES[0];
}

export const LEVELS_META: LevelMeta[] = [
  {
    id: "A1",
    title: "Beginner",
    titleRu: "С нуля",
    goals: [
      "представляться и здороваться",
      "говорить о себе и семье",
      "спрашивать цену и время",
      "заказывать еду",
      "понимать простые фразы",
    ],
  },
  {
    id: "A2",
    title: "Elementary",
    titleRu: "Начальный",
    goals: ["рассказывать о дне", "писать короткие письма", "понимать простые диалоги", "говорить о планах"],
  },
  {
    id: "B1",
    title: "Intermediate",
    titleRu: "Средний",
    goals: ["вести простой разговор", "объяснять мнение", "понимать новости простыми словами"],
  },
  {
    id: "B2",
    title: "Upper",
    titleRu: "Выше среднего",
    goals: ["спорить по теме", "понимать фильмы", "писать связный текст"],
  },
  {
    id: "C1",
    title: "Advanced",
    titleRu: "Продвинутый",
    goals: ["говорить свободно", "понимать нюансы", "писать формально"],
  },
  {
    id: "C2",
    title: "Mastery",
    titleRu: "Свободный",
    goals: ["почти как носитель", "тонкий стиль", "сложная лексика"],
  },
];

export function levelMeta(id: CefrLevel) {
  return LEVELS_META.find((l) => l.id === id)!;
}

export const REASONS: { id: import("./types").LearnReason; label: string; icon: string }[] = [
  { id: "travel", label: "Путешествия", icon: "✈️" },
  { id: "work", label: "Работа", icon: "💼" },
  { id: "study", label: "Учёба", icon: "🎓" },
  { id: "speak", label: "Разговорная речь", icon: "🗣" },
  { id: "move", label: "Переезд", icon: "🌎" },
  { id: "self", label: "Для себя", icon: "🎯" },
  { id: "exam", label: "Экзамен", icon: "📚" },
];

export const SELF_LEVELS: { id: import("./types").SelfLevel; label: string; text: string }[] = [
  { id: "zero", label: "С нуля", text: "Почти ничего не знаю." },
  { id: "beginner", label: "Начальный", text: "Знаю слова и простые фразы." },
  { id: "intermediate", label: "Средний", text: "Могу говорить о простых темах." },
  { id: "advanced", label: "Продвинутый", text: "Говорю уверенно, хочу точности." },
  { id: "unknown", label: "Я не знаю свой уровень", text: "Короткий тест подскажет, с чего начать." },
];
