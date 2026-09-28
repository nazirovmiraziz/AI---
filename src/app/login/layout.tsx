import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход — Micro AI School",
  description: "Войди в свой аккаунт Micro AI School. Если аккаунта нет — создай его сам.",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
