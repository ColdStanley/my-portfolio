'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Quicksand } from 'next/font/google'
import Link from 'next/link'


const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export default function PicGameHeader() {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full items-stretch min-h-[200px] mb-10">
      {/* 左栏：标题 + Slogan + 动效 */}
      <motion.div
        className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col gap-4">
         <motion.h1
  className={`text-4xl font-extrabold text-purple-600 tracking-wide ${quicksand.className}`}
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
  光影碎片
</motion.h1>


          <p className="text-sm text-gray-600 leading-relaxed">Shards of Light</p>
          <motion.p
            className="text-sm text-gray-600 leading-relaxed italic"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            片段即永恒，每次点击，都是一次静静的靠近
          </motion.p>
        </div>
      </motion.div>


      {/* 中栏：空卡片占位（含动效和链接） */}
    <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center justify-center h-[200px]">

  <div className="text-center text-gray-500 text-sm italic space-y-4">
    <motion.p
      animate={{ opacity: [1, 0.7, 1], y: [0, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      致自己：一切都是最好的安排
    </motion.p>

    <motion.p
      animate={{ opacity: [1, 0.7, 1], y: [0, 2, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      对他He/她She/They：对不起！我爱你！谢谢你！祝福你！
    </motion.p>

    <motion.div
      animate={{ scale: [1, 1.05, 1], opacity: [1, 0.9, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Link
        href="/picgame/upload"
        className="text-purple-500 font-medium hover:underline hover:text-purple-700 transition-all"
      >
        点我，生成专属的“光影碎片”
      </Link>
    </motion.div>
  </div>
</div>


      {/* 右栏：介绍说明 */}
      <motion.div
        className="flex-1 bg-white shadow rounded-xl p-6 text-gray-700 flex flex-col justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="text-sm leading-relaxed space-y-3 text-gray-600">
          <p>你以为这是普通图片？那你太小看我了</p>
          <p className="border-l-4 border-purple-300 pl-3 italic">
            有些话我们不好意思说出口，图片会替我们说。
          </p>
          <p className="border-l-4 border-purple-300 pl-3 italic">
            如果你愿意，也许能从这里看到更深的自己。
          </p>
          <p className="border-l-4 border-purple-300 pl-3 italic">
            希望你在这里找到一点点“被懂得”的感觉。
          </p>
          
        </div>
      </motion.div>
    </div>
  )
}
