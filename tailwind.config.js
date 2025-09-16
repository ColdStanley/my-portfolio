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
    // Cyberpunk theme classes
    'cyberpunk',
    'lightpink',
    'hellokitty',
    // Force include Cyberpunk colors
    'bg-cyberpunk-400', 'bg-cyberpunk-500', 'bg-cyberpunk-600', 'bg-cyberpunk-700',
    'text-cyberpunk-200', 'text-cyberpunk-300', 'text-cyberpunk-400',
    'border-cyberpunk-400', 'from-cyberpunk-600', 'to-cyberpunk-700',
    { pattern: /^cyberpunk:.*/, variants: ['hover', 'focus', 'active'] },
    // Lightpink theme classes
    'bg-lightpink-400', 'bg-lightpink-500', 'bg-lightpink-600', 'bg-lightpink-700',
    'text-lightpink-200', 'text-lightpink-300', 'text-lightpink-400',
    'border-lightpink-400', 'from-lightpink-500', 'to-lightpink-600',
    { pattern: /^lightpink:.*/, variants: ['hover', 'focus', 'active'] },
    // Hello Kitty theme classes
    'bg-hellokitty-400', 'bg-hellokitty-500', 'bg-hellokitty-600', 'bg-hellokitty-700',
    'text-hellokitty-200', 'text-hellokitty-300', 'text-hellokitty-400',
    'border-hellokitty-400', 'from-hellokitty-400', 'to-hellokitty-500',
    { pattern: /^hellokitty:.*/, variants: ['hover', 'focus', 'active'] },
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
        cyberpunk: {
          50: '#F0F0FF',   // 极浅紫白（背景）
          100: '#E0E0FF',  // 很浅紫白
          200: '#80FFFF',  // 淡青（辅助文本）
          300: '#00FFFF',  // 电子青（主要文本）
          400: '#39FF14',  // 霓虹绿（强调）
          500: '#FF0080',  // 霓虹粉（标准色）
          600: '#CC0066',  // 深霓虹粉（主色）
          700: '#1A1A1A',  // 暗灰（背景）
          800: '#111111',  // 更深灰
          900: '#0A0A0A',  // 深黑（强调背景）
        },
        lightpink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        hellokitty: {
          50: '#fff5f7',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7085',
          500: '#f472b6',
          600: '#f06292',
          700: '#e11d48',
          800: '#be123c',
          900: '#991b1b',
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
    },
    // Cyberpunk theme plugin
    function({ addVariant, addUtilities }) {
      addVariant('cyberpunk', '.cyberpunk &')
      // Force generate Cyberpunk text colors
      addUtilities({
        '.cyberpunk .text-purple-600': { color: '#00FFFF' },
        '.cyberpunk .text-purple-400': { color: '#00FFFF' }
      })
    },
    // Lightpink theme plugin
    function({ addVariant, addUtilities }) {
      addVariant('lightpink', '.lightpink &')
      addUtilities({
        '.lightpink .text-purple-600': { color: '#f472b6' },
        '.lightpink .text-purple-400': { color: '#f472b6' }
      })
    },
    // Hello Kitty theme plugin
    function({ addVariant, addUtilities }) {
      addVariant('hellokitty', '.hellokitty &')
      addUtilities({
        '.hellokitty .text-purple-600': { color: '#fda4af' },
        '.hellokitty .text-purple-400': { color: '#fda4af' }
      })
    }
  ],
}
