import type { Config } from "tailwindcss";

// Thinking-attribute colors follow the Emergenetics convention (Blue/Green/Red/Yellow).
// Shades were run through a CVD validator; red/green separation relies on direct labels.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "!./src/**/._*"],
  theme: {
    extend: {
      colors: {
        analytical: "#3A78E0",
        structural: "#17703D",
        social: "#EE5E57",
        conceptual: "#D9A514",
        behavior: "#7C4DCC",
        ink: { DEFAULT: "#1c1c1a", soft: "#55554f", muted: "#8a8a82" },
        surface: { DEFAULT: "#fcfcfb", card: "#ffffff", sunken: "#f3f3f0" },
        line: "#e4e4df",
      },
      fontFamily: { sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
