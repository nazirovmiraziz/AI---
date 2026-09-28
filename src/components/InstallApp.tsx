"use client";

import { useEffect, useState } from "react";
import { Download, PlusSquare, Share } from "lucide-react";
import { Button } from "@/components/Button";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) && !/CriOS|FxiOS/i.test(navigator.userAgent);
}

export function Pwa() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (local) {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => {});
      return;
    }
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => {});
    document.documentElement.classList.toggle("standalone", isStandalone());
  }, []);
  return null;
}

export function InstallApp({ compact = false }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const [ready, setReady] = useState(false);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIos());
    setReady(true);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as PromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!ready || installed) {
    if (installed && !compact) {
      return (
        <p className="text-sm text-[var(--muted)]">Школа уже стоит на этом устройстве.</p>
      );
    }
    return null;
  }

  async function add() {
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  return (
    <div className={compact ? "space-y-3" : "lift-card rounded-[1.6rem] p-5 sm:p-6 space-y-4"}>
      {!compact && (
        <div className="flex items-center gap-3">
          <img src="/app-icon.svg" alt="" className="h-14 w-14 rounded-[22%] shadow-card" />
          <div className="min-w-0">
            <p className="font-semibold">Micro AI School</p>
            <p className="text-sm text-[var(--muted)]">Сайт и иконка на экране — одна и та же школа.</p>
          </div>
        </div>
      )}
      {prompt ? (
        <Button className="w-full sm:w-auto" onClick={add}>
          <Download size={16} /> Поставить на телефон
        </Button>
      ) : ios ? (
        <ol className="space-y-2 text-sm text-[var(--text)]">
          <li className="flex gap-2">
            <Share size={16} className="mt-0.5 shrink-0 text-[#1784d4]" />
            Нажми «Поделиться» внизу Safari.
          </li>
          <li className="flex gap-2">
            <PlusSquare size={16} className="mt-0.5 shrink-0 text-[#1784d4]" />
            Выбери «На экран Домой».
          </li>
          <li>Нажми «Добавить». Школа появится как приложение.</li>
        </ol>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          В меню браузера нажми «Добавить на главный экран» или «Установить».
        </p>
      )}
    </div>
  );
}
