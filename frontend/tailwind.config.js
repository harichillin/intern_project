/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e14',
        surface: '#0d1117',
        'surface-2': '#161b22',
        primary: '#f0b429',
        cyan: '#22d3ee',
        secondary: '#8b949e',
        accent: '#f0b429',
        risk: '#f85149',
        safe: '#3fb950',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        amber: '0 0 24px rgba(240,180,41,0.12)',
        cyan: '0 0 24px rgba(34,211,238,0.12)',
      },
    },
  },
  plugins: [],
}
