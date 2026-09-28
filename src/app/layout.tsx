import type { Metadata, Viewport } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Toasts } from "@/components/Toasts";
import { SkipLink } from "@/components/SkipLink";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: false,
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  adjustFontFallback: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "overlays-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#163068" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.microaischooll.pp.ua"),
  applicationName: "Micro AI School",
  title: "Micro AI School — персональный AI-репетитор",
  description:
    "Персональный AI-репетитор объясняет темы с нуля, проверяет понимание и собирает план под твой уровень.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Micro AI School — персональный AI-репетитор",
    description: "Объясняет, проверяет и помнит прогресс. Не вываливает ответ, пока ты не попробуешь.",
    locale: "ru_RU",
    type: "website",
    siteName: "Micro AI School",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Micro AI School — персональный AI-репетитор",
    description: "Объясняет, проверяет и помнит прогресс.",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Micro AI School",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/app-icon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=document.documentElement;var p=location.pathname||"/";var seg=p.split("/")[1]||"";var allow="how|gallery|method|product|school|audience|login|register|present|install|program";var publicPage=p==="/"||allow.split("|").indexOf(seg)>=0;r.classList.remove("dark");if(publicPage)r.classList.add("force-light");var inner=window.innerWidth||0;var visual=(window.visualViewport&&window.visualViewport.width)||inner;var framed=window.parent!==window;var w=Math.round(framed?inner||visual:Math.max(inner,visual));r.style.setProperty("--app-width",w+"px");r.classList.toggle("device-phone",w<768);r.classList.toggle("device-tablet",w>=768&&w<1180);r.classList.toggle("device-laptop",w>=768);r.classList.toggle("device-wide",w>=1180);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${sans.variable} ${mono.variable} font-sans min-h-svh bg-[var(--bg)] text-[var(--text)]`}>
        <SkipLink />
        <Providers>
          {children}
          <Toasts />
        </Providers>
      </body>
    </html>
  );
}
