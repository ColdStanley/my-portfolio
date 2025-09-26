'use client'

import React, { ElementType, ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// Button 组件 Props 接口（遵循 Claude-UI.md 规范）
interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  className?: string
}

// 支持多态组件（as prop）
type ButtonProps<T extends ElementType = 'button'> = BaseButtonProps & {
  as?: T
} & Omit<ComponentProps<T>, keyof BaseButtonProps>

// 样式变体定义（严格遵循 Claude-UI.md 规范）
const buttonVariants = {
  primary: [
    // Primary 按钮：Brand Primary 填充，白字，质感导向
    'bg-primary text-primary-foreground',
    'shadow-sm hover:shadow-md',
    'hover:brightness-105 active:brightness-95',
    'transition duration-200',
  ].join(' '),

  secondary: [
    // Secondary 按钮：透明背景 + Brand Primary 边框
    'border border-primary text-primary bg-transparent',
    'hover:bg-neutral-light',
    'transition duration-200',
  ].join(' '),

  ghost: [
    // Ghost 按钮：透明背景，hover时显示背景
    'text-text-primary bg-transparent',
    'hover:bg-neutral-light',
    'transition duration-200',
  ].join(' '),

  danger: [
    // Danger 按钮：错误状态色，保持质感
    'bg-error text-white',
    'shadow-sm hover:shadow-md',
    'hover:brightness-105 active:brightness-95',
    'transition duration-200',
  ].join(' '),
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md font-medium',
  md: 'px-4 py-2 text-sm rounded-md font-medium',
  lg: 'px-6 py-3 text-base rounded-lg font-medium',
}

const Button = <T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className,
  ...props
}: ButtonProps<T>) => {
  const Component = as || 'button'

  // 基础样式组合
  const baseStyles = [
    'inline-flex items-center justify-center',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    buttonSizes[size],
    buttonVariants[variant],
  ].join(' ')

  return (
    <Component
      className={cn(baseStyles, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </Component>
  )
}

export default Button
