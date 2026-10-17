/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",       // modern deep slate
        sand: "#f8fafc",      // clean crisp neutral
        mist: "#f1f5f9",      // subtle slate-100
        saffron: "#f59e0b",   // crisp amber
        clay: "#ea580c",      // modern orange
        leaf: "#059669",      // crisp emerald
        berry: "#e11d48",     // modern rose/red
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(15, 23, 42, 0.06)",
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        elevated: "0 10px 30px -4px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
}
