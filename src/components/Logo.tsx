import Link from "next/link";

export function Logo({
  size = "md",
  href = "/",
  inverted = false,
}: {
  size?: "sm" | "md" | "lg";
  href?: string;
  inverted?: boolean;
}) {
  const type = size === "lg" ? "text-xl" : size === "sm" ? "text-[13px]" : "text-[15px]";
  const mark = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <Link href={href} className="flex items-center gap-3 group">
      <span className={`${mark} relative shrink-0 rounded-[22%] overflow-hidden shadow-[0_0_24px_rgba(212,180,131,0.28)] ring-1 ring-white/10`}>
        <img src="/logo-mark.png" alt="" className="h-full w-full object-cover scale-[1.02] group-hover:scale-110 transition-transform duration-500" />
      </span>
      <span className={`${type} font-display tracking-[-0.045em] leading-none ${inverted ? "text-white" : "text-[var(--text)]"}`}>
        SMART SCHOOL
        <span className={`block text-[0.72em] tracking-[0.18em] ${inverted ? "text-gold-400" : "text-brand-600 dark:text-gold-500"}`}>
          AI
        </span>
      </span>
    </Link>
  );
}
