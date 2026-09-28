"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Camera, Mic, Repeat, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { useApp } from "@/lib/store";
import { DEMO_EMAIL } from "@/lib/demo-data";
import { firstName } from "@/lib/cabinet";
import { Logo } from "@/components/Logo";
import { KnowledgeFlow } from "@/components/KnowledgeFlow";
import { CursorGlow } from "@/components/CursorGlow";
import { MagneticCta } from "@/components/MagneticCta";
import { PageTurn } from "@/components/PageTurn";

const FEATURES = [
  { icon: Sparkles, t: "Персональный репетитор", d: "Помнит имя, класс, ошибки и текущий урок." },
  { icon: Mic, t: "Голос", d: "Спроси вслух, если браузер умеет слушать." },
  { icon: Camera, t: "Фото задачи", d: "Снимок домашки. Сначала шаг, не готовый ответ." },
  { icon: Repeat, t: "Разбор ошибок", d: "То, что путал, возвращается, пока не закрепится." },
];

type Mood = "idle" | "listen" | "think" | "speak" | "happy" | "error";

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
    <div className="land">
      <CursorGlow />
      <section className="land-hero">
        <div className="land-copy">
          <p className="land-eye">Персональная AI-школа</p>
          <h1>
            {who ? (
              <>
                {who}, продолжим.
                <br />
                Репетитор помнит, где ты остановился.
              </>
            ) : (
              <>
                Понять тему.
                <br />
                А не списать ответ.
              </>
            )}
          </h1>
          <p className="land-lead">
            Репетитор объясняет с нуля, подстраивается под класс и не отдаёт решение, пока ты не попробуешь.
          </p>
          <div className="land-cta">
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
          <p className="land-note">Аккаунт и прогресс сохраняются. Свой кабинет собирается за минуты.</p>
        </div>
        <div className="land-stage">
          <KnowledgeFlow size="lg" mood={mood} subject="mix" />
          <span className="land-glass" style={{ top: "8%", left: "6%" }}>Английский · A1</span>
          <span className="land-glass" style={{ top: "18%", right: "8%" }}>Мастерство 72%</span>
          <span className="land-glass" style={{ bottom: "14%", left: "10%" }}>Сначала шаг</span>
        </div>
      </section>

      <section className="land-split">
        <div>
          <p className="land-eye">Проблема</p>
          <h2>Один учебник не подходит всем.</h2>
          <p className="land-sub">Кому-то скучно. Кто-то теряется. Micro AI School настраивает объяснение на тебя — не на средний класс.</p>
        </div>
        <blockquote className="land-quote">
          <p>«Объясни, как будто мне 13. Ответ пока не говори.»</p>
          <cite>Так начинается настоящий урок</cite>
        </blockquote>
      </section>

      <section className="land-split rev">
        <div className="land-feature-list">
          {FEATURES.map((b) => {
            const Icon = b.icon;
            return (
              <article key={b.t}>
                <Icon size={18} aria-hidden />
                <div>
                  <h3>{b.t}</h3>
                  <p>{b.d}</p>
                </div>
              </article>
            );
          })}
        </div>
        <div>
          <p className="land-eye">Решение</p>
          <h2>AI подстраивается под тебя.</h2>
          <p className="land-sub">Имя, класс, язык, слабые темы и текущий урок остаются в разговоре.</p>
        </div>
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
