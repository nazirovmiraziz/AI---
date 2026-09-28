"use client";

import { useEffect } from "react";
import { detectVisualQuality } from "@/lib/visual-quality";

export function VisualQuality() {
  useEffect(() => {
    const q = detectVisualQuality();
    const root = document.documentElement;
    root.dataset.visual = q;
    root.classList.toggle("reduce-motion", q === "reduced");
    root.classList.toggle("visual-low", q === "low");
    root.classList.toggle("visual-medium", q === "medium");
    root.classList.toggle("visual-high", q === "high");
  }, []);
  return null;
}
