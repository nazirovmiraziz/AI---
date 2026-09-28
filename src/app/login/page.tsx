"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { AmbientField } from "@/components/AmbientField";
import { KnowledgeFlow } from "@/components/KnowledgeFlow";
import { peekLastLogin, peekSession, useApp } from "@/lib/store";
import { DEMO_EMAIL } from "@/lib/demo-data";
import { PasswordField } from "@/components/PasswordField";

function AuthShell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="force-light relative min-h-svh min-w-0 overflow-x-clip grid lg:grid-cols-2 bg-[#f8fbff] text-[#121826]">
      <AmbientField />
      <div className="relative z-10 hidden lg:flex flex-col justify-between p-12">
        <Logo inverted={false} />
        <div className="max-w-md">
          <p className="text-4xl xl:text-5xl font-semibold leading-[1.2]">Войди в свой кабинет.</p>
          <p className="text-[var(--muted)] mt-5">Если аккаунта ещё нет — создай его сам. Чужое имя здесь не появится.</p>
          <div className="mt-10">
            <KnowledgeFlow size="md" />
          </div>
        </div>
        <p className="text-[var(--muted)] text-sm">Micro AI School</p>
      </div>
      <div className="relative z-10 flex items-center justify-center p-4 py-6 sm:py-12">
        <div className="lift-card w-full max-w-md rounded-[1.4rem] p-5 sm:p-8">
          <div className="lg:hidden mb-4">
            <Logo inverted={false} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold">{title}</h1>
          <p className="text-[var(--muted)] text-sm mt-2">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login, loginCloud, loginLast, loginDemo, lastUserEmail, displayName, hydrated, user } = useApp();
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

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
    const remembered = peekLastLogin();
    if (remembered) {
      setEmail(remembered.email);
      setPassword(remembered.password);
      return;
    }
    if (lastUserEmail) setEmail(lastUserEmail);
  }, [lastUserEmail, hydrated]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const mail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setErr("Введи нормальный email.");
      return;
    }
    if (password.length < 4) {
      setErr("Введи пароль.");
      return;
    }
    const go = () => {
      const next = sessionStorage.getItem("ssai-after-auth") || "/dashboard";
      sessionStorage.removeItem("ssai-after-auth");
      router.push(next);
    };
    if (login(mail, password)) {
      go();
      return;
    }
    setErr("");
    setBusy(true);
    const ok = await loginCloud(mail, password);
    setBusy(false);
    if (ok) go();
    else setErr("Неверные данные. Проверь почту и пароль.");
  }

  return (
    <AuthShell
      title="Вход"
      sub={displayName ? `С возвращением, ${displayName}.` : "Войди в аккаунт, который создал сам."}
    >
      <div className="mt-5 flex flex-col gap-2">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            loginDemo();
            router.push("/dashboard");
          }}
        >
          Открыть демо учителя
        </Button>
        {displayName && (
          <Button
            className="w-full"
            onClick={() => {
              if (loginLast()) router.push("/dashboard");
              else setErr("Войди по почте и паролю.");
            }}
          >
            Продолжить как {displayName}
          </Button>
        )}
      </div>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-3">
        <label className="block text-sm">
          Почта
          <input type="email" autoComplete="email" className="auth-field" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button type="submit" className="w-full" disabled={!hydrated || busy}>
          {busy ? "Ищем аккаунт…" : "Войти"}
        </Button>
      </form>
      <p className="text-sm text-[var(--muted)] mt-5">
        Нет аккаунта?{" "}
        <Link className="text-brand-700 font-medium" href="/register">
          Создать
        </Link>
      </p>
    </AuthShell>
  );
}
