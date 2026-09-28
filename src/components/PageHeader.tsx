export function PageHeader({
  kicker,
  title,
  text,
}: {
  kicker?: string;
  title: string;
  text?: string;
}) {
  return (
    <header className="mb-6">
      {kicker && <p className="text-xs font-semibold text-brand-600">{kicker}</p>}
      <h1 className="font-semibold mt-1">{title}</h1>
      {text && <p className="text-[var(--muted)] mt-2 max-w-2xl">{text}</p>}
    </header>
  );
}
