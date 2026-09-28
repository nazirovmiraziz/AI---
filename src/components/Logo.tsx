"use client";

import Link from "next/link";
import { useId } from "react";

export function BrandMark({ className, mono = false }: { className?: string; mono?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const ink = `mk-ink-${uid}`;
  const spark = `mk-sp-${uid}`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={ink} x1="8" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={mono ? "#2a3548" : "#6ec4f5"} />
          <stop offset="100%" stopColor={mono ? "#121826" : "#2b90d9"} />
        </linearGradient>
        <radialGradient id={spark} cx="50%" cy="38%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#6ec4f5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${ink})`} />
      <rect width="64" height="64" rx="16" fill={`url(#${spark})`} />
      <path
        className="logo-path"
        d="M16 46 L24 22 L32 38 L40 22 L48 46"
        fill="none"
        stroke="#e8eef8"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className="logo-node n1" cx="16" cy="46" r="3.1" fill="#d7f0ff" />
      <circle className="logo-node n2" cx="32" cy="20" r="3.4" fill="#ffffff" />
      <circle className="logo-node n3" cx="48" cy="46" r="3.1" fill="#d7f0ff" />
      <circle cx="32" cy="38" r="2.1" fill="#ffffff" />
    </svg>
  );
}

export function Logo({
  size = "md",
  href = "/",
  inverted = false,
  markOnly = false,
}: {
  size?: "sm" | "md" | "lg";
  href?: string;
  inverted?: boolean;
  markOnly?: boolean;
}) {
  const type = size === "lg" ? "text-[1.2rem]" : size === "sm" ? "text-[1.02rem]" : "text-[1.1rem]";
  const mark = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const icon = (
    <span className={`${mark} logo-mark relative shrink-0 overflow-hidden rounded-[28%]`}>
      <BrandMark className="h-full w-full" />
    </span>
  );
  if (markOnly) {
    return (
      <Link href={href} className="flex items-center justify-center shrink-0 group" aria-label="Micro AI School">
        {icon}
      </Link>
    );
  }
  return (
    <Link href={href} className="flex items-center gap-2.5 shrink-0 group" aria-label="Micro AI School">
      {icon}
      <span className={`logo-word shrink-0 leading-none ${inverted ? "text-white" : "text-[#121826]"}`}>
        <span className={`${type} font-sans font-semibold whitespace-nowrap`}>Micro AI</span>
        <span className={`mt-1 block font-sans text-[11px] font-semibold whitespace-nowrap ${inverted ? "text-white/70" : "text-[#2b90d9]"}`}>
          School
        </span>
      </span>
    </Link>
  );
}
