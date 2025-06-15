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

const animationClasses = [
  'animate-fade-in',
  'animate-slide-up',
  'animate-zoom-in',
]

export default function PicGameDisplayuser({ imageUrl, description, quotes }: Props) {
  const quoteArray = quotes?.split('\n').filter(line => line.trim() !== '') || []
  const safeImageUrl = imageUrl?.startsWith('http') ? imageUrl : `https://${imageUrl}`

  const imageRef = useRef<HTMLImageElement>(null)
  const [imageHeight, setImageHeight] = useState<number>(300)
  const [displayedQuote, setDisplayedQuote] = useState('')
  const [positionStyle, setPositionStyle] = useState<Position>({})
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const [shake, setShake] = useState(false)
  const [animationIndex, setAnimationIndex] = useState(0)
  const [lastClickTime, setLastClickTime] = useState<number>(Date.now())

  const getRandomOffset = (min: number, max: number): string => `${Math.floor(Math.random() * (max - min + 1)) + min}%`

  const showQuote = (e: React.MouseEvent | null = null, xPos?: number, yPos?: number) => {
    if (!imageRef.current || quoteArray.length === 0) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e ? e.clientX - rect.left : xPos ?? rect.width / 2
    const y = e ? e.clientY - rect.top : yPos ?? rect.height / 2

    setLastClickTime(Date.now())
    const quote = quoteArray[Math.floor(Math.random() * quoteArray.length)]
    setDisplayedQuote(quote)
    setAnimationIndex((prev) => (prev + 1) % animationClasses.length)

    setPositionStyle({
      ...(y <= rect.height / 2 ? { top: getRandomOffset(5, 15) } : { bottom: getRandomOffset(5, 15) }),
      ...(x <= rect.width / 2 ? { left: getRandomOffset(5, 15) } : { right: getRandomOffset(5, 15) }),
    })

    setTimeout(() => setDisplayedQuote(''), 6000)

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
    <div className="flex flex-col items-center gap-6 w-full">
      <div
        className={`w-full max-w-3xl relative rounded-xl overflow-hidden shadow border border-purple-100 bg-white transition hover:shadow-lg cursor-pointer ${shake ? 'animate-shake' : ''}`}
        onClick={(e) => showQuote(e)}
      >
        <img
          ref={imageRef}
          src={safeImageUrl}
          alt="feelink"
          className="w-full h-auto object-cover rounded-xl"
        />
        {displayedQuote && (
          <div
            className={`absolute px-4 py-2 border border-purple-100 rounded-2xl shadow-sm bg-white/30 backdrop-blur-sm text-purple-700 text-sm sm:text-base font-normal z-20 ${animationClasses[animationIndex]}`}
            style={{ ...positionStyle, position: 'absolute', maxWidth: '80%' }}
          >
            {displayedQuote}
          </div>
        )}
        {ripples.map(r => (
          <span
            key={r.id}
            className="absolute rounded-full bg-purple-300 opacity-40 animate-ripple z-0 pointer-events-none"
            style={{ left: r.x - 40, top: r.y - 40, width: 80, height: 80 }}
          />
        ))}
      </div>

      <div className="w-full max-w-3xl bg-white shadow rounded-xl p-6 text-gray-700 text-base border border-purple-100 whitespace-pre-wrap">
        {description}
      </div>

      <div className="w-full max-w-3xl flex justify-center">
        <Link href="/feelink/upload" className="text-purple-700 text-sm underline hover:text-purple-500 transition">
          Begin with a picture, let the quotes speak.
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
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        @keyframes zoom-in {
          from { transform: scale(0.5); opacity: 0; }
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
