"use client";

import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
};

export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const n = w < 700 ? 48 : 90;
    const dots: Dot[] = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 1.2 + 0.2,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.22,
      vz: (Math.random() - 0.5) * 0.004,
    }));

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx * d.z;
        d.y += d.vy * d.z;
        d.z += d.vz;
        if (d.z < 0.2 || d.z > 1.5) d.vz *= -1;
        if (d.x < -20) d.x = w + 20;
        if (d.x > w + 20) d.x = -20;
        if (d.y < -20) d.y = h + 20;
        if (d.y > h + 20) d.y = -20;
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i];
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(196, 176, 255, ${((130 - dist) / 130) * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const d of dots) {
        const r = 1.1 + d.z * 1.6;
        ctx.fillStyle = d.z > 0.9 ? "rgba(212,180,131,0.85)" : "rgba(170,186,255,0.75)";
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[1]" aria-hidden />;
}

const CHIPS = [
  { t: "x = (−b ± √D) / 2a", x: "8%", y: "22%", d: "0s" },
  { t: "F = ma", x: "78%", y: "18%", d: "1.2s" },
  { t: "I = U / R", x: "84%", y: "58%", d: "0.4s" },
  { t: "a² + b² = c²", x: "12%", y: "68%", d: "1.8s" },
  { t: "6CO₂ + 6H₂O → C₆H₁₂O₆", x: "58%", y: "78%", d: "0.8s" },
  { t: "E = mc²", x: "42%", y: "14%", d: "2.1s" },
  { t: "sin²θ + cos²θ = 1", x: "70%", y: "38%", d: "1.5s" },
];

export function FlyingChips() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] hidden md:block overflow-hidden">
      {CHIPS.map((c) => (
        <div
          key={c.t}
          className="fly-chip absolute rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] tracking-wide text-white/55 backdrop-blur-md"
          style={{ left: c.x, top: c.y, animationDelay: c.d }}
        >
          {c.t}
        </div>
      ))}
    </div>
  );
}

export function StudioIdent() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sessionStorage.getItem("ssai-ident")) {
      ref.current?.remove();
      return;
    }
    sessionStorage.setItem("ssai-ident", "1");
    const t = setTimeout(() => ref.current?.classList.add("ident-out"), 1600);
    const t2 = setTimeout(() => ref.current?.remove(), 2300);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);
  return (
    <div ref={ref} className="ident-screen">
      <div className="ident-mark">S</div>
      <p className="ident-word">SMART SCHOOL AI</p>
      <p className="ident-sub">Intelligence · Craft · School</p>
    </div>
  );
}
