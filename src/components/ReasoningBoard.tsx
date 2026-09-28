const STEPS = [
  { n: "1", k: "Условие", v: "3x + 5 = 20" },
  { n: "2", k: "Ход", v: "− 5 с обеих сторон" },
  { n: "3", k: "Стало", v: "3x = 15" },
  { n: "4", k: "Вопрос", v: "что сделает 3x → x?" },
];

export function ReasoningBoard() {
  return (
    <div className="reason-board max-w-full">
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold">Лист мышления</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Математика · линейное уравнение · без готового ответа</p>
        </div>
        <span className="live-dot shrink-0">Live</span>
      </div>
      <div className="relative z-[1] mt-5 space-y-2">
        {STEPS.map((s, i) => (
          <div key={s.k} className="reason-node" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-2">
              <span className="reason-num">{s.n}</span>
              <span className="reason-k">{s.k}</span>
            </div>
            <p className="mt-1.5 text-base sm:text-lg font-medium">{s.v}</p>
          </div>
        ))}
      </div>
      <div className="relative z-[1] mt-5">
        <div className="flex justify-between text-sm text-[var(--muted)] mb-2">
          <span>Понимание</span>
          <span>идёт разбор</span>
        </div>
        <div className="confidence">
          <span style={{ ["--w" as string]: "72%" }} />
        </div>
      </div>
    </div>
  );
}
