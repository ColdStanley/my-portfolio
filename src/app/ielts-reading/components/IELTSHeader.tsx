'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function IELTSHeader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* 标题区域 */}
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex flex-row items-center gap-3 mb-3">
          <h1 className="text-4xl font-extrabold text-purple-600">IELTS Reading</h1>
          <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Image src="/images/IELTS7.png" alt="IELTS7" width={60} height={60} />
          </motion.div>
        </div>
        <blockquote className="text-sm text-gray-600 leading-relaxed pl-2 border-l-4 border-purple-400">
          <p>"We are what we repeatedly do.</p>
          <p>我们由我们反复做的事情塑造而成。</p>
          <p>Excellence, then, is not an act, but a habit."</p>
          <p>卓越并非一时之举，而是一种习惯</p>
          <footer className="mt-2 text-xs text-gray-500">—— Aristotle / 亚里士多德</footer>
        </blockquote>
      </div>

      {/* 打赏区域 */}
      <div className="bg-white shadow rounded-xl p-4 text-center text-gray-700 flex flex-col items-center justify-center space-y-6">
        <div className="text-sm text-gray-500 leading-relaxed space-y-1">
          <p>🧑‍💻 独立开发，咖啡续命，小猫陪伴。</p>
          <p>💰 如果你觉得这个工具对你有帮助，欢迎打赏支持！</p>
          <p>😽 本身拮据的同学，就不要打赏了，转发给需要的朋友，然后别忘了我和我的小猫就行</p>
        </div>
        <div className="grid grid-cols-3 gap-6 w-full max-w-md">
          <div className="flex flex-col items-center space-y-2">
            <Image src="/images/wechat35.png" alt="wechat35" width={90} height={90} />
            <div className="text-center text-sm text-gray-600 leading-tight">
              <p>☕</p>
              <p>Buy me a coffe</p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Image src="/images/wechat70.png" alt="wechat70" width={90} height={90} />
            <div className="text-center text-sm text-gray-600 leading-tight">
              <p>🐾</p>
              <p>给小猫买袋猫粮</p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <p className="text-base font-semibold text-gray-800 invisible">_</p>
            <div className="w-[90px] h-[90px] flex items-center justify-center">
              <span className="text-3xl">😺</span>
            </div>
            <div className="text-center text-sm text-gray-600 leading-tight">
              <p>喵～</p>
            </div>
          </div>
        </div>
      </div>

      {/* 视频区域 */}
      <div className="bg-white shadow rounded-xl p-4 flex items-center justify-center">
        <video
          src="/images/cat.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="rounded-xl w-full h-auto object-cover"
        />
      </div>
    </div>
  )
}
