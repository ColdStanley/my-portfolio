'use client'

interface ThinkingAnimationProps {
  message: string
  className?: string
}

export default function ThinkingAnimation({ message, className = '' }: ThinkingAnimationProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Animated thinking dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
      </div>
      
      {/* Thinking message */}
      <span className="text-purple-700 font-medium">{message}</span>
      
      {/* Subtle pulsing background */}
      <div className="absolute inset-0 bg-purple-50 opacity-50 rounded-lg animate-pulse -z-10"></div>
    </div>
  )
}