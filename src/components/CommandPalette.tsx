"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { searchLearn } from "@/lib/lang/search";

const COMMANDS = [
  { id: "home", label: "Главная", href: "/dashboard", hint: "G" },
  { id: "chat", label: "Чат с репетитором", href: "/tutor", hint: "T" },
  { id: "learn", label: "Языки", href: "/learn", hint: "H" },
  { id: "practice", label: "Практика", href: "/practice" },
  { id: "tests", label: "Тесты", href: "/tests" },
  { id: "exam", label: "Экзамен", href: "/exam" },
  { id: "subjects", label: "Курсы", href: "/subjects" },
  { id: "map", label: "Учебный путь", href: "/learn/map" },
  { id: "ai", label: "Языковой репетитор", href: "/learn/ai" },
  { id: "vocab", label: "Словарь", href: "/learn/vocab" },
  { id: "progress", label: "Прогресс", href: "/progress" },
  { id: "profile", labelKey: "nav.profile", href: "/profile" },
  { id: "settings", labelKey: "nav.settings", href: "/settings" },
  { id: "achievements", label: "Достижения", href: "/achievements" },
];

export function CommandPalette() {
  const router = useRouter();
  const { user } = useApp();
  const loc = user?.language ?? "ru";
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") setOpen(false);
      if (open) return;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "t") router.push("/tutor");
      if (e.key.toLowerCase() === "h") router.push("/learn");
      if (e.key.toLowerCase() === "p") router.push("/progress");
      if (e.key.toLowerCase() === "g") router.push("/dashboard");
    };
    const openPalette = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("ssai-palette", openPalette);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ssai-palette", openPalette);
    };
  }, [open, router]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const cmds = COMMANDS.filter((c) => {
      const label = "labelKey" in c && c.labelKey ? t(loc, c.labelKey) : c.label ?? "";
      return !query || label.toLowerCase().includes(query) || c.id.includes(query);
    }).map((c) => ({
      ...c,
      label: "labelKey" in c && c.labelKey ? t(loc, c.labelKey) : c.label ?? c.id,
      kind: "cmd" as const,
    }));
    const learn = query
      ? searchLearn(query, user?.langSchool?.activeLanguage).map((h, i) => ({
          id: `${h.kind}-${i}-${h.href}`,
          label: h.label,
          href: h.href,
          kind: h.kind,
        }))
      : [];
    return query ? [...cmds, ...learn] : cmds;
  }, [q, loc, user?.langSchool?.activeLanguage]);

  useEffect(() => {
    setActive(0);
  }, [q, open]);

  function run(cmd: (typeof list)[number]) {
    router.push(cmd.href);
    setOpen(false);
    setQ("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-ink-950/40 p-3 sm:p-4" onClick={() => setOpen(false)}>
      <div
        className="mx-auto mt-[8vh] sm:mt-[12vh] w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] shadow-lift"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t(loc, "cmd.title")}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(list.length - 1, i + 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(0, i - 1));
            }
            if (e.key === "Enter" && list[active]) run(list[active]);
          }}
          placeholder={t(loc, "cmd.title")}
          className="w-full border-b border-[var(--line)] bg-transparent px-4 py-3 outline-none"
        />
        <div className="max-h-80 overflow-y-auto p-2">
          {list.length === 0 && <p className="px-3 py-6 text-sm text-[var(--muted)]">{t(loc, "cmd.empty")}</p>}
          {list.map((c, i) => (
            <button
              key={c.id}
              onClick={() => run(c)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${i === active ? "bg-black/5 dark:bg-white/10" : "hover:bg-ink-50 dark:hover:bg-white/5"}`}
            >
              <span>{String(c.label)}</span>
              {"hint" in c && typeof c.hint === "string" ? <kbd>{c.hint}</kbd> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function usePaletteHint() {
  return usePathname();
}
