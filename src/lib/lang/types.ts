export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type LearnLangId =
  | "en"
  | "ru"
  | "de"
  | "es"
  | "fr"
  | "it"
  | "tr"
  | "zh"
  | "ja"
  | "ko"
  | "ar";

export type LearnReason = "travel" | "work" | "study" | "speak" | "move" | "self" | "exam";
export type SelfLevel = "zero" | "beginner" | "intermediate" | "advanced" | "unknown";
export type VocabBox = "new" | "learning" | "known" | "review";
export type SrsRating = "again" | "hard" | "good" | "easy";

export type ExerciseType =
  | "choice"
  | "translate"
  | "blank"
  | "order"
  | "match"
  | "listen"
  | "speak"
  | "read"
  | "write"
  | "image"
  | "recall"
  | "grammar"
  | "talk";

export interface LearnLanguage {
  id: LearnLangId;
  name: string;
  native: string;
  flag: string;
  locale: string;
  dir: "ltr" | "rtl";
  ready: boolean;
}

export interface VocabEntry {
  id: string;
  word: string;
  translation: string;
  example: string;
  ipa?: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  titleRu: string;
  formula: string;
  text: string;
  examples: string[];
  mistakes: string[];
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  promptLang?: "ru" | "en";
  word?: string;
  translation?: string;
  example?: string;
  options?: string[];
  answer: string | string[];
  hint: string;
  explain: string;
  pairs?: MatchPair[];
  audio?: string;
  passage?: string;
  imageOptions?: { id: string; emoji: string; label: string }[];
  scene?: string;
}

export interface LangLesson {
  id: string;
  unitId: string;
  level: CefrLevel;
  languageId: LearnLangId;
  n: number;
  title: string;
  titleRu: string;
  skill: "vocab" | "grammar" | "listen" | "speak" | "read" | "write" | "mix";
  minutes: number;
  exercises: Exercise[];
  newWords: string[];
}

export interface LangUnit {
  id: string;
  languageId: LearnLangId;
  level: CefrLevel;
  n: number;
  title: string;
  titleRu: string;
  goal: string;
  vocab: VocabEntry[];
  grammar: GrammarTopic;
  lessons: LangLesson[];
  test: Exercise[];
  writing: string;
  reading: { title: string; text: string };
}

export interface LevelMeta {
  id: CefrLevel;
  title: string;
  titleRu: string;
  goals: string[];
}

export interface PlacementQuestion {
  id: string;
  skill: "vocabulary" | "grammar" | "reading" | "listening" | "sentence";
  prompt: string;
  audio?: string;
  options: string[];
  answer: string;
  weight: CefrLevel;
}

export interface PlacementResult {
  level: CefrLevel;
  skills: Record<string, number>;
  weak: string;
  answers: Record<string, string>;
}

export interface VocabState {
  box: VocabBox;
  ease: number;
  interval: number;
  due: string;
  reps: number;
  correct: number;
  wrong: number;
}

export interface DailyState {
  date: string;
  minutes: number;
  challengeDone: boolean;
  weeklyDone: boolean;
  goalMinutes: number;
  goalAwarded: boolean;
}

export interface LangChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface LanguageTrack {
  languageId: LearnLangId;
  reason: LearnReason;
  selfLevel: SelfLevel;
  cefr: CefrLevel;
  dailyMinutes: number;
  daysPerWeek: number;
  placement?: PlacementResult;
  completedLessons: string[];
  completedUnits: string[];
  completedLevels: CefrLevel[];
  unlockedLessons: string[];
  lessonAccuracy: Record<string, number>;
  vocab: Record<string, VocabState>;
  skills: {
    vocabulary: number;
    grammar: number;
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
  };
  unitScores: Record<string, number>;
  daily: DailyState;
  certificates: CefrLevel[];
  weakTags: string[];
  strongTags: string[];
  chat: LangChatTurn[];
  lastLessonId?: string;
}

export interface LanguageSchoolState {
  onboarded: boolean;
  activeLanguage: LearnLangId | null;
  tracks: Partial<Record<LearnLangId, LanguageTrack>>;
  hearts: number;
  coins: number;
  lastHeartAt?: string;
}

export const CEFR_ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const EMPTY_SKILLS = {
  vocabulary: 8,
  grammar: 8,
  reading: 8,
  listening: 8,
  speaking: 8,
  writing: 8,
};

export function emptyLangSchool(): LanguageSchoolState {
  return {
    onboarded: false,
    activeLanguage: null,
    tracks: {},
    hearts: 5,
    coins: 0,
  };
}

export function emptyDaily(minutes = 15): DailyState {
  return {
    date: new Date().toISOString().slice(0, 10),
    minutes: 0,
    challengeDone: false,
    weeklyDone: false,
    goalMinutes: minutes,
    goalAwarded: false,
  };
}

export function emptyTrack(partial: Pick<LanguageTrack, "languageId" | "reason" | "selfLevel" | "cefr" | "dailyMinutes" | "daysPerWeek"> & { firstLesson?: string }): LanguageTrack {
  return {
    ...partial,
    completedLessons: [],
    completedUnits: [],
    completedLevels: [],
    unlockedLessons: partial.firstLesson ? [partial.firstLesson] : [],
    lessonAccuracy: {},
    vocab: {},
    skills: { ...EMPTY_SKILLS },
    unitScores: {},
    daily: emptyDaily(partial.dailyMinutes),
    certificates: [],
    weakTags: [],
    strongTags: [],
    chat: [],
  };
}
