import { LEARN_LANGUAGES } from "./catalog";
import { allUnits } from "./curriculum";
import type { LearnLangId } from "./types";

export function searchLearn(q: string, languageId?: LearnLangId | null) {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const hits: { href: string; label: string; kind: string }[] = [];
  for (const l of LEARN_LANGUAGES) {
    if (l.name.toLowerCase().includes(query) || l.native.toLowerCase().includes(query) || l.id === query) {
      hits.push({ href: "/learn/languages", label: `${l.flag} ${l.name}`, kind: "lang" });
    }
  }
  const lang = languageId ?? "en";
  for (const u of allUnits(lang)) {
    if (u.title.toLowerCase().includes(query) || u.titleRu.toLowerCase().includes(query) || u.grammar.title.toLowerCase().includes(query) || u.grammar.titleRu.toLowerCase().includes(query)) {
      hits.push({ href: `/learn/unit/${u.id}`, label: `${u.level} · ${u.title} — ${u.titleRu}`, kind: "unit" });
    }
    for (const l of u.lessons) {
      if (l.title.toLowerCase().includes(query) || l.titleRu.toLowerCase().includes(query)) {
        hits.push({ href: `/learn/lesson/${l.id}`, label: l.titleRu, kind: "lesson" });
      }
    }
    for (const w of u.vocab) {
      if (w.word.toLowerCase().includes(query) || w.translation.toLowerCase().includes(query)) {
        hits.push({ href: "/learn/vocab", label: `${w.word} — ${w.translation}`, kind: "word" });
      }
    }
  }
  return hits.slice(0, 12);
}
