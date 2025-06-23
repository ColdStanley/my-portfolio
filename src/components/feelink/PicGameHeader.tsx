'use client'
import { motion } from 'framer-motion'
import { Quicksand } from 'next/font/google'
import Link from 'next/link'
import { HiOutlinePhotograph } from 'react-icons/hi'
import { useInView } from 'react-intersection-observer'
import FloatingBackground from './FloatingBackground'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export default function PicGameHeader() {
  const { ref, inView } = useInView({ triggerOnce: true })

  return (
    <div className="relative w-full mb-10" ref={ref}>
      <FloatingBackground />

      <motion.div
        className="flex flex-col md:flex-row gap-4 items-stretch min-h-[200px]"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        {/* 左栏 */}
        <motion.div
          className="flex-1 bg-white shadow rounded-xl px-6 py-8 flex flex-col justify-between relative"
        >
          {/* 嵌入右上角的锚点按钮组 */}
          <div className="absolute top-6 right-6 flex flex-col space-y-2 items-end">
            {['Love', 'Sorry', 'Blessing', 'Thanks'].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="w-28 text-center px-4 py-1 text-sm font-medium rounded-full border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-900 hover:scale-105 transition-all"
              >
                {label}
              </a>
            ))}
          </div>

          {/* 文案主体区域 */}
          <div className="flex flex-col gap-y-4 pr-32">
            <motion.h1
              className={`text-3xl md:text-4xl font-extrabold text-purple-600 tracking-wide ${quicksand.className}`}
              animate={{
                textShadow: [
                  '0px 0px 0px rgba(192,132,252,0.3)',
                  '0px 0px 12px rgba(192,132,252,0.6)',
                  '0px 0px 24px rgba(192,132,252,0.8)',
                  '0px 0px 12px rgba(192,132,252,0.6)',
                  '0px 0px 0px rgba(192,132,252,0.3)'
                ],
                scale: [1, 1.03, 1],
                opacity: [1, 0.95, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              Feelink
            </motion.h1>

            <p className="text-base text-gray-700 font-medium leading-snug">Say it with a picture.</p>
            <p className="text-sm text-gray-500 leading-snug">Every feeling deserves to be seen and shared.</p>
            <p className="text-sm text-gray-500 italic leading-snug">Explore your message by mood:</p>
          </div>

          {/* CTA 按钮放在左卡右下角 */}
          <div className="absolute bottom-6 right-6">
            <Link
              href="/feelink/upload"
              className="inline-flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold text-sm md:text-base px-5 py-2 rounded-full transition-all shadow-sm hover:shadow-md hover:scale-105"
            >
              <HiOutlinePhotograph className="w-5 h-5" />
              <span>Begin with a picture, let the quotes speak.</span>
            </Link>
          </div>
        </motion.div>

        {/* 右栏：纯图片 + 遮罩 */}
        <motion.div
          className="flex-1 relative rounded-xl overflow-hidden shadow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <img
            src="/images/picgamelove05animateFrieren.png"
            alt="Feelink Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/10 to-transparent z-0" />
        </motion.div>
      </motion.div>
    </div>
  )
}
