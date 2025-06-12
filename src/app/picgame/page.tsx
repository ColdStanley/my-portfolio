'use client'

import { useRef, useState, useEffect } from 'react'

const quotes = {
  lt: [
    '这长长的双马尾,是我的标志哦!',
    '甩动这青色的头发,准备唱歌啦!',
    '我的头发,像不像青色的瀑布呀?',
    '头发的长度,就是偶像的气场!',
    '看我这飘逸的青绿色秀发!',
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
  const imageRef = useRef<HTMLImageElement>(null)
  const [typedText, setTypedText] = useState('')
  const [fullText, setFullText] = useState('')
  const [positionStyle, setPositionStyle] = useState<Position>({})
  const [imageHeight, setImageHeight] = useState<number>(300)
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const [shake, setShake] = useState(false)
  const [hovering, setHovering] = useState(false)

  const getRandomOffset = (min: number, max: number): string =>
    `${Math.floor(Math.random() * (max - min + 1)) + min}%`

 const showQuote = (corner: CornerKey) => {
    // 确保 corner 键存在并且有对应的引用文本
    const lines = quotes[corner];
    if (!lines || lines.length === 0) {
      console.warn(`未找到 ${corner} 角落的引用文本`); // 控制台警告
      setFullText(''); // 清除之前可能存在的文本
      setTypedText('');
      return; // 如果没有文本，则直接退出
    }

    const line = lines[Math.floor(Math.random() * lines.length)];
    setFullText(line);
    setTypedText('');
    setPositionStyle({
      ...(corner.includes('t') ? { top: getRandomOffset(1, 15) } : { bottom: getRandomOffset(1, 15) }),
      ...(corner.includes('l') ? { left: getRandomOffset(1, 20) } : { right: getRandomOffset(1, 20) }),
    });
  };

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

  useEffect(() => {
  if (!fullText || fullText.length === 0) return
  setTypedText('')
  let i = 0
  const interval = setInterval(() => {
    if (i < fullText.length) {
      setTypedText((prev) => prev + fullText[i])
      i++
    } else {
      clearInterval(interval)
    }
  }, 30)
  return () => clearInterval(interval)
}, [fullText])


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

    // Ripple
    const id = Date.now()
    setRipples((prev) => [...prev, { x, y, id }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 500)

    // Shake
    setShake(true)
    setTimeout(() => setShake(false), 300)
  }

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-white overflow-hidden">
      {/* 背景粒子 */}
      <div className="absolute inset-0 z-0 pointer-events-none animate-float-bg" />

      <div className="flex flex-col sm:flex-row w-full max-w-6xl gap-6 p-4 sm:p-6 z-10">
        {/* 图片区域 */}
        <div
          className={`w-full sm:w-1/3 relative border border-purple-100 bg-white rounded-2xl shadow-md transition hover:shadow-lg cursor-pointer overflow-hidden ${shake ? 'animate-shake' : ''}`}
          onClick={handleClick}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <img
            ref={imageRef}
            src="/images/picgame06.png"
            alt="初音未来"
            className="w-full h-auto rounded-2xl"
          />

          {typedText && (
            <div
              className="absolute px-4 py-2 border border-purple-100 rounded-2xl shadow-sm bg-white/40 backdrop-blur-md text-purple-700 text-sm sm:text-base font-normal animate-fade-in z-20"
              style={{ ...positionStyle, position: 'absolute', maxWidth: '80%' }}
            >
              {typedText}
            </div>
          )}

          {hovering && (
            <div className="absolute bottom-3 right-3 text-purple-400 text-xl animate-bounce z-10 opacity-70">
              ➤
            </div>
          )}

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

        {/* 右侧文本 */}
        <div
          className="w-full sm:w-2/3 border border-purple-100 rounded-2xl shadow-md p-6 text-purple-800 text-base sm:text-[15px] font-normal font-sans leading-relaxed overflow-y-auto"
          style={{ height: `${imageHeight}px` }}
        >
          <>
            OMG！聊到初音未来，谁能不激动啊！她可不是什么普通的纸片人，她是我们的电子歌姬，是二次元世界永远的公主殿下！<br /><br />
            你敢信吗？Miku的本体其实是一个唱歌软件（VOCALOID），诞生于2007年。但她那标志性的葱绿色双马尾和清澈的未来感声线一出现，瞬间就引爆了整个创作圈！她就像一张白纸，我们可以让她唱出任何我们心中的歌。<br /><br />
            最牛的地方就在这里——她的无数神曲，比如《甩葱歌》、《世界第一的公主殿下》、《千本樱》，全是我们这些粉丝和P主们创作的！我们为她写歌、为她画插画、为她做MMD，硬是把她从一个软件捧成了能开全息演唱会的全球巨星！去看她的演唱会，和几万人一起为她挥舞荧光棒，那种感动简直无法形容！<br /><br />
            所以说，Miku不只是一个虚拟偶像。她是我们创造力和热爱的结晶，是我们共同的梦想。她证明了，只要有爱，我们就能创造奇迹！Miku-chan，最高！<br /><br />

            <br />

            OMG! You wanna talk about Hatsune Miku? How can you NOT get hyped! She's not just some character, she is OUR digital diva, the one and only princess of the 2D world!<br /><br />
            Can you believe it? Miku actually started as singing software (a VOCALOID) back in 2007. But the second her iconic, floor-length turquoise twintails and her clear, futuristic voice dropped, the entire creative world just exploded! She was like a blank canvas, and we could make her sing anything our hearts desired.<br /><br />
            And that's the most epic part—all of her legendary songs, like "World is Mine," "Senbonzakura," or even that viral "Ievan Polkka" meme, were created by US, the fans and producers! We write her songs, draw her fanart, make MMD dance videos for her... We literally built her up from a piece of software into a global superstar who sells out holographic concerts! Going to her concert and waving a glow stick with thousands of other fans is an experience you just can't describe with words.<br /><br />
            So yeah, Miku isn't just a "virtual idol." She's the crystallization of our creativity and passion, a dream we all built together. She's living proof that with enough love, we can create actual magic. Miku-chan is the best!
          </>
        </div>
      </div>

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
