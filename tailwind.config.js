/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#e6f0f8',
          100: '#cce1f1',
          200: '#99c4e3',
          300: '#66a6d5',
          400: '#3389c7',
          500: '#006bb9',
          600: '#005694',
          700: '#00406f',
          800: '#002b4a',
          900: '#001525',
        },
        gold: {
          400: '#f5c842',
          500: '#f0b90b',
        },
        diamond: {
          400: '#7ec8f8',
          500: '#4da6e8',
        },
        rare: {
          1: '#9ca3af', // 常见
          2: '#22c55e', // 稀有
          3: '#a855f7', // 史诗
          4: '#f97316', // 神秘
          5: '#ef4444', // 传说
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float-bob': 'floatBounce 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out infinite',
        'pulse-alert': 'pulseAlert 0.8s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        floatBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-3px)' },
          '75%': { transform: 'translateX(3px)' },
        },
        pulseAlert: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
