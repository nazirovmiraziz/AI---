"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const skip =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 767px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (skip) {
      el.style.display = "none";
      return;
    }
    const move = (e: PointerEvent) => {
      el.style.transform = `translate(${e.clientX - 40}px, ${e.clientY - 40}px)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return <span ref={ref} className="cursor-glow" aria-hidden />;
}
