import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Конфиденциальность — Micro AI School",
  description: "Как школа хранит имя, прогресс и чаты.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="page-sheet page-in max-w-2xl space-y-3 text-[#121826]">
      <h1 className="text-3xl font-semibold">Конфиденциальность</h1>
      <p className="text-[var(--muted)]">Коротко и ясно. Без юридического тумана.</p>
      <p>Аккаунт, прогресс и чаты остаются в браузере на этом устройстве. Ключ AI не попадает на фронтенд.</p>
      <p>Фото домашки уходит на сервер только когда ты спрашиваешь репетитора, и не хранится в общей школьной базе.</p>
      <p>Пароль на этом устройстве хранится локально. Это учебный продукт: не используй пароль от почты или банка.</p>
      <Link href="/" className="text-[#163068] font-medium">На главную</Link>
    </article>
  );
}
