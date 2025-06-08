/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'debate-blue': '#3B82F6',
        'debate-red': '#EF4444',
        'debate-green': '#10B981',
        'neutral': '#6B7280'
      },
      animation: {
        'typing': 'typing 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        typing: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0.3' }
        }
      }
    },
  },
  plugins: [],
}
