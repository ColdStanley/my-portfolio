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
  const [positionStyle, setPositionStyle] = useState<QuotePosition>({})
  const [imageHeight, setImageHeight] = useState<number>(300)
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
  
  // 新增状态
  const [colorSpreads, setColorSpreads] = useState<{ x: number; y: number; id: number; emotion: string }[]>([])
  const [particles, setParticles] = useState<{ x: number; y: number; id: number; emotion: string; vx: number; vy: number }[]>([])
  const [currentEmotion, setCurrentEmotion] = useState<'love' | 'sorry' | 'blessing' | 'thanks'>('love')
  const [imageTransform, setImageTransform] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showGlow, setShowGlow] = useState(false)

  const getRandomOffset = (min: number, max: number): string =>
    `${Math.floor(Math.random() * (max - min + 1)) + min}%`

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

  const showQuote = (corner: CornerKey, clickX?: number, clickY?: number) => {
    const lines = quotes[corner]
    if (!lines || lines.length === 0) return
    const line = lines[Math.floor(Math.random() * lines.length)]
    
    // 检测情感类型
    const emotion = detectEmotion(line)
    setCurrentEmotion(emotion)
    
    setDisplayedQuote('')
    setTimeout(() => setDisplayedQuote(line || ''), 100)
    setPositionStyle({
      ...(corner.includes('t') ? { top: getRandomOffset(1, 15) } : { bottom: getRandomOffset(1, 15) }),
      ...(corner.includes('l') ? { left: getRandomOffset(1, 20) } : { right: getRandomOffset(1, 20) }),
    })

    // 如果有点击坐标，触发效果
    if (clickX !== undefined && clickY !== undefined) {
      triggerEmotionEffects(emotion, clickX, clickY, corner)
    }
  }

  // 触发情感效果
  const triggerEmotionEffects = (emotion: 'love' | 'sorry' | 'blessing' | 'thanks', x: number, y: number, corner: CornerKey) => {
    const id = Date.now()
    
    // 1. 情感色彩扩散效果
    setColorSpreads(prev => [...prev, { x, y, id, emotion }])
    setTimeout(() => setColorSpreads(prev => prev.filter(s => s.id !== id)), 1500)

    // 2. 粒子爆炸效果
    const particleCount = emotion === 'love' ? 8 : 5
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      x,
      y,
      id: id + i,
      emotion,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200
    }))
    setParticles(prev => [...prev, ...newParticles])
    setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id))), 2000)

    // 3. 图片深度变化
    const tiltDirection = corner.includes('l') ? 'left' : 'right'
    const tiltClass = `tilt-${tiltDirection}-${emotion}`
    setImageTransform(tiltClass)
    setTimeout(() => setImageTransform(''), 800)

    // 4. 心跳/呼吸节奏（通过CSS类控制）
    const rhythmClass = `rhythm-${emotionConfig[emotion].rhythm}`
    setImageTransform(prev => `${prev} ${rhythmClass}`)
    setTimeout(() => setImageTransform(prev => prev.replace(rhythmClass, '')), 3000)

    // 7. 情感震动模式
    const vibrateClass = `vibrate-${emotionConfig[emotion].intensity}`
    setImageTransform(prev => `${prev} ${vibrateClass}`)
    setTimeout(() => setImageTransform(prev => prev.replace(vibrateClass, '')), 
      emotion === 'love' ? 500 : emotion === 'sorry' ? 1500 : emotion === 'blessing' ? 2000 : 3000)
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

    // 确定点击的角落
    let corner: CornerKey
    if (x <= width / 2 && y <= height / 2) corner = 'lt'
    else if (x > width / 2 && y <= height / 2) corner = 'rt'
    else if (x <= width / 2 && y > height / 2) corner = 'lb'
    else corner = 'rb'

    // 显示quote并触发所有效果
    showQuote(corner, x, y)

    // 保持原有的涟漪效果
    const id = Date.now()
    setRipples((prev) => [...prev, { x, y, id }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 500)
    setAnimationIndex((prev) => (prev + 1) % animationTypeList.length)

    // 触发光晕效果
    setShowGlow(true)
    setTimeout(() => setShowGlow(false), 300)
  }

  // 5. 光晕追踪效果
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = imageRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

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
    <div className="w-full mb-8 break-inside-avoid rounded-xl shadow-md border border-gray-200 bg-white transition-transform hover:scale-[1.01] hover:shadow-lg" style={{ overflow: 'visible' }}>
      {/* 图片区域 */}
      <div
        className={`relative w-full cursor-pointer animate-${animationType} ${imageTransform}`}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        style={{ overflow: 'visible' }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="interactive"
          className="w-full h-auto object-contain transition-transform duration-300"
        />

        {/* 5. 光晕追踪效果 */}
        <div
          className="absolute pointer-events-none transition-opacity duration-200"
          style={{
            left: mousePosition.x - 20,
            top: mousePosition.y - 20,
            width: 40,
            height: 40,
            background: `radial-gradient(circle, ${emotionConfig[currentEmotion].colors[0]}40 0%, transparent 70%)`,
            borderRadius: '50%',
            opacity: showGlow ? 0.8 : 0.3,
            transform: showGlow ? 'scale(2)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}
        />

        {/* 1. 情感色彩扩散效果 */}
        {colorSpreads.map((spread) => (
          <div
            key={spread.id}
            className="absolute pointer-events-none animate-color-spread"
            style={{
              left: spread.x - 50,
              top: spread.y - 50,
              width: 100,
              height: 100,
              background: `radial-gradient(circle, ${emotionConfig[spread.emotion as keyof typeof emotionConfig].colors[0]}60 0%, ${emotionConfig[spread.emotion as keyof typeof emotionConfig].colors[1]}30 50%, transparent 100%)`,
              borderRadius: '50%',
            }}
          />
        ))}

        {/* 2. 粒子爆炸效果 */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute pointer-events-none animate-particle-explosion text-2xl"
            style={{
              left: particle.x,
              top: particle.y,
              '--vx': `${particle.vx}px`,
              '--vy': `${particle.vy}px`,
            } as React.CSSProperties}
          >
            {emotionConfig[particle.emotion as keyof typeof emotionConfig].particles}
          </div>
        ))}


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

        /* 1. 情感色彩扩散效果 */
        @keyframes color-spread {
          0% { transform: scale(0); opacity: 0.8; }
          100% { transform: scale(4); opacity: 0; }
        }
        .animate-color-spread { animation: color-spread 1.5s ease-out; }

        /* 2. 粒子爆炸效果 */
        @keyframes particle-explosion {
          0% { 
            transform: translate(0, 0) scale(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(var(--vx), var(--vy)) scale(0.3); 
            opacity: 0; 
          }
        }
        .animate-particle-explosion { animation: particle-explosion 2s ease-out; }

        /* 3. 图片深度变化 - 左倾斜 */
        .tilt-left-love { transform: perspective(1000px) rotateY(-12deg) rotateX(3deg); transition: transform 0.8s ease; }
        .tilt-left-sorry { transform: perspective(1000px) rotateY(-8deg) rotateX(2deg); transition: transform 0.8s ease; }
        .tilt-left-blessing { transform: perspective(1000px) rotateY(-10deg) rotateX(4deg); transition: transform 0.8s ease; }
        .tilt-left-thanks { transform: perspective(1000px) rotateY(-6deg) rotateX(2deg); transition: transform 0.8s ease; }

        /* 3. 图片深度变化 - 右倾斜 */
        .tilt-right-love { transform: perspective(1000px) rotateY(12deg) rotateX(3deg); transition: transform 0.8s ease; }
        .tilt-right-sorry { transform: perspective(1000px) rotateY(8deg) rotateX(2deg); transition: transform 0.8s ease; }
        .tilt-right-blessing { transform: perspective(1000px) rotateY(10deg) rotateX(4deg); transition: transform 0.8s ease; }
        .tilt-right-thanks { transform: perspective(1000px) rotateY(6deg) rotateX(2deg); transition: transform 0.8s ease; }

        /* 4. 心跳/呼吸节奏效果 */
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.05); }
          28% { transform: scale(1); }
          42% { transform: scale(1.05); }
          70% { transform: scale(1); }
        }
        .rhythm-heartbeat { animation: heartbeat 1.2s ease-in-out infinite; }

        @keyframes breathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .rhythm-breathing { animation: breathing 3s ease-in-out infinite; }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.9; }
        }
        .rhythm-pulse { animation: pulse 2s ease-in-out infinite; }

        @keyframes gentle-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        .rhythm-gentle-pulse { animation: gentle-pulse 2.5s ease-in-out infinite; }

        /* 7. 情感震动模式 */
        @keyframes intense-vibration {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-2px); }
          20% { transform: translateX(2px); }
          30% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          50% { transform: translateX(-1px); }
          60% { transform: translateX(1px); }
          70% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
          90% { transform: translateX(-1px); }
        }
        .vibrate-intense { animation: intense-vibration 0.5s ease-in-out; }

        @keyframes gentle-sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          75% { transform: rotate(-1deg); }
        }
        .vibrate-gentle { animation: gentle-sway 1.5s ease-in-out infinite; }

        @keyframes warm-glow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 5px rgba(241, 196, 15, 0.3)); }
          50% { filter: brightness(1.1) drop-shadow(0 0 15px rgba(241, 196, 15, 0.6)); }
        }
        .vibrate-warm { animation: warm-glow 2s ease-in-out infinite; }

        @keyframes soft-flutter {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-1px) rotate(0.5deg); }
          67% { transform: translateY(1px) rotate(-0.5deg); }
        }
        .vibrate-soft { animation: soft-flutter 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
