'use client'

import { useState, ReactNode } from 'react'

interface AnimatedButtonProps {
  onClick: () => void
  disabled?: boolean
  className?: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
}

export default function AnimatedButton({ 
  onClick, 
  disabled = false, 
  className = '', 
  children,
  variant = 'primary',
  size = 'md'
}: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const getBaseClasses = () => {
    const sizeClasses = {
      sm: 'px-3 py-1 text-xs',
      md: 'px-4 py-2 text-sm', 
      lg: 'px-6 py-3 text-base'
    }
    
    const variantClasses = {
      primary: 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
      accent: 'bg-purple-100 text-purple-700 hover:bg-purple-200 active:bg-purple-300 border border-purple-200'
    }
    
    return `
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      rounded-lg font-medium
      transition-all duration-150 ease-out
      transform active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
      ${isPressed ? 'scale-95 shadow-inner' : 'shadow-sm hover:shadow-md'}
      ${className}
    `
  }

  const handleMouseDown = () => {
    if (!disabled) {
      setIsPressed(true)
    }
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  const handleMouseLeave = () => {
    setIsPressed(false)
  }

  const handleClick = () => {
    if (!disabled) {
      // Add a subtle haptic feedback simulation
      setIsPressed(true)
      setTimeout(() => setIsPressed(false), 100)
      onClick()
    }
  }

  return (
    <button
      className={getBaseClasses()}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
    >
      {children}
    </button>
  )
}