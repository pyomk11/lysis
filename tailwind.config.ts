import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // rgb(var(--xx)) 형식 — CSS 변수 다크모드와 완벽 호환
        bg:            "rgb(var(--bg))",
        "bg-soft":     "rgb(var(--bg-soft))",
        ink:           "rgb(var(--ink))",
        "ink-soft":    "rgb(var(--ink-soft))",
        accent:        "rgb(var(--accent))",
        "accent-soft": "rgb(var(--accent-soft))",
        line:          "rgb(var(--line))",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        lg: "24px",
        md: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
