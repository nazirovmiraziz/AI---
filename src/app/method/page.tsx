"use client";

import Link from "next/link";
import { SiteFrame } from "@/components/SiteFrame";
import { Button } from "@/components/Button";

const STEPS = [
  "Находит пробел",
  "Объясняет с нуля",
  "Даёт пример",
  "Решает вместе",
  "Даёт твою задачу",
  "Проверяет",
  "Разбирает ошибку",
  "Оценивает понимание",
];

export default function MethodPage() {
  return (
    <SiteFrame>
      <div className="h-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 items-center">
        <div className="method-board rounded-[1.8rem] p-6 md:p-8 h-[min(70dvh,560px)] overflow-auto fly-in">
          <p className="text-[11px] uppercase tracking-[0.36em] text-gold-400">Страница 04 · Метод</p>
          <h1 className="font-serif italic text-4xl mt-2">Восемь шагов репетитора</h1>
          <div className="title-underline mt-3" />
          <ol className="method-list mt-6">
            <span className="method-runner" />
            {STEPS.map((s, i) => (
              <li key={s} className="method-step" style={{ animationDelay: `${i * 2}s` }}>
                <span className="method-num">0{i + 1}</span>
                <span className="font-serif italic text-lg md:text-xl">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="method-quote rounded-[1.8rem] p-8 flex flex-col justify-between min-h-[320px] fly-in" style={{ animationDelay: "180ms" }}>
          <div className="method-rings" aria-hidden>
            <span />
            <span />
          </div>
          <div className="relative">
            <p className="text-gold-400/80 text-sm tracking-wide">Если просят «реши за меня»:</p>
            <p className="quote-shine font-serif italic text-3xl md:text-4xl mt-4 leading-snug">
              «Давай решим вместе. Я покажу первый шаг, а следующий попробуешь ты.»
            </p>
          </div>
          <div className="relative mt-8 flex flex-wrap gap-3">
            <Link href="/register">
              <Button variant="glow" className="cta-pulse">
                Начать обучение
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="light">Войти</Button>
            </Link>
          </div>
        </div>
      </div>
    </SiteFrame>
  );
}
