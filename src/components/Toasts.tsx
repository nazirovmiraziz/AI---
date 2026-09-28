"use client";

import { useApp } from "@/lib/store";
import { ACHIEVEMENTS } from "@/lib/demo-data";

export function Toasts() {
  const { lastXp, lastAchievement } = useApp();
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[70] space-y-2 pointer-events-none">
      {lastXp && (
        <div className="animate-xpPop rounded-xl bg-ink-900 text-white px-4 py-3 shadow-lift text-sm font-medium">
          +{lastXp.amount} XP{lastXp.reason ? ` · ${lastXp.reason}` : ""}
        </div>
      )}
      {lastAchievement && (
        <div className="animate-xpPop rounded-xl bg-brand-600 text-white px-4 py-3 shadow-lift text-sm">
          {ACHIEVEMENTS.find((a) => a.id === lastAchievement)?.icon} Достижение открыто
        </div>
      )}
    </div>
  );
}
