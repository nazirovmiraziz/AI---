"use client";

import { Button } from "@/components/Button";
import { TutorBot } from "@/components/TutorBot";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] grid place-items-center p-8 text-center">
      <div className="max-w-md">
        <TutorBot size="md" look={false} mood="error" />
        <h1 className="text-3xl font-semibold mt-4">Страницу не удалось открыть</h1>
        <p className="text-[var(--muted)] mt-2 text-sm">
          {error.message || "Попробуй ещё раз. Если не помогает — вернись на главную."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>Повторить</Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
}
