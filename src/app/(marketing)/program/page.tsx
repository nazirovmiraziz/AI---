import type { Metadata } from "next";
import { ProgramChapter } from "@/components/ProgramChapter";

export const metadata: Metadata = {
  title: "Предметы и языки — Micro AI School",
  description: "Математика, физика, химия, биология, информатика и языки A1–C1 с AI-репетитором.",
  alternates: { canonical: "/program" },
};

export default function ProgramPage() {
  return <ProgramChapter />;
}
