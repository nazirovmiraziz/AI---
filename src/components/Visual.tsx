"use client";

import { useEffect, useState } from "react";

export function CursorGlow() {
  const [p, setP] = useState({ x: 50, y: 20 });
  useEffect(() => {
    const on = (e: MouseEvent) => setP({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", on);
    return () => window.removeEventListener("mousemove", on);
  }, []);
  return (
    <div
      className="pointer-events-none fixed z-20 hidden md:block h-72 w-72 rounded-full opacity-40 mix-blend-screen blur-3xl transition-transform duration-200"
      style={{
        left: p.x - 144,
        top: p.y - 144,
        background: "radial-gradient(circle, rgba(142,160,255,.55), transparent 68%)",
      }}
    />
  );
}

export function AuroraScene({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="aurora" />
      <div className="orb h-40 w-40 bg-brand-400/20 top-[18%] left-[8%] delay-2" />
      <div className="orb h-24 w-24 bg-gold-400/20 top-[58%] right-[12%]" style={{ animationDelay: "1.4s" }} />
      <div className="noise absolute inset-0" />
    </div>
  );
}
