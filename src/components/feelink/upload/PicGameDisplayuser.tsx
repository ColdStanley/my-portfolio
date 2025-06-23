'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { HiOutlineArrowNarrowRight } from 'react-icons/hi'
import QuoteVisualPetal from '../QuoteVisualPetal'
import { motion, AnimatePresence } from 'framer-motion'

const fadeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

type Position = {
  top?: string
  bottom?: string
  left?: string
  right?: string
}

interface Props {
  imageUrl: string
  description: string
  quotes: string
}

export default function PicGameDisplayuser({ imageUrl, description, quotes }: Props) {
  const imageRef = useRef<HTMLImageElement>(null)
  const quoteArray = quotes?.split('\n').filter(line => line.trim() !== '') || []

  const [displayedQuote, setDisplayedQuote] = useState('')
  const [positionStyle, setPositionStyle] = useState<Position>({})
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const [imageHeight, setImageHeight] = useState<number>(300)

  const [quoteColor, setQuoteColor] = useState<'white' | 'black'>('white')
  const [hasPlayed, setHasPlayed] = useState(false)
  const [showColorToggle, setShowColorToggle] = useState(false)

  const animationTypeList = ['shake', 'scale', 'bounce', 'fade-in', 'ripple'] as const
  const [animationIndex, setAnimationIndex] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(Date.now())
  const [copied, setCopied] = useState(false)

  const toggleQuoteColor = () => {
    setQuoteColor(prev => (prev === 'white' ? 'black' : 'white'))
  }

  const getRandomOffset = (min: number, max: number): string =>
    `${Math.floor(Math.random() * (max - min + 1)) + min}%`

  const showQuote = (e?: React.MouseEvent | null, xPos?: number, yPos?: number) => {
    if (!imageRef.current || quoteArray.length === 0) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e ? e.clientX - rect.left : xPos ?? rect.width / 2
    const y = e ? e.clientY - rect.top : yPos ?? rect.height / 2

    setDisplayedQuote('')
    setTimeout(() => {
      const quote = quoteArray[Math.floor(Math.random() * quoteArray.length)]
      setDisplayedQuote(quote)
      setPositionStyle({
        ...(y <= rect.height / 2 ? { top: getRandomOffset(5, 15) } : { bottom: getRandomOffset(5, 15) }),
        ...(x <= rect.width / 2 ? { left: getRandomOffset(5, 15) } : { right: getRandomOffset(5, 15) }),
      })
      setTimeout(() => {
        setDisplayedQuote('')
      }, 12000)
    }, 10)

    setLastClickTime(Date.now())
    setAnimationIndex(prev => (prev + 1) % animationTypeList.length)
    const id = Date.now()
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 500)

    if (!hasPlayed) {
      setHasPlayed(true)
      setTimeout(() => setShowColorToggle(true), 2000)
    }
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
      if (now - lastClickTime >= 9000) {
        const rect = imageRef.current.getBoundingClientRect()
        const randX = Math.floor(Math.random() * rect.width)
        const randY = Math.floor(Math.random() * rect.height)
        showQuote(null, randX, randY)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [lastClickTime, quoteArray])

  const safeImageUrl = imageUrl?.startsWith('http') ? imageUrl : `https://${imageUrl}`
  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="w-full mb-6 break-inside-avoid rounded-md shadow-sm border border-gray-200 overflow-hidden">
      <div
        className={`relative w-full cursor-pointer overflow-hidden animate-${animationTypeList[animationIndex]}`}
        onClick={(e) => showQuote(e)}
      >
        <img
          ref={imageRef}
          src={safeImageUrl}
          alt="interactive"
          className="w-full h-auto object-contain rounded-t-md"
        />

        <AnimatePresence>
          {displayedQuote && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeVariants}
              transition={{ duration: 0.6 }}
            >
              <QuoteVisualPetal
                quote={displayedQuote}
                position={positionStyle}
                color={quoteColor}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-3 right-3 z-10">
          {!hasPlayed ? (
            <div className="bg-purple-500/40 hover:bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow transition">
              ▶ Click to show quotes
            </div>
          ) : showColorToggle ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleQuoteColor()
              }}
              className="bg-purple-500/40 hover:bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow transition"
            >
              🎨 Switch text color
            </button>
          ) : null}
        </div>

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

        {/* 分享功能按钮组 */}
        <div className="absolute bottom-3 right-3 z-20 space-x-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(pageUrl)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
            className="bg-white/80 text-gray-800 text-xs px-3 py-1 rounded shadow hover:bg-purple-100"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <a
            href={`mailto:?subject=Check this out&body=${encodeURIComponent(pageUrl)}`}
            className="bg-white/80 text-gray-800 text-xs px-3 py-1 rounded shadow hover:bg-purple-100"
          >
            Email
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(pageUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/80 text-gray-800 text-xs px-3 py-1 rounded shadow hover:bg-purple-100"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <div className="w-full p-4 text-sm text-gray-700 bg-white border-t border-gray-200 leading-relaxed">
        {description}
      </div>

      <div className="w-full px-4 pb-4">
        <Link
          href="/feelink/upload"
          className="mt-2 inline-flex items-center gap-1 text-sm text-gray-700 underline hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span>Begin with a picture, let the quotes speak.</span>
          <HiOutlineArrowNarrowRight className="w-4 h-4" />
        </Link>
      </div>

      <style>{`
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-ripple { animation: ripple 0.5s ease-out; }

        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }

        @keyframes scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .animate-scale { animation: scale 0.4s ease-in-out; }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce { animation: bounce 0.4s ease-in-out; }

        @keyframes fade-in {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}
