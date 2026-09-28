"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Users, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/Button";
import { HomeLanding } from "@/components/HomeLanding";
import { Reveal } from "@/components/Reveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { KnowledgeFlow } from "@/components/KnowledgeFlow";
import { LiveTutorDemo } from "@/components/LiveTutorDemo";
import { PageTurn } from "@/components/PageTurn";
import type { BotMood } from "@/components/TutorBot";
import { TEMPLATES } from "@/lib/templates";
import { useApp } from "@/lib/store";
import { useRouter } from "next/navigation";
import { DEMO_EMAIL } from "@/lib/demo-data";

const AUDIENCE = [
  { icon: BookOpen, t: "Ученик", d: "Разбор в любой момент, без стыда за «глупый» вопрос." },
  { icon: Users, t: "Учитель", d: "Не замена уроку: индивидуальная практика и след прогресса." },
  { icon: GraduationCap, t: "Родитель", d: "Система не пишет домашку за ребёнка. Видно, над чем работали." },
];

function useStart() {
  const router = useRouter();
  const { user } = useApp();
  return (prompt?: string, href = "/tutor") => {
    const guest = !user || user.email.toLowerCase() === DEMO_EMAIL;
    if (guest) {
      if (prompt) sessionStorage.setItem("ssai-seed", prompt);
      sessionStorage.setItem("ssai-after-auth", href);
      router.push("/login");
      return;
    }
    if (href === "/tutor" && prompt) {
      sessionStorage.setItem("ssai-seed", prompt);
    }
    router.push(href);
  };
}

export function HomeChapter() {
  return <HomeLanding />;
}

export function HowChapter() {
  const start = useStart();
  const steps = [
    { n: "01", t: "Ты спрашиваешь", d: "Текст, голос или фото. Даже «не понял прошлый урок».", mood: "listen" as BotMood },
    { n: "02", t: "AI понимает", d: "Смотрит уровень и тему. Не вываливает ответ сразу.", mood: "think" as BotMood },
    { n: "03", t: "AI объясняет", d: "Коротко, на класс, с одним примером.", mood: "speak" as BotMood },
    { n: "04", t: "Ты пробуешь", d: "Шаг твой. Подсказка — не ответ.", mood: "idle" as BotMood },
    { n: "05", t: "AI проверяет", d: "Верно — или где ход сломался.", mood: "think" as BotMood },
    { n: "06", t: "AI подстраивается", d: "Слабые темы возвращаются чаще. Потом повтор.", mood: "happy" as BotMood },
  ];
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const nodes = refs.current.filter(Boolean) as HTMLLIElement[];
    if (!nodes.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!vis) return;
        const i = nodes.indexOf(vis.target as HTMLLIElement);
        if (i >= 0) setActive(i);
      },
      { threshold: 0.55 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <div className="land how-page">
      <header className="land-sec">
        <p className="land-eye">Как идёт урок</p>
        <h1>От вопроса до понимания</h1>
        <p className="land-sub">Без готового ответа в начале. Репетитор ведёт, ты решаешь, AI проверяет.</p>
      </header>
      <div className="how-story">
        <ol>
          {steps.map((s, i) => (
            <li
              key={s.n}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={active === i ? "on" : ""}
            >
              <button type="button" onClick={() => setActive(i)}>
                <span>{s.n}</span>
                <strong>{s.t}</strong>
                <p>{s.d}</p>
              </button>
            </li>
          ))}
        </ol>
        <div className="how-sticky">
          <KnowledgeFlow size="lg" mood={steps[active].mood} />
        </div>
      </div>
      <section className="land-split">
        <div>
          <h2>Фото задачи, не готовый ответ</h2>
          <p className="land-sub">Репетитор ведёт по шагам. Ответ появляется, когда ты его собрал.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {["Сканируем область задачи", "Сначала подсказка без спойлера", "Проверка понимания"].map((x) => (
              <li key={x} className="flex gap-2">
                <Check size={16} className="text-[#0c9b78] mt-0.5" /> {x}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <Button variant="secondary" onClick={() => start(undefined, "/photo")}>Открыть фото</Button>
          </div>
        </div>
        <div className="photo-scan rounded-2xl border border-[var(--line)] bg-[#f7fbff] p-8 min-h-[180px] grid place-items-center">
          <div className="text-center">
            <Camera className="mx-auto text-[#3aa0e8]" />
            <p className="font-mono mt-3 text-lg">2x + 5 = 17</p>
            <p className="text-xs text-[var(--muted)] mt-2">распознано · шаг 1 из 4</p>
          </div>
        </div>
      </section>
      <section className="land-sec">
        <p className="land-eye">Попробуй сейчас</p>
        <h2>Живой ответ репетитора</h2>
        <p className="land-sub">Настоящий запрос к AI — без регистрации.</p>
        <div className="mt-5">
          <LiveTutorDemo />
        </div>
      </section>
      <PageTurn id="how" />
    </div>
  );
}

export function AudienceChapter() {
  return (
    <div className="page-sheet page-in">
      <p className="page-tag">Для кого</p>
      <h1 className="font-semibold">Один продукт — три роли</h1>
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {AUDIENCE.map((a, i) => (
          <Reveal key={a.t} delay={i * 80}>
            <article className="lift-card rounded-2xl p-6 h-full min-h-[200px]">
              <a.icon size={20} className="text-[#3bb4ff]" />
              <h2 className="mt-4 font-semibold text-2xl">{a.t}</h2>
              <p className="mt-3 text-[var(--muted)]">{a.d}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function ProductChapter() {
  return (
    <div className="page-sheet page-in">
      <p className="page-tag">Возможности</p>
      <h1 className="font-semibold">Живой репетитор внутри школы</h1>
      <p className="mt-4 text-lg text-[var(--muted)]">Диалог, тесты, экзамен, фото и прогресс — в одном аккаунте.</p>
      <div className="mt-8">
        <Button href="/how">Смотреть, как ведёт</Button>
      </div>
    </div>
  );
}

export function GalleryChapter() {
  const start = useStart();
  return (
    <div className="page-sheet page-in">
      <h1 className="font-semibold">Двенадцать режимов</h1>
      <p className="mt-3 text-[var(--muted)]">Каждый шаблон открывает репетитора с готовым сценарием.</p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TEMPLATES.map((tpl, i) => (
          <Reveal key={tpl.id} delay={Math.min(i * 40, 240)}>
            <SpotlightCard as="button" className="lift-card text-left rounded-2xl p-5 w-full min-h-[140px]" onClick={() => start(tpl.prompt)}>
              <p className="text-[11px] font-mono text-[#163068]">{tpl.kind} · {tpl.minutes} мин</p>
              <h2 className="mt-2 text-lg font-semibold">{tpl.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{tpl.points.join(" · ")}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function MethodChapter() {
  const steps = [
    { t: "Находит пробел", d: "Короткая проверка. Слабые темы — первые в плане.", mood: "listen" as BotMood },
    { t: "Объясняет с нуля", d: "На класс, без стены текста.", mood: "speak" as BotMood },
    { t: "Даёт пример", d: "Один разобранный ход, не десять копий.", mood: "idle" as BotMood },
    { t: "Решает вместе", d: "Первый шаг общий.", mood: "speak" as BotMood },
    { t: "Даёт задачу тебе", d: "Дальше считаешь ты.", mood: "listen" as BotMood },
    { t: "Проверяет", d: "Верно — или где сломалось.", mood: "think" as BotMood },
    { t: "Разбирает ошибку", d: "Почему именно этот шаг.", mood: "think" as BotMood },
    { t: "Оценивает понимание", d: "Тема закрыта или обратно в повтор.", mood: "happy" as BotMood },
  ];
  const [active, setActive] = useState(0);
  return (
    <div className="land method-page">
      <header className="land-sec">
        <p className="land-eye">Метод</p>
        <h1>Восемь шагов к пониманию</h1>
        <p className="land-sub">Не ответ в чате — путь. Текущий шаг подсвечен. Поле знаний рядом.</p>
      </header>
      <div className="method-live">
        <ol className="method-path">
          {steps.map((s, i) => (
            <li key={s.t} className={i === active ? "on" : i < active ? "done" : ""}>
              <button type="button" onClick={() => setActive(i)}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <strong>{s.t}</strong>
                <p>{s.d}</p>
              </button>
            </li>
          ))}
        </ol>
        <div className="method-bot">
          <KnowledgeFlow size="lg" mood={steps[active].mood} />
          <div className="method-nav">
            <Button variant="secondary" disabled={active === 0} onClick={() => setActive((n) => Math.max(0, n - 1))}>Назад</Button>
            <Button disabled={active === steps.length - 1} onClick={() => setActive((n) => Math.min(steps.length - 1, n + 1))}>Дальше</Button>
          </div>
        </div>
      </div>
      <PageTurn id="method" />
    </div>
  );
}

export function LandingStory() {
  return <HomeChapter />;
}
