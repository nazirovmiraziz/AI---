"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { ShaderCanvas } from "@/components/ShaderCanvas";
import { useApp } from "@/lib/store";

function AuthShell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  const { displayName } = useApp();
  return (
    <div className="relative min-h-screen bg-[#05060b] text-[#f3f1ea] grid lg:grid-cols-2">
      <ShaderCanvas />
      <div className="relative z-10 hidden lg:flex flex-col justify-between p-12">
        <Logo inverted />
        <div>
          <p className="font-serif italic text-5xl leading-tight max-w-md">
            {displayName ? `${displayName}, школа уже знает тебя.` : "Школа, которая узнаёт тебя с первого вопроса."}
          </p>
          <p className="text-white/50 mt-5 max-w-sm">Имя берётся из аккаунта. Репетитор обращается к тебе лично.</p>
        </div>
        <p className="text-white/30 text-sm">{displayName ? `Аккаунт · ${displayName}` : "Создай аккаунт — и тебя будут называть по имени."}</p>
      </div>
      <div className="relative z-10 flex items-center justify-center p-6 py-16">
        <div className="w-full max-w-md rounded-[2rem] panel p-8">
          <div className="lg:hidden mb-6">
            <Logo inverted />
          </div>
          <h1 className="font-serif text-4xl">{title}</h1>
          <p className="text-white/50 text-sm mt-2">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login, loginLast, lastUserEmail, displayName, hydrated, user } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (hydrated && user) router.replace("/dashboard");
  }, [hydrated, user, router]);

  useEffect(() => {
    if (lastUserEmail) setEmail(lastUserEmail);
  }, [lastUserEmail]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!login(email, password)) {
      setErr("Неверные данные. Проверьте почту и пароль.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <AuthShell title="Войти" sub={displayName ? `С возвращением, ${displayName}.` : "Продолжить обучение в своей школе."}>
      {displayName && (
        <Button
          variant="glow"
          className="w-full mt-6"
          onClick={() => {
            if (loginLast()) router.push("/dashboard");
            else setErr("Войдите почтой и паролем.");
          }}
        >
          Продолжить как {displayName}
        </Button>
      )}
      <form onSubmit={onSubmit} className="mt-6 space-y-3" style={{ colorScheme: "dark" }}>
        <label className="block text-sm text-white/70">
          Электронная почта
          <input className="auth-field" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ animationDelay: "40ms" }} />
        </label>
        <label className="block text-sm text-white/70">
          Пароль
          <input type="password" className="auth-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ animationDelay: "90ms" }} />
        </label>
        {err && <p className="text-sm text-red-400">{err}</p>}
        <Button type="submit" variant="glow" className="w-full" disabled={!hydrated}>
          Войти
        </Button>
      </form>
      <p className="text-sm text-white/40 mt-5">
        Нет аккаунта?{" "}
        <Link className="text-gold-400" href="/register">
          Создать аккаунт
        </Link>
      </p>
    </AuthShell>
  );
}
