"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, Brain, FileQuestion, GraduationCap, MessageCircle, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { SUBJECTS } from "@/lib/subjects";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { levelFromXp } from "@/lib/demo-data";

export default function DashboardPage() {
  const { user, addConversation, demoMode } = useApp();
  const router = useRouter();
  const [q, setQ] = useState("");
  const loc = user?.language ?? "ru";
  const lv = levelFromXp(user?.xp ?? 0);

  const rec = useMemo(
    () => ({
      title: t(loc, "topic.discriminant"),
      minutes: 12,
      why: t(loc, "welcome.why"),
    }),
    [loc]
  );

  function goTutor(prompt?: string) {
    const id = addConversation({ title: prompt?.slice(0, 40) || "Новый диалог" });
    if (prompt) sessionStorage.setItem("ssai-seed", prompt);
    router.push(`/tutor?c=${id}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    goTutor(q.trim());
  }

  const quick = [
    { icon: Camera, key: "quick.photo", href: "/photo" },
    { icon: Brain, key: "quick.check", href: "/tests" },
    { icon: FileQuestion, key: "quick.test", href: "/tests?create=1" },
    { icon: GraduationCap, key: "quick.exam", href: "/exam" },
    { icon: MessageCircle, key: "quick.ask", action: () => goTutor() },
  ];

  return (
    <div className="space-y-8 pb-16">
      {demoMode && (
        <div className="rounded-2xl border border-gold-400/30 bg-gold-400/10 px-4 py-3 text-sm text-gold-400 fly-in">
          {t(loc, "demo.banner")}
        </div>
      )}

      <section className="dash-hero fly-in">
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold-400">
          {t(loc, "welcome")}, {user?.name}
        </p>
        <h1 className="font-serif italic text-4xl md:text-5xl mt-2 home-shine">
          {user?.lastStudy
            ? `Недавно: ${t(loc, `topic.${user.lastStudy.topic}`)}.`
            : `${user?.name}, начнём с того, что сейчас важнее.`}
        </h1>
        <div className="title-underline mt-4" />
        <div className="mt-6 flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">{t(loc, "welcome.today")}</div>
            <div className="font-display text-2xl mt-1">
              {rec.title} · {rec.minutes} {t(loc, "minutes.short")}
            </div>
            <p className="text-sm text-white/50 mt-2">{rec.why}</p>
          </div>
          <Button variant="glow" className="cta-pulse" onClick={() => goTutor("Объясни дискриминант простыми словами")}>
            <Sparkles size={16} /> {t(loc, "cta.learn")}
          </Button>
        </div>
      </section>

      {user?.continueLesson && (
        <section className="tpl-card" style={{ animationDelay: "80ms" }}>
          <div className="text-[11px] uppercase tracking-[0.18em] text-gold-400/80">{t(loc, "continue.title")}</div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
            <div className="flex-1">
              <h2 className="font-serif italic text-2xl">{t(loc, `topic.${user.continueLesson.topicId}`)}</h2>
              <p className="text-sm text-white/45 mt-1">
                {t(loc, "continue.last")}: {user.continueLesson.progress}%
              </p>
              <ProgressBar value={user.continueLesson.progress} className="mt-3 max-w-md" />
            </div>
            <Link href={`/lesson/${user.continueLesson.topicId}`}>
              <Button variant="light">{t(loc, "cta.continue")} →</Button>
            </Link>
          </div>
        </section>
      )}

      <section className="text-center pt-2 fly-in" style={{ animationDelay: "120ms" }}>
        <h2 className="font-serif italic text-4xl md:text-5xl">{t(loc, "hero.q")}</h2>
        <p className="text-white/50 mt-3">{t(loc, "hero.hint")}</p>
        <form onSubmit={onSubmit} className="mt-7 max-w-3xl mx-auto">
          <div className="dash-ask flex flex-col md:flex-row gap-2 p-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t(loc, "hero.ph")}
              className="flex-1 rounded-2xl px-4 py-4 bg-transparent outline-none text-base md:text-lg text-white placeholder:text-white/35"
            />
            <Button type="submit" variant="glow" className="md:px-6">
              <Sparkles size={16} /> {t(loc, "cta.explain")}
            </Button>
          </div>
        </form>
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {quick.map((item) => {
            const Icon = item.icon;
            const inner = (
              <span className="dash-quick">
                <Icon size={15} /> {t(loc, item.key)}
              </span>
            );
            return item.href ? (
              <Link key={item.key} href={item.href}>
                {inner}
              </Link>
            ) : (
              <button key={item.key} onClick={item.action}>
                {inner}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-serif italic text-2xl">{t(loc, "popular")}</h2>
          <Link href="/templates" className="text-sm text-gold-400 hover:text-white transition-colors">
            Шаблоны →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SUBJECTS.slice(0, 8).map((s, i) => (
            <Link key={s.id} href={`/subjects/${s.id}`} className="tpl-card !p-4" style={{ animationDelay: `${100 + i * 50}ms` }}>
              <div className="text-[11px] uppercase tracking-wider text-white/40">{t(loc, `cat.${s.category}`)}</div>
              <div className="font-medium mt-1">{t(loc, `subject.${s.id}`)}</div>
              <ProgressBar value={user?.subjectLevels[s.id] ?? 40} className="mt-3" />
            </Link>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="tpl-card">
          <h3 className="font-serif italic text-xl">{t(loc, "level.title")}</h3>
          <div className="mt-4 space-y-3">
            {["math", "physics", "chemistry", "english"].map((id) => (
              <div key={id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t(loc, `subject.${id}`)}</span>
                  <span className="text-gold-400">{user?.subjectLevels[id] ?? 0}%</span>
                </div>
                <ProgressBar value={user?.subjectLevels[id] ?? 0} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/70">
            Рекомендуем повторить: <strong className="text-gold-400">{t(loc, "topic.discriminant")}</strong>
          </p>
          <p className="text-xs text-white/40 mt-3">
            {t(loc, lv.current.nameKey)} · {user?.xp.toLocaleString("ru-RU")} XP
            {lv.next ? ` · ${t(loc, "level.to")} «${t(loc, lv.next.nameKey)}» ${t(loc, "level.left")} ${lv.remaining} XP` : ""}
          </p>
        </div>
        <div className="tpl-card">
          <h3 className="font-serif italic text-xl">{t(loc, "today.review")}</h3>
          <ul className="mt-4 space-y-2">
            {(user?.weakTopics ?? []).slice(0, 3).map((id) => (
              <li key={id}>
                <Link href={`/lesson/${id}`} className="block rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                  {t(loc, `topic.${id}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
