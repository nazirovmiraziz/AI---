"use client";

import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { SiteFrame } from "@/components/SiteFrame";
import { OrbitHero, CountUp } from "@/components/OrbitHero";
import { useApp } from "@/lib/store";

export default function LandingPage() {
  const { displayName } = useApp();
  return (
    <SiteFrame>
      <div className="h-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 items-center">
        <div className="relative">
          <span className="home-spark s1" />
          <span className="home-spark s2" />
          <span className="home-spark s3" />
          <p className="fly-in text-[11px] uppercase tracking-[0.36em] text-gold-400 flex items-center gap-2">
            <Sparkles size={12} className="dialog-icon" /> Страница 01 · Главная
          </p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-[4.2rem] leading-[1.06] tracking-[-0.04em] fly-in">
            {displayName ? `${displayName},` : "Школа,"}
            <span className="home-shine block font-serif italic font-normal">
              {displayName ? "школа уже знает тебя." : "которая светится."}
            </span>
          </h1>
          <div className="title-underline mt-4" />
          <p className="fly-in mt-5 text-white/75 max-w-lg leading-relaxed" style={{ animationDelay: "200ms" }}>
            Четыре главы. Стрелка справа — дальше. Внизу — путь по волне.
          </p>
          <div className="fly-in mt-7 flex flex-wrap gap-3" style={{ animationDelay: "320ms" }}>
            <Link href="/product">
              <Button variant="glow" className="cta-pulse px-6 py-3">
                Следующая страница <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="light" className="px-6 py-3">
                <Play size={14} /> Войти
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            {[
              [13, "предметов"],
              [12, "шаблонов"],
              [6, "языков"],
            ].map(([n, l], i) => (
              <div key={String(l)} className="home-stat" style={{ animationDelay: `${420 + i * 120}ms` }}>
                <div className="font-display text-2xl home-stat-num">
                  <CountUp to={Number(n)} />
                </div>
                <div className="text-[11px] text-white/50">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <OrbitHero compact />
      </div>
    </SiteFrame>
  );
}
