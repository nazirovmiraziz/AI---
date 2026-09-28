"use client";

import { useLangSchool } from "@/lib/lang/use-school";
import { EmptyLearn } from "@/components/lang/bits";
import { langById } from "@/lib/lang/catalog";
import { firstName } from "@/lib/cabinet";
import { Button } from "@/components/Button";

export default function CertificatesPage() {
  const { user, ls, track, meta } = useLangSchool();
  if (!ls.onboarded || !track) {
    return <EmptyLearn title="Сертификаты появятся здесь" text="После закрытия уровня A1 откроется первый." href="/learn/start" cta="Начать" />;
  }
  const list = track.certificates;
  if (!list.length) {
    return (
      <EmptyLearn
        title="Пока нет сертификатов"
        text="Пройди все модули A1 и тест — появится первый сертификат."
        href="/learn/map"
        cta="К карте"
      />
    );
  }
  const who = firstName(user?.name) || "ученик";
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Сертификаты</h1>
      {list.map((lv) => (
        <article key={lv} className="cert-card">
          <p className="text-xs uppercase tracking-[0.2em]">Smart School AI</p>
          <h2 className="mt-4 text-2xl font-semibold">
            {meta ? langById(meta.id).name : "Language"} {lv}
          </h2>
          <p className="mt-2 text-[var(--muted)]">Completed</p>
          <p className="mt-6 text-lg">{who}</p>
          <p className="mt-8 text-xs text-[var(--muted)]">Уровень пройден в школе. Это внутренний сертификат платформы.</p>
          <Button className="mt-4" variant="secondary" onClick={() => window.print()}>
            Смотреть / печать
          </Button>
        </article>
      ))}
    </div>
  );
}
