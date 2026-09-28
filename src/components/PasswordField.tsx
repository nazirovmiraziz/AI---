"use client";

import { useState } from "react";

function strength(pw: string) {
  let n = 0;
  if (pw.length >= 6) n += 1;
  if (pw.length >= 10) n += 1;
  if (/[A-ZА-Я]/.test(pw) && /[a-zа-я]/.test(pw)) n += 1;
  if (/\d/.test(pw)) n += 1;
  return Math.min(4, n);
}

const LABELS = ["Слабый", "Слабый", "Нормальный", "Хороший", "Надёжный"];

export function PasswordField({
  value,
  onChange,
  autoComplete = "current-password",
  label = "Пароль",
  showStrength = false,
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  label?: string;
  showStrength?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const s = strength(value);

  return (
    <label className="block text-sm">
      {label}
      <span className="mt-2 flex gap-2">
        <input
          required
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          className="auth-field flex-1"
          placeholder="Не короче 6 символов"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={(e) => setCaps(e.getModifierState?.("CapsLock") ?? false)}
        />
        <button
          type="button"
          className="chip-btn shrink-0 min-h-11"
          onClick={() => setShow((v) => !v)}
          aria-pressed={show}
        >
          {show ? "Скрыть" : "Показать"}
        </button>
      </span>
      {caps && <span className="mt-1 block text-xs text-amber-800">Включён Caps Lock.</span>}
      {showStrength && value && (
        <span className="mt-2 block">
          <span className="flex gap-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <i key={i} className={`h-1 flex-1 rounded-full ${i < s ? "bg-[#2b90d9]" : "bg-[var(--line)]"}`} />
            ))}
          </span>
          <span className="mt-1 block text-xs text-[var(--muted)]">{LABELS[s]} · минимум 6 символов</span>
        </span>
      )}
    </label>
  );
}
