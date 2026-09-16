import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef0ff",
          100: "#dfe4ff",
          200: "#c4cbff",
          300: "#a0abff",
          400: "#7b88ff",
          500: "#5b6eff",
          600: "#3d4fd8",
          700: "#3140b3",
          800: "#2a378f",
          900: "#1c255c",
          950: "#10143a",
        },
        ink: {
          50: "#f6f5f1",
          100: "#eceae3",
          200: "#d8d5cc",
          300: "#b8b4a9",
          400: "#8e8b82",
          500: "#6c6972",
          600: "#4e5160",
          700: "#3a3d4a",
          800: "#22242e",
          900: "#12141c",
          950: "#08090d",
        },
        gold: {
          400: "#e0c48a",
          500: "#d4b483",
          600: "#b8945a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,18,24,0.04), 0 18px 40px rgba(16,18,24,0.06)",
        lift: "0 20px 60px rgba(16,18,24,0.14)",
        glow: "0 0 0 1px rgba(91,110,255,0.25), 0 18px 50px rgba(61,79,216,0.22)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
        xpPop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "40%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both",
        pulseSoft: "pulseSoft 1.4s ease-in-out infinite",
        xpPop: "xpPop 0.55s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
