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
        studio: {
          bg: "#0F172A",
          card: "#1E293B",
          cardHover: "#283548",
          fretboard: "#161F2E",
          woodgrain: "#111827",
          lines: "#94A3B8",
          nut: "#CBD5E1",
          amber: "#F59E0B",
          amberGlow: "rgba(245, 158, 11, 0.4)",
          amberHover: "#FBBF24",
          gold: "#EAB308",
          text: "#FFFFFF",
          muted: "#64748B",
          subtle: "#334155"
        }
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        "glow-amber": "0 0 20px -2px rgba(245, 158, 11, 0.5)",
        "glow-amber-lg": "0 0 35px -3px rgba(245, 158, 11, 0.6)",
        "studio-panel": "0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)",
      }
    },
  },
  plugins: [],
};

export default config;
