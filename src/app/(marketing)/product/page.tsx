import type { Metadata } from "next";
import { ProductChapter } from "@/components/LandingChapters";

export const metadata: Metadata = {
  title: "Возможности — Micro AI School",
  description: "Чат, тесты, экзамен, фото и прогресс — живой репетитор внутри школы.",
  alternates: { canonical: "/product" },
};

export default function ProductPage() {
  return <ProductChapter />;
}
