"use client";

import { Globe, Laptop, Smartphone, Wifi, Zap, Bell } from "lucide-react";
import { InstallApp } from "@/components/InstallApp";
import { PageHero } from "@/components/PageHero";
import { PageTurn } from "@/components/PageTurn";
import { Reveal } from "@/components/Reveal";
import { SpotlightCard } from "@/components/SpotlightCard";

const WAYS = [
  { icon: Globe, t: "Android", steps: ["Открой сайт в Chrome", "Меню ⋮", "«Добавить на главный экран»"] },
  { icon: Smartphone, t: "iPhone", steps: ["Открой сайт в Safari", "Кнопка «Поделиться»", "«На экран Домой»"] },
  { icon: Laptop, t: "Компьютер", steps: ["Chrome или Edge", "Значок установки в адресной строке", "«Установить»"] },
];

const PLUS = [
  { icon: Zap, t: "Открывается сразу", d: "Иконка на экране — без поиска вкладки." },
  { icon: Wifi, t: "Тот же аккаунт", d: "Прогресс общий с сайтом." },
  { icon: Bell, t: "Без магазина", d: "Ничего не скачивать и не обновлять вручную." },
];

function PhoneMock() {
  return (
    <div className="phone-mock" aria-hidden>
      <div className="phone-mock-screen">
        <span className="phone-mock-notch" />
        <p className="phone-mock-time">9:41</p>
        <div className="phone-mock-grid">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="phone-mock-app" />
          ))}
          <span className="phone-mock-app is-ours">
            <img src="/logo-mark.svg" alt="" />
          </span>
        </div>
        <p className="phone-mock-label">Micro AI School</p>
        <div className="phone-mock-dock">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export function InstallLanding() {
  return (
    <div className="land land-v2 install-page">
      <PageHero
        chip="На телефон"
        words={["Школа", "всегда", { t: "с тобой", grad: true }]}
        lead="Поставь на экран Домой. Это тот же сайт — без магазина приложений."
        stage={<PhoneMock />}
      >
        <div className="install-cta v2-glass">
          <InstallApp compact />
        </div>
      </PageHero>

      <section className="v2-sec">
        <Reveal>
          <p className="land-eye">Три шага</p>
          <h2 className="display-h2">
            Меньше минуты. <span className="grad-text">На любом устройстве.</span>
          </h2>
        </Reveal>
        <div className="bento v2-bento3">
          {WAYS.map((w, i) => {
            const Icon = w.icon;
            return (
              <Reveal key={w.t} delay={i * 90}>
                <SpotlightCard className="bento-card">
                  <span className="bento-orb">
                    <Icon size={20} aria-hidden />
                  </span>
                  <h3>{w.t}</h3>
                  <ol className="v2-steps">
                    {w.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="v2-plus">
        {PLUS.map((p, i) => {
          const Icon = p.icon;
          return (
            <Reveal key={p.t} delay={i * 80}>
              <div className="v2-plus-item">
                <Icon size={18} aria-hidden />
                <div>
                  <b>{p.t}</b>
                  <p>{p.d}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </section>

      <PageTurn id="install" />
    </div>
  );
}
