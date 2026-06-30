import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-strong": "rgb(var(--surface-strong) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        teal: {
          50: "#effcf8",
          100: "#d6f7ee",
          600: "#0d8f77",
          700: "#087361"
        },
        ember: {
          50: "#fff6e5",
          100: "#ffe7b8",
          500: "#d97706"
        },
        signal: {
          hot: "#b42318",
          warm: "#b54708",
          cold: "#175cd3"
        }
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        soft: "var(--shadow-soft)",
        "soft-sm": "var(--shadow-soft-sm)",
        inset: "var(--shadow-inset)",
        button: "var(--shadow-button)",
        pressed: "var(--shadow-pressed)"
      }
    }
  },
  plugins: []
};

export default config;
