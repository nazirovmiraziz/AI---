"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, Check, Footprints, MessageSquare, Mic, Sparkles, Target, Users, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/Button";
import { HomeLanding } from "@/components/HomeLanding";
import { PageHero } from "@/components/PageHero";
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

const PRINCIPLES = [
  { icon: Target, t: "Один вопрос за раз", d: "Без стены текста. Короткий ход — и твоя очередь." },
  { icon: Footprints, t: "Последний шаг — твой", d: "Подсказка не превращается в готовое решение." },
  { icon: Check, t: "Ошибка — это данные", d: "Слабые темы возвращаются, пока не закрепятся." },
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
    <div className="land land-v2 how-page">
      <PageHero
        chip="Как идёт урок"
        words={["От", "вопроса", { t: "к\u00a0пониманию", grad: true }]}
        lead="Репетитор ведёт, ты решаешь, AI проверяет. Готового ответа в начале нет."
        stage={<HowModes />}
      >
        <Button href="#demo">
          Спросить сейчас <ArrowRight size={16} aria-hidden />
        </Button>
        <Button variant="ai" href="#steps">
          Шесть шагов урока
        </Button>
      </PageHero>

      <section className="v2-sec" id="steps">
        <Reveal>
          <p className="land-eye">Шесть ходов</p>
          <h2 className="display-h2">
            Один урок. <span className="grad-text">Твоя голова.</span>
          </h2>
          <p className="land-sub">Листай или нажимай шаг — поле знаний покажет, что происходит.</p>
        </Reveal>
        <div className="how-story v2-story">
          <ol>
            {steps.map((s, i) => (
              <li
                key={s.n}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className={active === i ? "on" : i < active ? "done" : ""}
              >
                <button type="button" onClick={() => setActive(i)} aria-pressed={active === i}>
                  <span>{s.n}</span>
                  <strong>{s.t}</strong>
                  <p>{s.d}</p>
                </button>
              </li>
            ))}
          </ol>
          <div className="how-sticky v2-glass">
            <KnowledgeFlow size="lg" mood={steps[active].mood} />
            <p className="v2-caption" key={active}>
              <b>{steps[active].n}</b> {steps[active].t}
            </p>
          </div>
        </div>
      </section>

      <section className="duo v2-photo">
        <Reveal>
          <p className="land-eye">Фото задачи</p>
          <h2 className="display-h2">
            Сфоткал. <span className="grad-text">Решаешь сам.</span>
          </h2>
          <p className="land-sub">Репетитор распознаёт условие и ведёт по шагам. Ответ появляется, когда ты его собрал.</p>
          <ul className="v2-checks">
            {["Распознаёт условие", "Подсказка без спойлера", "Проверка понимания"].map((x) => (
              <li key={x}>
                <Check size={16} aria-hidden /> {x}
              </li>
            ))}
          </ul>
          <div className="land-cta">
            <Button variant="ai" onClick={() => start(undefined, "/photo")}>
              <Camera size={16} aria-hidden /> Открыть фото
            </Button>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <SpotlightCard className="v2-scan photo-scan">
            <span className="v2-scan-corner tl" />
            <span className="v2-scan-corner tr" />
            <span className="v2-scan-corner bl" />
            <span className="v2-scan-corner br" />
            <Camera size={22} aria-hidden className="v2-scan-icon" />
            <p className="v2-scan-eq">2x + 5 = 17</p>
            <p className="v2-scan-meta">распознано · шаг 1 из 4</p>
            <p className="v2-scan-hint">Что мешает x остаться одному?</p>
          </SpotlightCard>
        </Reveal>
      </section>

      <section className="v2-sec v2-demo" id="demo">
        <Reveal>
          <LiveTutorDemo />
        </Reveal>
      </section>

      <PageTurn id="how" />
    </div>
  );
}

function HowModes() {
  return (
    <div className="how-modes" aria-hidden>
      <div className="how-mode m1">
        <span className="bento-orb">
          <MessageSquare size={18} />
        </span>
        <div>
          <small>Текст</small>
          <p>Не понял прошлый урок про дроби</p>
        </div>
      </div>
      <div className="how-mode m2">
        <span className="bento-orb">
          <Mic size={18} />
        </span>
        <div>
          <small>Голос</small>
          <p className="how-wave">
            {Array.from({ length: 14 }).map((_, i) => (
              <i key={i} style={{ animationDelay: `${i * 70}ms` }} />
            ))}
          </p>
        </div>
      </div>
      <div className="how-mode m3">
        <span className="bento-orb">
          <Camera size={18} />
        </span>
        <div>
          <small>Фото</small>
          <p className="font-mono">2x + 5 = 17</p>
        </div>
      </div>
      <div className="how-mode m4">
        <span className="bento-orb">
          <Sparkles size={18} />
        </span>
        <div>
          <small>Репетитор</small>
          <p>Сначала: что мешает x остаться одному?</p>
        </div>
      </div>
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
  const pct = ((active + 1) / steps.length) * 100;
  return (
    <div className="land land-v2 method-page">
      <PageHero
        chip="Метод"
        words={["Восемь", { t: "шагов", grad: true }]}
        sub="от пробела до понимания"
        lead="Каждая тема проходит один и тот же путь. Ты не получаешь ответ — ты его собираешь."
        after={
          <div className="method-rail" aria-hidden>
            {steps.map((s, i) => (
              <span key={s.t} style={{ animationDelay: `${700 + i * 140}ms` }}>
                <small>{String(i + 1).padStart(2, "0")}</small>
              </span>
            ))}
          </div>
        }
      >
        <Button href="#path">
          Пройти путь <ArrowRight size={16} aria-hidden />
        </Button>
        <Button variant="ai" href="/register">
          Начать учиться
        </Button>
      </PageHero>

      <section className="v2-sec" id="path">
        <Reveal>
          <p className="land-eye">Интерактивный путь</p>
          <h2 className="display-h2">
            Нажимай шаги. <span className="grad-text">Смотри поле.</span>
          </h2>
        </Reveal>
        <div className="method-live v2-story">
          <ol className="method-path" style={{ ["--p" as string]: active / (steps.length - 1) }}>
            {steps.map((s, i) => (
              <li key={s.t} className={i === active ? "on" : i < active ? "done" : ""}>
                <button type="button" onClick={() => setActive(i)} aria-pressed={i === active}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{s.t}</strong>
                  <p>{s.d}</p>
                </button>
              </li>
            ))}
          </ol>
          <div className="method-bot v2-glass">
            <p className="v2-step-count">
              Шаг <b>{String(active + 1).padStart(2, "0")}</b> из {String(steps.length).padStart(2, "0")}
            </p>
            <span className="v2-meter" aria-hidden>
              <i style={{ width: `${pct}%` }} />
            </span>
            <KnowledgeFlow size="lg" mood={steps[active].mood} />
            <p className="v2-caption" key={active}>
              <b>{steps[active].t}</b> {steps[active].d}
            </p>
            <div className="method-nav">
              <Button variant="secondary" disabled={active === 0} onClick={() => setActive((n) => Math.max(0, n - 1))}>Назад</Button>
              <Button disabled={active === steps.length - 1} onClick={() => setActive((n) => Math.min(steps.length - 1, n + 1))}>Дальше</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bento v2-bento3">
        {PRINCIPLES.map((p, i) => {
          const Icon = p.icon;
          return (
            <Reveal key={p.t} delay={i * 90}>
              <SpotlightCard className="bento-card">
                <span className="bento-orb">
                  <Icon size={20} aria-hidden />
                </span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </SpotlightCard>
            </Reveal>
          );
        })}
      </section>

      <PageTurn id="method" />
    </div>
  );
}

export function LandingStory() {
  return <HomeChapter />;
}
