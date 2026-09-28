import type { Metadata } from "next";
import { AudienceChapter } from "@/components/LandingChapters";

export const metadata: Metadata = {
  title: "Для кого — Micro AI School",
  description: "Один продукт для ученика, родителя и учителя.",
  alternates: { canonical: "/audience" },
};

export default function AudiencePage() {
  return <AudienceChapter />;
}
