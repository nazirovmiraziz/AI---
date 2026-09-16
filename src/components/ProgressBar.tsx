export function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1.5 rounded-full bg-black/8 dark:bg-white/10 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-gold-400 transition-all duration-700"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
