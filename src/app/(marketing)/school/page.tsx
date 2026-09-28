"use client";

import { useRouter } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { SCHOOL_SECTIONS } from "@/lib/school-pages";
import { useApp } from "@/lib/store";
import { DEMO_EMAIL } from "@/lib/demo-data";

export default function SchoolPage() {
  const router = useRouter();
  const { user } = useApp();

  function open(href: string, app?: boolean) {
    if (app && (!user || user.email.toLowerCase() === DEMO_EMAIL)) {
      sessionStorage.setItem("ssai-after-auth", href);
      router.push("/login");
      return;
    }
    router.push(href);
  }

  const site = SCHOOL_SECTIONS.filter((x) => x.group === "Сайт");
  const room = SCHOOL_SECTIONS.filter((x) => x.group === "Кабинет");

  return (
    <div className="page-in mx-auto max-w-6xl px-4 py-10 md:py-14">
      <p className="line-reveal gold-kicker">Кабинет</p>
      <h1 className="mt-3 font-semibold">Только нужные разделы</h1>
      <p className="mt-3 text-[var(--muted)] max-w-xl">Каждая карточка открывает настоящую страницу. Если ты ещё не вошёл — сначала имя, потом кабинет.</p>

      <h2 className="mt-12 text-sm font-semibold text-[var(--muted)]">Сайт</h2>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {site.map((p, i) => (
          <Reveal key={p.href} delay={i * 40}>
            <SpotlightCard as="button" onClick={() => open(p.href)} className="lift-card w-full text-left rounded-2xl p-5 min-h-[132px]">
              <p className="text-[11px] font-mono text-[#163068]">{p.href}</p>
              <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{p.text}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

      <h2 className="mt-12 text-sm font-semibold text-[var(--muted)]">Кабинет</h2>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {room.map((p, i) => (
          <Reveal key={p.href} delay={Math.min(i * 30, 180)}>
            <SpotlightCard as="button" onClick={() => open(p.href, true)} className="lift-card w-full text-left rounded-2xl p-5 min-h-[132px]">
              <p className="text-[11px] font-mono text-[#163068]">{p.href}</p>
              <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{p.text}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
