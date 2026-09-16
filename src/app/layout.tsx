import type { Metadata } from "next";
import { Golos_Text, Unbounded, Cormorant_Garamond } from "next/font/google";
import { Providers } from "./providers";
import { Toasts } from "@/components/Toasts";
import "./globals.css";
import "katex/dist/katex.min.css";

const sans = Golos_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const display = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
});

const serif = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SMART SCHOOL AI — персональный AI-учитель",
  description:
    "Ученик задаёт вопрос — AI понимает уровень, объясняет, проверяет понимание и строит персональный путь обучения.",
  icons: { icon: "/logo-mark.png", apple: "/logo-mark.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} ${serif.variable} font-sans antialiased min-h-screen bg-[var(--bg)] text-[var(--text)]`}>
        <Providers>
          {children}
          <Toasts />
        </Providers>
      </body>
    </html>
  );
}
