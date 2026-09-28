import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Кабинет — Micro AI School",
  description: "Разделы школы: сайт и кабинет. Сначала свой вход, потом уроки.",
  alternates: { canonical: "/school" },
};

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
