"use client";

import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "glow" | "light";
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium tracking-tight transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
        variant === "primary" &&
          "bg-brand-600 text-white shadow-glow hover:bg-brand-500 hover:-translate-y-0.5",
        variant === "secondary" &&
          "bg-[var(--bg-elev)] border border-[var(--line)] hover:border-brand-300 hover:-translate-y-0.5",
        variant === "ghost" && "hover:bg-black/5 dark:hover:bg-white/5",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        variant === "glow" &&
          "bg-white text-ink-950 shadow-glow hover:bg-brand-50 hover:-translate-y-0.5",
        variant === "light" &&
          "border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}
