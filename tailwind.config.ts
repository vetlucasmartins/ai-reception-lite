import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        paper: "#f7f8f6",
        line: "#d9ded8",
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
        panel: "0 18px 50px rgba(24, 33, 47, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
