/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Control-room neutral scale. Kept the old "base-NNN" naming so
        // existing component classes didn't need renaming, only remapping.
        base: {
          900: "#0E1013", // ground
          850: "#121519",
          800: "#16191D", // surface / panel
          750: "#1A1E23",
          700: "#1E2228", // hover surface / inputs
          600: "#262B32", // borders
          500: "#323841", // stronger borders / dividers
        },
        ink: "#EDEBE6",
        amber: {
          DEFAULT: "#E8A23D",
          hover: "#F0B45E",
          soft: "#C98A30",
        },
        teal: {
          DEFAULT: "#4C9C90",
          soft: "#3D7D73",
        },
        warn: "#C1554A",
        // Presence colors
        online: "#4C9C90",
        idle: "#8A7A5C",
        dnd: "#C1554A",
        // Legacy alias so any missed spot still renders sanely instead of
        // Tailwind silently dropping the class.
        accent: {
          DEFAULT: "#E8A23D",
          hover: "#F0B45E",
          soft: "#C98A30",
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
