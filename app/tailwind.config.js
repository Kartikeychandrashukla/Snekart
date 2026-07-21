/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forest:   "#2F4A3F",
        sage:     "#A8BBA6",
        lavender: "#DCCFEE",
        dusty:    "#BFD1E1",
        peach:    "#F6C9B2",
        warm:     "#F7E2A6",
        cream:    "#FAF7F2",
        taupe:    "#E7E1D9",
        marigold: "#E3A857",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}

