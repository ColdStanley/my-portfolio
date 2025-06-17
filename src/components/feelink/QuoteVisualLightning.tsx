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
  triggerKey?: string
}

export default function QuoteVisualLightning({
  quote,
  position,
  triggerKey,
}: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 10000)
    return () => clearTimeout(timer)
  }, [quote, triggerKey])

  const lightningStyle = clsx(
    'absolute text-white text-lg font-bold font-[cursive] transition-all duration-700 ease-out animate-zap',
    {
      'opacity-0': !visible,
    }
  )

  return (
    <div
      className={lightningStyle}
      style={{
        ...position,
        position: 'absolute',
        maxWidth: '80%',
        zIndex: 40,
        textShadow: '0 0 6px #fff, 0 0 12px #ffff33, 0 0 20px #ffd700',
      }}
    >
      {quote}
      <style jsx>{`
        @keyframes zap {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.9;
          }
          10% {
            transform: scale(1.02) rotate(-1deg);
            opacity: 1;
          }
          20% {
            transform: scale(0.98) rotate(1deg);
            opacity: 0.85;
          }
          30% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }

        .animate-zap {
          animation: zap 0.6s ease-in-out, float 4s ease-in-out infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  )
}
