import { clsx } from "clsx";
import type { HTMLAttributes } from "react";
import Link from "next/link";

export function Card({
  href,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { href?: string }) {
  const cls = clsx(
    "rounded-2xl border border-[var(--line)] bg-white dark:bg-[var(--bg-elev)] p-5 transition-colors duration-200",
    href && "block hover:border-brand-400 hover:-translate-y-0.5",
    className
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <div className={cls} {...props}>
      {children}
    </div>
  );
}
