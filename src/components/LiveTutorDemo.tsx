"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { KnowledgeFlow } from "@/components/KnowledgeFlow";

const SEEDS = [
  "Объясни квадратные уравнения",
  "Что такое Present Simple?",
  "Помоги начать F = ma",
];

export function LiveTutorDemo() {
  const [q, setQ] = useState(SEEDS[0]);
  const [a, setA] = useState("");
  const [phase, setPhase] = useState<"idle" | "think" | "done" | "error">("idle");
  const [offline, setOffline] = useState(false);

  async function ask(e?: FormEvent) {
    e?.preventDefault();
    const text = q.trim();
    if (!text) return;
    setPhase("think");
    setA("");
    setOffline(false);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
          lessonLanguage: "ru",
          style: "simple",
          hintOnly: true,
          mode: "chat",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.demo && !data.content) {
        setOffline(true);
        setA("Сейчас репетитор в локальном режиме. После входа в кабинет урок будет полным.");
        setPhase("done");
        return;
      }
      const reply = String(data.content || data.message || "").trim();
      if (!res.ok || !reply) {
        setPhase("error");
        setA(reply || "Репетитор временно недоступен. Попробуй ещё раз.");
        return;
      }
      setA(reply);
      setPhase("done");
    } catch {
      setPhase("error");
      setA("Нет сети. Проверь соединение и нажми ещё раз.");
    }
  }

  return (
    <div className="live-demo">
      <div className="live-demo-copy">
        <p className="land-eye">Живой демо-урок</p>
        <h2>Спроси. Посмотри, как думает. Получи первый шаг.</h2>
        <p className="land-sub">Это настоящий API репетитора, не картинка. Сначала ход, не готовый ответ.</p>
        <form onSubmit={ask} className="live-demo-form">
          <label className="sr-only" htmlFor="live-q">Вопрос репетитору</label>
          <input
            id="live-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Напиши школьный вопрос"
          />
          <Button type="submit" disabled={phase === "think"}>
            {phase === "think" ? "Думаю" : "Спросить"} <ArrowRight size={16} aria-hidden />
          </Button>
        </form>
        <div className="live-demo-seeds">
          {SEEDS.map((s) => (
            <button key={s} type="button" onClick={() => setQ(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="live-demo-stage">
        <KnowledgeFlow size="md" mood={phase === "think" ? "think" : phase === "error" ? "error" : phase === "done" ? "speak" : "idle"} />
        <div className="live-demo-thread" aria-live="polite">
          <p className="me"><span>Ты</span>{q}</p>
          <p className={`bot ${phase}`}>
            <span>
              <Sparkles size={12} aria-hidden /> Репетитор
            </span>
            {phase === "idle" && "Напиши вопрос. Первый ответ — шаг, не свалка формул."}
            {phase === "think" && (
              <>
                Читаю вопрос…
                <i className="ai-think" />
              </>
            )}
            {(phase === "done" || phase === "error") && a}
          </p>
          {offline && <p className="note">Честный fallback: живая модель на этом запросе не ответила.</p>}
          {phase === "error" && (
            <Button variant="secondary" onClick={() => ask()}>Ещё раз</Button>
          )}
        </div>
      </div>
    </div>
  );
}
