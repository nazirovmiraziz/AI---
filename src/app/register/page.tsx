"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { ShaderCanvas } from "@/components/ShaderCanvas";
import { useApp } from "@/lib/store";

export default function RegisterPage() {
  const { register, hydrated, user } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("9");
  const [country, setCountry] = useState("TJ");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (hydrated && user) router.replace("/dashboard");
  }, [hydrated, user, router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setErr("Введите имя — репетитор будет обращаться к тебе так, как в аккаунте.");
      return;
    }
    if (password.length < 4) {
      setErr("Пароль слишком короткий.");
      return;
    }
    if (!register({ name, email, password, grade, country })) {
      setErr("Этот адрес уже используется.");
      return;
    }
    router.push("/diagnostic");
  }

  return (
    <div className="relative min-h-screen bg-[#07080c] text-[#f3f1ea] grid lg:grid-cols-2">
      <ShaderCanvas />
      <div className="relative z-10 hidden lg:flex flex-col justify-between p-12">
        <Logo inverted />
        <div>
          <p className="font-serif italic text-5xl leading-tight max-w-md">
            {name.trim() ? `${name.trim()}, школа запомнит твоё имя.` : "Создай свою версию школы за минуту."}
          </p>
          <p className="text-white/50 mt-5 max-w-sm">Имя берётся из аккаунта. Репетитор будет обращаться к тебе лично.</p>
        </div>
        <p className="text-white/30 text-sm">6 языков · адаптивные тесты · экзамен</p>
      </div>
      <div className="relative z-10 flex items-center justify-center p-6 py-16">
        <div className="w-full max-w-md rounded-[2rem] panel p-8">
          <div className="lg:hidden mb-6">
            <Logo inverted />
          </div>
          <h1 className="font-serif text-4xl">Создать аккаунт</h1>
          <form onSubmit={onSubmit} className="mt-7 space-y-3" style={{ colorScheme: "dark" }}>
            <label className="block text-sm text-white/70">
              Имя
              <input required className="auth-field" placeholder="Как тебя зовут" value={name} onChange={(e) => setName(e.target.value)} style={{ animationDelay: "40ms" }} />
            </label>
            <label className="block text-sm text-white/70">
              Электронная почта
              <input required type="email" className="auth-field" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ animationDelay: "90ms" }} />
            </label>
            <label className="block text-sm text-white/70">
              Пароль
              <input required type="password" className="auth-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ animationDelay: "140ms" }} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-white/70">
                Класс
                <select className="auth-field" value={grade} onChange={(e) => setGrade(e.target.value)} style={{ animationDelay: "190ms" }}>
                  {Array.from({ length: 7 }, (_, i) => i + 5).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-white/70">
                Страна
                <select className="auth-field" value={country} onChange={(e) => setCountry(e.target.value)} style={{ animationDelay: "240ms" }}>
                  <option value="TJ">Таджикистан</option>
                  <option value="RU">Россия</option>
                  <option value="US">США</option>
                  <option value="CN">Китай</option>
                  <option value="KR">Корея</option>
                  <option value="SA">Саудовская Аравия</option>
                </select>
              </label>
            </div>
            {err && <p className="text-sm text-red-400">{err}</p>}
            <Button type="submit" variant="glow" className="w-full" disabled={!hydrated}>
              Начать обучение
            </Button>
          </form>
          <p className="text-sm text-white/40 mt-5">
            Уже есть аккаунт?{" "}
            <Link className="text-gold-400" href="/login">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
