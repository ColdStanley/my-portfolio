'use client'

import { useEffect, useState } from 'react'

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

export default function QuoteVisualPetal({ quote, position, triggerKey }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 10000)
    return () => clearTimeout(timer)
  }, [quote, triggerKey])

  return (
    <div
      className={`absolute transition-all duration-700 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        ...position,
        maxWidth: '75%',
        zIndex: 30,
        padding: '12px 18px',
        fontSize: '0.95rem',
        fontWeight: 500,
        fontFamily: 'Georgia, serif',
        color: 'rgb(100, 60, 90)',
        background: 'radial-gradient(ellipse at center, rgba(255,240,245,0.65) 40%, rgba(255,240,245,0.2) 100%)',
        borderRadius: '50% / 35%',
        boxShadow: '0 4px 12px rgba(255,192,203,0.4)',
        animation: 'petalFloat 4.5s ease-in-out infinite',
        whiteSpace: 'pre-wrap',
        backdropFilter: 'blur(1.5px)',
      }}
    >
      {quote}
      <style jsx>{`
        @keyframes petalFloat {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(-1deg);
          }
          100% {
            transform: translateY(0px) rotate(1deg);
          }
        }
      `}</style>
    </div>
  )
}
