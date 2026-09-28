"use client";

import { useRouter } from "next/navigation";
import { TEMPLATES } from "@/lib/templates";
import { useApp } from "@/lib/store";
import { Button } from "@/components/Button";

export default function TemplatesPage() {
  const { addConversation } = useApp();
  const router = useRouter();

  function run(prompt: string, title: string) {
    const id = addConversation({ title });
    sessionStorage.setItem("ssai-seed", prompt);
    router.push(`/tutor?c=${id}`);
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="text-[11px] font-semibold text-[var(--muted)]">Сценарии</p>
        <h1 className="font-semibold mt-2">Шаблоны обучения</h1>
        <p className="text-[var(--muted)] mt-3 max-w-2xl">
          Готовые режимы репетитора: экзамен, подсказки, другой язык, фото, сочинение. Один клик — урок уже в нужном стиле.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {TEMPLATES.map((tpl, i) => (
          <article key={tpl.id} className="surface hover-lift rounded-[1.7rem] p-6" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex justify-between text-[11px] uppercase tracking-wider text-[var(--muted)]">
              <span>{tpl.kind}</span>
              <span>{tpl.minutes} мин</span>
            </div>
            <h2 className="font-serif text-2xl mt-2">{tpl.title}</h2>
            <ul className="mt-4 space-y-1 text-sm text-[var(--muted)]">
              {tpl.points.map((p) => (
                <li key={p}>— {p}</li>
              ))}
            </ul>
            <Button className="mt-5" onClick={() => run(tpl.prompt, tpl.title)}>
              Запустить шаблон
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
