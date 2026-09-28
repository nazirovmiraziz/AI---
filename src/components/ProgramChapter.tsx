"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { KnowledgeFlow, type FlowSubject } from "@/components/KnowledgeFlow";
import { PageTurn } from "@/components/PageTurn";
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
};

const SUBJ_FLOW: Record<string, FlowSubject> = {
  math: "math",
  physics: "physics",
  chemistry: "chemistry",
  biology: "biology",
  english: "english",
  cs: "cs",
};

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
  const [flow, setFlow] = useState<FlowSubject>("mix");
  const gate = (href: string) => (guest ? "/register" : href);

  return (
    <div className="land program-page">
      <header className="land-hero program-hero">
        <div className="land-copy">
          <p className="land-eye">Предметы и языки</p>
          <h1>Всё, что проходят в школе.</h1>
          <p className="land-lead">Наведи на предмет — поле знаний покажет, с чем будешь работать. Прогресс считается только в твоём аккаунте.</p>
        </div>
        <div className="land-stage">
          <KnowledgeFlow size="md" subject={flow} />
        </div>
      </header>

      <section className="land-sec" id="subjects">
        <div className="land-grid subj">
          {SUBJECTS.map((s) => {
            const hard = s.topics.some((x) => x.difficulty === "hard") ? "Сложнее" : s.topics.some((x) => x.difficulty === "medium") ? "Средне" : "Основа";
            const prog = !guest && user ? user.subjectLevels[s.id] ?? 0 : 0;
            const n = s.topics.length;
            return (
              <Link
                key={s.id}
                href={gate(`/subjects/${s.id}`)}
                className="land-card subj-card"
                onMouseEnter={() => setFlow(SUBJ_FLOW[s.id] ?? "mix")}
                onMouseLeave={() => setFlow("mix")}
                onFocus={() => setFlow(SUBJ_FLOW[s.id] ?? "mix")}
                onBlur={() => setFlow("mix")}
              >
                <b className="subj-glyph" aria-hidden>{GLYPH[s.id] ?? "✦"}</b>
                <h3>{t("ru", `subject.${s.id}`)}</h3>
                <p>{n} {topicsWord(n)} · {hard}</p>
                <span className="land-bar" style={{ width: `${Math.max(4, prog)}%` }} aria-hidden />
                <em>{guest ? "После входа" : `${prog}%`}</em>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="land-sec" id="languages">
        <h2>Языки</h2>
        <p className="land-sub">Языковая школа с картами A1–C1. Таджикский также живёт в школьных предметах.</p>
        <div className="lang-row">
          {LANGS.map((l) => (
            <Link key={l.hello} href={gate(l.href)} className="lang-tile" dir={l.rtl ? "rtl" : "ltr"}>
              <span className="lang-hello">{l.hello}</span>
              <span>{l.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="land-split" id="progress">
        <div>
          <p className="land-eye">Прогресс</p>
          <h2>Видно, куда идёшь.</h2>
          <p className="land-sub">Серия дней, XP и слабые темы — в кабинете. Здесь пример пути, не чужие цифры.</p>
          <ol className="land-path">
            {PATH.map((p) => (
              <li key={p.t} className={p.s}>
                <span>{p.s === "done" ? "✓" : p.s === "now" ? "●" : "○"}</span>
                {p.t}
              </li>
            ))}
          </ol>
          <Button href={gate("/learn")} variant="secondary">Открыть карту</Button>
        </div>
        <div className="land-faq">
          {FAQ.map((item) => (
            <details key={item.q} className="land-card">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <PageTurn id="program" />
    </div>
  );
}
