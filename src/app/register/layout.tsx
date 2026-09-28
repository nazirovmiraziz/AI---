import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация — Micro AI School",
  description: "Создай свой аккаунт Micro AI School и учись под своим именем.",
  alternates: { canonical: "/register" },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
