"use client";

export function FlyingGlyphs() {
  return null;
}

export function SplitTitle({ text, className = "" }: { text: string; className?: string }) {
  return <h1 className={className}>{text}</h1>;
}
