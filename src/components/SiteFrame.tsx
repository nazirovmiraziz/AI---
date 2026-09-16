"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { ShaderCanvas } from "@/components/ShaderCanvas";
import { SiteAtmosphere } from "@/components/SiteAtmosphere";
import { SitePath } from "@/components/SitePath";
import { SITE_PAGES } from "@/lib/site-pages";
import { useApp } from "@/lib/store";

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, displayName, loginLast } = useApp();
  const idx = Math.max(0, SITE_PAGES.findIndex((p) => p.href === path));
  const prev = SITE_PAGES[idx - 1];
  const next = SITE_PAGES[idx + 1];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && next) router.push(next.href);
      if (e.key === "ArrowLeft" && prev) router.push(prev.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, router]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.background;
    const prevBody = body.style.background;
    html.style.background = "#05060b";
    body.style.background = "#05060b";
    return () => {
      html.style.background = prevHtml;
      body.style.background = prevBody;
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#05060b] text-[#f6f3ea]">
      <ShaderCanvas />
      <SiteAtmosphere />

      <header className="relative z-30 mx-3 mt-3 md:mx-auto md:max-w-7xl rounded-full panel px-4 py-2.5 flex items-center gap-3">
        <Logo inverted />
        <nav className="hidden md:flex items-center gap-5 text-sm text-white/65 mx-auto">
          {SITE_PAGES.map((p) => (
            <Link key={p.href} href={p.href} className={path === p.href ? "text-white" : "hover:text-white"}>
              {p.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 ms-auto">
          {user ? (
            <Link href="/dashboard">
              <Button variant="glow">Продолжить, {user.name}</Button>
            </Link>
          ) : displayName ? (
            <button
              className="text-sm px-3 py-2 text-white/80 hover:text-white"
              onClick={() => {
                if (loginLast()) router.push("/dashboard");
                else router.push("/login");
              }}
            >
              Войти как {displayName}
            </button>
          ) : (
            <Link href="/login" className="hidden sm:block text-sm px-3 py-2 text-white/70 hover:text-white">
              Войти
            </Link>
          )}
          {!user && (
            <Link href="/register">
              <Button variant="glow">Начать</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 h-[calc(100dvh-6.5rem)] px-4 md:px-8 overflow-hidden pb-16">{children}</main>

      <SitePath idx={idx} prevHref={prev?.href} nextHref={next?.href ?? (user ? "/dashboard" : "/register")} />
    </div>
  );
}
