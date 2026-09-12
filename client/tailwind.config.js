/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Cool graphite/indigo dark scale. Kept the old "base-NNN" naming so
        // existing component classes didn't need renaming, only remapping.
        base: {
          900: "#0A0B12", // ground
          850: "#0E1018",
          800: "#14161F", // surface / panel
          750: "#191C28",
          700: "#20232F", // hover surface / inputs
          600: "#2B2F41", // borders
          500: "#393E56", // stronger borders / dividers
        },
        ink: "#F2F3FA",
        // "amber" is the primary-accent token name kept from the previous
        // palette (avoids renaming it across every component); the color
        // itself is now the brand indigo/violet, reserved for primary
        // calls-to-action, notifications, and the bot hub.
        amber: {
          DEFAULT: "#6D5EF0",
          hover: "#8577FF",
          soft: "#4E41C9",
        },
        teal: {
          DEFAULT: "#2FD9E8",
          soft: "#159FB0",
        },
        warn: "#F2495C",
        // Presence colors
        online: "#3ED598",
        idle: "#F5B94D",
        dnd: "#F2495C",
        // Legacy alias so any missed spot still renders sanely instead of
        // Tailwind silently dropping the class.
        accent: {
          DEFAULT: "#6D5EF0",
          hover: "#8577FF",
          soft: "#4E41C9",
        },
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        brand: "linear-gradient(135deg, #6D5EF0 0%, #2FD9E8 100%)",
      },
      boxShadow: {
        panel: "0 8px 28px rgba(0,0,0,0.5)",
        glow: "0 0 0 1px rgba(109,94,240,0.35), 0 10px 30px -6px rgba(109,94,240,0.55)",
      },
      animation: {
        "pulse-fast": "pulse 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
