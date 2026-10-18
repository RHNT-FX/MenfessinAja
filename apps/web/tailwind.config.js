/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF9F6', // Warm off-white sesuai Figma
        primary: {
          DEFAULT: '#2563EB', // Cobalt blue aksen utama Figma
          hover: '#1D4ED8',
          light: '#EFF6FF',
          dark: '#1E40AF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F3F4F6',
          border: '#E5E7EB',
        },
        badge: {
          superchat: '#FEF3C7',
          superchatText: '#92400E',
          boost: '#EDE9FE',
          boostText: '#5B21B6',
          lost: '#FEE2E2',
          lostText: '#991B1B',
          found: '#DCFCE7',
          foundText: '#166534',
        }
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
