"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SiteFrame } from "@/components/SiteFrame";
import { Button } from "@/components/Button";

const SAMPLE = `Представь лист как маленькую кухню. Свет, вода и углекислый газ входят — растение готовит сахар.

6CO₂ + 6H₂O → глюкоза + O₂

Где в клетке это происходит?`;

export default function ProductPage() {
  return (
    <SiteFrame>
      <div className="h-full max-w-5xl mx-auto flex flex-col justify-center">
        <p className="fly-in text-[11px] uppercase tracking-[0.36em] text-gold-400">Страница 02 · Продукт</p>
        <h1 className="font-serif italic text-4xl md:text-5xl mt-2 fly-in">Живой AI-репетитор</h1>
        <div className="dialog-window mt-6 panel rounded-[1.8rem] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 text-xs text-white/50">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <Sparkles size={12} className="dialog-icon ml-2 text-gold-400" /> Диалог
          </div>
          <div className="p-5 md:p-7 space-y-4 min-h-[240px] bg-[#0b0d14]">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-3xl rounded-tr-md bg-white text-ink-950 px-4 py-3 text-sm">
                Объясни мне фотосинтез как школьнику.
              </div>
            </div>
            <div className="max-w-[92%] rounded-3xl rounded-tl-md border border-white/10 bg-[#151826] px-4 py-4 text-sm leading-relaxed whitespace-pre-wrap text-white/90">
              <p className="text-[11px] uppercase tracking-wider text-gold-400 mb-2">Стиль · как школьнику</p>
              {SAMPLE}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Link href="/gallery">
            <Button variant="glow">К шаблонам</Button>
          </Link>
        </div>
      </div>
    </SiteFrame>
  );
}
