/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        diwali: {
          dark: '#0c071e',
          plum: '#1b0d2f',
          indigo: '#120b29',
          purple: '#2d0f4d',
          gold: '#f7c948',
          goldLight: '#ffe082',
          goldDark: '#d4af37',
          pink: '#ff2a85',
          orange: '#ff6b35',
          amber: '#ffb703',
          teal: '#06d6a0',
        }
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        festive: ['"Rozha One"', 'Cinzel', 'serif']
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'flicker': 'flameFlicker 1.5s ease-in-out infinite alternate',
        'diya-sway': 'sway 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(247, 201, 72, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 35px rgba(255, 107, 53, 0.8))' },
        },
        flameFlicker: {
          '0%': { transform: 'scale(1) rotate(-1deg)', filter: 'brightness(1)' },
          '25%': { transform: 'scale(1.08, 0.95) rotate(2deg)', filter: 'brightness(1.2)' },
          '50%': { transform: 'scale(0.96, 1.05) rotate(-2deg)', filter: 'brightness(0.95)' },
          '75%': { transform: 'scale(1.04, 1.02) rotate(1deg)', filter: 'brightness(1.15)' },
          '100%': { transform: 'scale(1) rotate(-1deg)', filter: 'brightness(1)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        }
      }
    },
  },
  plugins: [],
}
