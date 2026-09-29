"use client";

import { useEffect, useRef } from "react";

export type FlowSubject = "math" | "english" | "physics" | "chemistry" | "biology" | "cs" | "mix";

const FIELDS: Record<FlowSubject, { nodes: { x: number; y: number; t: string }[]; edges: [number, number][] }> = {
  mix: {
    nodes: [
      { x: 18, y: 46, t: "π" },
      { x: 34, y: 22, t: "Aa" },
      { x: 58, y: 16, t: "你好" },
      { x: 78, y: 38, t: "Σ" },
      { x: 70, y: 68, t: "F=ma" },
      { x: 42, y: 78, t: "DNA" },
      { x: 20, y: 72, t: "{ }" },
      { x: 48, y: 46, t: "AI" },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  },
  math: {
    nodes: [
      { x: 20, y: 58, t: "2x" },
      { x: 38, y: 24, t: "+" },
      { x: 62, y: 20, t: "5" },
      { x: 80, y: 48, t: "=" },
      { x: 62, y: 76, t: "17" },
      { x: 28, y: 78, t: "x" },
      { x: 48, y: 50, t: "6" },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [2, 6], [4, 6]],
  },
  english: {
    nodes: [
      { x: 18, y: 42, t: "Hello" },
      { x: 42, y: 18, t: "I" },
      { x: 70, y: 28, t: "go" },
      { x: 80, y: 58, t: "to" },
      { x: 58, y: 80, t: "school" },
      { x: 26, y: 74, t: "every" },
      { x: 48, y: 48, t: "day" },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 6], [3, 6], [5, 6]],
  },
  physics: {
    nodes: [
      { x: 22, y: 40, t: "F" },
      { x: 48, y: 18, t: "=" },
      { x: 74, y: 36, t: "m" },
      { x: 70, y: 70, t: "a" },
      { x: 36, y: 76, t: "N" },
      { x: 48, y: 48, t: "6" },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 5], [2, 5], [3, 5]],
  },
  chemistry: {
    nodes: [
      { x: 24, y: 36, t: "H₂" },
      { x: 52, y: 18, t: "+" },
      { x: 76, y: 40, t: "O₂" },
      { x: 62, y: 74, t: "→" },
      { x: 30, y: 76, t: "H₂O" },
      { x: 48, y: 48, t: "2" },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 5], [3, 5]],
  },
  biology: {
    nodes: [
      { x: 22, y: 44, t: "CO₂" },
      { x: 50, y: 18, t: "light" },
      { x: 78, y: 42, t: "H₂O" },
      { x: 64, y: 76, t: "O₂" },
      { x: 30, y: 78, t: "C₆" },
      { x: 48, y: 50, t: "DNA" },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 5], [3, 5], [0, 5]],
  },
  cs: {
    nodes: [
      { x: 20, y: 38, t: "if" },
      { x: 48, y: 16, t: "fn" },
      { x: 78, y: 36, t: "[]" },
      { x: 70, y: 72, t: "{ }" },
      { x: 28, y: 76, t: "=>" },
      { x: 48, y: 48, t: "AI" },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 5], [2, 5], [4, 5]],
  },
};

const CHIP_COLORS = ["#3aa0e8", "#22c39a", "#8b7bff", "#f5a524", "#ef6f9a", "#1fb6c9", "#5b8def"];

export function KnowledgeFlow({
  subject = "mix",
  mood = "idle",
  size = "lg",
  look: _look = true,
}: {
  subject?: FlowSubject;
  mood?: "idle" | "listen" | "think" | "speak" | "happy" | "error";
  size?: "sm" | "md" | "lg";
  look?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const field = FIELDS[subject] ?? FIELDS.mix;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onMove = (e: PointerEvent) => {
      if (mobile || reduce) return;
      const r = root.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 14;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 10;
      root.style.setProperty("--kx", `${x}px`);
      root.style.setProperty("--ky", `${y}px`);
    };
    const onLeave = () => {
      root.style.setProperty("--kx", "0px");
      root.style.setProperty("--ky", "0px");
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    const canvas = canvasRef.current;
    let raf = 0;
    let stop = false;
    if (canvas && !reduce && !mobile && size === "lg") {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const fit = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
          canvas.width = Math.floor(canvas.clientWidth * dpr);
          canvas.height = Math.floor(canvas.clientHeight * dpr);
        };
        fit();
        window.addEventListener("resize", fit);
        let t = 0;
        let last = 0;
        let visible = true;
        const io = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible && !raf && !stop) raf = requestAnimationFrame(tick);
        });
        io.observe(root);
        const tick = (now: number) => {
          if (stop) return;
          if (!visible || document.hidden) {
            raf = 0;
            return;
          }
          if (now - last < 33) {
            raf = requestAnimationFrame(tick);
            return;
          }
          last = now;
          t += 0.016;
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);
          const r = Math.max(2, w * 0.0045);
          field.edges.forEach(([a, b], i) => {
            const na = field.nodes[a];
            const nb = field.nodes[b];
            const x1 = (na.x / 100) * w;
            const y1 = (na.y / 100) * h;
            const x2 = (nb.x / 100) * w;
            const y2 = (nb.y / 100) * h;
            const p = (t * 0.35 + i * 0.37) % 1;
            const px = x1 + (x2 - x1) * p;
            const py = y1 + (y2 - y1) * p;
            const fade = Math.sin(p * Math.PI);
            const tx = px - (x2 - x1) * 0.08;
            const ty = py - (y2 - y1) * 0.08;
            const g = ctx.createLinearGradient(tx, ty, px, py);
            g.addColorStop(0, "rgba(110, 196, 245, 0)");
            g.addColorStop(1, `rgba(58, 160, 232, ${0.55 * fade})`);
            ctx.strokeStyle = g;
            ctx.lineWidth = r * 1.1;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(px, py);
            ctx.stroke();
            ctx.beginPath();
            ctx.fillStyle = `rgba(58, 160, 232, ${0.22 * fade})`;
            ctx.arc(px, py, r * 2.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * fade})`;
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
          });
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        const onVis = () => {
          if (!document.hidden && visible && !raf && !stop) raf = requestAnimationFrame(tick);
        };
        document.addEventListener("visibilitychange", onVis);
        return () => {
          stop = true;
          cancelAnimationFrame(raf);
          io.disconnect();
          document.removeEventListener("visibilitychange", onVis);
          window.removeEventListener("resize", fit);
          root.removeEventListener("pointermove", onMove);
          root.removeEventListener("pointerleave", onLeave);
        };
      }
    }

    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [field, size]);

  return (
    <div ref={rootRef} className={`kf-stage ${size} ${mood}`} aria-hidden>
      <div className="kf-glow" />
      <canvas ref={canvasRef} className="kf-canvas" />
      <svg className="kf-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="kf-line" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0" stopColor="#7fd0ff" />
            <stop offset="1" stopColor="#2b8fe0" />
          </linearGradient>
        </defs>
        {field.edges.map(([a, b], i) => {
          const hub = a === field.nodes.length - 1 || b === field.nodes.length - 1;
          const d = `M${field.nodes[a].x} ${field.nodes[a].y} L${field.nodes[b].x} ${field.nodes[b].y}`;
          return (
            <g key={`${a}-${b}`}>
              <path d={d} className={`kf-edge ${hub ? "hub" : ""}`} vectorEffect="non-scaling-stroke" />
              <path
                d={d}
                className="kf-flow"
                vectorEffect="non-scaling-stroke"
                style={{ animationDelay: `${-i * 0.45}s` }}
              />
            </g>
          );
        })}
      </svg>
      <div className="kf-chips">
        {field.nodes.map((n, i) => {
          const core = n.t === "AI" || i === field.nodes.length - 1;
          return (
            <span
              key={`${n.t}-${n.x}`}
              className={core ? "core" : ""}
              style={{ left: `${n.x}%`, top: `${n.y}%`, animationDelay: `${-i * 0.9}s` }}
            >
              {core ? null : <i style={{ background: CHIP_COLORS[i % CHIP_COLORS.length] }} />}
              {n.t}
            </span>
          );
        })}
      </div>
    </div>
  );
}
