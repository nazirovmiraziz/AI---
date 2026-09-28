"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SITE_PAGES } from "@/lib/site-pages";

type PageId = (typeof SITE_PAGES)[number]["id"];

export function PageTurn({ id }: { id: PageId }) {
  const i = SITE_PAGES.findIndex((p) => p.id === id);
  const prev = SITE_PAGES[i - 1];
  const next = SITE_PAGES[i + 1];
  return (
    <nav className="land-turn" aria-label="Страницы сайта">
      {prev ? (
        <Link href={prev.href} className="land-turn-link">
          <ArrowLeft size={16} aria-hidden />
          <span>
            <small>Назад</small>
            {prev.label}
          </span>
        </Link>
      ) : (
        <span />
      )}
      <p className="land-turn-num">
        {SITE_PAGES[i]?.num} / {String(SITE_PAGES.length).padStart(2, "0")}
      </p>
      {next ? (
        <Link href={next.href} className="land-turn-link next">
          <span>
            <small>Дальше</small>
            {next.label}
          </span>
          <ArrowRight size={16} aria-hidden />
        </Link>
      ) : (
        <Link href="/register" className="land-turn-link next">
          <span>
            <small>Готов?</small>
            Создать аккаунт
          </span>
          <ArrowRight size={16} aria-hidden />
        </Link>
      )}
    </nav>
  );
}
