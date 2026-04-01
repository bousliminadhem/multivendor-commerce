/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif']
      },
      colors: {
        base: {
          light: '#fafafa',
          dark: '#0f172a'
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        primary: {
          50: '#f6f8ff',
          100: '#e8edff',
          200: '#c9d6ff',
          300: '#a9beff',
          400: '#7a9bff',
          500: '#4c78ff',
          600: '#2f5fe6',
          700: '#2349b4',
          800: '#1b388a',
          900: '#142966'
        },
        accent: '#00d8a4'
      },
      boxShadow: {
        soft: '0 12px 40px rgba(15, 23, 42, 0.08)'
      },
      animation: {
        pulseSlow: 'pulse 2.4s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
