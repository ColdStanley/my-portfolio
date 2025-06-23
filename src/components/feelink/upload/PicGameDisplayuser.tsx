'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { HiOutlineArrowNarrowRight } from 'react-icons/hi'
import QuoteVisualPetal from '../QuoteVisualPetal'

// ✅ 分享行为辅助工具
const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

export default function PicGameDisplayuser({ imageUrl, description, quotes }: { imageUrl: string; description: string; quotes: string }) {
  const imageRef = useRef<HTMLImageElement>(null)
  const quoteArray = quotes?.split('\n').filter(line => line.trim() !== '') || []

  const [displayedQuote, setDisplayedQuote] = useState('')
  const [positionStyle, setPositionStyle] = useState<{ top?: string; bottom?: string; left?: string; right?: string }>({})
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const [imageHeight, setImageHeight] = useState<number>(300)

  const [quoteColor, setQuoteColor] = useState<'white' | 'black'>('black')
  const [hasPlayed, setHasPlayed] = useState(false)
  const [showColorToggle, setShowColorToggle] = useState(false)

  const animationTypeList = ['shake', 'scale', 'bounce', 'fade-in', 'ripple'] as const
  const [animationIndex, setAnimationIndex] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(Date.now())

  const toggleQuoteColor = () => {
    setQuoteColor(prev => (prev === 'white' ? 'black' : 'white'))
  }

  const getRandomOffset = (min: number, max: number): string => `${Math.floor(Math.random() * (max - min + 1)) + min}%`

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
      setTimeout(() => setDisplayedQuote(''), 12000)
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

  return (
    <div className="w-full mb-6 break-inside-avoid rounded-md shadow-sm border border-gray-200 overflow-hidden">
      {/* 图片区域 */}
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

        {/* Quote 气泡 */}
        {displayedQuote && (
          <QuoteVisualPetal
            quote={displayedQuote}
            position={positionStyle}
            color={quoteColor}
          />
        )}

        {/* 初始提示或颜色切换按钮 */}
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

        {/* 分享按钮组 */}
        <div className="absolute bottom-3 right-3 z-10 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(window.location.href)
            }}
            className="text-white bg-purple-500/50 hover:bg-purple-600 text-xs px-3 py-1 rounded-full shadow"
          >
            Copy Link
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(`mailto:?subject=Check this out&body=${window.location.href}`, '_blank')
            }}
            className="text-white bg-purple-500/50 hover:bg-purple-600 text-xs px-3 py-1 rounded-full shadow"
          >
            Email
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, '_blank')
            }}
            className="text-white bg-purple-500/50 hover:bg-purple-600 text-xs px-3 py-1 rounded-full shadow"
          >
            WhatsApp
          </button>
        </div>

        {/* Ripple 效果 */}
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

      {/* description 文本展示区 */}
      <div className="w-full p-4 text-sm text-gray-700 bg-white border-t border-gray-200 leading-relaxed">
        {description}
      </div>

      {/* 跳转链接 */}
      <div className="w-full px-4 pb-4">
        <Link
          href="/feelink/upload"
          className="mt-2 inline-flex items-center gap-1 text-sm text-gray-700 underline hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span>Begin with a picture, let the quotes speak.</span>
          <HiOutlineArrowNarrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 动画样式 */}
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