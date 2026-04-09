import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0a0b0d",
        steel: "#14181d",
        panel: "#1b2128",
        line: "#2d3742",
        gold: "#b4975a",
        "gold-bright": "#d8bc7a",
        frost: "#f7f8fa",
        mist: "#a9b3bf"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(180, 151, 90, 0.2), 0 20px 60px rgba(0, 0, 0, 0.35)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top, rgba(180, 151, 90, 0.2), transparent 35%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent)"
      }
    }
  },
  plugins: []
};

export default config;
