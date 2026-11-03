/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F2EA',      // Background warm parchment Figma
        surface: {
          DEFAULT: '#FFFEFA',  // Surface card & form input
          muted: '#EAE6DC',
        },
        ink: {
          DEFAULT: '#20211F',  // Primary dark charcoal text
          muted: '#706F68',    // Secondary subtext
          light: '#9E9B92',
        },
        border: {
          DEFAULT: '#CDCAC1',  // Subtle parchment divider line
          light: '#EAE6DC',
          dark: '#20211F',
        },
        primary: {
          DEFAULT: '#284DB0',  // Editorial royal blue
          hover: '#1E3F96',
          soft: '#E9EDF6',     // Light blue superchat & active menu
          dark: '#172F6E',
        },
        badge: {
          superchatBg: '#F3EBD6',
          superchatText: '#865F20',
          foundBg: '#EAF0E7',
          foundText: '#41634B',
          lostBg: '#F5E6DF',
          lostText: '#A43C2C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
