'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

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
  const [lastClickTime, setLastClickTime] = useState<number>(Date.now())
  const [animationClass, setAnimationClass] = useState('animate-fade-in')

  const getRandomOffset = (min: number, max: number): string =>
    `${Math.floor(Math.random() * (max - min + 1)) + min}%`

  const animationOptions = ['animate-fade-in', 'animate-slide-up', 'animate-zoom-in']

  const showQuote = (
    e: React.MouseEvent | null = null,
    xPos?: number,
    yPos?: number
  ) => {
    if (!imageRef.current || quoteArray.length === 0) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e ? e.clientX - rect.left : xPos ?? rect.width / 2
    const y = e ? e.clientY - rect.top : yPos ?? rect.height / 2

    setLastClickTime(Date.now())

    const quote = quoteArray[Math.floor(Math.random() * quoteArray.length)]
    setDisplayedQuote(quote)
    setAnimationClass(animationOptions[Math.floor(Math.random() * animationOptions.length)])
    setPositionStyle({
      ...(y <= rect.height / 2 ? { top: getRandomOffset(5, 15) } : { bottom: getRandomOffset(5, 15) }),
      ...(x <= rect.width / 2 ? { left: getRandomOffset(5, 15) } : { right: getRandomOffset(5, 15) }),
    })

    setTimeout(() => {
      setDisplayedQuote('')
    }, 6000)

    const id = Date.now()
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 500)

    setShake(true)
    setTimeout(() => setShake(false), 150)
  }

  useEffect(() => {
    if (!imageRef.current) return
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === imageRef.current) {
          setImageHeight(entry.contentRect.height)
        }
      }
    })
    observer.observe(imageRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!imageRef.current || quoteArray.length === 0) return
      const now = Date.now()
      if (now - lastClickTime >= 7000) {
        const rect = imageRef.current.getBoundingClientRect()
        for (let i = 0; i < 2; i++) {
          const randX = Math.floor(Math.random() * rect.width)
          const randY = Math.floor(Math.random() * rect.height)
          showQuote(null, randX, randY)
        }
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [lastClickTime, quoteArray])

  return (
    <div className="flex flex-col gap-6 relative w-full items-center"> {/* Changed from lg:flex-row to flex-col and added items-center */}
      {/* 左图 */}
      <div
        className={`w-full relative rounded-xl overflow-hidden shadow border border-purple-100 bg-white transition hover:shadow-lg cursor-pointer ${shake ? 'animate-shake' : ''} max-w-lg`} // Removed lg:w-1/2, set to w-full and added max-w-lg to constrain width
        onClick={(e) => showQuote(e)}
      >
        <img
          ref={imageRef}
          src={safeImageUrl}
          alt="picgame"
          className="w-full h-auto object-cover rounded-xl"
        />

        {displayedQuote && (
          <div
            className={`absolute px-4 py-2 border border-purple-100 rounded-2xl shadow-sm bg-white/30 backdrop-blur-sm text-purple-700 text-sm sm:text-base font-normal ${animationClass} z-20`}
            style={{ ...positionStyle, position: 'absolute', maxWidth: '80%' }}
          >
            {displayedQuote}
          </div>
        )}

        {ripples.map(r => (
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

      {/* 中段：描述 */}
      <div
        className="w-full bg-white shadow rounded-xl p-6 flex flex-col justify-between border border-purple-100 max-w-lg" // Removed lg:w-1/3, set to w-full and added max-w-lg
        // Removed style={{ height: `${imageHeight}px` }} as it makes less sense in a vertical layout and the example image doesn't show it.
      >
        <p className="text-gray-700 text-sm whitespace-pre-wrap">{description}</p>
      </div>

      {/* 右侧跳转引导 */}
      <div
        className="w-full bg-white shadow rounded-xl p-6 border border-purple-100 flex items-center justify-center max-w-lg" // Removed lg:w-1/6, set to w-full and added max-w-lg
        // Removed style={{ height: `${imageHeight}px` }} for the same reason as above.
      >
        <Link
          href="/feelink/upload"
          className="text-purple-600 text-sm hover:underline hover:text-purple-800 transition"
        >
          点击上传你的故事
        </Link>
      </div>

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

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        @keyframes zoom-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-zoom-in {
          animation: zoom-in 0.3s ease-out;
        }

        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(8deg); }
          75% { transform: rotate(-8deg); }
        }
        .animate-shake {
          animation: shake 0.15s ease-in-out;
        }
      `}</style>
    </div>
  )
}