const SPARKS = [
  { t: "π", x: "8%", y: "18%" },
  { t: "AI", x: "86%", y: "14%" },
  { t: "x", x: "78%", y: "62%" },
  { t: "Ω", x: "12%", y: "68%" },
  { t: "Σ", x: "48%", y: "8%" },
  { t: "√", x: "92%", y: "40%" },
];

export function SparkField() {
  return (
    <div className="spark-field" aria-hidden>
      {SPARKS.map((s) => (
        <span key={s.t} className="spark-chip" style={{ left: s.x, top: s.y }}>
          {s.t}
        </span>
      ))}
      <span className="spark-dot d1" />
      <span className="spark-dot d2" />
      <span className="spark-dot d3" />
    </div>
  );
}
