/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: {
          900: "#0b0d13",
          850: "#11141c",
          800: "#171a24",
          750: "#1c1f2a",
          700: "#22252f",
          600: "#2b2e3a",
          500: "#3a3d4a",
        },
        accent: {
          DEFAULT: "#5b5ff5",
          hover: "#6d70f7",
          soft: "#4448c9",
        },
        online: "#3ddc84",
        idle: "#f5b942",
        dnd: "#f04747",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 8px 24px rgba(0,0,0,0.35)",
      },
      animation: {
        "pulse-fast": "pulse 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
