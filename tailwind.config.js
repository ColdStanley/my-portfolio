/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  safelist: [
    'animate-scroll-up',
    // Lakers theme classes
    'lakers',
    // Force include Lakers colors
    'bg-lakers-400', 'bg-lakers-500', 'bg-lakers-600', 'bg-lakers-700',
    'text-lakers-200', 'text-lakers-300', 'text-lakers-400',
    'border-lakers-400', 'from-lakers-600', 'to-lakers-700',
    { pattern: /^lakers:.*/, variants: ['hover', 'focus', 'active'] },
  ],
  theme: {
    extend: {
      keyframes: {
        'scroll-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
      },
      animation: {
        'scroll-up': 'scroll-up 20s linear infinite',
      },
      colors: {
        lakers: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d946ef',
          400: '#FDB927', // Lakers Gold
          500: '#F4C430', // Bright Gold
          600: '#552583', // Lakers Purple
          700: '#4c1d95', // Deep Purple
          800: '#3b0764',
          900: '#2e1065',
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    },
    // Lakers theme plugin
    function({ addVariant }) {
      addVariant('lakers', '.lakers &')
    }
  ],
}
