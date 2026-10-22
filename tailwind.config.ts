import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F7F2EA",
        champagne: "#D8C2AF",
        rose: "#A67C70",
        burgundy: "#402A2E",
        onyx: "#201B1A",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(32, 27, 26, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
