"use client";

import { Button } from "./Button";
import { TutorBot } from "./TutorBot";

export function EmptyState({
  title,
  text,
  action,
  href,
}: {
  title: string;
  text: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="empty-hero rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] px-6 py-10 text-center">
      <TutorBot size="sm" look={false} mood="idle" />
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-[var(--muted)] mt-2 max-w-md mx-auto">{text}</p>
      {action && href && (
        <Button href={href} className="mt-5">{action}</Button>
      )}
    </div>
  );
}
