/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
    },
    extend: {
      colors: {
        coffee: {
          50: '#FAF7F4',
          100: '#F5F0E8',
          200: '#E8DFD1',
          300: '#D4C4A8',
          400: '#B8A37E',
          500: '#9A7D52',
          600: '#7A5E3E',
          700: '#5D4037',
          800: '#4A322C',
          900: '#3A2722',
        },
        gold: {
          50: '#FBF7EC',
          100: '#F5EDD4',
          200: '#E8D9A8',
          300: '#DAC17C',
          400: '#C9A962',
          500: '#B08E45',
          600: '#8E7036',
          700: '#6C5428',
        },
        cream: '#F5F0E8',
        espresso: '#3A2722',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(93, 64, 55, 0.08)',
        'card': '0 4px 24px rgba(93, 64, 55, 0.1)',
        'hover': '0 8px 32px rgba(93, 64, 55, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
