"use client";

import Link from "next/link";
import { SiteFrame } from "@/components/SiteFrame";
import { Button } from "@/components/Button";
import { TutorBot } from "@/components/TutorBot";
import { SCHOOL_SECTIONS } from "@/lib/school-pages";

export default function NotFound() {
  return (
    <SiteFrame>
      <div className="page-in mx-auto max-w-4xl px-4 py-16 text-center sm:text-start">
        <TutorBot size="md" look={false} mood="idle" />
        <p className="mt-4 text-[11px] font-semibold text-[#2b90d9]">404</p>
        <h1 className="mt-3 font-semibold">Такой страницы нет.</h1>
        <p className="mt-3 text-[var(--muted)]">Вернись на главную или открой рабочий раздел.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/">На главную</Button>
          <Button href="/login" variant="secondary">Кабинет</Button>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 gap-2">
          {SCHOOL_SECTIONS.slice(0, 10).map((p) => (
            <Link key={p.href} href={p.href} className="lift-card rounded-xl px-4 py-3 text-sm">
              <span className="font-medium">{p.title}</span>
              <span className="block text-[var(--muted)]">{p.href}</span>
            </Link>
          ))}
        </div>
      </div>
    </SiteFrame>
  );
}
