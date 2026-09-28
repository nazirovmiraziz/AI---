import { Button } from "@/components/Button";

export function Hearts({ n }: { n: number }) {
  return (
    <span className="tabular-nums tracking-[0.2em] text-rose-500" aria-label={`${n} попыток`}>
      {"❤".repeat(Math.max(0, n))}
      {"♡".repeat(Math.max(0, 5 - n))}
    </span>
  );
}

export function SkillMeter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
        <div className="h-full rounded-full bg-[#2f6bff] transition-all" style={{ width: `${Math.max(4, value)}%` }} />
      </div>
    </div>
  );
}

export function LockedCard({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="panel-card p-6 text-center">
      <p className="text-3xl">🔒</p>
      <h1 className="mt-3 text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-[var(--muted)]">{text}</p>
      <Button href={href} className="mt-5">{cta}</Button>
    </div>
  );
}

export function EmptyLearn({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="panel-card p-8 text-center">
      <p className="text-3xl">✦</p>
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{text}</p>
      <Button href={href} className="mt-5">{cta}</Button>
    </div>
  );
}
