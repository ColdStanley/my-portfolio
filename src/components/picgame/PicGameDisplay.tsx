'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { HiOutlinePhotograph } from 'react-icons/hi'

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

  return (
    <div className="relative z-10">
      <div className="relative flex flex-col md:flex-row w-full">
        {/* 图片区域 */}
        <div
          className={`w-full md:w-2/5 relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300 animate-${animationType}`}
          onClick={handleClick}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="interactive"
            className="w-full h-auto object-cover rounded-xl"
          />

          {/* Quote 气泡 */}
          {displayedQuote && (
            <div
              className="absolute px-4 py-2 border border-purple-300 rounded-xl shadow-sm bg-[rgba(255,255,255,0.01)] text-white text-sm font-medium z-20"
              style={{ ...positionStyle, position: 'absolute', maxWidth: '80%', opacity: 0.9 }}
            >
              {displayedQuote}
            </div>
          )}

          {/* ✅ 初始提示：已从 bottom-3 改为 top-3 */}
          {!hasClicked && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-purple-500/80 hover:bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow transition">
                ▶ Click to play
              </div>
            </div>
          )}

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

        {/* 文字区域 + 按钮（仅此处新增链接） */}
        <div
          className="w-full md:w-3/5 p-6 text-black text-[15px] font-sans leading-relaxed overflow-y-auto rounded-xl bg-white border border-purple-200 shadow-sm relative"
          style={{ height: `${imageHeight}px` }}
        >
          <div className="pb-16">{description}</div>
        </div>

        <Link
          href="/picgame/upload"
          className="absolute bottom-0 left-0 right-0 inline-flex justify-center items-center gap-2 bg-purple-500/80 hover:bg-purple-600 text-white text-[0.65rem] font-normal px-3 py-1 rounded-b-xl shadow transition"
        >
          <HiOutlinePhotograph className="w-4 h-4" />
          <span>Begin with a picture, let the quotes speak.</span>
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
