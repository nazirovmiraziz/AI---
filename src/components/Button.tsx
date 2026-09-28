"use client";

import { clsx } from "clsx";
import Link from "next/link";
import type { ButtonHTMLAttributes, MouseEventHandler } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "glow" | "light" | "ai";
  magnetic?: boolean;
  href?: string;
};

export function Button({
  variant = "primary",
  magnetic = false,
  className,
  children,
  href,
  type = "button",
  onClick,
  ...props
}: Props) {
  const cls = clsx(
    "shine inline-flex items-center justify-center gap-2 rounded-full px-4 sm:px-5 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none min-h-11 max-w-full active:scale-[0.97]",
    (variant === "primary" || variant === "glow") && "btn-primary",
    (variant === "secondary" || variant === "light") && "btn-secondary",
    variant === "ghost" && "btn-ghost",
    variant === "ai" && "btn-ai",
    variant === "danger" && "bg-[#b42318] text-white hover:bg-[#c9372c]",
    magnetic && "mag-cta",
    className
  );
  const inner = <span className="relative z-[1] inline-flex items-center justify-center gap-2">{children}</span>;
  if (href) {
    return (
      <Link
        href={href}
        className={cls}
        onClick={onClick as unknown as MouseEventHandler<HTMLAnchorElement>}
        onMouseEnter={props.onMouseEnter as unknown as MouseEventHandler<HTMLAnchorElement>}
        onMouseLeave={props.onMouseLeave as unknown as MouseEventHandler<HTMLAnchorElement>}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} {...props}>
      {inner}
    </button>
  );
}
