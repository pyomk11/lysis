import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FBF9F6",
        "bg-soft": "#F4EFE8",
        ink: "#2B2B2B",
        "ink-soft": "#6B6863",
        accent: "#E8834B",
        "accent-soft": "#FBE4D4",
        line: "#E8E2D8",
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
