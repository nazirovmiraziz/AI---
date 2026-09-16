"use client";

import { FORMULAS } from "@/lib/formulas";
import { Formula } from "@/components/Formula";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useState } from "react";

export default function FormulasPage() {
  const { user } = useApp();
  const loc = user?.language ?? "ru";
  const [g, setG] = useState(FORMULAS[0].group);
  const group = FORMULAS.find((x) => x.group === g) ?? FORMULAS[0];
  return (
    <div className="space-y-6 pb-16">
      <h1 className="font-serif text-4xl">{t(loc, "formulas.title")}</h1>
      <div className="flex flex-wrap gap-2">
        {FORMULAS.map((x) => (
          <button key={x.group} onClick={() => setG(x.group)} className={`rounded-full px-4 py-2 text-sm border ${g === x.group ? "border-brand-600 bg-brand-50" : "border-[var(--line)]"}`}>
            {t(loc, `formulas.${x.group}`)}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {group.items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-5">
            <div className="font-medium">{item.name}</div>
            <div className="mt-3 overflow-x-auto">
              <Formula latex={item.latex} display />
            </div>
            <p className="text-sm text-ink-500 mt-2">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
