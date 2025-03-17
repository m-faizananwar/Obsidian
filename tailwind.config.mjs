/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          bg: '#fef6ff',
          darkBg: '#2a1b37',
          nebulaBg: '#1e0a33',
          accent: '#c99bff',
          secondary: '#ff9dd2',
          tertiary: '#a6e3e9',
          neon: '#84ffbd',
          starlight: '#fff7cc',
          dream: '#ba83ff',
          text: '#40304a',
          darkText: '#e9d8ff',
          muted: '#9a86a5'
        }
      },
      fontFamily: {
        cute: ['Quicksand', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-gentle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: [],
}
