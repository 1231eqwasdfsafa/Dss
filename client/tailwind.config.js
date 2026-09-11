/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Warm mocha/terracotta dark scale. Kept the old "base-NNN" naming
        // so existing component classes didn't need renaming, only remapping.
        base: {
          900: "#18130F", // ground
          850: "#1C1611",
          800: "#231C15", // surface / panel
          750: "#2A2118",
          700: "#33281D", // hover surface / inputs
          600: "#3F3125", // borders
          500: "#4C3B2C", // stronger borders / dividers
        },
        ink: "#F2E9DE",
        amber: {
          DEFAULT: "#D98A4C",
          hover: "#E6A268",
          soft: "#B36F3A",
        },
        teal: {
          DEFAULT: "#6BAE7E",
          soft: "#548F65",
        },
        warn: "#C2604A",
        // Presence colors
        online: "#6BAE7E",
        idle: "#B08B5C",
        dnd: "#C2604A",
        // Legacy alias so any missed spot still renders sanely instead of
        // Tailwind silently dropping the class.
        accent: {
          DEFAULT: "#D98A4C",
          hover: "#E6A268",
          soft: "#B36F3A",
        },
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        panel: "0 8px 28px rgba(0,0,0,0.45)",
      },
      animation: {
        "pulse-fast": "pulse 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
