"use client";

import { useEffect, type RefObject } from "react";

const FIELD = ".gpt-composer";

export function useChatViewport(feedRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = document.documentElement;
    const vv = window.visualViewport;
    let raf = 0;
    let baseline = 0;
    let baseWidth = 0;
    let kbWasOpen = false;

    const inComposer = (el: EventTarget | null) => el instanceof Element && !!el.closest(FIELD);
    const isField = (el: EventTarget | null) =>
      inComposer(el) && el instanceof HTMLElement && (el.tagName === "TEXTAREA" || el.tagName === "INPUT");

    const toBottom = () => {
      const feed = feedRef.current;
      if (feed) feed.scrollTop = feed.scrollHeight;
    };

    const apply = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const width = Math.round(vv?.width ?? window.innerWidth);
        const height = Math.round(vv?.height ?? window.innerHeight);
        const top = Math.max(0, Math.round(vv?.offsetTop ?? 0));
        if (width !== baseWidth) {
          baseWidth = width;
          baseline = 0;
        }
        baseline = Math.max(baseline, height, root.classList.contains("chat-typing") ? 0 : window.innerHeight);
        const kbOpen = baseline - height > 120;
        root.style.setProperty("--chat-vh", `${height}px`);
        root.style.setProperty("--chat-top", `${top}px`);
        const dock = document.querySelector<HTMLElement>(".app-dock");
        if (dock && dock.offsetHeight > 0) root.style.setProperty("--chat-dock", `${dock.offsetHeight}px`);
        root.classList.toggle("chat-kb", kbOpen);
        if (kbWasOpen && !kbOpen && isField(document.activeElement)) root.classList.remove("chat-typing");
        kbWasOpen = kbOpen;
        if (root.classList.contains("chat-typing")) toBottom();
      });
    };

    const startTyping = () => {
      root.classList.add("chat-typing");
      apply();
      window.setTimeout(apply, 250);
      window.setTimeout(apply, 600);
    };
    const onIn = (e: FocusEvent) => {
      if (isField(e.target)) startTyping();
    };
    const onOut = (e: FocusEvent) => {
      if (!inComposer(e.target) || inComposer(e.relatedTarget)) return;
      root.classList.remove("chat-typing");
      apply();
    };
    const onTap = (e: PointerEvent) => {
      if (isField(e.target) && document.activeElement === e.target && !root.classList.contains("chat-typing")) startTyping();
    };

    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    document.addEventListener("pointerdown", onTap);
    if (isField(document.activeElement)) root.classList.add("chat-typing");
    apply();

    return () => {
      cancelAnimationFrame(raf);
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
      document.removeEventListener("pointerdown", onTap);
      root.classList.remove("chat-typing", "chat-kb");
      root.style.removeProperty("--chat-vh");
      root.style.removeProperty("--chat-top");
      root.style.removeProperty("--chat-dock");
    };
  }, [feedRef]);
}
