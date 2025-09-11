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
    // Anno theme classes
    'anno',
    // Force include Anno colors
    'bg-anno-400', 'bg-anno-500', 'bg-anno-600', 'bg-anno-700',
    'text-anno-200', 'text-anno-300', 'text-anno-400',
    'border-anno-400', 'from-anno-600', 'to-anno-700',
    { pattern: /^anno:.*/, variants: ['hover', 'focus', 'active'] },
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
        anno: {
          50: '#F0F9FF',   // 极浅蓝（背景）
          100: '#E0F2FE',  // 很浅蓝
          200: '#BAE6FD',  // 浅蓝（辅助文本）
          300: '#7DD3FC',  // 中浅蓝（主要文本）
          400: '#38BDF8',  // 中蓝（强调）
          500: '#0EA5E9',  // 标准蓝
          600: '#0284C7',  // 深蓝（主色）
          700: '#0369A1',  // 更深蓝（背景）
          800: '#075985',  // 很深蓝
          900: '#0C4A6E',  // 极深蓝
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
    function({ addVariant, addUtilities }) {
      addVariant('lakers', '.lakers &')
      // Force generate Lakers text colors
      addUtilities({
        '.lakers .text-purple-600': { color: '#B8A082' },
        '.lakers .text-purple-400': { color: '#B8A082' }
      })
    },
    // Anno theme plugin
    function({ addVariant, addUtilities }) {
      addVariant('anno', '.anno &')
      // Force generate Anno text colors
      addUtilities({
        '.anno .text-purple-600': { color: '#7DD3FC' },
        '.anno .text-purple-400': { color: '#7DD3FC' }
      })
    }
  ],
}
