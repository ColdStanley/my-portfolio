'use client'

import { PromptManagerButtonProps } from './types'

const positionClasses = {
  'bottom-right': 'fixed bottom-6 right-6',
  'bottom-left': 'fixed bottom-6 left-6',
  'top-right': 'fixed top-6 right-6',
  'top-left': 'fixed top-6 left-6'
}

export default function PromptManagerButton({
  onClick,
  position = 'bottom-right',
  icon = '</>',
  className = ''
}: PromptManagerButtonProps) {
  const positionClass = positionClasses[position]
  
  return (
    <button
      onClick={onClick}
      className={`
        ${positionClass}
        w-8 h-8 
        bg-gray-300/30 hover:bg-gray-400/50 
        rounded-full 
        flex items-center justify-center 
        text-gray-500/70 hover:text-gray-700 
        transition-all duration-200 
        text-xs font-mono 
        shadow-sm hover:shadow-md 
        z-50
        ${className}
      `}
      title="Prompt Management"
    >
      {icon}
    </button>
  )
}