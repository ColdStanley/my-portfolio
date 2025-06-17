'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { HiOutlineArrowNarrowRight } from 'react-icons/hi'
import QuoteVisualPetal from './QuoteVisualPetal'

type CornerKey = 'lt' | 'rt' | 'lb' | 'rb'

interface Position {
  top?: string
  bottom?: string
  left?: string
  right?: string
}

interface Props {
  imageUrl: string
  quotes: Record<CornerKey, string[]>
  description: string
}

export default function PicGameDisplay({ imageUrl, quotes, description }: Props) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [displayedQuote, setDisplayedQuote] = useState('')
  const [positionStyle, setPositionStyle] = useState<Position>({})
  const [imageHeight, setImageHeight] = useState<number>(300)
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const animationTypeList = ['shake', 'scale', 'bounce', 'fade-in', 'ripple'] as const
  const [animationIndex, setAnimationIndex] = useState(0)
  const animationType = animationTypeList[animationIndex]
  const [hasClicked, setHasClicked] = useState(false)

  // 新增：字体颜色切换
  const [quoteColor, setQuoteColor] = useState<'white' | 'black'>('white')
  const [renderKey, setRenderKey] = useState(0)
  const toggleQuoteColor = () => {
    setQuoteColor(prev => (prev === 'white' ? 'black' : 'white'))
    setRenderKey(prev => prev + 1)
  }

  // 新增：记录最后一次点击时间
  const [lastClickTime, setLastClickTime] = useState(Date.now())

  const getRandomOffset = (min: number, max: number): string =>
    `${Math.floor(Math.random() * (max - min + 1)) + min}%`

  const showQuote = (corner: CornerKey) => {
    const lines = quotes[corner]
    if (!lines || lines.length === 0) return
    const line = lines[Math.floor(Math.random() * lines.length)]
    setDisplayedQuote('')
    setTimeout(() => setDisplayedQuote(line || ''), 100)
    setPositionStyle({
      ...(corner.includes('t') ? { top: getRandomOffset(1, 15) } : { bottom: getRandomOffset(1, 15) }),
      ...(corner.includes('l') ? { left: getRandomOffset(1, 20) } : { right: getRandomOffset(1, 20) }),
    })
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

  const handleClick = (e: React.MouseEvent) => {
    if (!hasClicked) setHasClicked(true)
    setLastClickTime(Date.now())

    const rect = imageRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const width = rect.width
    const height = rect.height

    if (x <= width / 2 && y <= height / 2) showQuote('lt')
    else if (x > width / 2 && y <= height / 2) showQuote('rt')
    else if (x <= width / 2 && y > height / 2) showQuote('lb')
    else if (x > width / 2 && y > height / 2) showQuote('rb')

    const id = Date.now()
    setRipples((prev) => [...prev, { x, y, id }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 500)
    setAnimationIndex((prev) => (prev + 1) % animationTypeList.length)
  }

  // 新增：定时检测是否无点击并自动触发 quote
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastClickTime >= 7000) {
        const corners: CornerKey[] = ['lt', 'rt', 'lb', 'rb']
        const randomCorner = corners[Math.floor(Math.random() * corners.length)]
        showQuote(randomCorner)
        setLastClickTime(now)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [lastClickTime, quotes])

  return (
    <div className="w-full mb-6 break-inside-avoid rounded-md shadow-sm border border-gray-200 overflow-hidden">
      {/* 图片区域 */}
      <div
        className={`relative w-full cursor-pointer overflow-hidden animate-${animationType}`}
        onClick={handleClick}
      >
        <img
          ref={imageRef}
          src={imageUrl}
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

        {/* 提示按钮（新逻辑） */}
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

      {/* CSS 动画样式 */}
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
