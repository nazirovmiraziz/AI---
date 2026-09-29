import type { Metadata } from "next";
import { InstallLanding } from "@/components/InstallLanding";

export const metadata: Metadata = {
  title: "На телефон — Micro AI School",
  description: "Добавь школу на экран Домой. Тот же сайт, без магазина приложений.",
  alternates: { canonical: "/install" },
};

export default function InstallPage() {
  return <InstallLanding />;
}
