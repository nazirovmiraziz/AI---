export type VisualQuality = "high" | "medium" | "low" | "reduced";

export function detectVisualQuality(): VisualQuality {
  if (typeof window === "undefined") return "medium";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 767px)").matches;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (narrow || coarse) return "low";
  if (cores <= 4 || (typeof mem === "number" && mem <= 4)) return "medium";
  return "high";
}
