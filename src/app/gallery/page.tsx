"use client";

import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Camera,
  GraduationCap,
  Heart,
  Languages,
  Lightbulb,
  Mic,
  PenLine,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { SiteFrame } from "@/components/SiteFrame";
import { TEMPLATES } from "@/lib/templates";
import { Button } from "@/components/Button";

const ICONS: Record<string, typeof Sparkles> = {
  zero: Sparkles,
  exam: GraduationCap,
  child: Heart,
  teacher: BookOpen,
  plan30: Calendar,
  photo: Camera,
  hints: Lightbulb,
  lang: Languages,
  essay: PenLine,
  olymp: Trophy,
  voice: Mic,
  week: Zap,
};

export default function GalleryPage() {
  return (
    <SiteFrame>
      <div className="h-full max-w-7xl mx-auto flex flex-col">
        <div className="shrink-0 pt-1 pb-4 flex items-end justify-between gap-4">
          <div>
            <p className="fly-in text-[11px] uppercase tracking-[0.36em] text-gold-400">Страница 03 · Шаблоны</p>
            <h1 className="font-serif italic text-4xl md:text-5xl mt-1 fly-in">12 режимов обучения</h1>
            <div className="title-underline mt-3" />
          </div>
          <Link href="/method" className="hidden sm:block fly-in" style={{ animationDelay: "180ms" }}>
            <Button variant="light">К методу</Button>
          </Link>
        </div>
        <div className="flex-1 overflow-auto pb-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TEMPLATES.map((tpl, i) => {
            const Icon = ICONS[tpl.id] ?? Sparkles;
            return (
              <Link
                key={tpl.id}
                href="/register"
                className="tpl-card"
                style={{ animationDelay: `${80 + i * 70}ms` }}
                data-kind={tpl.kind}
              >
                <span className="tpl-glow" />
                <span className="tpl-shine" />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="tpl-icon">
                    <Icon size={16} />
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-white/40 font-display">{tpl.minutes} мин</span>
                </div>
                <div className="relative mt-4 text-[11px] uppercase tracking-[0.18em] text-gold-400/80">{tpl.kind}</div>
                <h2 className="relative font-serif italic text-xl mt-1">{tpl.title}</h2>
                <p className="relative text-sm text-white/55 mt-2">{tpl.points.join(" · ")}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </SiteFrame>
  );
}
