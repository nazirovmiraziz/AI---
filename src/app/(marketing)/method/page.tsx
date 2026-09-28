import type { Metadata } from "next";
import { MethodChapter } from "@/components/LandingChapters";

export const metadata: Metadata = {
  title: "Метод — Micro AI School",
  description: "Восемь шагов репетитора: от пробела до проверки понимания. Не сброс ответа — путь.",
  alternates: { canonical: "/method" },
};

export default function MethodPage() {
  return <MethodChapter />;
}
