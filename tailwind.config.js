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
          50: '#2F2438',   // Ultra soft background
          100: '#3A2B45',  // Very soft background
          200: '#C4B4A8',  // Ultra soft gold
          300: '#B8A082',  // Soft gold (main text)
          400: '#E6C794',  // Gentle gold (accents)
          500: '#D4A574',  // Warm gold
          600: '#2A1B3D',  // Deep purple background
          700: '#1F1429',  // Deeper purple
          800: '#161020',  // Deepest purple (emphasis)
          900: '#0D0815',  // Ultra deep purple
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
