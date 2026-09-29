import type { CefrLevel, LanguageSchoolState, LanguageTrack, LearnLangId, LearnReason, SelfLevel, VocabState } from "./types";
import { CEFR_ORDER, emptyDaily, emptyLangSchool, emptyTrack } from "./types";
import { allUnits, findLesson, firstLessonId, nextLessonId } from "./curriculum";
import { selfToCefr } from "./placement";
import { LEARN_LANGUAGES } from "./catalog";

export function today() {
  return new Date().toISOString().slice(0, 10);
}

const LANG_IDS = new Set<string>(LEARN_LANGUAGES.map((l) => l.id));
const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const dict = <T,>(v: unknown): Record<string, T> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, T>) : {});

function normalizeTrack(id: LearnLangId, raw: Partial<LanguageTrack>): LanguageTrack {
  const cefr = CEFR_ORDER.includes(raw.cefr as CefrLevel) ? (raw.cefr as CefrLevel) : "A1";
  const dailyMinutes = typeof raw.dailyMinutes === "number" && raw.dailyMinutes > 0 ? raw.dailyMinutes : 15;
  const base = emptyTrack({
    languageId: id,
    reason: raw.reason ?? "speak",
    selfLevel: raw.selfLevel ?? "zero",
    cefr,
    dailyMinutes,
    daysPerWeek: typeof raw.daysPerWeek === "number" ? raw.daysPerWeek : 7,
  });
  const unlocked = list<string>(raw.unlockedLessons);
  const daily = raw.daily && typeof raw.daily === "object" && typeof raw.daily.date === "string" ? { ...emptyDaily(dailyMinutes), ...raw.daily } : emptyDaily(dailyMinutes);
  return {
    ...base,
    ...raw,
    languageId: id,
    cefr,
    dailyMinutes,
    completedLessons: list(raw.completedLessons),
    completedUnits: list(raw.completedUnits),
    completedLevels: list(raw.completedLevels),
    unlockedLessons: unlocked.length ? unlocked : unlockForCefr(id, cefr),
    lessonAccuracy: dict(raw.lessonAccuracy),
    vocab: dict(raw.vocab),
    skills: { ...base.skills, ...dict<number>(raw.skills) },
    unitScores: dict(raw.unitScores),
    daily,
    certificates: list(raw.certificates),
    weakTags: list(raw.weakTags),
    strongTags: list(raw.strongTags),
    chat: list(raw.chat),
  };
}

export function ensureLangSchool(raw?: LanguageSchoolState | null): LanguageSchoolState {
  if (!raw || typeof raw !== "object") return emptyLangSchool();
  const tracks: LanguageSchoolState["tracks"] = {};
  for (const [id, t] of Object.entries(dict<Partial<LanguageTrack>>(raw.tracks))) {
    if (!LANG_IDS.has(id) || !t || typeof t !== "object") continue;
    tracks[id as LearnLangId] = normalizeTrack(id as LearnLangId, t);
  }
  const ids = Object.keys(tracks) as LearnLangId[];
  const activeLanguage = raw.activeLanguage && tracks[raw.activeLanguage] ? raw.activeLanguage : ids[0] ?? null;
  return {
    ...emptyLangSchool(),
    ...raw,
    onboarded: Boolean(raw.onboarded && activeLanguage),
    activeLanguage,
    tracks,
    hearts: typeof raw.hearts === "number" ? raw.hearts : 5,
    coins: typeof raw.coins === "number" ? raw.coins : 0,
  };
}

export function refillHearts(ls: LanguageSchoolState): LanguageSchoolState {
  if (ls.hearts >= 5) return ls;
  const last = ls.lastHeartAt ? new Date(ls.lastHeartAt).getTime() : 0;
  const passed = Date.now() - last;
  const gain = Math.min(5 - ls.hearts, Math.floor(passed / (20 * 60 * 1000)));
  if (gain <= 0) return ls;
  return { ...ls, hearts: ls.hearts + gain, lastHeartAt: new Date().toISOString() };
}

export function getTrack(ls: LanguageSchoolState, id?: LearnLangId | null): LanguageTrack | null {
  if (!id) return null;
  return ls.tracks[id] ?? null;
}

export function withDaily(track: LanguageTrack): LanguageTrack {
  const d = today();
  if (track.daily.date === d) return track;
  return { ...track, daily: emptyDaily(track.dailyMinutes) };
}

export function unlockForCefr(languageId: LearnLangId, cefr: CefrLevel): string[] {
  const units = allUnits(languageId);
  const idx = CEFR_ORDER.indexOf(cefr);
  const ids: string[] = [];
  let placed = false;
  for (const u of units) {
    const ui = CEFR_ORDER.indexOf(u.level);
    if (ui < idx) ids.push(...u.lessons.map((l) => l.id));
    if (ui === idx && !placed) {
      const first = u.lessons[0]?.id;
      if (first) ids.push(first);
      placed = true;
    }
  }
  if (!ids.length) {
    const f = firstLessonId(languageId);
    if (f) ids.push(f);
  }
  return [...new Set(ids)];
}

export function startTrack(opts: {
  languageId: LearnLangId;
  reason: LearnReason;
  selfLevel: SelfLevel;
  dailyMinutes: number;
  daysPerWeek: number;
  cefr?: CefrLevel;
}): LanguageTrack {
  const cefr = opts.cefr ?? selfToCefr(opts.selfLevel);
  const unlocked = unlockForCefr(opts.languageId, cefr);
  const track = emptyTrack({ ...opts, cefr, firstLesson: unlocked[0] });
  track.unlockedLessons = unlocked;
  return track;
}

export function isLessonOpen(track: LanguageTrack, lessonId: string) {
  return track.unlockedLessons.includes(lessonId) || track.completedLessons.includes(lessonId);
}

export function isUnitOpen(track: LanguageTrack, languageId: LearnLangId, unitId: string) {
  const unit = allUnits(languageId).find((u) => u.id === unitId);
  if (!unit) return false;
  const li = CEFR_ORDER.indexOf(unit.level);
  const ci = CEFR_ORDER.indexOf(track.cefr);
  if (li < ci) return true;
  if (li > ci && !track.completedLevels.includes(unit.level) && !track.completedLevels.includes(CEFR_ORDER[li - 1])) {
    const prev = CEFR_ORDER[li - 1];
    if (prev && !track.completedLevels.includes(prev) && unit.level !== track.cefr) return false;
  }
  return unit.lessons.some((l) => isLessonOpen(track, l.id));
}

export function unitProgress(track: LanguageTrack, languageId: LearnLangId, unitId: string) {
  const unit = allUnits(languageId).find((u) => u.id === unitId);
  if (!unit) return 0;
  const done = unit.lessons.filter((l) => track.completedLessons.includes(l.id)).length;
  return Math.round((done / Math.max(1, unit.lessons.length)) * 100);
}

export interface LessonFinish {
  ls: LanguageSchoolState;
  xp: number;
  reasons: string[];
  nextLessonId?: string;
  unitReady?: string;
  levelDone?: CefrLevel;
  goalHit?: boolean;
}

export function finishLesson(ls: LanguageSchoolState, lessonId: string, accuracyPct: number, minutes: number): LessonFinish {
  const lang = ls.activeLanguage;
  if (!lang || !ls.tracks[lang]) return { ls, xp: 0, reasons: [] };
  const track = withDaily(ls.tracks[lang]!);
  const found = findLesson(lang, lessonId);
  if (!found) return { ls, xp: 0, reasons: [] };
  const { unit, lesson } = found;
  const already = track.completedLessons.includes(lessonId);
  const nextId = nextLessonId(lang, lessonId);
  const unlocked = new Set(track.unlockedLessons);
  unlocked.add(lessonId);
  if (nextId) unlocked.add(nextId);

  const completedLessons = already ? track.completedLessons : [...track.completedLessons, lessonId];
  const vocab = { ...track.vocab };
  for (const w of lesson.newWords) {
    const id = unit.vocab.find((v) => v.word === w)?.id;
    if (id && !vocab[id]) vocab[id] = newVocab();
  }

  const skills = { ...track.skills };
  const bump = (k: keyof typeof skills, n: number) => {
    skills[k] = Math.max(0, Math.min(100, skills[k] + n));
  };
  const gain = already ? 0 : accuracyPct >= 80 ? 4 : accuracyPct >= 50 ? 2 : 1;
  if (lesson.skill === "vocab" || lesson.skill === "mix") bump("vocabulary", gain);
  if (lesson.skill === "grammar" || lesson.skill === "mix") bump("grammar", gain);
  if (lesson.skill === "listen") bump("listening", gain);
  if (lesson.skill === "speak") bump("speaking", gain);
  if (lesson.skill === "read") bump("reading", gain);
  if (lesson.skill === "write") bump("writing", gain);

  const unitDone = unit.lessons.every((l) => completedLessons.includes(l.id));
  let xp = already ? 5 : XP_LANG.lesson;
  const reasons = already ? ["Повтор урока"] : ["Урок"];
  const daily = { ...track.daily, minutes: track.daily.minutes + minutes };
  let goalHit = false;
  if (!daily.goalAwarded && daily.minutes >= daily.goalMinutes) {
    daily.goalAwarded = true;
    xp += XP_LANG.dailyGoal;
    reasons.push("Цель дня");
    goalHit = true;
  }

  let completedUnits = track.completedUnits;
  let unitReady: string | undefined;
  if (unitDone && !completedUnits.includes(unit.id)) unitReady = unit.id;

  const next: LanguageTrack = {
    ...track,
    completedLessons,
    unlockedLessons: [...unlocked],
    lessonAccuracy: { ...track.lessonAccuracy, [lessonId]: accuracyPct },
    vocab,
    skills,
    daily,
    lastLessonId: lessonId,
    completedUnits,
  };

  return {
    ls: { ...ls, tracks: { ...ls.tracks, [lang]: next }, coins: (ls.coins ?? 0) + (already ? 1 : 5) },
    xp,
    reasons,
    nextLessonId: nextId,
    unitReady,
    goalHit,
  };
}

export function finishUnitTest(ls: LanguageSchoolState, unitId: string, scorePct: number): LessonFinish {
  const lang = ls.activeLanguage;
  if (!lang || !ls.tracks[lang]) return { ls, xp: 0, reasons: [] };
  const track = withDaily(ls.tracks[lang]!);
  const units = allUnits(lang);
  const unit = units.find((u) => u.id === unitId);
  if (!unit) return { ls, xp: 0, reasons: [] };
  const passed = scorePct >= 70;
  const completedUnits = passed && !track.completedUnits.includes(unitId) ? [...track.completedUnits, unitId] : track.completedUnits;
  const nextU = units[units.findIndex((u) => u.id === unitId) + 1];
  const unlocked = new Set(track.unlockedLessons);
  if (passed && nextU?.lessons[0]) unlocked.add(nextU.lessons[0].id);

  const levelUnits = units.filter((u) => u.level === unit.level);
  const levelDone = passed && levelUnits.every((u) => completedUnits.includes(u.id)) ? unit.level : undefined;
  const completedLevels = levelDone && !track.completedLevels.includes(levelDone) ? [...track.completedLevels, levelDone] : track.completedLevels;
  const certificates = levelDone && !track.certificates.includes(levelDone) ? [...track.certificates, levelDone] : track.certificates;
  if (levelDone) {
    const ni = CEFR_ORDER.indexOf(levelDone) + 1;
    const nextLevel = CEFR_ORDER[ni];
    if (nextLevel) {
      const nu = units.find((u) => u.level === nextLevel);
      if (nu?.lessons[0]) unlocked.add(nu.lessons[0].id);
    }
  }

  let xp = passed ? XP_LANG.test : 10;
  const reasons = [passed ? "Тест модуля" : "Попытка теста"];
  if (levelDone) {
    xp += XP_LANG.level;
    reasons.push(`Уровень ${levelDone}`);
  } else if (passed) {
    xp += XP_LANG.unit;
    reasons.push("Модуль");
  }

  const next: LanguageTrack = {
    ...track,
    completedUnits,
    completedLevels,
    certificates,
    unlockedLessons: [...unlocked],
    unitScores: { ...track.unitScores, [unitId]: scorePct },
    cefr: levelDone ? CEFR_ORDER[Math.min(CEFR_ORDER.length - 1, CEFR_ORDER.indexOf(levelDone) + 1)] ?? track.cefr : track.cefr,
  };
  if (levelDone && CEFR_ORDER.indexOf(levelDone) >= CEFR_ORDER.indexOf(track.cefr)) {
    const nxt = CEFR_ORDER[CEFR_ORDER.indexOf(levelDone) + 1];
    if (nxt) next.cefr = nxt;
  }

  return {
    ls: { ...ls, tracks: { ...ls.tracks, [lang]: next }, coins: ls.coins + (passed ? 20 : 4) },
    xp,
    reasons,
    nextLessonId: nextU?.lessons[0]?.id,
    levelDone,
  };
}

export function newVocab(): VocabState {
  return {
    box: "new",
    ease: 2.3,
    interval: 0,
    due: today(),
    reps: 0,
    correct: 0,
    wrong: 0,
  };
}

export function applySrs(v: VocabState, rating: "again" | "hard" | "good" | "easy"): VocabState {
  const now = new Date();
  let interval = v.interval;
  let ease = v.ease;
  let box: VocabState["box"] = "learning";
  if (rating === "again") {
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
    box = "review";
  } else if (rating === "hard") {
    interval = Math.max(1, Math.round(interval * 1.2) || 1);
    ease = Math.max(1.3, ease - 0.05);
    box = "learning";
  } else if (rating === "good") {
    interval = interval === 0 ? 1 : Math.round(interval * ease);
    box = interval >= 7 ? "known" : "learning";
  } else {
    interval = interval === 0 ? 3 : Math.round(interval * ease * 1.3);
    ease += 0.08;
    box = "known";
  }
  now.setDate(now.getDate() + Math.max(0, interval));
  return {
    ...v,
    ease,
    interval,
    box,
    due: now.toISOString().slice(0, 10),
    reps: v.reps + 1,
    correct: rating === "again" ? v.correct : v.correct + 1,
    wrong: rating === "again" ? v.wrong + 1 : v.wrong,
  };
}

export function bumpSkill(n: number, ok: boolean) {
  return Math.max(0, Math.min(100, n + (ok ? 2 : -1)));
}

export const XP_LANG = {
  lesson: 25,
  test: 50,
  dailyGoal: 30,
  streak7: 100,
  challenge: 50,
  achievement: 200,
  unit: 80,
  level: 200,
} as const;

export const REASON_LABEL: Record<LearnReason, string> = {
  travel: "Путешествия",
  work: "Работа",
  study: "Учёба",
  speak: "Разговорная речь",
  move: "Переезд",
  self: "Для себя",
  exam: "Экзамен",
};

export function continueLessonId(track: LanguageTrack, languageId: LearnLangId) {
  const flat = allUnits(languageId).flatMap((u) => u.lessons);
  const open = flat.find((l) => track.unlockedLessons.includes(l.id) && !track.completedLessons.includes(l.id));
  return open?.id ?? track.lastLessonId ?? flat[0]?.id;
}

export function dueVocabIds(track: LanguageTrack) {
  const d = today();
  return Object.entries(track.vocab)
    .filter(([, s]) => s.due <= d)
    .map(([id]) => id);
}

export function recommendLesson(track: LanguageTrack, languageId: LearnLangId) {
  const weakest = (Object.entries(track.skills) as [string, number][]).sort((a, b) => a[1] - b[1])[0];
  const units = allUnits(languageId);
  if (weakest?.[0] === "listening") {
    const l = units.flatMap((u) => u.lessons).find((x) => x.skill === "listen" && isLessonOpen(track, x.id) && !track.completedLessons.includes(x.id));
    if (l) return { lessonId: l.id, why: "Слабее всего аудирование. Короткий слух сегодня поможет." };
  }
  if (weakest?.[0] === "grammar") {
    const g = units.flatMap((u) => u.lessons).find((x) => x.skill === "grammar" && isLessonOpen(track, x.id) && !track.completedLessons.includes(x.id));
    if (g) return { lessonId: g.id, why: "Часто путается грамматика. Сегодня лучше короткий разбор правила." };
  }
  const id = continueLessonId(track, languageId);
  return { lessonId: id, why: "Продолжи с того места, где остановился." };
}
