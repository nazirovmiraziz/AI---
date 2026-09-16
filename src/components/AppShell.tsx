"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Brain,
  Camera,
  GraduationCap,
  Home,
  Languages,
  LayoutDashboard,
  LineChart,
  Menu,
  PenLine,
  Sigma,
  Sparkles,
  Trophy,
  User,
  Settings,
  X,
  LayoutTemplate,
} from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { peekSession, useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { levelFromXp } from "@/lib/demo-data";
import { ProgressBar } from "./ProgressBar";
import { ShaderCanvas } from "./ShaderCanvas";

const GROUPS = [
  {
    label: "Обучение",
    items: [
      { href: "/dashboard", key: "nav.dashboard", icon: Home },
      { href: "/tutor", key: "nav.tutor", icon: Sparkles },
      { href: "/subjects", key: "nav.subjects", icon: BookOpen },
      { href: "/library", key: "nav.library", icon: LayoutDashboard },
      { href: "/templates", key: "nav.templates", icon: LayoutTemplate },
    ],
  },
  {
    label: "Практика",
    items: [
      { href: "/tests", key: "nav.tests", icon: Brain },
      { href: "/exam", key: "nav.exam", icon: GraduationCap },
      { href: "/photo", key: "nav.photo", icon: Camera },
      { href: "/flashcards", key: "nav.flash", icon: Languages },
      { href: "/writing", key: "nav.writing", icon: PenLine },
      { href: "/formulas", key: "nav.formulas", icon: Sigma },
    ],
  },
  {
    label: "Ты",
    items: [
      { href: "/plan", key: "nav.plan", icon: LineChart },
      { href: "/progress", key: "nav.progress", icon: LineChart },
      { href: "/achievements", key: "nav.achievements", icon: Trophy },
      { href: "/profile", key: "nav.profile", icon: User },
      { href: "/history", key: "nav.history", icon: BookOpen },
      { href: "/translator", key: "translator", icon: Languages },
      { href: "/diagnostic", key: "diag.title", icon: Brain },
      { href: "/lesson/new", key: "nav.createLesson", icon: BookOpen },
      { href: "/settings", key: "nav.settings", icon: Settings },
    ],
  },
];

const MOBILE = [
  GROUPS[0].items[0],
  GROUPS[0].items[1],
  GROUPS[0].items[2],
  GROUPS[1].items[0],
  GROUPS[2].items[3],
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, hydrated, demoMode, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const loc = user?.language ?? "ru";

  useEffect(() => {
    if (!hydrated) return;
    if (user) return;
    if (peekSession()) return;
    router.replace("/login");
  }, [hydrated, user, router]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("dark");
    html.style.background = "#05060b";
    body.style.background = "#05060b";
    return () => {
      html.style.background = "";
      body.style.background = "";
    };
  }, []);

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#05060b] text-white">
        <div className="skeleton h-12 w-52" />
      </div>
    );
  }

  const lv = levelFromXp(user.xp);
  const initial = user.name.trim().slice(0, 1).toUpperCase();

  const NavList = () => (
    <nav className="flex flex-col gap-5 px-3">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <div className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/35">{g.label}</div>
          <div className="flex flex-col gap-0.5">
            {g.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`app-nav ${active ? "on" : ""}`}
                >
                  <Icon size={16} />
                  {t(loc, item.key)}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="app-cinema relative min-h-screen flex text-[#f6f3ea]">
      <ShaderCanvas />
      <aside className="app-side hidden lg:flex w-[280px] flex-col sticky top-0 h-screen z-20">
        <div className="p-5">
          <Logo href="/dashboard" inverted />
        </div>
        <div className="flex-1 overflow-y-auto pb-4">
          <NavList />
        </div>
        <div className="p-5 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="app-avatar">{initial}</span>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-[11px] text-gold-400/80">
                {t(loc, lv.current.nameKey)} · {user.xp.toLocaleString("ru-RU")} XP
              </div>
            </div>
          </div>
          <ProgressBar value={lv.progress} />
        </div>
      </aside>

      <div className="relative z-10 flex-1 min-w-0 flex flex-col">
        <header className="app-top sticky top-0 z-40">
          <div className="flex items-center gap-3 px-4 py-3">
            <button className="lg:hidden rounded-xl p-2 hover:bg-white/10" onClick={() => setOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="lg:hidden">
              <Logo size="sm" href="/dashboard" inverted />
            </div>
            <div className="flex-1" />
            {demoMode && <span className="app-chip">Demo</span>}
            <span className="hidden sm:flex items-center gap-2 text-sm">
              <span className="app-avatar sm">{initial}</span>
              {user.name}
            </span>
            <span className="hidden sm:flex app-chip gold">🔥 {user.streak}</span>
            <LanguageSwitcher />
            <button className="text-sm text-white/50 hover:text-white" onClick={logout}>
              {t(loc, "logout")}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto pb-24">{children}</main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-80 bg-[#0b0e16] p-4 overflow-y-auto border-r border-white/10">
            <div className="flex justify-between items-center mb-4">
              <Logo href="/dashboard" inverted />
              <button onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>
            <NavList />
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 app-top grid grid-cols-5 px-1 py-2">
        {MOBILE.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 text-[10px] ${active ? "text-gold-400" : "text-white/40"}`}>
              <Icon size={18} />
              {t(loc, item.key)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
