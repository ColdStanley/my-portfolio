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
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onFocus?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

// 基础样式（遵循 Claude-UI.md 规范）
const baseInputStyles = [
  'w-full px-3 py-2',
  'border border-neutral-dark rounded-md',
  'bg-white text-text-primary',
  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-light',
  'transition duration-200',
  'placeholder:text-text-secondary',
].join(' ')

// 错误状态样式
const errorStyles = [
  'border-error',
  'focus:ring-error focus:border-error',
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

  // 根据multiline渲染不同组件
  if (multiline) {
    return (
      <div className="space-y-1">
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          rows={rows}
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
  }

  return (
    <div className="space-y-1">
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