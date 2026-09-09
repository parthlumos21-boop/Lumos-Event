/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#000000',
        strong: '#fdfdfd',
        primary: '#ededed',
        secondary: '#24363f',
      },
      fontFamily: {
        sans: ['"Switzer"', '"Mona Sans"', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
        serif: ['"Instrument Serif"', 'serif'],
      }
    },
  },
  plugins: [],
}
