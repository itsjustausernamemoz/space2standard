import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        serif: ["var(--font-cormorant)"],
        display: ["var(--font-playfair)"],
      },
      colors: {
        primary: "#1a1a2e",
        secondary: "#16213e",
        accent: {
          gold: "#c9a84c",
          warm: "#e8d5b7",
        },
        surface: "#0f3460",
        success: "#2ecc71",
        warning: "#f39c12",
        danger: "#e74c3c",
      },
    },
  },
  plugins: [],
};
export default config;
