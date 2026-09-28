"use client";

import { AppProvider } from "@/lib/store";
import { DeviceSync } from "@/components/DeviceSync";
import { Pwa } from "@/components/InstallApp";
import { VisualQuality } from "@/components/VisualQuality";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <VisualQuality />
      <DeviceSync />
      <Pwa />
      {children}
    </AppProvider>
  );
}
