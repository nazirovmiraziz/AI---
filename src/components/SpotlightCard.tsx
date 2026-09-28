"use client";

import { useRef, type ReactNode, type PointerEvent, type ElementType } from "react";

export function SpotlightCard({
  children,
  className = "",
  as = "div",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  onClick?: () => void;
}) {
  const Tag = as;
  const ref = useRef<HTMLDivElement>(null);

  function move(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
  }

  return (
    <Tag
      ref={ref}
      type={as === "button" ? "button" : undefined}
      onPointerMove={move}
      onClick={onClick}
      className={`spot-card ${className}`}
    >
      {children}
    </Tag>
  );
}
