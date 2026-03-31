/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1F1B16",
        sand: "#F6EFE7",
        saffron: "#F2A154",
        clay: "#D76C4B",
        leaf: "#4C8B6F",
        berry: "#9A4E4E",
        mist: "#F9F6F1",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        body: ['"Manrope"', "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 50px rgba(31, 27, 22, 0.12)",
        card: "0 12px 30px rgba(31, 27, 22, 0.12)",
      },
    },
  },
  plugins: [],
}
