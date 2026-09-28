import type { Metadata } from "next";
import { HowChapter } from "@/components/LandingChapters";

export const metadata: Metadata = {
  title: "Как работает — Micro AI School",
  description: "От вопроса до ошибки: репетитор объясняет, ты решаешь, AI проверяет.",
  alternates: { canonical: "/how" },
};

export default function HowPage() {
  return <HowChapter />;
}
