import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Условия — Micro AI School",
  description: "Как пользоваться школой и чего ждать от репетитора.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="page-sheet page-in max-w-2xl space-y-3 text-[#121826]">
      <h1 className="text-3xl font-semibold">Условия</h1>
      <p>Школа помогает понять тему. Репетитор может ошибаться — проверяй шаги, особенно на экзамене.</p>
      <p>Демо-вход показывает чужой прогресс и не является твоим аккаунтом.</p>
      <p>Не загружай чужие документы без разрешения и фото людей без согласия.</p>
      <Link href="/" className="text-[#163068] font-medium">На главную</Link>
    </article>
  );
}
