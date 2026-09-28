import type { Metadata } from "next";
import { HomeChapter } from "@/components/LandingChapters";

export const metadata: Metadata = {
  title: "Micro AI School — учись с AI, который понимает тебя",
  description: "Персональный AI-репетитор объясняет темы с нуля, проверяет понимание и собирает план под твой уровень.",
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return <HomeChapter />;
}
