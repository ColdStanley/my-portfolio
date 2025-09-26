'use client'

import React, { ChangeEvent, forwardRef } from 'react'
import { cn } from '@/lib/utils'

// Input 组件 Props 接口（支持multiline）
interface InputProps {
  type?: 'text' | 'email' | 'tel' | 'url' | 'password'
  multiline?: boolean  // 支持textarea
  rows?: number        // multiline时的行数
  placeholder?: string
  error?: string       // 错误状态和消息
  disabled?: boolean
  required?: boolean
  className?: string
  // 当需要让外层容器参与布局（如flex-1填充高度）时使用
  containerClassName?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onFocus?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

// 基础样式（遵循 Claude-UI.md 规范）
const baseInputStyles = [
  'w-full px-4 py-2',
  'border border-[var(--neutral-dark)] rounded-lg',
  'bg-[var(--neutral-light)] text-[var(--text-primary)]',
  'focus:outline-none focus:border-[var(--primary)] focus:shadow-md',
  'hover:brightness-105 hover:shadow-sm',
  'disabled:bg-[var(--neutral-dark)]/10 disabled:text-[var(--neutral-dark)]/50 disabled:cursor-not-allowed',
  'transition duration-200',
  'placeholder:text-[var(--text-secondary)]',
].join(' ')

// 错误状态样式
const errorStyles = [
  'border-[var(--error)]',
  'text-[var(--error)]',
  'focus:border-[var(--error)]',
].join(' ')

const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(({
  type = 'text',
  multiline = false,
  rows = 3,
  placeholder,
  error,
  disabled = false,
  required = false,
  className,
  containerClassName,
  value,
  onChange,
  onBlur,
  onFocus,
  ...props
}, ref) => {
  // 组合样式类
  const inputStyles = cn(
    baseInputStyles,
    error && errorStyles,
    multiline && 'resize-none', // textarea不允许手动调整大小
    className
  )

  // 检测是否需要 flex 高度控制
  const shouldUseFlex = className?.includes('flex-1')

  // 根据multiline渲染不同组件
  if (multiline) {
    return (
      <div className={cn("space-y-1", containerClassName)}>
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          rows={shouldUseFlex ? undefined : rows}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          className={inputStyles}
          style={shouldUseFlex ? { height: '100%' } : undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'input-error' : undefined}
          {...props}
        />
        {error && (
          <p id="input-error" className="text-sm text-error">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-1", containerClassName)}>
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        className={inputStyles}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'input-error' : undefined}
        {...props}
      />
      {error && (
        <p id="input-error" className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
