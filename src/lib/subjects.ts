import type { Subject, SubjectCategory } from "./types";

export const SUBJECTS: Subject[] = [
  {
    id: "math",
    category: "exact",
    icon: "Calculator",
    color: "#1f6f60",
    topics: [
      { id: "percentages", subjectId: "math", grade: [6, 7, 8], difficulty: "easy", minutes: 10 },
      { id: "linear-eq", subjectId: "math", grade: [7, 8, 9], difficulty: "easy", minutes: 12 },
      { id: "systems", subjectId: "math", grade: [8, 9], difficulty: "medium", minutes: 18 },
      { id: "functions", subjectId: "math", grade: [8, 9, 10], difficulty: "medium", minutes: 16 },
      { id: "quadratic", subjectId: "math", grade: [8, 9, 10], difficulty: "medium", minutes: 20 },
      { id: "discriminant", subjectId: "math", grade: [8, 9, 10], difficulty: "medium", minutes: 12 },
      { id: "pythagoras", subjectId: "math", grade: [8, 9], difficulty: "easy", minutes: 10 },
      { id: "trigonometry", subjectId: "math", grade: [9, 10, 11], difficulty: "hard", minutes: 22 },
    ],
  },
  {
    id: "physics",
    category: "exact",
    icon: "Atom",
    color: "#2f5d9f",
    topics: [
      { id: "kinematics", subjectId: "physics", grade: [8, 9], difficulty: "medium", minutes: 15 },
      { id: "ohm", subjectId: "physics", grade: [8, 9, 10], difficulty: "medium", minutes: 12 },
      { id: "newton", subjectId: "physics", grade: [9, 10], difficulty: "medium", minutes: 16 },
      { id: "optics", subjectId: "physics", grade: [8, 9], difficulty: "easy", minutes: 12 },
      { id: "sky-blue", subjectId: "physics", grade: [7, 8, 9], difficulty: "easy", minutes: 8 },
    ],
  },
  {
    id: "chemistry",
    category: "exact",
    icon: "FlaskConical",
    color: "#b45309",
    topics: [
      { id: "atoms", subjectId: "chemistry", grade: [8, 9], difficulty: "easy", minutes: 12 },
      { id: "reactions", subjectId: "chemistry", grade: [8, 9, 10], difficulty: "medium", minutes: 16 },
      { id: "moles", subjectId: "chemistry", grade: [9, 10], difficulty: "medium", minutes: 14 },
    ],
  },
  {
    id: "cs",
    category: "exact",
    icon: "Code2",
    color: "#4338ca",
    topics: [
      { id: "algorithms", subjectId: "cs", grade: [8, 9, 10], difficulty: "medium", minutes: 18 },
      { id: "python-basics", subjectId: "cs", grade: [7, 8, 9], difficulty: "easy", minutes: 16 },
      { id: "data-structures", subjectId: "cs", grade: [10, 11], difficulty: "hard", minutes: 22 },
    ],
  },
  {
    id: "biology",
    category: "natural",
    icon: "Leaf",
    color: "#15803d",
    topics: [
      { id: "photosynthesis", subjectId: "biology", grade: [6, 7, 8], difficulty: "easy", minutes: 12 },
      { id: "cell", subjectId: "biology", grade: [7, 8, 9], difficulty: "medium", minutes: 14 },
      { id: "genetics", subjectId: "biology", grade: [9, 10, 11], difficulty: "hard", minutes: 20 },
    ],
  },
  {
    id: "geography",
    category: "natural",
    icon: "Globe2",
    color: "#0e7490",
    topics: [
      { id: "climate", subjectId: "geography", grade: [7, 8], difficulty: "easy", minutes: 10 },
      { id: "maps", subjectId: "geography", grade: [6, 7, 8], difficulty: "easy", minutes: 10 },
      { id: "tajikistan-geo", subjectId: "geography", grade: [7, 8, 9], difficulty: "medium", minutes: 14 },
    ],
  },
  {
    id: "history",
    category: "humanities",
    icon: "Landmark",
    color: "#9a3412",
    topics: [
      { id: "ancient", subjectId: "history", grade: [6, 7], difficulty: "easy", minutes: 12 },
      { id: "silk-road", subjectId: "history", grade: [7, 8, 9], difficulty: "medium", minutes: 14 },
      { id: "world-wars", subjectId: "history", grade: [9, 10, 11], difficulty: "medium", minutes: 18 },
    ],
  },
  {
    id: "russian",
    category: "humanities",
    icon: "BookOpen",
    color: "#b91c1c",
    topics: [
      { id: "cases", subjectId: "russian", grade: [6, 7, 8], difficulty: "medium", minutes: 14 },
      { id: "punctuation", subjectId: "russian", grade: [8, 9], difficulty: "medium", minutes: 12 },
      { id: "essay-ru", subjectId: "russian", grade: [9, 10, 11], difficulty: "hard", minutes: 20 },
    ],
  },
  {
    id: "tajik",
    category: "humanities",
    icon: "Languages",
    color: "#047857",
    topics: [
      { id: "alphabet-tg", subjectId: "tajik", grade: [5, 6], difficulty: "easy", minutes: 10 },
      { id: "grammar-tg", subjectId: "tajik", grade: [7, 8, 9], difficulty: "medium", minutes: 14 },
      { id: "literature-tg", subjectId: "tajik", grade: [9, 10], difficulty: "medium", minutes: 16 },
    ],
  },
  {
    id: "english",
    category: "humanities",
    icon: "Speech",
    color: "#1d4ed8",
    topics: [
      { id: "tenses", subjectId: "english", grade: [6, 7, 8, 9], difficulty: "medium", minutes: 16 },
      { id: "articles", subjectId: "english", grade: [6, 7, 8], difficulty: "easy", minutes: 10 },
      { id: "conditionals", subjectId: "english", grade: [8, 9, 10], difficulty: "hard", minutes: 18 },
    ],
  },
  {
    id: "chinese",
    category: "humanities",
    icon: "Languages",
    color: "#dc2626",
    topics: [
      { id: "pinyin", subjectId: "chinese", grade: [6, 7, 8], difficulty: "easy", minutes: 12 },
      { id: "hanzi", subjectId: "chinese", grade: [7, 8, 9], difficulty: "medium", minutes: 16 },
      { id: "tones", subjectId: "chinese", grade: [6, 7, 8], difficulty: "medium", minutes: 12 },
    ],
  },
  {
    id: "korean",
    category: "humanities",
    icon: "Languages",
    color: "#4338ca",
    topics: [
      { id: "hangul", subjectId: "korean", grade: [6, 7], difficulty: "easy", minutes: 12 },
      { id: "particles", subjectId: "korean", grade: [7, 8, 9], difficulty: "medium", minutes: 14 },
      { id: "honorifics", subjectId: "korean", grade: [8, 9, 10], difficulty: "hard", minutes: 16 },
    ],
  },
  {
    id: "arabic",
    category: "humanities",
    icon: "Languages",
    color: "#0f766e",
    topics: [
      { id: "alphabet-ar", subjectId: "arabic", grade: [6, 7], difficulty: "easy", minutes: 14 },
      { id: "roots", subjectId: "arabic", grade: [8, 9], difficulty: "medium", minutes: 16 },
      { id: "cases-ar", subjectId: "arabic", grade: [9, 10], difficulty: "hard", minutes: 18 },
    ],
  },
];

export const CATEGORIES: SubjectCategory[] = ["exact", "natural", "humanities"];

export function getSubject(id: string) {
  return SUBJECTS.find((s) => s.id === id);
}

export function getTopic(id: string) {
  for (const s of SUBJECTS) {
    const t = s.topics.find((x) => x.id === id);
    if (t) return t;
  }
  return undefined;
}

export function allTopics() {
  return SUBJECTS.flatMap((s) => s.topics);
}
