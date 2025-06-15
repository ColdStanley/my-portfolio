'use client'

import { motion } from 'framer-motion'
import { Quicksand } from 'next/font/google'
import Link from 'next/link'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export default function PicGameUploadHeader() {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full items-stretch min-h-[200px] mb-10">
      {/* Left: Brand + Emotional Hook */}
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
                '0px 0px 0px rgba(192,132,252,0.3)',
              ],
              scale: [1, 1.03, 1],
              opacity: [1, 0.95, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            Feelink
          </motion.h1>

          <p className="text-sm text-gray-600 leading-relaxed">Say it with a picture</p>
          <motion.p
            className="text-sm text-gray-600 leading-relaxed italic"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Every click brings you closer. <br />
            Each photo holds a feeling you never said aloud.
          </motion.p>
        </div>
      </motion.div>

      {/* Center: Action Guide */}
      <motion.div
        className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0 }}
      >
        <div className="text-sm leading-relaxed text-gray-600 space-y-4">
          <p className="font-semibold text-purple-500">📤 Create Your Feelink</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Upload your photo</li>
            <li>Choose a quote from the library</li>
            <li>Add a description – short or long – to tell your story</li>
          </ul>
          <p className="text-xs text-gray-500 italic pt-2">
            Want a custom quote? Email us at <span className="underline">stanleytonight@hotmail.com</span>
          </p>
          <p className="text-xs text-gray-400 italic pt-1">
            Upload your photo to begin.
          </p>
        </div>
      </motion.div>

      {/* Right: Quote vs Description Guide */}
      <motion.div
        className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <div className="text-sm leading-relaxed text-gray-600 space-y-4">
          <p className="font-semibold text-purple-500">💡 Not sure what to write?</p>
          <div>
            <p className="font-medium text-gray-700">Quote</p>
            <p className="italic text-purple-500">“I never had the courage to say it, but I think you always knew.”</p>
            <p className="text-xs text-gray-400">Click the "Love", "Apology", "Blessing", "Thanks" buttons to choose your quote</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 pt-2">Description</p>
            <p className="italic text-purple-500">“That afternoon, the sunlight hit her face just right. It felt like peace.”</p>
            <p className="text-xs text-gray-400">Describe what the photo means to you</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
