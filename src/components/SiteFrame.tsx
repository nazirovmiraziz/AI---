"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Home, Layers, Smartphone, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { AmbientField } from "@/components/AmbientField";
import { SITE_PAGES } from "@/lib/site-pages";
import { useApp } from "@/lib/store";
import { DEMO_EMAIL } from "@/lib/demo-data";

const DOCK = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/how", label: "Как", icon: Sparkles },
  { href: "/method", label: "Метод", icon: BookOpen },
  { href: "/program", label: "Предметы", icon: Layers },
  { href: "/install", label: "Телефон", icon: Smartphone },
] as const;

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/how", label: "Как работает" },
  { href: "/method", label: "Метод" },
  { href: "/program", label: "Предметы" },
  { href: "/tutor", label: "Репетитор" },
] as const;

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, loginDemo, setTheme } = useApp();
  const signed = Boolean(user && user.email.toLowerCase() !== DEMO_EMAIL);
  const [scrolled, setScrolled] = useState(false);

  const home = path === "/" || path === "/privacy" || path === "/terms" || path === "/how" || path === "/method" || path === "/program";

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove("dark");
    root.classList.add("force-light");
    if (home) {
      root.classList.add("site-home");
      root.classList.remove("site-lock");
      body.classList.remove("site-lock-body");
      root.style.overflow = "";
      body.style.overflow = "";
    } else {
      root.classList.remove("site-home");
      root.classList.add("site-lock");
      body.classList.add("site-lock-body");
      root.style.overflow = "hidden";
      body.style.overflow = "hidden";
    }
    if (user?.theme === "dark") setTheme("light");
    return () => {
      root.classList.remove("force-light", "site-lock", "site-home");
      body.classList.remove("site-lock-body");
      root.style.overflow = "";
      body.style.overflow = "";
    };
  }, [home, user?.theme, setTheme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function openDemo() {
    loginDemo();
    router.push("/tutor");
  }

  return (
    <div className="site-shell force-light relative min-w-0 bg-[#f8fbff] text-[#121826]">
      <AmbientField />
      <header className={`site-head ${scrolled ? "is-scrolled" : ""}`}>
        <div className="site-nav">
          <div className="flex min-w-0 items-center gap-2">
            <Logo size="sm" inverted={false} />
          </div>
          <nav className="desk-nav" aria-label="Разделы">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${path === item.href ? "on" : ""}`}
                aria-current={path === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="head-cta flex items-center gap-2 shrink-0">
            {signed ? (
              <Button href="/dashboard" className="!h-9 !min-h-9 px-4 md:!h-11 md:!min-h-11">Продолжить</Button>
            ) : (
              <>
                <Button href="/login" variant="secondary" className="!h-9 !min-h-9 px-3 md:!h-11 md:!min-h-11 hidden sm:inline-flex">
                  Войти
                </Button>
                <Button href="/register" className="!h-9 !min-h-9 px-4 md:!h-11 md:!min-h-11">
                  Начать
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="content" tabIndex={-1} className="site-main relative z-10">
        {children}
      </main>

      <footer className="site-foot">
        <nav className="phone-dock" aria-label="Меню">
          {DOCK.map((item) => {
            const Icon = item.icon;
            const on = path === item.href;
            return (
              <Link key={item.href} href={item.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
                <Icon size={18} aria-hidden />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <nav className="page-dots" aria-label="Страницы сайта">
          {SITE_PAGES.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className={`page-dot ${path === p.href ? "on" : ""}`}
              aria-label={`${p.num}. ${p.label}`}
              aria-current={path === p.href ? "page" : undefined}
              title={`${p.num}. ${p.label}`}
            />
          ))}
        </nav>
        <div className="foot-extra mx-auto mt-3 hidden max-w-6xl flex-wrap items-center justify-between gap-3 px-1 text-sm text-[var(--muted)] md:flex">
          <Link href="/school" className="hover:text-[var(--text)]">
            Кабинет
          </Link>
          <button type="button" className="hover:text-[var(--text)]" onClick={openDemo}>
            Демо учителя
          </button>
        </div>
      </footer>
    </div>
  );
}
