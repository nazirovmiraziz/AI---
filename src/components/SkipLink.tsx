"use client";

export function SkipLink() {
  return (
    <a
      href="#content"
      className="skip-link"
      onFocus={() => {
        document.documentElement.style.removeProperty("transform");
      }}
      onClick={(e) => {
        const el = document.getElementById("content");
        if (!el) return;
        e.preventDefault();
        el.focus({ preventScroll: true });
      }}
    >
      К содержанию
    </a>
  );
}
