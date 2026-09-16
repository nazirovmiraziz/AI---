"use client";

const FLOATS = [
  { left: "8%", delay: "0s", size: 7, gold: false },
  { left: "22%", delay: "1.4s", size: 4, gold: true },
  { left: "38%", delay: "0.6s", size: 6, gold: false },
  { left: "55%", delay: "2.1s", size: 5, gold: true },
  { left: "71%", delay: "0.9s", size: 8, gold: false },
  { left: "86%", delay: "1.8s", size: 4, gold: true },
];

function Wave({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden>
      <path
        fill="currentColor"
        d="M0,72 C180,132 360,12 540,72 C720,132 900,22 1080,78 C1260,134 1350,48 1440,80 L1440,140 L0,140 Z"
      />
    </svg>
  );
}

export function SiteAtmosphere() {
  return (
    <div className="site-sea" aria-hidden>
      {FLOATS.map((f) => (
        <span
          key={f.left}
          className={`site-bubble ${f.gold ? "gold" : ""}`}
          style={{
            left: f.left,
            width: f.size,
            height: f.size,
            animationDelay: f.delay,
          }}
        />
      ))}
      <Wave className="site-wave wave-a" />
      <Wave className="site-wave wave-b" />
      <Wave className="site-wave wave-c" />
    </div>
  );
}
