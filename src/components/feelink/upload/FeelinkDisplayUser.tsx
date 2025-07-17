'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { HiOutlineArrowNarrowRight } from 'react-icons/hi'
// 情感quotes样式配置
const emotionQuoteStyles = {
  love: {
    background: 'linear-gradient(135deg, rgba(255,107,157,0.85) 0%, rgba(255,192,203,0.7) 50%, rgba(255,182,193,0.6) 100%)',
    borderRadius: '60% 40% 70% 30% / 40% 30% 70% 60%',
    boxShadow: '0 8px 24px rgba(255,107,157,0.4), inset 0 2px 8px rgba(255,255,255,0.3), 0 0 15px rgba(255,107,157,0.2)',
    border: '2px solid rgba(255,182,193,0.6)',
    animation: 'heartFloat 3s ease-in-out infinite',
    fontFamily: "var(--font-dancing-script), 'Dancing Script', cursive",
    fontSize: '1.1rem',
    textShadow: '0 2px 4px rgba(255,107,157,0.3), 0 0 8px rgba(255,255,255,0.5)'
  },
  sorry: {
    background: 'linear-gradient(135deg, rgba(168,218,220,0.85) 0%, rgba(69,123,157,0.7) 50%, rgba(29,53,87,0.6) 100%)',
    borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
    boxShadow: '0 6px 18px rgba(168,218,220,0.5), inset 0 2px 6px rgba(255,255,255,0.2), 0 0 12px rgba(168,218,220,0.3)',
    border: '1px solid rgba(168,218,220,0.7)',
    animation: 'teardropFloat 4s ease-in-out infinite',
    fontFamily: "var(--font-pt-serif), 'PT Serif', serif",
    fontSize: '0.95rem',
    textShadow: '0 1px 3px rgba(69,123,157,0.4)'
  },
  blessing: {
    background: 'linear-gradient(135deg, rgba(241,196,15,0.85) 0%, rgba(243,156,18,0.7) 50%, rgba(255,159,67,0.6) 100%)',
    borderRadius: '55% 45% 65% 35% / 45% 35% 65% 55%',
    boxShadow: '0 10px 30px rgba(241,196,15,0.4), inset 0 3px 10px rgba(255,255,255,0.4), 0 0 20px rgba(241,196,15,0.3)',
    border: '2px solid rgba(241,196,15,0.8)',
    animation: 'starFloat 2.5s ease-in-out infinite',
    fontFamily: "var(--font-geist-sans), 'Quicksand', sans-serif",
    fontSize: '1rem',
    textShadow: '0 0 8px rgba(255,255,255,0.8), 0 2px 4px rgba(241,196,15,0.3)'
  },
  thanks: {
    background: 'linear-gradient(135deg, rgba(155,89,182,0.85) 0%, rgba(142,68,173,0.7) 50%, rgba(108,92,231,0.6) 100%)',
    borderRadius: '50% 50% 70% 30% / 30% 70% 50% 50%',
    boxShadow: '0 7px 21px rgba(155,89,182,0.4), inset 0 2px 7px rgba(255,255,255,0.25), 0 0 15px rgba(155,89,182,0.2)',
    border: '1.5px solid rgba(155,89,182,0.7)',
    animation: 'gentleFloat 3.5s ease-in-out infinite',
    fontFamily: "var(--font-cormorant-garamond), 'Cormorant Garamond', serif",
    fontSize: '1.05rem',
    textShadow: '0 1px 4px rgba(155,89,182,0.3), 0 0 6px rgba(255,255,255,0.4)'
  }
}

// 情感装饰符号配置
const emotionDecorations = {
  love: ['💕', '✨', '🌹', '💖'],
  sorry: ['💧', '🕊️', '🤍', '💙'], 
  blessing: ['⭐', '🌟', '✨', '🎯'],
  thanks: ['🌸', '💜', '🙏', '🌺']
}

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
  emotion?: 'love' | 'sorry' | 'blessing' | 'thanks'
}

function FeelinkQuoteVisual({ quote, position, triggerKey, color = 'white', emotion = 'love' }: FeelinkQuoteVisualProps) {
  const [visible, setVisible] = useState(true)
  const [showTypewriter, setShowTypewriter] = useState(false)
  const [decorationVisible, setDecorationVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setShowTypewriter(true)
    setTimeout(() => setDecorationVisible(true), 500)
    const timer = setTimeout(() => setVisible(false), 20000)
    return () => clearTimeout(timer)
  }, [quote, triggerKey, color, emotion])

  const emotionStyle = emotionQuoteStyles[emotion]
  const decorations = emotionDecorations[emotion]
  const textColor = color === 'white' ? '#ffffff' : '#111111'

  // 智能引号组件
  const QuoteDecorators = () => (
    <>
      <span className={`quote-mark quote-start emotion-${emotion}`}>"</span>
      <span className={`quote-text ${showTypewriter ? 'typewriter-active' : ''}`}>
        {quote}
      </span>
      <span className={`quote-mark quote-end emotion-${emotion}`}>"</span>
    </>
  )

  // 装饰符号组件
  const EmotionDecorations = () => (
    <>
      {decorations.map((symbol, index) => (
        <span
          key={index}
          className={`emotion-decoration decoration-${index} ${decorationVisible ? 'visible' : ''}`}
          style={{
            position: 'absolute',
            fontSize: '0.8rem',
            zIndex: -1,
            opacity: decorationVisible ? 0.6 : 0,
            transition: 'all 0.8s ease',
            animationDelay: `${index * 0.2}s`
          }}
        >
          {symbol}
        </span>
      ))}
    </>
  )

  return (
    <div
      className={`absolute transition-all duration-700 ease-out quote-container emotion-${emotion} ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        ...position,
        maxWidth: '70%',
        zIndex: 30,
        padding: '16px 22px',
        margin: '20px',
        color: textColor,
        whiteSpace: 'pre-wrap',
        backdropFilter: 'blur(2px)',
        ...emotionStyle
      }}
    >
      <EmotionDecorations />
      <QuoteDecorators />
      
      <style jsx>{`
        /* 原有动画保持 */
        @keyframes petalFloat {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-1deg); }
          100% { transform: translateY(0px) rotate(1deg); }
        }

        /* 1. 新增情感动画 */
        @keyframes heartFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-4px) rotate(-0.5deg) scale(1.02); }
          50% { transform: translateY(-8px) rotate(0deg) scale(1.04); }
          75% { transform: translateY(-4px) rotate(0.5deg) scale(1.02); }
        }

        @keyframes teardropFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-3px) rotate(-0.3deg) scale(1.01); }
        }

        @keyframes starFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); filter: brightness(1); }
          33% { transform: translateY(-5px) rotate(1deg) scale(1.03); filter: brightness(1.1); }
          67% { transform: translateY(-3px) rotate(-0.5deg) scale(1.02); filter: brightness(1.05); }
        }

        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-4px) rotate(0.3deg) scale(1.015); }
        }

        /* 2. 文字动态效果 */
        .typewriter-active {
          overflow: hidden;
          white-space: nowrap;
          animation: typewriter 2s steps(40) 1 normal both;
        }

        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }

        .quote-text {
          display: inline-block;
          animation: text-breathe 4s ease-in-out infinite;
        }

        @keyframes text-breathe {
          0%, 100% { letter-spacing: 0px; }
          50% { letter-spacing: 0.3px; }
        }

        /* 3. 交互式引号符号 */
        .quote-mark {
          font-size: 1.5em;
          font-weight: bold;
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        .quote-start {
          margin-right: 2px;
          animation: quote-pulse-start 3s ease-in-out infinite;
        }

        .quote-end {
          margin-left: 2px;
          animation: quote-pulse-end 3s ease-in-out infinite;
        }

        @keyframes quote-pulse-start {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.1) rotate(-2deg); opacity: 1; }
        }

        @keyframes quote-pulse-end {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.1) rotate(2deg); opacity: 1; }
        }

        /* 情感特定引号颜色 */
        .emotion-love .quote-mark { color: rgba(255,107,157,0.9); text-shadow: 0 0 4px rgba(255,107,157,0.3); }
        .emotion-sorry .quote-mark { color: rgba(69,123,157,0.9); text-shadow: 0 0 4px rgba(69,123,157,0.3); }
        .emotion-blessing .quote-mark { color: rgba(241,196,15,0.9); text-shadow: 0 0 4px rgba(241,196,15,0.3); }
        .emotion-thanks .quote-mark { color: rgba(155,89,182,0.9); text-shadow: 0 0 4px rgba(155,89,182,0.3); }

        /* 4. 装饰符号动画 */
        .emotion-decoration {
          animation: decoration-float 4s ease-in-out infinite;
        }

        .decoration-0 { top: -10px; left: -5px; animation-delay: 0s; }
        .decoration-1 { top: -12px; right: -3px; animation-delay: 0.5s; }
        .decoration-2 { bottom: -10px; left: -3px; animation-delay: 1s; }
        .decoration-3 { bottom: -12px; right: -5px; animation-delay: 1.5s; }

        @keyframes decoration-float {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-3px) rotate(5deg) scale(1.1); }
          50% { transform: translateY(-1px) rotate(-3deg) scale(0.9); }
          75% { transform: translateY(-2px) rotate(2deg) scale(1.05); }
        }

        /* 5. 高级视觉效果 */
        .quote-container {
          position: relative;
        }

        .quote-container::before {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          background: inherit;
          border-radius: inherit;
          filter: blur(6px);
          opacity: 0.25;
          z-index: -2;
        }

        /* 玻璃态增强效果 */
        .emotion-love.quote-container {
          backdrop-filter: blur(8px) saturate(180%);
        }
        
        .emotion-sorry.quote-container {
          backdrop-filter: blur(6px) saturate(120%);
        }
        
        .emotion-blessing.quote-container {
          backdrop-filter: blur(10px) saturate(200%) brightness(110%);
        }
        
        .emotion-thanks.quote-container {
          backdrop-filter: blur(7px) saturate(150%);
        }

        /* 霓虹效果增强 */
        .emotion-blessing.quote-container {
          box-shadow: 
            0 10px 30px rgba(241,196,15,0.4), 
            inset 0 3px 10px rgba(255,255,255,0.4), 
            0 0 20px rgba(241,196,15,0.3),
            0 0 40px rgba(241,196,15,0.1);
        }
      `}</style>
    </div>
  )
}

// ✅ 分享行为辅助工具
const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

export default function FeelinkDisplayUser({ imageUrl, description, quotes }: { imageUrl: string; description: string; quotes: string }) {
  const imageRef = useRef<HTMLImageElement>(null)
  const quoteArray = quotes?.split('\n').filter(line => line.trim() !== '') || []

  const [displayedQuote, setDisplayedQuote] = useState('')
  const [positionStyle, setPositionStyle] = useState<{ top?: string; bottom?: string; left?: string; right?: string }>({})
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const [imageHeight, setImageHeight] = useState<number>(300)

  const [quoteColor, setQuoteColor] = useState<'white' | 'black'>('black')
  const [hasPlayed, setHasPlayed] = useState(false)
  const [showColorToggle, setShowColorToggle] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<'love' | 'sorry' | 'blessing' | 'thanks'>('love')

  const animationTypeList = ['shake', 'scale', 'bounce', 'fade-in', 'ripple'] as const
  const [animationIndex, setAnimationIndex] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(Date.now())

  const toggleQuoteColor = () => {
    setQuoteColor(prev => (prev === 'white' ? 'black' : 'white'))
  }

  const getRandomOffset = (min: number, max: number): string => `${Math.floor(Math.random() * (max - min + 1)) + min}%`

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

  const showQuote = (e?: React.MouseEvent | null, xPos?: number, yPos?: number) => {
    if (!imageRef.current || quoteArray.length === 0) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e ? e.clientX - rect.left : xPos ?? rect.width / 2
    const y = e ? e.clientY - rect.top : yPos ?? rect.height / 2

    setDisplayedQuote('')
    setTimeout(() => {
      const quote = quoteArray[Math.floor(Math.random() * quoteArray.length)]
      
      // 检测情感类型
      const emotion = detectEmotion(quote)
      setCurrentEmotion(emotion)
      
      setDisplayedQuote(quote)
      setPositionStyle({
        ...(y <= rect.height / 2 ? { top: getRandomOffset(5, 15) } : { bottom: getRandomOffset(5, 15) }),
        ...(x <= rect.width / 2 ? { left: getRandomOffset(5, 15) } : { right: getRandomOffset(5, 15) }),
      })
      setTimeout(() => setDisplayedQuote(''), 20000)
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
    <div className="w-full mb-6 break-inside-avoid rounded-md shadow-sm border border-gray-200" style={{ overflow: 'visible' }}>
      {/* 图片区域 */}
      <div
        className={`relative w-full cursor-pointer animate-${animationTypeList[animationIndex]}`}
        onClick={(e) => showQuote(e)}
        style={{ overflow: 'visible' }}
      >
        <img
          ref={imageRef}
          src={safeImageUrl}
          alt="interactive"
          className="w-full h-auto object-contain rounded-t-md"
        />

        {/* Quote 气泡 */}
        {displayedQuote && (
          <FeelinkQuoteVisual
            quote={displayedQuote}
            position={positionStyle}
            color={quoteColor}
            emotion={currentEmotion}
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

        {/* 分享按钮组 - 固定位置，不受quotes状态影响 */}
        <div className="absolute bottom-3 right-3 z-50 flex gap-2" style={{ position: 'absolute' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(window.location.href)
              alert('✅ Link copied!')
            }}
            className="text-white bg-purple-500/50 hover:bg-purple-600 text-xs px-3 py-1 rounded-full shadow"
          >
            Copy Link
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(`mailto:?subject=Check this out&body=${window.location.href}`, '_blank')
              alert('✅ Email client opened!')
            }}
            className="text-white bg-purple-500/50 hover:bg-purple-600 text-xs px-3 py-1 rounded-full shadow"
          >
            Email
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, '_blank')
              alert('✅ WhatsApp share opened!')
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
