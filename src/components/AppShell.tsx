"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  Brain,
  Camera,
  ChevronsLeft,
  GraduationCap,
  History,
  Home,
  Languages,
  LineChart,
  Menu,
  MoreHorizontal,
  Repeat,
  Search,
  Sparkles,
  Target,
  Trophy,
  User,
  Settings,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CommandPalette } from "./CommandPalette";
import { FocusTimer } from "./FocusTimer";
import { BootScreen } from "./BootScreen";
import { peekSession, useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { levelFromXp } from "@/lib/demo-data";
import { ProgressBar } from "./ProgressBar";

const PRIMARY = [
  { href: "/dashboard", key: "nav.dashboard", icon: Home },
  { href: "/learn", key: "nav.learn", icon: Languages },
  { href: "/tutor", key: "nav.tutor", icon: Sparkles },
  { href: "/practice", key: "nav.practice", icon: Target },
  { href: "/review", key: "nav.review", icon: Repeat },
];

const MORE = [
  { href: "/subjects", key: "nav.subjects", icon: BookOpen },
  { href: "/progress", key: "nav.progress", icon: LineChart },
  { href: "/achievements", key: "nav.achievements", icon: Trophy },
  { href: "/history", key: "nav.history", icon: History },
  { href: "/photo", key: "nav.photo", icon: Camera },
  { href: "/exam", key: "nav.exam", icon: GraduationCap },
  { href: "/tests", key: "nav.tests", icon: Brain },
  { href: "/profile", key: "nav.profile", icon: User },
  { href: "/settings", key: "nav.settings", icon: Settings },
];

const MOBILE = [
  { href: "/dashboard", icon: Home, short: "Главная" },
  { href: "/learn", icon: Languages, short: "Учёба" },
  { href: "/tutor", icon: Sparkles, short: "ИИ" },
  { href: "/practice", icon: Target, short: "Практика" },
  { href: "/profile", icon: User, short: "Профиль" },
];

function navLabel(item: { key?: string; label?: string }, loc: Locale) {
  if (item.label) return item.label;
  return t(loc, item.key ?? "");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, hydrated, demoMode, logout, loginLast, setTheme, markInboxRead, unlockAchievement, lastXp, lastAchievement, displayName } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const loc = user?.language ?? "ru";

  useEffect(() => {
    if (!hydrated) return;
    if (user) return;
    if (loginLast()) return;
    if (peekSession()) return;
    router.replace("/login");
  }, [hydrated, user, router, loginLast]);

  const chatMode = pathname.startsWith("/tutor");

  useEffect(() => {
    if (!hydrated || !user) return;
    const free = pathname.startsWith("/learn/start") || pathname.startsWith("/learn/placement");
    if (!user.langSchool?.onboarded && !free && pathname.startsWith("/learn")) {
      router.replace("/learn/start");
    }
  }, [hydrated, user, pathname, router]);

  useEffect(() => {
    document.documentElement.classList.toggle("chat-lite", chatMode);
    setCollapsed(chatMode);
    return () => document.documentElement.classList.remove("chat-lite");
  }, [chatMode]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", user?.animationsOn === false);
  }, [user?.animationsOn]);

  useEffect(() => {
    const pref = user?.theme ?? "light";
    const apply = () => {
      const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [user?.theme]);

  useEffect(() => {
    if ((user?.streak ?? 0) >= 7) unlockAchievement("streak-7");
    if ((user?.streak ?? 0) >= 30) unlockAchievement("streak-30");
  }, [user?.streak, unlockAchievement]);

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--bg)] px-6">
        <div className="w-full max-w-sm text-center">
          <BootScreen text="Открываем кабинет…" />
        </div>
      </div>
    );
  }

  const lv = levelFromXp(user.xp);
  const shownName = displayName || "";
  const initial = (shownName || "S").trim().slice(0, 1).toUpperCase();
  const unread = (user.inbox ?? []).filter((n) => !n.read).length;

  const itemClass = (href: string) => {
    const on =
      href === "/learn"
        ? pathname === "/learn" || (pathname.startsWith("/learn/") && !pathname.startsWith("/learn/ai"))
        : pathname === href || pathname.startsWith(href + "/");
    return `app-nav ${on ? "on" : ""}`;
  };

  return (
    <div className={`relative flex w-full min-w-0 bg-[var(--bg)] text-[var(--text)] ${chatMode || pathname.startsWith("/learn/ai") ? "h-svh max-h-svh" : "min-h-svh overflow-x-clip"}`}>
      <CommandPalette />
      <aside className={`app-sidebar ${chatMode || collapsed ? "collapsed" : ""}`}>
        <div className={`flex gap-2 ${chatMode || collapsed ? "flex-col items-center p-3" : "items-center justify-between p-4"}`}>
          <Logo href="/dashboard" size="sm" markOnly={chatMode || collapsed} />
          {!chatMode && (
            <button type="button" className="icon-chip" onClick={() => setCollapsed((v) => !v)} aria-label="Свернуть меню" title="Свернуть">
              <ChevronsLeft size={16} />
            </button>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {PRIMARY.map((item) => {
            const Icon = item.icon;
            const label = navLabel(item, loc);
            return (
              <Link key={item.href} href={item.href} className={itemClass(item.href)} title={label}>
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
            <button className="app-nav w-full mt-3" onClick={() => setMore((v) => !v)} title="Ещё">
            <MoreHorizontal size={16} />
            <span>Ещё</span>
          </button>
          {more &&
            MORE.map((item) => {
              const Icon = item.icon;
              const label = navLabel(item, loc);
              return (
                <Link key={item.href} href={item.href} className={itemClass(item.href)} title={label}>
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              );
            })}
        </nav>
        <div className="p-4 border-t border-[var(--line)] space-y-3">
          <div className="side-user flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white text-sm font-semibold">
              {initial}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{shownName || "Ученик"}</div>
              <div className="text-[11px] text-[var(--muted)]">
                {t(loc, lv.current.nameKey)} · {user.xp.toLocaleString("ru-RU")} XP
              </div>
            </div>
          </div>
          <div className="side-xp"><ProgressBar value={lv.progress} /></div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        {!chatMode ? (
          <header className="sticky top-0 z-40 px-3 pt-3 app-shell-head">
          <div className="glass-nav flex items-center gap-1.5 sm:gap-2 rounded-2xl px-2 sm:px-3 py-2 min-w-0">
            <button className="app-menu-btn rounded-lg p-2 hover:bg-white/10" onClick={() => setOpen(true)} aria-label="Меню">
              <Menu size={20} />
            </button>
            <div className="app-mobile-logo">
              <Logo size="sm" href="/dashboard" />
            </div>
            <button
              className="btn-secondary app-search-wide flex-1 max-w-md items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--muted)]"
              onClick={() => window.dispatchEvent(new Event("ssai-palette"))}
            >
              <Search size={14} />
              {t(loc, "cmd.title")}
              <kbd className="ms-auto">Ctrl K</kbd>
            </button>
            <button
              className="app-menu-btn rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => window.dispatchEvent(new Event("ssai-palette"))}
              aria-label="Поиск"
            >
              <Search size={18} />
            </button>
            <div className="app-mobile-logo flex-1" />
            {!chatMode && <FocusTimer />}
            <div className="relative">
              <button type="button" className="icon-chip" onClick={() => setInboxOpen((v) => !v)} aria-label={t(loc, "notify.title")}>
                <Bell size={16} />
                {unread > 0 && <span className="notify-dot" />}
              </button>
              {inboxOpen && (
                <div className="absolute end-0 mt-2 w-[min(20rem,80vw)] panel-card p-3 z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">{t(loc, "notify.title")}</p>
                    <button type="button" className="text-xs text-brand-700" onClick={() => markInboxRead()}>Прочитать все</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {(user.inbox ?? []).length === 0 ? (
                      <p className="text-sm text-[var(--muted)] py-6 text-center">{t(loc, "notify.empty")}</p>
                    ) : (
                      (user.inbox ?? []).map((n) => (
                        <Link
                          key={n.id}
                          href={n.href || "/tutor"}
                          onClick={() => { markInboxRead(n.id); setInboxOpen(false); }}
                          className={`block rounded-xl border px-3 py-2 text-sm ${n.read ? "border-transparent" : "border-[var(--line)] bg-brand-50/50 dark:bg-white/5"}`}
                        >
                          <b className="font-medium">{n.title}</b>
                          <p className="text-[var(--muted)] text-xs mt-0.5">{n.text}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {demoMode && <span className="hidden sm:inline rounded-full bg-[#163068]/10 text-[#163068] text-[11px] px-2 py-1">Демо</span>}
            <button
              className="hidden sm:inline text-xs text-[var(--muted)] hover:text-[var(--text)]"
              onClick={() => setTheme(user.theme === "dark" ? "light" : "dark")}
            >
              {user.theme === "dark" ? "Светлая" : "Тёмная"}
            </button>
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <button className="text-sm text-[var(--muted)] hover:text-[var(--text)] shrink-0" onClick={() => { if (window.confirm("Выйти из этого аккаунта?")) logout(); }}>
              {t(loc, "logout")}
            </button>
          </div>
        </header>
        ) : null}
        {!chatMode && (lastXp || lastAchievement) ? (
          <div className="px-3 pt-2" aria-live="polite">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elev)] px-3 py-2 text-sm">
              {lastXp ? `+${lastXp.amount} XP${lastXp.reason ? ` · ${lastXp.reason}` : ""}` : null}
              {lastAchievement ? ` 🏆 ${t(loc, `ach.${lastAchievement}`)}` : null}
            </div>
          </div>
        ) : null}
        <main
          id="content"
          className={
            chatMode || pathname.startsWith("/learn/ai")
              ? `app-main-tutor flex-1 min-h-0 flex flex-col overflow-hidden page-in ${chatMode ? "p-0 pb-[4.5rem] md:pb-0" : "p-2 md:p-3 pb-[4.75rem]"}`
              : "flex-1 p-3 md:p-6 max-w-6xl w-full mx-auto pb-28 md:pb-6 page-in"
          }
        >
          {chatMode || pathname.startsWith("/learn/ai") ? children : <div className="lesson-canvas p-3 sm:p-4 md:p-6">{children}</div>}
        </main>
      </div>

      {open && (
        <div className="app-drawer fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-[min(20rem,88vw)] bg-[var(--bg-elev)] p-4 overflow-y-auto border-r border-[var(--line)]">
            <div className="flex justify-between items-center mb-4">
              <Logo href="/dashboard" size="sm" />
              <button onClick={() => setOpen(false)} aria-label="Закрыть"><X /></button>
            </div>
            {[...PRIMARY, ...MORE].map((item) => {
              const Icon = item.icon;
              const label = navLabel(item, loc);
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={itemClass(item.href)}>
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav className="app-dock" aria-label="Главное меню">
        {MOBILE.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/learn" ? pathname === "/learn" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-col items-center gap-1 px-0.5 text-[10px] min-h-11 ${active ? "text-brand-600 font-semibold" : "text-[var(--muted)]"}`}
            >
              <Icon size={18} />
              <span className="w-full truncate text-center leading-tight">{item.short}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
