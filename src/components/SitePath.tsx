"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SITE_PAGES } from "@/lib/site-pages";

export function SitePath({
  idx,
  prevHref,
  nextHref,
}: {
  idx: number;
  prevHref?: string;
  nextHref?: string;
}) {
  const next = SITE_PAGES[idx + 1];
  const nextLabel = next?.label ?? "Начать";

  return (
    <>
      {prevHref && (
        <Link href={prevHref} className="site-side left" aria-label="Назад">
          <ChevronLeft size={20} />
        </Link>
      )}
      {nextHref && (
        <Link href={nextHref} className="site-side right" aria-label={next?.label ?? "Дальше"}>
          <span className="hidden sm:block font-serif italic text-sm pe-1">{nextLabel}</span>
          <ChevronRight size={20} />
        </Link>
      )}

      <nav className="site-path" aria-label="Страницы">
        <div className="site-path-line" style={{ ["--p" as string]: `${(idx / (SITE_PAGES.length - 1)) * 100}%` }} />
        {SITE_PAGES.map((p, i) => {
          const on = i === idx;
          return (
            <Link key={p.href} href={p.href} className={`site-node ${on ? "on" : ""}`}>
              <span className="site-node-label">{p.label}</span>
              <span className="site-node-orb" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
