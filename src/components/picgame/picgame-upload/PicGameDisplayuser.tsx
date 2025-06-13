'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  imageUrl: string
  description: string
  quotes: string
}

interface Position {
  top?: string
  bottom?: string
  left?: string
  right?: string
}

export default function PicGameDisplayuser({ imageUrl, description, quotes }: Props) {
  const quoteArray = quotes?.split('\n').filter(line => line.trim() !== '') || []
  const safeImageUrl = imageUrl?.startsWith('http') ? imageUrl : `https://${imageUrl}`

  const imageRef = useRef<HTMLImageElement>(null)
  const [imageHeight, setImageHeight] = useState<number>(300)

  const [displayedQuote, setDisplayedQuote] = useState('')
  const [positionStyle, setPositionStyle] = useState<Position>({})
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const [shake, setShake] = useState(false)
  const [hovering, setHovering] = useState(false)

  const getRandomOffset = (min: number, max: number): string =>
    `${Math.floor(Math.random() * (max - min + 1)) + min}%`

  const showQuote = (e: React.MouseEvent) => {
    if (!imageRef.current || quoteArray.length === 0) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const quote = quoteArray[Math.floor(Math.random() * quoteArray.length)]
    setDisplayedQuote(quote)
    setPositionStyle({
      ...(y <= rect.height / 2 ? { top: getRandomOffset(5, 15) } : { bottom: getRandomOffset(5, 15) }),
      ...(x <= rect.width / 2 ? { left: getRandomOffset(5, 15) } : { right: getRandomOffset(5, 15) }),
    })

    const id = Date.now()
    setRipples((prev) => [...prev, { x, y, id }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 500)

    setShake(true)
    setTimeout(() => setShake(false), 300)
  }

  useEffect(() => {
    if (!imageRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === imageRef.current) {
          setImageHeight(entry.contentRect.height)
        }
      }
    })
    observer.observe(imageRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col md:flex-row gap-6 relative">
      {/* 左图 */}
      <div
        className={`md:w-1/2 w-full relative rounded-xl overflow-hidden shadow border border-purple-100 bg-white transition hover:shadow-lg cursor-pointer ${shake ? 'animate-shake' : ''}`}
        onClick={showQuote}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <img
          ref={imageRef}
          src={safeImageUrl}
          alt="picgame"
          className="w-full h-auto object-cover rounded-xl"
        />

        {displayedQuote && (
          <div
            className="absolute px-4 py-2 border border-purple-100 rounded-2xl shadow-sm bg-white/30 backdrop-blur-sm text-purple-700 text-sm sm:text-base font-normal animate-fade-in z-20"
            style={{ ...positionStyle, position: 'absolute', maxWidth: '80%' }}
          >
            {displayedQuote}
          </div>
        )}

        {hovering && (
          <div className="absolute bottom-3 right-3 text-purple-400 text-xl animate-bounce z-10 opacity-70">
            ➤
          </div>
        )}

        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute rounded-full bg-purple-300 opacity-40 animate-ripple z-0 pointer-events-none"
            style={{
              left: r.x - 40,
              top: r.y - 40,
              width: 80,
              height: 80,
            }}
          />
        ))}
      </div>

      {/* 右文 */}
      <div
        className="md:w-1/2 w-full bg-white shadow rounded-xl p-6 flex flex-col justify-between border border-purple-100"
        style={{ height: `${imageHeight}px` }}
      >
        <div className="mb-4">
          <div className="text-lg font-bold text-purple-600 mb-2">描述（Description）</div>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{description}</p>
        </div>

        <div>
          <div className="text-lg font-bold text-purple-600 mb-2">留言语录（Quotes）</div>
          <div className="space-y-2">
            {quoteArray.map((quote, idx) => (
              <motion.p
                key={idx}
                className="text-gray-600 text-sm italic"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {quote}
              </motion.p>
            ))}
          </div>
        </div>
      </div>

      {/* 动画 CSS */}
      <style>{`
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-ripple {
          animation: ripple 0.5s ease-out;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(5.5deg); }
          75% { transform: rotate(-5.5deg); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
