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
          className="flex-1 bg-white shadow rounded-xl px-6 py-8 flex flex-col justify-between"
        >
          <div className="flex flex-col gap-4">
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

            <p className="text-sm md:text-base text-gray-600 leading-relaxed">Say it with a picture</p>

            <motion.p
              className="text-sm md:text-base text-gray-600 leading-relaxed italic"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Turn a picture into something that says what you couldn’t.
            </motion.p>

            <p className="text-sm md:text-base text-gray-600 italic">
              Because every feeling deserves to be seen.
            </p>
          </div>
        </motion.div>

        {/* 右栏 */}
        <motion.div
          className="flex-1 bg-white shadow rounded-xl px-6 py-8 text-gray-700 flex flex-col justify-center items-center"
        >
          <div className="text-center text-gray-500 text-sm md:text-base italic space-y-5">
            <motion.p
              animate={{ opacity: [1, 0.7, 1], y: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              Say sorry. Say I love you. Say thank you.
            </motion.p>

            <motion.p
              animate={{ opacity: [1, 0.7, 1], y: [0, 2, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              Without saying anything at all.
            </motion.p>

            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [1, 0.95, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Link
                href=/feelink/upload"
                className="inline-flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold text-sm md:text-base px-4 py-2 rounded-full transition-all shadow-sm"
              >
                <HiOutlinePhotograph className="w-5 h-5" />
                <span>Begin with a picture, let the quotes speak.</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
