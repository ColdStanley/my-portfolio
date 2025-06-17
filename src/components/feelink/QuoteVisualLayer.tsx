'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

interface Position {
  top?: string
  bottom?: string
  left?: string
  right?: string
}

interface Props {
  quote: string
  position: Position
  variant?: 'default' | 'pink' | 'blue' | 'sunset' | 'purple'
  triggerKey?: string
  className?: string // ✅ 父组件控制文字颜色
}

export default function QuoteVisualLayer({
  quote,
  position,
  variant = 'default',
  triggerKey,
  className = '',
}: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 10000)
    return () => clearTimeout(timer)
  }, [quote, triggerKey])

  const balloonStyle = clsx(
    'absolute px-4 py-2 rounded-full shadow-md text-sm font-medium backdrop-blur-sm transition-all duration-700 ease-out',
    'animate-float',
    {
      'bg-white/60': variant === 'default',
      'bg-pink-200/50': variant === 'pink',
      'bg-blue-200/50': variant === 'blue',
      'bg-gradient-to-r from-orange-200/40 to-pink-200/40': variant === 'sunset',
      'bg-purple-300/20': variant === 'purple', // 🟣 更高透明度
      'opacity-0': !visible,
    },
    className // ✅ 由父组件决定文字颜色
  )

  return (
    <div
      className={balloonStyle}
      style={{
        ...position,
        position: 'absolute',
        maxWidth: '75%',
        zIndex: 30,
      }}
    >
      {quote}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(1deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }

        .animate-float {
          animation: float 3.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
