"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { AmbientField } from "@/components/AmbientField";
import { peekSession, useApp } from "@/lib/store";
import { DEMO_EMAIL } from "@/lib/demo-data";
import { SUBJECTS } from "@/lib/subjects";
import { LOCALES, t } from "@/lib/i18n";
import { buildStarterPlan } from "@/lib/learning";
import { PasswordField } from "@/components/PasswordField";
import type { Locale } from "@/lib/types";

const STEPS = ["Имя", "Класс", "Предметы", "Язык", "Уровень", "Время", "Аккаунт", "План"];
const TIMES = [5, 10, 20, 30] as const;
const LEVELS = [
  { id: 15, label: "С нуля", hint: "Нужно объяснять базу." },
  { id: 40, label: "Середина", hint: "Что-то знаю, путаю детали." },
  { id: 70, label: "Уверенно", hint: "Хочу сложнее и к экзамену." },
] as const;

export default function RegisterPage() {
  const { register, loginLast, hydrated, user, setPlan } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("9");
  const [subjects, setSubjects] = useState<string[]>(["math", "english"]);
  const [lessonLanguage, setLessonLanguage] = useState<Locale>("ru");
  const [startLevel, setStartLevel] = useState(40);
  const [dailyGoalMin, setDailyGoalMin] = useState(20);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("TJ");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!hydrated) return;
    if (user && user.email.toLowerCase() !== DEMO_EMAIL) {
      router.replace("/dashboard");
      return;
    }
    const alive = peekSession();
    if (alive && alive.email.toLowerCase() !== DEMO_EMAIL && loginLast()) router.replace("/dashboard");
  }, [hydrated, user, router, loginLast]);

  useEffect(() => {
    if (step !== 7) return;
    setPhase(0);
    const timers = [500, 1000, 1500, 2000].map((ms, i) => window.setTimeout(() => setPhase(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [step]);

  useEffect(() => {
    if (step === 7 && phase >= 4) finish();
    // finish reads latest form state from this render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phase]);

  function toggleSubject(id: string) {
    setSubjects((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function next(e?: FormEvent) {
    e?.preventDefault();
    setErr("");
    if (step === 0 && name.trim().length < 2) {
      setErr("Напиши имя.");
      return;
    }
    if (step === 2 && subjects.length === 0) {
      setErr("Выбери хотя бы один предмет.");
      return;
    }
    if (step === 6) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErr("Введи нормальный email.");
        return;
      }
      if (password.length < 6) {
        setErr("Пароль не короче 6 символов.");
        return;
      }
      setStep(7);
      setPhase(0);
      return;
    }
    setStep((n) => Math.min(7, n + 1));
  }

  function finish() {
    if (busy) return;
    setBusy(true);
    try {
      const goal = subjects[0] ? `Фокус: ${subjects.map((id) => t("ru", `subject.${id}`)).join(", ")}` : "Понять школьные темы";
      const ok = register({
        name,
        email,
        password,
        grade,
        country,
        favoriteSubjects: subjects,
        dailyGoalMin,
        lessonLanguage,
        goal,
        startLevel,
        onboardingDone: true,
      });
      if (!ok) {
        setBusy(false);
        setStep(6);
        setErr("Эта почта уже занята. Войди или выбери другую.");
        return;
      }
      setPlan(buildStarterPlan({ goal, dailyGoalMin, subjects }));
      const nextUrl = sessionStorage.getItem("ssai-after-auth") || "/dashboard";
      sessionStorage.removeItem("ssai-after-auth");
      router.replace(nextUrl);
    } catch {
      setBusy(false);
      setStep(6);
      setErr("Не получилось создать аккаунт. Проверь данные и попробуй ещё раз.");
    }
  }

  const labels = ["Читаю цель…", "Оцениваю уровень…", "Собираю маршрут…", "План готов."];

  return (
    <div className="force-light relative min-h-svh min-w-0 overflow-x-clip grid lg:grid-cols-2 bg-[#f5f7fb] text-[#121826]">
      <AmbientField />
      <div className="relative z-10 hidden lg:flex flex-col justify-between p-12">
        <Logo inverted={false} />
        <div>
          <p className="text-4xl xl:text-5xl font-semibold leading-[1.2] max-w-md">
            {name.trim() ? `${name.trim()}, соберём твой план.` : "Сначала — зачем ты здесь?"}
          </p>
          <p className="text-[var(--muted)] mt-5 max-w-sm">Короткий мастер. Без длинной анкеты. План появится в кабинете.</p>
        </div>
        <p className="text-[var(--muted)] text-sm">Шаг {Math.min(step + 1, 7)} из 7</p>
      </div>
      <div className="relative z-10 flex items-center justify-center p-4 py-6 sm:py-12">
        <div className="lift-card w-full max-w-md rounded-[1.4rem] p-5 sm:p-8">
          <div className="lg:hidden mb-4">
            <Logo inverted={false} />
          </div>
          <p className="text-xs font-semibold text-[#163068]">{STEPS[step]}</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1">
            {step === 0 && "Как тебя зовут?"}
            {step === 1 && "В каком ты классе?"}
            {step === 2 && "Что хочешь изучать?"}
            {step === 3 && "На каком языке вести урок?"}
            {step === 4 && "Какой у тебя уровень?"}
            {step === 5 && "Сколько времени в день?"}
            {step === 6 && "Создай аккаунт"}
            {step === 7 && "Собираем план"}
          </h1>

          {step === 0 && (
            <form onSubmit={next} className="mt-5 space-y-3">
              <label className="block text-sm">
                Имя
                <input required autoComplete="name" className="auth-field" placeholder="Как к тебе обращаться" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <Button type="submit" className="w-full">Дальше</Button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={next} className="mt-5 space-y-3">
              <label className="block text-sm">
                Класс
                <select className="auth-field" value={grade} onChange={(e) => setGrade(e.target.value)}>
                  {Array.from({ length: 7 }, (_, i) => i + 5).map((g) => (
                    <option key={g} value={g}>{g} класс</option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep(0)}>Назад</Button>
                <Button type="submit" className="flex-1">Дальше</Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`chip-btn ${subjects.includes(s.id) ? "on" : ""}`}
                    onClick={() => toggleSubject(s.id)}
                  >
                    {t("ru", `subject.${s.id}`)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>Назад</Button>
                <Button className="flex-1" onClick={() => next()}>Дальше</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap gap-2">
                {LOCALES.map((l) => (
                  <button key={l.id} type="button" className={`chip-btn ${lessonLanguage === l.id ? "on" : ""}`} onClick={() => setLessonLanguage(l.id)}>
                    {l.flag} {l.native}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>Назад</Button>
                <Button className="flex-1" onClick={() => next()}>Дальше</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="mt-5 space-y-3">
              {LEVELS.map((lv) => (
                <button
                  key={lv.id}
                  type="button"
                  className={`w-full text-start rounded-xl border px-3 py-3 ${startLevel === lv.id ? "border-[#163068] bg-white" : "border-[var(--line)]"}`}
                  onClick={() => setStartLevel(lv.id)}
                >
                  <b className="block">{lv.label}</b>
                  <span className="text-sm text-[var(--muted)]">{lv.hint}</span>
                </button>
              ))}
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep(3)}>Назад</Button>
                <Button className="flex-1" onClick={() => next()}>Дальше</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {TIMES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`min-h-12 rounded-xl border ${dailyGoalMin === m ? "border-[#163068] bg-white" : "border-[var(--line)]"}`}
                    onClick={() => setDailyGoalMin(m)}
                  >
                    {m === 30 ? "30+ мин" : `${m} мин`}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep(4)}>Назад</Button>
                <Button className="flex-1" onClick={() => next()}>Дальше</Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <form onSubmit={next} noValidate className="mt-5 space-y-2.5">
              <label className="block text-sm">
                Почта
                <input required type="email" autoComplete="email" className="auth-field" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <PasswordField value={password} onChange={setPassword} autoComplete="new-password" showStrength />
              <label className="block text-sm">
                Страна
                <select className="auth-field" value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="TJ">Таджикистан</option>
                  <option value="RU">Россия</option>
                  <option value="US">США</option>
                  <option value="CN">Китай</option>
                  <option value="KR">Корея</option>
                  <option value="SA">Саудовская Аравия</option>
                </select>
              </label>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep(5)}>Назад</Button>
                <Button type="submit" className="flex-1" disabled={!hydrated}>Собрать план</Button>
              </div>
            </form>
          )}

          {step === 7 && (
            <div className="mt-6 space-y-3" aria-live="polite">
              {labels.map((line, i) => (
                <p key={line} className={phase > i ? "text-[#0c9b78]" : "text-[var(--muted)]"}>
                  {phase > i ? "✓ " : "… "}
                  {line}
                </p>
              ))}
              {phase >= 4 && (
                <Button className="w-full" onClick={finish} disabled={busy}>
                  Открыть кабинет
                </Button>
              )}
            </div>
          )}

          {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
          <p className="text-sm text-[var(--muted)] mt-5">
            Уже есть аккаунт?{" "}
            <Link className="text-brand-700 font-medium" href="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
