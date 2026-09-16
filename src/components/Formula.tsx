"use client";

import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export function Formula({ latex, display = false }: { latex: string; display?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, { throwOnError: false, displayMode: display });
    } catch {
      if (ref.current) ref.current.textContent = latex;
    }
  }, [latex, display]);
  return <span ref={ref} className="text-[1.05em]" />;
}
