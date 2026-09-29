"use client";

import { useEffect, useRef } from "react";

export function AmbientField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile =
      window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(pointer: coarse)").matches;

    const onMove = (e: PointerEvent) => {
      if (!root || mobile) return;
      root.style.setProperty("--mx", `${(e.clientX / window.innerWidth) * 100}%`);
      root.style.setProperty("--my", `${(e.clientY / window.innerHeight) * 100}%`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let stop = false;
    let onMouse: ((e: PointerEvent) => void) | null = null;
    let onResize: (() => void) | null = null;

    if (canvas && !reduce && !mobile) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        onResize = () => {
          canvas.width = Math.floor(window.innerWidth * dpr);
          canvas.height = Math.floor(window.innerHeight * dpr);
        };
        onResize();
        const mouse = { x: 0.52, y: 0.28 };
        onMouse = (e: PointerEvent) => {
          mouse.x = e.clientX / window.innerWidth;
          mouse.y = e.clientY / window.innerHeight;
        };
        window.addEventListener("pointermove", onMouse, { passive: true });
        window.addEventListener("resize", onResize);
        const pts = Array.from({ length: 18 }, () => ({
          x: Math.random(),
          y: Math.random(),
          vx: (Math.random() - 0.5) * 0.00022,
          vy: (Math.random() - 0.5) * 0.00022,
          r: 0.55 + Math.random() * 1.05,
        }));
        let last = 0;
        const tick = (now: number) => {
          if (stop) return;
          if (now - last < 33) {
            raf = requestAnimationFrame(tick);
            return;
          }
          last = now;
          if (!document.hidden && !document.querySelector(".hero-v2-bg")) {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            for (const p of pts) {
              p.vx += (mouse.x - p.x) * 0.000007;
              p.vy += (mouse.y - p.y) * 0.000007;
              p.x += p.vx;
              p.y += p.vy;
              if (p.x < 0 || p.x > 1) p.vx *= -1;
              if (p.y < 0 || p.y > 1) p.vy *= -1;
              p.x = Math.min(1, Math.max(0, p.x));
              p.y = Math.min(1, Math.max(0, p.y));
              ctx.beginPath();
              ctx.fillStyle = "rgba(58, 160, 232, 0.22)";
              ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
    }

    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      if (onMouse) window.removeEventListener("pointermove", onMouse);
      if (onResize) window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={rootRef} className="ambient-field" aria-hidden>
      <div className="ambient-blobs" />
      <div className="ambient-grid" />
      <div className="ambient-math" />
      <div className="ambient-mouse" />
      <canvas ref={canvasRef} className="ambient-particles" />
    </div>
  );
}
