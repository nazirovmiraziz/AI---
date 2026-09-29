"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { KnowledgeFlow, type FlowSubject } from "@/components/KnowledgeFlow";
import { PageTurn } from "@/components/PageTurn";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { useApp } from "@/lib/store";
import { DEMO_EMAIL } from "@/lib/demo-data";
import { SUBJECTS } from "@/lib/subjects";
import { t } from "@/lib/i18n";

const LANGS = [
  { hello: "Привет", name: "Русский", href: "/subjects/russian" },
  { hello: "Hello", name: "English", href: "/learn/start" },
  { hello: "Салом", name: "Тоҷикӣ", href: "/subjects/tajik" },
  { hello: "你好", name: "中文", href: "/learn/start" },
  { hello: "안녕하세요", name: "한국어", href: "/learn/start" },
  { hello: "مرحبا", name: "العربية", href: "/learn/start", rtl: true },
];

const GLYPH: Record<string, string> = {
  math: "π",
  physics: "F=ma",
  chemistry: "H₂O",
  biology: "DNA",
  geography: "♁",
  history: "Δ",
  cs: "{ }",
  english: "Aa",
  russian: "Аа",
  tajik: "Тоҷ",
  chinese: "中",
  korean: "한",
  arabic: "ع",
};

const SUBJ_FLOW: Record<string, FlowSubject> = {
  math: "math",
  physics: "physics",
  chemistry: "chemistry",
  biology: "biology",
  english: "english",
  cs: "cs",
};

const CYCLE: { id: FlowSubject; label: string }[] = [
  { id: "mix", label: "Все предметы" },
  { id: "math", label: "Математика" },
  { id: "physics", label: "Физика" },
  { id: "chemistry", label: "Химия" },
  { id: "biology", label: "Биология" },
  { id: "english", label: "Английский" },
  { id: "cs", label: "Информатика" },
];

const PATH = [
  { t: "Алфавит", s: "done" as const },
  { t: "Приветствия", s: "done" as const },
  { t: "Числа", s: "done" as const },
  { t: "Present Simple", s: "now" as const },
  { t: "Вопросы", s: "lock" as const },
  { t: "Повседневная жизнь", s: "lock" as const },
  { t: "Past Simple", s: "lock" as const },
  { t: "Тест A1", s: "lock" as const },
];

const FAQ = [
  { q: "Можно учить языки?", a: "Да. Отдельная карта A1–C1 в разделе Учёба. Таджикский также в школьных предметах." },
  { q: "Какие предметы есть?", a: "Математика, физика, химия, биология, информатика, история, география и языки." },
  { q: "Прогресс сохраняется?", a: "Да. Аккаунт и прогресс хранятся на устройстве и в облаке, если оно подключено — можно войти с другого телефона." },
  { q: "AI сразу даёт ответ?", a: "В режиме учёбы — нет. Сначала ход и подсказка. Полное решение — если попросишь или после попытки." },
];

function topicsWord(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return "тема";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return "темы";
  return "тем";
}

export function ProgramChapter() {
  const { user, hydrated } = useApp();
  const guest = !hydrated || !user || user.email.toLowerCase() === DEMO_EMAIL;
  const [hover, setHover] = useState<{ id: FlowSubject; label: string } | null>(null);
  const [auto, setAuto] = useState(0);
  const gate = (href: string) => (guest ? "/register" : href);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setAuto((n) => (n + 1) % CYCLE.length), 2600);
    return () => window.clearInterval(id);
  }, []);

  const flow = hover?.id ?? CYCLE[auto].id;
  const flowLabel = hover?.label ?? CYCLE[auto].label;

  return (
    <div className="land land-v2 program-page">
      <PageHero
        chip="Предметы и языки"
        words={["Всё,", "что", "проходят", { t: "в школе", grad: true }]}
        lead="Математика, науки, история и языки — в одном репетиторе. Прогресс считается только в твоём аккаунте."
        stage={
          <div className="program-stage">
            <KnowledgeFlow size="lg" subject={flow} />
            <p className="v2-caption" key={flowLabel}>
              <b>Поле знаний</b> {flowLabel}
            </p>
          </div>
        }
      >
        <Button href="#subjects">
          Выбрать предмет <ArrowRight size={16} aria-hidden />
        </Button>
        <Button variant="ai" href="#languages">
          Языки
        </Button>
      </PageHero>

      <section className="v2-sec" id="subjects">
        <Reveal>
          <p className="land-eye">Школьные предметы</p>
          <h2 className="display-h2">
            Наведи — <span className="grad-text">поле ответит.</span>
          </h2>
        </Reveal>
        <div className="v2-subj">
          {SUBJECTS.map((s, i) => {
            const hard = s.topics.some((x) => x.difficulty === "hard") ? "Сложнее" : s.topics.some((x) => x.difficulty === "medium") ? "Средне" : "Основа";
            const prog = !guest && user ? user.subjectLevels[s.id] ?? 0 : 0;
            const n = s.topics.length;
            const name = t("ru", `subject.${s.id}`);
            const f = { id: SUBJ_FLOW[s.id] ?? "mix", label: name };
            return (
              <Reveal key={s.id} delay={Math.min(i * 60, 360)}>
                <Link
                  href={gate(`/subjects/${s.id}`)}
                  className="v2-subj-link"
                  onMouseEnter={() => setHover(f)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(f)}
                  onBlur={() => setHover(null)}
                >
                  <SpotlightCard className="bento-card v2-subj-card">
                    <b className="v2-glyph" aria-hidden>{GLYPH[s.id] ?? "✦"}</b>
                    <h3>{name}</h3>
                    <p>
                      {n} {topicsWord(n)} · {hard}
                    </p>
                    <span className="v2-meter" aria-hidden>
                      <i style={{ width: `${Math.max(4, prog)}%` }} />
                    </span>
                    <em>{guest ? "После входа" : `${prog}%`}</em>
                  </SpotlightCard>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="v2-sec" id="languages">
        <Reveal>
          <p className="land-eye">Языковая школа</p>
          <h2 className="display-h2">
            Шесть языков. <span className="grad-text">A1{"\u00a0→\u00a0"}C1.</span>
          </h2>
          <p className="land-sub">Карта уровней, диалоги и тесты. Таджикский есть и в школьных предметах.</p>
        </Reveal>
        <div className="lang-row v2-langs">
          {LANGS.map((l, i) => (
            <Reveal key={l.hello} delay={i * 70}>
              <Link href={gate(l.href)} className="lang-tile" dir={l.rtl ? "rtl" : "ltr"}>
                <span className="lang-hello">{l.hello}</span>
                <span>{l.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="duo v2-progress" id="progress">
        <Reveal>
          <p className="land-eye">Прогресс</p>
          <h2 className="display-h2">
            Видно, <span className="grad-text">куда идёшь.</span>
          </h2>
          <p className="land-sub">Серия дней, XP и слабые темы — в кабинете. Здесь пример пути.</p>
          <ol className="land-path v2-path">
            {PATH.map((p) => (
              <li key={p.t} className={p.s}>
                <span>{p.s === "done" ? "✓" : p.s === "now" ? "●" : "○"}</span>
                {p.t}
              </li>
            ))}
          </ol>
          <div className="land-cta">
            <Button href={gate("/learn")} variant="ai">Открыть карту</Button>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="land-faq v2-faq">
            <p className="land-eye">Частые вопросы</p>
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q}
                  <Plus size={16} aria-hidden />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      <PageTurn id="program" />
    </div>
  );
}
