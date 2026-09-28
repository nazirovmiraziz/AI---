import { clsx } from "clsx";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <div className="mt-1.5">{children}</div>
      {error ? <p className="text-sm text-red-600 mt-1">{error}</p> : hint ? <p className="text-xs text-[var(--muted)] mt-1">{hint}</p> : null}
    </label>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full min-h-11 rounded-xl border bg-white dark:bg-[var(--bg-elev)] px-3 py-2 outline-none transition-shadow",
        props["aria-invalid"] ? "border-red-400" : "border-[var(--line)] focus:border-brand-500 focus:shadow-[0_0_0_4px_var(--glow)]",
        className
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-xl border border-[var(--line)] bg-white dark:bg-[var(--bg-elev)] px-3 py-2 outline-none min-h-24 focus:border-brand-500 focus:shadow-[0_0_0_4px_var(--glow)]",
        className
      )}
      {...props}
    />
  );
}
