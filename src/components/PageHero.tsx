"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { ShaderWave } from "@/components/ShaderWave";

type Word = string | { t: string; grad?: boolean };

export function PageHero({
  chip,
  words,
  sub,
  lead,
  children,
  stage,
  after,
  className = "",
}: {
  chip: string;
  words: Word[];
  sub?: string;
  lead?: string;
  children?: ReactNode;
  stage?: ReactNode;
  after?: ReactNode;
  className?: string;
}) {
  const n = words.length;
  return (
    <section className={`hero-v2 page-hero ${stage ? "" : "solo"} ${className}`}>
      <ShaderWave className="hero-v2-bg" />
      <div className="hero-v2-copy">
        <p className="hero-chip rise" style={{ animationDelay: "0ms" }}>
          <span className="hero-chip-dot" />
          {chip}
        </p>
        <h1 className="hero-title">
          {words.map((w, i) => {
            const word = typeof w === "string" ? { t: w } : w;
            return (
              <span key={i}>
                <span className={`rise ${word.grad ? "grad-text" : ""}`} style={{ animationDelay: `${80 + i * 110}ms` }}>
                  {word.t}
                </span>{" "}
              </span>
            );
          })}
          {sub ? (
            <span className="rise hero-title-sub" style={{ animationDelay: `${80 + n * 110}ms` }}>
              {sub}
            </span>
          ) : null}
        </h1>
        {lead ? (
          <p className="hero-lead rise" style={{ animationDelay: `${200 + n * 110}ms` }}>
            {lead}
          </p>
        ) : null}
        {children ? (
          <div className="land-cta rise" style={{ animationDelay: `${320 + n * 110}ms` }}>
            {children}
          </div>
        ) : null}
        {after}
      </div>
      {stage ? (
        <div className="hero-v2-stage rise" style={{ animationDelay: "200ms" }}>
          {stage}
        </div>
      ) : null}
      <span className="hero-cue" aria-hidden>
        <ChevronDown size={18} />
      </span>
    </section>
  );
}
