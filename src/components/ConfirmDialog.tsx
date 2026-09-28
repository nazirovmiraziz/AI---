"use client";

import { Button } from "./Button";

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  text: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <button className="absolute inset-0 bg-black/45" aria-label="Закрыть" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-5 shadow-lift">
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="text-sm text-[var(--muted)] mt-2">{text}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
