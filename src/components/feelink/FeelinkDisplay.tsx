'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { HiOutlineArrowNarrowRight } from 'react-icons/hi'

// Merged FeelinkQuoteVisual component
interface QuotePosition {
  top?: string
  bottom?: string
  left?: string
  right?: string
}

interface FeelinkQuoteVisualProps {
  quote: string
  position: QuotePosition
  triggerKey?: string
  color?: 'white' | 'black'
}

// 情感quotes样式配置 - 苹果液体玻璃风格
const emotionQuoteStyles = {
  love: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(255,107,157,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    animation: 'breathe 4s ease-in-out infinite',
    fontFamily: "var(--font-dancing-script), 'Dancing Script', cursive",
    fontSize: '1.1rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  sorry: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(168,218,220,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    animation: 'breathe 4s ease-in-out infinite',
    fontFamily: "var(--font-pt-serif), 'PT Serif', serif",
    fontSize: '0.95rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  blessing: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(241,196,15,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    animation: 'breathe 4s ease-in-out infinite',
    fontFamily: "var(--font-geist-sans), 'Quicksand', sans-serif",
    fontSize: '1rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  thanks: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(155,89,182,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    animation: 'breathe 4s ease-in-out infinite',
    fontFamily: "var(--font-cormorant-garamond), 'Cormorant Garamond', serif",
    fontSize: '1.05rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
  }
}

// 情感装饰符号配置
const emotionDecorations = {
  love: ['💕', '✨', '🌹', '💖'],
  sorry: ['💧', '🕊️', '🤍', '💙'], 
  blessing: ['⭐', '🌟', '✨', '🎯'],
  thanks: ['🌸', '💜', '🙏', '🌺']
}

// 情感字体配置
const emotionFonts = {
  love: "'Dancing Script', cursive",
  sorry: "'PT Serif', serif",
  blessing: "'Quicksand', sans-serif", 
  thanks: "'Cormorant Garamond', serif"
}

interface FeelinkQuoteVisualProps {
  quote: string
  position: QuotePosition
  triggerKey?: string
  color?: 'white' | 'black'
  emotion?: 'love' | 'sorry' | 'blessing' | 'thanks'
}

function FeelinkQuoteVisual({ quote, position, triggerKey, color = 'white', emotion = 'love' }: FeelinkQuoteVisualProps) {
  const [visible, setVisible] = useState(true)
  const [fadeIn, setFadeIn] = useState(false)

  useEffect(() => {
    setVisible(true)
    setFadeIn(true)
    const timer = setTimeout(() => setVisible(false), 15000)
    return () => clearTimeout(timer)
  }, [quote, triggerKey, color, emotion])

  const emotionStyle = emotionQuoteStyles[emotion]
  const textColor = color === 'white' ? '#ffffff' : '#111111'

  return (
    <div
      className={`absolute transition-all duration-1000 ease-out quote-container emotion-${emotion} ${visible && fadeIn ? 'opacity-100' : 'opacity-0'}`}
      style={{
        ...position,
        maxWidth: '60%',
        zIndex: 30,
        padding: '12px 16px',
        color: textColor,
        whiteSpace: 'pre-wrap',
        backdropFilter: 'blur(20px) saturate(180%)',
        ...emotionStyle
      }}
    >
      <div className="quote-text-content">
        {quote}
      </div>
      
      <style jsx>{`
        /* 精简的氛围动效 */
        @keyframes breathe {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.9; 
          }
          50% { 
            transform: scale(1.01); 
            opacity: 1; 
          }
        }

        /* 文字内容样式 */
        .quote-text-content {
          position: relative;
          z-index: 1;
          line-height: 1.4;
          font-weight: 500;
          animation: textGlow 3s ease-in-out infinite;
        }

        @keyframes textGlow {
          0%, 100% { 
            text-shadow: 0 1px 2px rgba(0,0,0,0.1); 
          }
          50% { 
            text-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 0 8px rgba(255,255,255,0.3); 
          }
        }

        /* 玻璃态容器 */
        .quote-container {
          position: relative;
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 
            0 4px 30px rgba(0,0,0,0.1),
            inset 0 1px 0 rgba(255,255,255,0.2),
            0 0 0 1px rgba(255,255,255,0.1);
        }

        /* 情感色彩微调 */
        .emotion-love.quote-container {
          box-shadow: 
            0 4px 30px rgba(255,107,157,0.15),
            inset 0 1px 0 rgba(255,255,255,0.2),
            0 0 0 1px rgba(255,107,157,0.1);
        }
        
        .emotion-sorry.quote-container {
          box-shadow: 
            0 4px 30px rgba(168,218,220,0.15),
            inset 0 1px 0 rgba(255,255,255,0.2),
            0 0 0 1px rgba(168,218,220,0.1);
        }
        
        .emotion-blessing.quote-container {
          box-shadow: 
            0 4px 30px rgba(241,196,15,0.15),
            inset 0 1px 0 rgba(255,255,255,0.2),
            0 0 0 1px rgba(241,196,15,0.1);
        }
        
        .emotion-thanks.quote-container {
          box-shadow: 
            0 4px 30px rgba(155,89,182,0.15),
            inset 0 1px 0 rgba(255,255,255,0.2),
            0 0 0 1px rgba(155,89,182,0.1);
        }
      `}</style>
    </div>
  )
}

interface Position {
  top?: string
  bottom?: string
  left?: string
  right?: string
}

interface Props {
  imageUrl: string
  quotes: string
  description: string
}


// 情感配置
const emotionConfig = {
  love: {
    colors: ['#ff6b9d', '#ffc0cb', '#ff8fab'],
    particles: '💖',
    rhythm: 'heartbeat',
    intensity: 'intense'
  },
  sorry: {
    colors: ['#a8dadc', '#457b9d', '#1d3557'],
    particles: '💧',
    rhythm: 'breathing',
    intensity: 'gentle'
  },
  blessing: {
    colors: ['#f1c40f', '#f39c12', '#ff9f43'],
    particles: '✨',
    rhythm: 'pulse',
    intensity: 'warm'
  },
  thanks: {
    colors: ['#9b59b6', '#8e44ad', '#6c5ce7'],
    particles: '🌸',
    rhythm: 'gentle-pulse',
    intensity: 'soft'
  }
}

export default function FeelinkDisplay({ imageUrl, quotes, description }: Props) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [displayedQuote, setDisplayedQuote] = useState('')
  const [positionStyle, setPositionStyle] = useState<Position>({})
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const animationTypeList = ['shake', 'scale', 'bounce', 'fade-in', 'ripple'] as const
  const [animationIndex, setAnimationIndex] = useState(0)
  const animationType = animationTypeList[animationIndex]
  const [hasClicked, setHasClicked] = useState(false)

  const [quoteColor, setQuoteColor] = useState<'white' | 'black'>('black')
  const [renderKey, setRenderKey] = useState(0)
  const toggleQuoteColor = () => {
    setQuoteColor(prev => (prev === 'white' ? 'black' : 'white'))
    setRenderKey(prev => prev + 1)
  }

  const [lastClickTime, setLastClickTime] = useState(Date.now())
  const [currentEmotion, setCurrentEmotion] = useState<'love' | 'sorry' | 'blessing' | 'thanks'>('love')

  const getRandomOffset = (min: number, max: number): string =>
    `${Math.floor(Math.random() * (max - min + 1)) + min}%`

  // 随机位置计算函数，确保quotes完全在图片内部
  const calculateRandomPosition = (): Position => {
    const positions = [
      { top: getRandomOffset(2, 8), left: getRandomOffset(2, 15) },      // 左上角
      { top: getRandomOffset(2, 8), right: getRandomOffset(2, 15) },     // 右上角
      { bottom: getRandomOffset(2, 15), left: getRandomOffset(2, 15) },  // 左下角
      { bottom: getRandomOffset(2, 15), right: getRandomOffset(2, 15) }  // 右下角
    ]
    
    return positions[Math.floor(Math.random() * positions.length)]
  }

  // 情感检测函数
  const detectEmotion = (quote: string): 'love' | 'sorry' | 'blessing' | 'thanks' => {
    const loveKeywords = ['love', 'heart', 'kiss', 'beautiful', 'darling', 'sweet', 'dear', 'romance', 'crush', 'adore']
    const sorryKeywords = ['sorry', 'apologize', 'forgive', 'mistake', 'wrong', 'hurt', 'sad', 'regret', 'fault']
    const blessKeywords = ['bless', 'luck', 'fortune', 'wish', 'hope', 'dream', 'success', 'joy', 'peace', 'magic']
    const thanksKeywords = ['thank', 'grateful', 'appreciate', 'gratitude', 'wonderful', 'amazing', 'help']
    
    const lowerQuote = quote.toLowerCase()
    
    if (loveKeywords.some(word => lowerQuote.includes(word))) return 'love'
    if (sorryKeywords.some(word => lowerQuote.includes(word))) return 'sorry'
    if (blessKeywords.some(word => lowerQuote.includes(word))) return 'blessing'
    if (thanksKeywords.some(word => lowerQuote.includes(word))) return 'thanks'
    
    // 默认根据图片URL判断
    if (imageUrl.includes('love')) return 'love'
    if (imageUrl.includes('apology')) return 'sorry'
    if (imageUrl.includes('blessing')) return 'blessing'
    if (imageUrl.includes('thanks')) return 'thanks'
    
    return 'love' // 默认
  }

  const showQuote = () => {
    if (!quotes) return
    
    // 检测情感类型
    const emotion = detectEmotion(quotes)
    setCurrentEmotion(emotion)
    
    setDisplayedQuote('')
    setTimeout(() => setDisplayedQuote(quotes), 100)
    setPositionStyle(calculateRandomPosition())
  }


  const handleClick = (e: React.MouseEvent) => {
    if (!hasClicked) setHasClicked(true)
    setLastClickTime(Date.now())

    const rect = imageRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 显示quote
    showQuote()

    // 保持原有的涟漪效果
    const id = Date.now()
    setRipples((prev) => [...prev, { x, y, id }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 500)
    setAnimationIndex((prev) => (prev + 1) % animationTypeList.length)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastClickTime >= 7000) {
        showQuote()
        setLastClickTime(now)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [lastClickTime, quotes])

  return (
    <div className="w-full mb-8 break-inside-avoid rounded-xl shadow-md border border-gray-200 bg-white transition-transform hover:scale-[1.01] hover:shadow-lg" style={{ overflow: 'visible' }}>
      {/* 图片区域 */}
      <div
        className={`relative w-full cursor-pointer animate-${animationType}`}
        onClick={handleClick}
        style={{ overflow: 'visible' }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="interactive"
          className="w-full h-auto object-contain transition-transform duration-300"
        />

        {/* Quote 气泡 */}
        {displayedQuote && (
          <FeelinkQuoteVisual
            quote={displayedQuote}
            position={positionStyle}
            triggerKey={displayedQuote + renderKey}
            color={quoteColor}
            emotion={currentEmotion}
          />
        )}

        {/* 提示按钮 */}
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
      <div className="w-full px-4 pt-4 pb-2 text-sm md:text-base text-gray-700 leading-relaxed">
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
