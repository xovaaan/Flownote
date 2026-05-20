import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        granola: {
          50: "#faf9f7", 100: "#f3f1ed", 200: "#e8e4dc", 300: "#d6cfc3",
          400: "#c0b5a3", 500: "#a89982", 600: "#8c7d68", 700: "#726553",
          800: "#5e5446", 900: "#4f473c", 950: "#2b2520",
        },
        ink: {
          50: "#f6f6f6", 100: "#e7e7e7", 200: "#d1d1d1", 300: "#b0b0b0",
          400: "#888888", 500: "#6d6d6d", 600: "#5d5d5d", 700: "#4f4f4f",
          800: "#454545", 900: "#3d3d3d", 950: "#1a1a1a",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["SF Mono", "Monaco", "Inconsolata", "monospace"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
