import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef1f7",
          100: "#dce3f0",
          200: "#b7c4dc",
          300: "#8798c0",
          400: "#4d6496",
          500: "#163068",
          600: "#132a5c",
          700: "#0d1f4a",
          800: "#0a1838",
          900: "#071228",
          950: "#040a18",
        },
        ink: {
          50: "#f4f3ef",
          100: "#e8e6df",
          200: "#d4d0c4",
          300: "#b3ad9e",
          400: "#9299a8",
          500: "#6d7384",
          600: "#525866",
          700: "#3c424e",
          800: "#12151c",
          900: "#090b10",
          950: "#05070b",
        },
        gold: {
          400: "#35d6b4",
          500: "#163068",
          600: "#0d1f4a",
        },
      },
      fontFamily: {
        sans: ["Segoe UI", "Tahoma", "Arial", "var(--font-sans)", "sans-serif"],
        display: ["Segoe UI", "Tahoma", "Arial", "var(--font-sans)", "sans-serif"],
        serif: ["Segoe UI", "Tahoma", "Arial", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 18px 50px rgba(18, 24, 38, 0.08)",
        lift: "0 28px 70px rgba(18, 24, 38, 0.12)",
        glow: "0 0 0 1px rgba(13, 31, 74, 0.18), 0 16px 40px rgba(13, 31, 74, 0.16)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        xpPop: {
          "0%": { transform: "scale(0.92)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both",
        pulseSoft: "pulseSoft 1.4s ease-in-out infinite",
        xpPop: "xpPop 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
