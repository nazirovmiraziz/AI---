"use client";

import { useEffect, useRef } from "react";

const W = 2000;
const H = 1000;
const TOP = 280;

type Layer = { base: number; a1: number; k1: number; a2: number; k2: number; ph: number; fill: string; op: number; dur: number };

const LAYERS: Layer[] = [
  { base: 700, a1: 55, k1: 1, a2: 22, k2: 3, ph: 0.4, fill: "#2e8ced", op: 0.2, dur: 46 },
  { base: 615, a1: 48, k1: 2, a2: 18, k2: 3, ph: 1.9, fill: "#4aa3f0", op: 0.17, dur: 38 },
  { base: 530, a1: 42, k1: 1, a2: 20, k2: 4, ph: 3.1, fill: "#72bdf7", op: 0.15, dur: 31 },
  { base: 445, a1: 36, k1: 2, a2: 14, k2: 5, ph: 4.4, fill: "#9fd2fb", op: 0.13, dur: 26 },
  { base: 360, a1: 30, k1: 1, a2: 12, k2: 3, ph: 5.2, fill: "#c7e6ff", op: 0.12, dur: 22 },
];

function wavePath(l: Layer, closed: boolean) {
  let d = "";
  for (let x = 0; x <= W; x += 20) {
    const t = (x / (W / 2)) * Math.PI * 2;
    const y = l.base - l.a1 * Math.sin(t * l.k1 + l.ph) - l.a2 * Math.sin(t * l.k2 - l.ph * 1.3);
    d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`;
  }
  return closed ? `${d}L${W} ${H}L0 ${H}Z` : d;
}

const PATHS = LAYERS.map((l) => ({ fill: wavePath(l, true), line: wavePath(l, false) }));

export function ShaderWave({ className = "" }: { className?: string }) {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow || window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className={`shader-wave ${className}`} aria-hidden>
      <div ref={glowRef} className="sw-glow" />
      {LAYERS.map((l, i) => (
        <div key={i} className="sw-layer" style={{ animationDuration: `${9 + i * 2}s`, animationDelay: `${-i * 1.7}s` }}>
          <svg
            viewBox={`0 ${TOP} ${W} ${H - TOP}`}
            preserveAspectRatio="none"
            className="sw-svg"
            style={{ animationDuration: `${l.dur}s`, animationDirection: i % 2 ? "reverse" : "normal" }}
          >
            <path d={PATHS[i].fill} fill={l.fill} fillOpacity={l.op} />
            <path d={PATHS[i].line} className="sw-line" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      ))}
    </div>
  );
}
