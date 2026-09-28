"use client";

import { useLangSchool } from "@/lib/lang/use-school";
import { EmptyLearn } from "@/components/lang/bits";
import { firstName } from "@/lib/cabinet";

export default function BoardPage() {
  const { user, ls } = useLangSchool();
  if (!ls.onboarded) {
    return <EmptyLearn title="Таблица не главное" text="Сначала учись. Рейтинг — только для интереса." href="/learn/start" cta="Начать" />;
  }
  const xp = user?.xp ?? 0;
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Твой счёт</h1>
      <p className="text-sm text-[var(--muted)]">Общей таблицы учеников нет: школа хранит прогресс на устройстве. Здесь только ты.</p>
      <ol className="space-y-2">
        <li className="panel-card flex items-center justify-between p-4 ring-1 ring-[#2f6bff]">
          <span>1. {firstName(user?.name) || "Ты"}</span>
          <span className="text-sm text-[var(--muted)]">{xp} XP</span>
        </li>
      </ol>
    </div>
  );
}
