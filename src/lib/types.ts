export type Locale = "ru" | "tg" | "en" | "zh" | "ko" | "ar";

export type ExplainStyle =
  | "child"
  | "student"
  | "teacher"
  | "short"
  | "detailed"
  | "steps"
  | "funny"
  | "exam"
  | "simple";

export type Difficulty = "easy" | "medium" | "hard" | "olympiad" | "exam";

export type QuestionType =
  | "single"
  | "multiple"
  | "input"
  | "solve"
  | "match"
  | "boolean";

export type SubjectCategory = "exact" | "natural" | "humanities";

export interface Subject {
  id: string;
  category: SubjectCategory;
  icon: string;
  color: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  subjectId: string;
  grade: number[];
  difficulty: Difficulty;
  minutes: number;
  progress?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  meta?: {
    topic?: string;
    subject?: string;
    style?: ExplainStyle;
    steps?: { title: string; body: string }[];
    formula?: string;
    quizPrompt?: boolean;
    hints?: string[];
    understanding?: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  pinned: boolean;
  subjectId?: string;
  topicId?: string;
  messages: ChatMessage[];
  updatedAt: string;
  lessonLanguage: Locale;
}

export interface TestQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  answer: string | string[] | boolean;
  explanation: string;
  topic: string;
  difficulty: number;
  matchPairs?: { left: string; right: string }[];
}

export interface TestRecord {
  id: string;
  title: string;
  subjectId: string;
  topic: string;
  score: number;
  total: number;
  date: string;
  strong: string[];
  weak: string[];
  durationSec: number;
}

export interface ExamSession {
  id: string;
  country: string;
  grade: string;
  subjectId: string;
  examType: string;
  questions: TestQuestion[];
  answers: Record<string, unknown>;
  skipped: string[];
  startedAt: string;
  durationSec: number;
  finished?: boolean;
}

export interface StudyPlanDay {
  day: number;
  title: string;
  topicId?: string;
  done: boolean;
  minutes: number;
}

export interface StudyPlan {
  id: string;
  goal: string;
  days: StudyPlanDay[];
  createdAt: string;
}

export interface Flashcard {
  id: string;
  topic: string;
  subjectId: string;
  front: string;
  back: string;
  ease: number;
  interval: number;
  due: string;
  reps: number;
}

export interface Achievement {
  id: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Lesson {
  id: string;
  subjectId: string;
  topicId: string;
  grade: number;
  titleKey: string;
  sections: {
    learn: string[];
    simple: string;
    theory: string;
    examples: { title: string; body: string; formula?: string }[];
    practice: { prompt: string; hint: string; answer: string }[];
    summary: string[];
    next: string;
  };
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  password: string;
  grade: string;
  country: string;
  language: Locale;
  lessonLanguage: Locale;
  goal: string;
  favoriteSubjects: string[];
  subjectLevels: Record<string, number>;
  learnedTopics: string[];
  weakTopics: string[];
  strongTopics: string[];
  xp: number;
  streak: number;
  lastActiveDate: string;
  achievements: string[];
  testHistory: TestRecord[];
  explainStyle: ExplainStyle;
  hintOnly: boolean;
  theme: "light" | "dark";
  onboardingDone: boolean;
  diagnosticDone: boolean;
  continueLesson?: { topicId: string; subjectId: string; progress: number };
  lastStudy?: { topic: string; date: string };
  weeklyMinutes: number[];
  topicsThisWeek: number;
  studyMinutes: number;
}

export interface AppState {
  user: StudentProfile | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  studyPlan: StudyPlan | null;
  flashcards: Flashcard[];
  exam: ExamSession | null;
  demoMode: boolean;
  hydrated: boolean;
  lastUserName: string | null;
  lastUserEmail: string | null;
}
