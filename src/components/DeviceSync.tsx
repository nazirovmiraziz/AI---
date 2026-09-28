"use client";

import { useEffect } from "react";

function viewportWidth() {
  const inner = window.innerWidth || 0;
  const client = document.documentElement.clientWidth || 0;
  const visual = Math.round(window.visualViewport?.width ?? inner);
  const framed = window.parent !== window;
  if (framed) return Math.round(inner || visual || client);
  return Math.round(Math.max(inner, client, visual));
}

function measure() {
  const width = Math.max(1, viewportWidth());
  const root = document.documentElement;
  root.style.setProperty("--app-width", `${width}px`);
  root.classList.toggle("device-phone", width < 768);
  root.classList.toggle("device-tablet", width >= 768 && width < 1180);
  root.classList.toggle("device-laptop", width >= 768);
  root.classList.toggle("device-wide", width >= 1180);
}

export function DeviceSync() {
  useEffect(() => {
    measure();
    const onChange = () => measure();
    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);
    window.visualViewport?.addEventListener("resize", onChange);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
      window.visualViewport?.removeEventListener("resize", onChange);
    };
  }, []);
  return null;
}
