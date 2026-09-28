"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import { SITE_PAGES } from "@/lib/site-pages";
import { useApp } from "@/lib/store";
import { DEMO_EMAIL } from "@/lib/demo-data";

export function PageChrome({
  id,
  children,
}: {
  id: (typeof SITE_PAGES)[number]["id"];
  children: React.ReactNode;
}) {
  const i = SITE_PAGES.findIndex((p) => p.id === id);
  const page = SITE_PAGES[i];
  const next = SITE_PAGES[i + 1];
  const prev = SITE_PAGES[i - 1];
  const { user } = useApp();
  const guest = !user || user.email.toLowerCase() === DEMO_EMAIL;
  const cabinet = guest ? "/login" : "/dashboard";

  return (
    <div className="page-sheet page-in">
      {page && (
        <p className="page-tag">
          Страница {page.num} · {page.label}
        </p>
      )}
      <div className="page-body">{children}</div>
      <div className="phone-actions">
        <Button href={cabinet} className="cta-pulse w-full phone-actions-main">
          {guest ? "Войти" : "Продолжить"} <ArrowRight size={16} aria-hidden />
        </Button>
        <Button href={next?.href || cabinet} variant="secondary" className="phone-next w-full phone-actions-next">
          Дальше <ArrowRight size={16} aria-hidden />
        </Button>
      </div>
      <div className="page-turn">
        {prev && (
          <Button href={prev.href} variant="secondary" className="h-10 min-h-10 sm:h-11 sm:min-h-11">Назад</Button>
        )}
        {next ? (
          <Button href={next.href} className="h-10 min-h-10 sm:h-11 sm:min-h-11">
            {next.label} <ArrowRight size={16} aria-hidden />
          </Button>
        ) : (
          <Button href={cabinet} className="h-10 min-h-10 sm:h-11 sm:min-h-11">
            Открыть кабинет <ArrowRight size={16} aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
