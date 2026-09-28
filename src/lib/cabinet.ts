import type { AppNotice, Locale, StudentProfile } from "./types";
import { t } from "./i18n";

export const TUTOR_NAME = "Репетитор";
export const TUTOR_ROLE = "Помогу понять тему";

const INVENTED = /^(алишер|alisher|нигара|нигора|nigara)$/i;

export function isInventedName(name?: string) {
  const first = name?.trim().split(/\s+/)[0] || "";
  return INVENTED.test(first);
}

export function firstName(name?: string) {
  const first = name?.trim().split(/\s+/)[0] || "";
  if (!first || INVENTED.test(first)) return "";
  return first;
}

export function stripFakeNames(text: string, realFirst?: string) {
  const safe = realFirst && !INVENTED.test(realFirst) ? realFirst : "";
  const next = safe
    ? text
        .replace(/Алишер/g, safe)
        .replace(/Alisher/gi, safe)
        .replace(/Нигара/g, safe)
        .replace(/Нигора/g, safe)
        .replace(/Nigara/gi, safe)
    : text
        .replace(/,?\s*(Алишер|Alisher|Нигара|Нигора|Nigara)/gi, "")
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([,.!?])/g, "$1");
  return next.replace(/^\s+/, "");
}

export function dayGreeting(locale: Locale, name?: string, hour = 12) {
  const who = firstName(name);
  const slot = hour < 5 ? "night" : hour < 12 ? "morning" : hour < 18 ? "day" : "evening";
  const hi = t(locale, `greet.${slot}`);
  return who ? `${hi}, ${who}` : hi;
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function weekdayKeys() {
  return ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
}

export function weekActivity(days: string[] = []) {
  const keys = weekdayKeys();
  const now = new Date();
  const monday = new Date(now);
  const dow = now.getDay();
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  return keys.map((key, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return { key, iso, done: days.includes(iso), today: iso === todayKey() };
  });
}

export function accuracy(user?: StudentProfile | null) {
  const hist = user?.testHistory ?? [];
  if (!hist.length) return 0;
  const score = hist.reduce((a, r) => a + r.score, 0);
  const total = hist.reduce((a, r) => a + r.total, 0);
  return total ? Math.round((score / total) * 100) : 0;
}

export function tasksDone(user?: StudentProfile | null) {
  return (user?.testHistory ?? []).reduce((a, r) => a + r.score, 0);
}

export function seedInbox(user: StudentProfile): AppNotice[] {
  if (user.inbox?.length) return user.inbox;
  const weak = user.weakTopics[0];
  return [
    {
      id: "n-streak",
      kind: "streak",
      title: `Серия ${user.streak} дн.`,
      text: "Занимайся сегодня, чтобы не сбить серию.",
      href: "/learn",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "n-ai",
      kind: "ai",
      title: "Подсказка",
      text: weak ? "Эту тему стоит повторить." : "Начни первый урок.",
      href: weak ? `/learn/ai` : "/learn",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "n-ach",
      kind: "ach",
      title: "Достижения",
      text: user.achievements.length ? "Открой коллекцию наград." : "Первые награды появятся после урока.",
      href: "/achievements",
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export function appHome(user?: StudentProfile | null) {
  if (!user) return "/login";
  return "/dashboard";
}

export function insightText(user?: StudentProfile | null, locale: Locale = "ru") {
  const weak = user?.weakTopics?.[0];
  if (weak) return t(locale, "insight.weak");
  if (user?.continueLesson) return t(locale, "insight.continue");
  return t(locale, "insight.start");
}
