'use client'

import { useRef, useState, useEffect } from 'react'

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
  // console.log('Quotes received in PicGameDisplay:', quotes); // 调试行可以根据需要移除

  const imageRef = useRef<HTMLImageElement>(null)
  const [displayedQuote, setDisplayedQuote] = useState('') // 直接显示完整文本
  const [positionStyle, setPositionStyle] = useState<Position>({})
  const [imageHeight, setImageHeight] = useState<number>(300)
  // 恢复 ripples, shake, hovering 相关的 state
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const [shake, setShake] = useState(false)
  const [hovering, setHovering] = useState(false) // 恢复 hover 状态

  const getRandomOffset = (min: number, max: number): string =>
    `${Math.floor(Math.random() * (max - min + 1)) + min}%`

  const showQuote = (corner: CornerKey) => {
    const lines = quotes[corner]
    if (!lines || lines.length === 0) return
    const line = lines[Math.floor(Math.random() * lines.length)]
    setDisplayedQuote(line || '') // 直接设置完整文本，移除打字动画的 fullText 逻辑
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

  // 移除打字动画逻辑的 useEffect

  const handleClick = (e: React.MouseEvent) => {
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

    // 恢复 ripples 和 shake 相关的代码
    const id = Date.now()
    setRipples((prev) => [...prev, { x, y, id }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 500) // 500ms 后移除

    setShake(true) // 设置 shake 状态为 true
    setTimeout(() => setShake(false), 300) // 300ms 后恢复
  }

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-white overflow-hidden">
      {/* 恢复背景粒子动画 */}
      <div className="absolute inset-0 z-0 pointer-events-none animate-float-bg" />

      <div className="flex flex-col sm:flex-row w-full max-w-6xl gap-6 p-4 sm:p-6 z-10">
        <div
          className={`w-full sm:w-1/3 relative border border-purple-100 bg-white rounded-2xl shadow-md transition hover:shadow-lg cursor-pointer overflow-hidden ${shake ? 'animate-shake' : ''}`} // 恢复 transition, hover:shadow-lg, shake 相关的 class
          onClick={handleClick}
          onMouseEnter={() => setHovering(true)} // 恢复 onMouseEnter
          onMouseLeave={() => setHovering(false)} // 恢复 onMouseLeave
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="互动图片"
            className="w-full h-auto rounded-2xl"
          />
          {displayedQuote && ( // 使用 displayedQuote 来显示完整文本
            <div
              className="absolute px-4 py-2 border border-purple-100 rounded-2xl shadow-sm bg-white/30 backdrop-blur-sm text-purple-700 text-sm sm:text-base font-normal animate-fade-in z-20" // 添加 animate-fade-in
              style={{ ...positionStyle, position: 'absolute', maxWidth: '80%' }}
            >
              {displayedQuote} {/* 显示完整文本 */}
            </div>
          )}
          {/* 恢复悬停提示 */}
          {hovering && (
            <div className="absolute bottom-3 right-3 text-purple-400 text-xl animate-bounce z-10 opacity-70">
              ➤
            </div>
          )}
          {/* 恢复涟漪效果 */}
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

        <div
          className="w-full sm:w-2/3 border border-purple-100 rounded-2xl shadow-md p-6 text-purple-800 text-base sm:text-[15px] font-normal font-sans leading-relaxed overflow-y-auto"
          style={{ height: `${imageHeight}px` }}
        >
          {description}
        </div>
      </div>

      {/* 恢复所有 CSS 动画的 style 块 */}
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
          25% { transform: rotate(0.3deg); }
          75% { transform: rotate(-0.3deg); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        @keyframes float-bg {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float-bg {
          background-image: radial-gradient(circle at 10% 20%, rgba(168, 129, 255, 0.08) 0%, transparent 70%),
                            radial-gradient(circle at 70% 80%, rgba(129, 206, 255, 0.08) 0%, transparent 70%);
          background-size: 400% 400%;
          animation: float-bg 10s ease infinite;
        }
      `}</style>
    </div>
  )
}