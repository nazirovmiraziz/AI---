"use client";

import { KnowledgeFlow } from "@/components/KnowledgeFlow";

export function BootScreen({ text = "Открываем школу…" }: { text?: string }) {
  return (
    <div className="boot-screen" role="status" aria-live="polite">
      <KnowledgeFlow size="md" mood="think" />
      <p className="boot-brand">Micro AI School</p>
      <p className="boot-copy">{text}</p>
    </div>
  );
}
