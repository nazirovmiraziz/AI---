"use client";

export function OrbitHero({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`hero-stage relative mx-auto ${compact ? "h-[250px] w-[250px] sm:h-[340px] sm:w-[340px]" : "h-[340px] w-[340px] sm:h-[420px] sm:w-[420px]"}`}>
      <div className="hero-halo" />
      <div className="hero-ring spin-slow" />
      <div className="hero-ring dashed spin-reverse" />
      <div className="hero-orbit o1">
        <span className="gold" />
      </div>
      <div className="hero-orbit o2">
        <span />
      </div>
      <div className="hero-orbit o3">
        <span className="gold" />
      </div>
      <span className="hero-chip c1">π</span>
      <span className="hero-chip c2">AI</span>
      <span className="hero-chip c3">Σ</span>
      <span className="hero-chip c4">中</span>
      <div className="hero-mark">
        <img src="/logo-mark.png" alt="SMART SCHOOL AI" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  return (
    <span>
      {to}
      {suffix}
    </span>
  );
}
