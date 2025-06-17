'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { HiOutlineArrowNarrowRight } from 'react-icons/hi'
import QuoteVisualPetal from '../QuoteVisualPetal'

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
  const [hasClicked, setHasClicked] = useState(false)
  const [imageHeight, setImageHeight] = useState<number>(300)

  const animationTypeList = ['shake', 'scale', 'bounce', 'fade-in', 'ripple'] as const
  const [animationIndex, setAnimationIndex] = useState(0)
  const animationType = animationTypeList[animationIndex]
  const [lastClickTime, setLastClickTime] = useState(Date.now())

  // ✅ 新增：quote 颜色切换逻辑 + renderKey
  const [quoteColor, setQuoteColor] = useState<'white' | 'black'>('white')
  const [renderKey, setRenderKey] = useState(0)
  const toggleQuoteColor = () => {
    setQuoteColor(prev => (prev === 'white' ? 'black' : 'white'))
    setRenderKey(prev => prev + 1)
  }

  const getRandomOffset = (min: number, max: number): string =>
    `${Math.floor(Math.random() * (max - min + 1)) + min}%`

  const showQuote = (e?: React.MouseEvent | null, xPos?: number, yPos?: number) => {
    if (!imageRef.current || quoteArray.length === 0) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e ? e.clientX - rect.left : xPos ?? rect.width / 2
    const y = e ? e.clientY - rect.top : yPos ?? rect.height / 2

    setLastClickTime(Date.now())
    const quote = quoteArray[Math.floor(Math.random() * quoteArray.length)]
    setDisplayedQuote(quote)
    setPositionStyle({
      ...(y <= rect.height / 2 ? { top: getRandomOffset(5, 15) } : { bottom: getRandomOffset(5, 15) }),
      ...(x <= rect.width / 2 ? { left: getRandomOffset(5, 15) } : { right: getRandomOffset(5, 15) }),
    })

    setTimeout(() => {
      setDisplayedQuote('')
    }, 15000)

    const id = Date.now()
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 500)

    setAnimationIndex(prev => (prev + 1) % animationTypeList.length)
    if (!hasClicked) setHasClicked(true)
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
        className={`relative w-full cursor-pointer overflow-hidden animate-${animationType}`}
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
    triggerKey={displayedQuote + renderKey}
    color={quoteColor}
  />
)}

        {/* 初始提示 or 切换按钮 */}
        <div className="absolute top-3 right-3 z-10">
          {!hasClicked ? (
            <div className="bg-purple-500/40 hover:bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow transition">
              ▶ Click to play
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleQuoteColor()
              }}
              className="bg-purple-500/40 hover:bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow transition"
            >
              🎨 Change quote color
            </button>
          )}
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
