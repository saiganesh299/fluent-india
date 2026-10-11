/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fi: {
          bg: '#DFEFFF',
          card: '#F5F3E8',
          cardHover: '#ECE9DA',
          forest: '#17492F',
          forestHover: '#0E301F',
          lemon: '#EFF583',
          lemonHover: '#E5EB74',
          sage: '#CAD7CD',
          sageLight: '#E3ECE4',
          muted: '#41634E',
          mutedDark: '#2C4A38',
          coral: '#E64735',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Roboto Slab"', 'serif']
      }
    },
  },
  plugins: [],
}
