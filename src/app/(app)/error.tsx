"use client";

import { Button } from "@/components/Button";
import { TutorBot } from "@/components/TutorBot";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] grid place-items-center p-8 text-center">
      <div className="max-w-md">
        <TutorBot size="md" look={false} mood="error" />
        <h1 className="mt-4 text-2xl font-semibold">Раздел временно недоступен</h1>
        <p className="text-sm text-[var(--muted)] mt-2">{error.message || "Открой страницу ещё раз."}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Button onClick={reset}>Повторить</Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/tutor")}>
            К репетитору
          </Button>
        </div>
      </div>
    </div>
  );
}
