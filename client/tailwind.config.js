/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#080808',
        soft: '#111111',
        elevate: '#191919',
        card: '#151515',
        line: '#303030',
        brand: { DEFAULT: '#FF650D', hover: '#FF7A1A', deep: '#C94E08' },
        lime: { DEFAULT: '#C7F32F', deep: '#9FC41F' },
        ink: { DEFAULT: '#FFFFFF', soft: '#B8B8B8', muted: '#818181' },
        success: '#4ADE80',
        danger: '#FF4D4F',
        warn: '#FFC857',
      },
      fontFamily: {
        sans: ['Inter', 'Vazirmatn', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 40px -24px rgba(0,0,0,0.9)',
        glow: '0 12px 40px -12px rgba(255,101,13,0.55)',
      },
      borderRadius: { '4xl': '2rem' },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.94)', opacity: '0.4' },
          '60%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        'fade-in': 'fade-in 0.25s ease-out both',
        'slide-in': 'slide-in 0.28s cubic-bezier(0.22,1,0.36,1) both',
        pop: 'pop 0.25s ease-out both',
      },
    },
  },
  plugins: [],
};
