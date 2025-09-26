import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 通用主题色彩系统 - 支持项目作用域覆盖
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        surface: 'var(--surface)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'neutral-light': 'var(--neutral-light)',
        'neutral-dark': 'var(--neutral-dark)',
        // 基础变量映射
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
      },
      spacing: {
        // 基于 4px grid 的间距系统
        'xs': '4px',   // 4px
        'sm': '8px',   // 8px
        'md': '16px',  // 16px
        'lg': '24px',  // 24px
        'xl': '32px',  // 32px
      },
      borderRadius: {
        // 统一圆角系统
        'small': '4px',
        'medium': '8px',
        'large': '16px',
      },
      boxShadow: {
        // 层次化阴影系统
        'base': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'overlay': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'hover': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // 统一字体大小系统
        'title': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }], // text-2xl font-semibold
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],   // text-base
        'caption': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // text-sm
      },
      animation: {
        // 统一过渡动画
        'fade-in': 'fadeIn 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    // CSS 变量由项目作用域定义，不再全局注入
  ],
}

export default config