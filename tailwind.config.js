/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'pulse-highlight': 'pulse-highlight 1.5s infinite alternate',
      },
      keyframes: {
        'pulse-highlight': {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}

