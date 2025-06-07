'use client'

import { useRef, useState, useEffect } from 'react'

const quotes = {
  lt: [
    '这长长的双马尾，是我的标志哦！',
    '甩动这青色的头发，准备唱歌啦！',
    '我的头发，像不像青色的瀑布呀？',
    '头发的长度，就是偶像的气场！',
    '看我这飘逸的青绿色秀发！',
  ],
  rt: [
    '戴上耳机，我的世界就是舞台！',
    '看我手臂上的“01”，我是最初的声音！',
    '用我的歌声，直接唱到你心里！',
    '这双眼睛，有没有电到你呀？',
    '准备好和我一起嗨翻全场了吗？',
  ],
  lb: [
    '这双黑色长靴，是不是超有型？',
    '穿着它，就能踏上任何舞台！',
    '我的绝对领域，喜欢吗？',
    '修长的双腿，是跳舞的利器！',
    '站在这里，我就是视线的焦点！',
  ],
  rb: [
    '挥动双手，为我加油应援吧！',
    '这个袖套可是很重要的配饰！',
    '指尖为你染上了青色的活力！',
    '来，要不要牵我的手呀？',
    '用这双手，为你创造旋律！',
  ],
}

type CornerKey = keyof typeof quotes

interface Position {
  top?: string
  bottom?: string
  left?: string
  right?: string
}

export default function PicGamePage() {
  const imageRef = useRef<HTMLDivElement>(null)
  const [visibleText, setVisibleText] = useState<string>('')
  const [positionStyle, setPositionStyle] = useState<Position>({})

  const getRandomOffset = (min: number, max: number): string =>
    `${Math.floor(Math.random() * (max - min + 1)) + min}%`

  const showQuote = (corner: CornerKey) => {
    const lines = quotes[corner]
    const randomLine = lines[Math.floor(Math.random() * lines.length)]
    let style: Position = {}

    switch (corner) {
      case 'lt':
        style = {
          top: getRandomOffset(1, 15),
          left: getRandomOffset(1, 20),
        }
        break
      case 'rt':
        style = {
          top: getRandomOffset(1, 15),
          right: getRandomOffset(1, 20),
        }
        break
      case 'lb':
        style = {
          bottom: getRandomOffset(1, 15),
          left: getRandomOffset(1, 20),
        }
        break
      case 'rb':
        style = {
          bottom: getRandomOffset(1, 15),
          right: getRandomOffset(1, 20),
        }
        break
    }

    setVisibleText(randomLine)
    setPositionStyle(style)
  }

  useEffect(() => {
    if (visibleText !== '') {
      const timer = setTimeout(() => {
        setVisibleText('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [visibleText])

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
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-700 tracking-widest">初音未来</h1>

      <div
        ref={imageRef}
        onClick={handleClick}
        className="relative w-full max-w-[90vw] sm:max-w-[400px] cursor-pointer transition duration-300 hover:scale-[1.01]"
      >
        <img
          src="/images/001.jpg"
          alt="初音未来"
          className="w-full h-auto border-4 border-purple-300 rounded-xl shadow-xl"
        />

        {visibleText && (
          <div
            className={`
              absolute
              px-4 py-2
              border border-purple-200
              rounded-2xl
              shadow-md
              bg-white/30
              backdrop-blur
              text-purple-700
              text-sm sm:text-base font-normal font-sans
              animate-fade-in
              hover:animate-wiggle
              transition-opacity
              z-10
            `}
            style={{
              ...positionStyle,
              position: 'absolute',
              maxWidth: '80%',
            }}
          >
            {visibleText}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1.5deg); }
          75% { transform: rotate(-1.5deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
