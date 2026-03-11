import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0D0D1A",
          surface: "#111124",
          elevated: "#1a1a2e",
        },
        text: {
          primary: "#E0E0E0",
          secondary: "#888888",
          muted: "#555555",
          dark: "#333333",
        },
        accent: {
          jantile: "#00E5A0",
          velora: "#FF6B6B",
          hustleflow: "#FFD93D",
          focustack: "#7B68EE",
          reelai: "#FF69B4",
          mnqbot: "#4ECDC4",
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
