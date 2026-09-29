"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Camera, Mic, Repeat, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { useApp } from "@/lib/store";
import { DEMO_EMAIL } from "@/lib/demo-data";
import { firstName } from "@/lib/cabinet";
import { Logo } from "@/components/Logo";
import { KnowledgeFlow } from "@/components/KnowledgeFlow";
import { MagneticCta } from "@/components/MagneticCta";
import { PageTurn } from "@/components/PageTurn";
import { ShaderWave } from "@/components/ShaderWave";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Reveal } from "@/components/Reveal";

const WORDS = ["алгебру", "английский", "физику", "химию", "историю", "биологию"];

const TAPE_A = ["x² + 5x = 14", "Present Simple", "F = ma", "H₂O", "√144 = 12", "Past Perfect", "πr²", "1812", "E = mc²", "sin²α + cos²α = 1"];
const TAPE_B = ["ДНК", "a² + b² = c²", "I have been", "NaCl", "v = s / t", "Причастие", "log₂ 8 = 3", "Фотосинтез", "Zn + 2HCl", "¾ + ¼ = 1"];

const STEPS = [
  { who: "you", text: "Реши 2x + 5 = 17" },
  { who: "ai", text: "Сначала: что мешает x остаться одному?" },
  { who: "you", text: "Пятёрка. Убираю: 2x = 12" },
  { who: "ai", text: "Верно. Последний шаг — твой." },
  { who: "you", text: "x = 6" },
  { who: "ai", text: "Точно. Тема закрыта ✓" },
] as const;

const FEATURES = [
  { icon: Sparkles, t: "Помнит тебя", d: "Имя, класс, ошибки и текущий урок." },
  { icon: Mic, t: "Слышит голос", d: "Спроси вслух — ответит голосом." },
  { icon: Camera, t: "Видит фото", d: "Снимок задачи. Сначала подсказка." },
  { icon: Repeat, t: "Возвращает ошибки", d: "Пока тема не закрепится." },
];

type Mood = "idle" | "listen" | "think" | "speak" | "happy" | "error";

function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="rot-word" aria-live="off">
      <span key={WORDS[i]} className="rot-word-in grad-text">
        {WORDS[i]}
      </span>
    </span>
  );
}

function StepDemo() {
  const [n, setN] = useState(1);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(STEPS.length);
      return;
    }
    const id = window.setInterval(() => setN((k) => (k >= STEPS.length + 2 ? 1 : k + 1)), 1500);
    return () => window.clearInterval(id);
  }, []);
  const shown = Math.min(n, STEPS.length);
  return (
    <div className="step-demo" aria-label="Пример урока">
      <div className="step-demo-head">
        <span className="step-dot" />
        Пример урока
        <span className="step-count">
          {shown}/{STEPS.length}
        </span>
      </div>
      <ol>
        {STEPS.slice(0, shown).map((s, i) => (
          <li key={i} className={`step-bubble ${s.who}`}>
            {s.text}
          </li>
        ))}
        {shown < STEPS.length && STEPS[shown].who === "ai" ? (
          <li className="step-bubble ai typing" aria-hidden>
            <i />
            <i />
            <i />
          </li>
        ) : null}
      </ol>
    </div>
  );
}

function Tape({ items, reverse }: { items: readonly string[]; reverse?: boolean }) {
  return (
    <div className={`tape ${reverse ? "rev" : ""}`} aria-hidden>
      <div className="tape-track">
        {[...items, ...items].map((x, i) => (
          <span key={i}>{x}</span>
        ))}
      </div>
    </div>
  );
}

export function HomeLanding() {
  const router = useRouter();
  const { user, loginLast, lastUserName, lastUserEmail, hydrated } = useApp();
  const guest = !hydrated || !user || user.email.toLowerCase() === DEMO_EMAIL;
  const who = !hydrated ? "" : guest ? "" : firstName(user?.name);
  const rememberedWho = hydrated && guest ? firstName(lastUserName || "") : "";
  const [mood, setMood] = useState<Mood>("idle");

  function start() {
    if (!guest) {
      router.push("/dashboard");
      return;
    }
    if (loginLast()) {
      router.push("/dashboard");
      return;
    }
    sessionStorage.setItem("ssai-after-auth", "/dashboard");
    router.push(lastUserEmail || rememberedWho ? "/login" : "/register");
  }

  return (
    <div className="land land-v2">
      <section className="hero-v2">
        <ShaderWave className="hero-v2-bg" />
        <div className="hero-v2-copy">
          <p className="hero-chip">
            <span className="hero-chip-dot" />
            Персональная AI-школа
          </p>
          <h1 className="hero-title">
            {who ? (
              <>
                <span className="rise" style={{ animationDelay: "0ms" }}>{who},</span>{" "}
                <span className="rise grad-text" style={{ animationDelay: "120ms" }}>продолжим</span>
              </>
            ) : (
              <>
                <span className="rise" style={{ animationDelay: "0ms" }}>Понять</span> <RotatingWord />
                <span className="rise hero-title-sub" style={{ animationDelay: "240ms" }}>а не списать ответ</span>
              </>
            )}
          </h1>
          <p className="hero-lead rise" style={{ animationDelay: "360ms" }}>
            Репетитор объясняет с нуля и не отдаёт решение, пока ты не попробуешь.
          </p>
          <div className="land-cta rise" style={{ animationDelay: "480ms" }}>
            <MagneticCta>
              {who || rememberedWho ? (
                <Button magnetic onClick={start} onMouseEnter={() => setMood("happy")} onMouseLeave={() => setMood("idle")}>
                  {who ? "Продолжить учёбу" : `Продолжить как ${rememberedWho}`} <ArrowRight size={16} aria-hidden />
                </Button>
              ) : (
                <Button magnetic href="/register" onMouseEnter={() => setMood("happy")} onMouseLeave={() => setMood("idle")}>
                  Начать учиться <ArrowRight size={16} aria-hidden />
                </Button>
              )}
            </MagneticCta>
            <Button
              variant="ai"
              href="/tutor"
              onMouseEnter={() => setMood("listen")}
              onMouseLeave={() => setMood("idle")}
              onClick={() => {
                if (guest) sessionStorage.setItem("ssai-after-auth", "/tutor");
              }}
            >
              Открыть репетитора
            </Button>
          </div>
        </div>
        <div className="hero-v2-stage rise" style={{ animationDelay: "200ms" }}>
          <KnowledgeFlow size="lg" mood={mood} subject="mix" />
        </div>
      </section>

      <section className="tapes">
        <Tape items={TAPE_A} />
        <Tape items={TAPE_B} reverse />
      </section>

      <section className="duo">
        <Reveal>
          <p className="land-eye">Как это выглядит</p>
          <h2 className="display-h2">
            Не ответ.
            <br />
            <span className="grad-text">Путь к ответу.</span>
          </h2>
          <p className="land-sub">Один вопрос за раз. Последний шаг всегда делаешь ты.</p>
        </Reveal>
        <Reveal delay={120}>
          <StepDemo />
        </Reveal>
      </section>

      <section className="bento">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={f.t} delay={i * 90}>
              <SpotlightCard className="bento-card">
                <span className="bento-orb">
                  <Icon size={20} aria-hidden />
                </span>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </SpotlightCard>
            </Reveal>
          );
        })}
      </section>

      <PageTurn id="home" />

      <footer className="land-foot">
        <div>
          <Logo size="sm" />
          <p>Персональная AI-школа. Объясняет, проверяет и помнит твой прогресс.</p>
        </div>
        <nav aria-label="Страницы">
          <p>Страницы</p>
          <Link href="/how">Как работает</Link>
          <Link href="/method">Метод</Link>
          <Link href="/program">Предметы</Link>
          <Link href="/install">На телефон</Link>
        </nav>
        <nav aria-label="Учёба">
          <p>Учёба</p>
          <Link href="/register">Регистрация</Link>
          <Link href="/login">Вход</Link>
          <Link href="/school">Кабинет</Link>
        </nav>
        <nav aria-label="Право">
          <p>Право</p>
          <Link href="/privacy">Конфиденциальность</Link>
          <Link href="/terms">Правила</Link>
        </nav>
      </footer>
    </div>
  );
}
