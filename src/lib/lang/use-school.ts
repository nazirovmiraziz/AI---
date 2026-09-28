"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useApp } from "@/lib/store";
import type { CefrLevel, LanguageSchoolState, LanguageTrack, LearnLangId, LearnReason, PlacementResult, SelfLevel, SrsRating } from "./types";
import { langById } from "./catalog";
import { allUnits } from "./curriculum";
import {
  applySrs,
  continueLessonId,
  dueVocabIds,
  ensureLangSchool,
  finishLesson,
  finishUnitTest,
  getTrack,
  recommendLesson,
  refillHearts,
  startTrack,
  withDaily,
} from "./progress";

export function useLangSchool() {
  const app = useApp();
  const ls = useMemo(() => refillHearts(ensureLangSchool(app.user?.langSchool)), [app.user?.langSchool]);
  const lang = ls.activeLanguage;
  const track = useMemo(() => {
    const t = getTrack(ls, lang);
    return t ? withDaily(t) : null;
  }, [ls, lang]);
  const meta = lang ? langById(lang) : null;
  const units = lang ? allUnits(lang) : [];

  useEffect(() => {
    if (!app.user) return;
    const raw = ensureLangSchool(app.user.langSchool);
    const next = refillHearts(raw);
    if (next.hearts !== raw.hearts) app.updateUser({ langSchool: next });
  }, [app.user?.id]);

  const setLS = useCallback(
    (next: LanguageSchoolState) => {
      app.updateUser({ langSchool: next });
    },
    [app],
  );

  const patchTrack = useCallback(
    (fn: (t: LanguageTrack) => LanguageTrack) => {
      if (!lang || !ls.tracks[lang]) return;
      const cur = withDaily(ls.tracks[lang]!);
      setLS({ ...ls, tracks: { ...ls.tracks, [lang]: fn(cur) } });
    },
    [lang, ls, setLS],
  );

  const begin = useCallback(
    (opts: {
      languageId: LearnLangId;
      reason: LearnReason;
      selfLevel: SelfLevel;
      dailyMinutes: number;
      daysPerWeek: number;
      cefr?: CefrLevel;
      placement?: PlacementResult;
    }) => {
      const t = startTrack(opts);
      if (opts.placement) {
        t.placement = opts.placement;
        t.weakTags = [opts.placement.weak];
        t.skills = {
          vocabulary: opts.placement.skills.vocabulary ?? 40,
          grammar: opts.placement.skills.grammar ?? 40,
          reading: opts.placement.skills.reading ?? 40,
          listening: opts.placement.skills.listening ?? 40,
          speaking: 28,
          writing: 28,
        };
      }
      setLS({
        ...ls,
        onboarded: true,
        activeLanguage: opts.languageId,
        tracks: { ...ls.tracks, [opts.languageId]: t },
        hearts: 5,
      });
      app.updateUser({ onboardingDone: true, lessonLanguage: opts.languageId === "ru" ? "ru" : "en" });
      return t;
    },
    [app, ls, setLS],
  );

  const switchLang = useCallback(
    (id: LearnLangId) => {
      setLS({ ...ls, activeLanguage: id });
    },
    [ls, setLS],
  );

  const missHeart = useCallback(() => {
    setLS({ ...ls, hearts: Math.max(0, ls.hearts - 1), lastHeartAt: new Date().toISOString() });
  }, [ls, setLS]);

  const completeLesson = useCallback(
    (lessonId: string, accuracyPct: number, minutes: number) => {
      const result = finishLesson(ls, lessonId, accuracyPct, minutes);
      setLS(result.ls);
      if (result.xp) app.addXp(result.xp, result.reasons.join(" · "));
      if (minutes) app.addStudyMinutes(minutes);
      if (!app.user?.achievements.includes("first-lesson")) app.unlockAchievement("first-lesson");
      if (result.unitReady) app.unlockAchievement("first-unit");
      if (result.levelDone === "A1") app.unlockAchievement("a1-complete");
      if (result.goalHit) {
        app.pushNotice({
          kind: "task",
          title: "Цель дня",
          text: "Сегодняшние минуты уже набраны. Можно чуть отдохнуть или повторить слова.",
          href: "/learn",
        });
      }
      return result;
    },
    [app, ls, setLS],
  );

  const completeUnitTest = useCallback(
    (unitId: string, scorePct: number) => {
      const result = finishUnitTest(ls, unitId, scorePct);
      setLS(result.ls);
      if (result.xp) app.addXp(result.xp, result.reasons.join(" · "));
      if (result.levelDone === "A1") app.unlockAchievement("a1-complete");
      if (result.unitReady || result.reasons.includes("Модуль")) app.unlockAchievement("first-unit");
      return result;
    },
    [app, ls, setLS],
  );

  const rateWord = useCallback(
    (wordId: string, rating: SrsRating) => {
      patchTrack((t) => {
        const cur = t.vocab[wordId] ?? {
          box: "learning" as const,
          ease: 2.3,
          interval: 0,
          due: new Date().toISOString().slice(0, 10),
          reps: 0,
          correct: 0,
          wrong: 0,
        };
        return { ...t, vocab: { ...t.vocab, [wordId]: applySrs(cur, rating) } };
      });
      app.unlockAchievement("first-word");
    },
    [app, patchTrack],
  );

  const addChat = useCallback(
    (role: "user" | "assistant", content: string) => {
      patchTrack((t) => ({
        ...t,
        chat: [
          ...t.chat,
          { id: `c-${Date.now()}`, role, content, at: new Date().toISOString() },
        ].slice(-40),
      }));
    },
    [patchTrack],
  );

  const markChallenge = useCallback(
    (weekly = false) => {
      patchTrack((t) => ({
        ...t,
        daily: { ...t.daily, challengeDone: true, weeklyDone: weekly ? true : t.daily.weeklyDone },
      }));
      app.addXp(weekly ? 80 : 50, weekly ? "Недельный вызов" : "Задание дня");
      app.unlockAchievement("challenge-day");
    },
    [app, patchTrack],
  );

  const nextId = track && lang ? continueLessonId(track, lang) : undefined;
  const due = track ? dueVocabIds(track) : [];
  const rec = track && lang ? recommendLesson(track, lang) : null;

  return {
    user: app.user,
    ls,
    lang,
    meta,
    track,
    units,
    nextId,
    due,
    rec,
    setLS,
    begin,
    switchLang,
    patchTrack,
    missHeart,
    completeLesson,
    completeUnitTest,
    rateWord,
    addChat,
    markChallenge,
  };
}
