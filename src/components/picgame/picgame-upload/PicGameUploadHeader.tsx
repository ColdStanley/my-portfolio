'use client'

import { motion } from 'framer-motion'
import { Quicksand } from 'next/font/google'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export default function PicGameUploadHeader() {
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
                '0px 0px 0px rgba(192,132,252,0.3)',
              ],
              scale: [1, 1.03, 1],
              opacity: [1, 0.95, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            Shards of Light
          </motion.h1>

          <p className="text-sm text-gray-600 leading-relaxed">Shards of Light</p>
          <motion.p
            className="text-sm text-gray-600 leading-relaxed italic"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Every click is a quiet moment closer.
            <br />
            <span className="text-purple-400 italic">
              Chaque clic est un moment silencieux de plus près.
            </span>
          </motion.p>
        </div>
      </motion.div>

      {/* 中栏：Quotes 说明（已互换） */}
      <motion.div
        className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0 }}
      >
        <div className="text-sm leading-relaxed text-gray-600 space-y-3">
          <p className="font-semibold text-purple-500">💬 What are the Quotes?</p>
          <p>
            They are messages you want to share through the photo—words from the heart.
            <br />
            <span className="text-purple-400 italic">
              Ce sont des messages que vous souhaitez transmettre à travers la photo — des mots du cœur.
            </span>
          </p>
          <p>
            You can write them for yourself, for someone else, for the past or future.
            <br />
            <span className="text-purple-400 italic">
              Vous pouvez les écrire pour vous-même, pour quelqu’un d’autre, pour le passé ou l’avenir.
            </span>
          </p>
          <p className="italic text-purple-400">
            For example: “I never had the courage to say it, but I think you always knew.”
            <br />
            <span className="text-purple-400 italic">
              Par exemple : « Je n’ai jamais eu le courage de le dire, mais je pense que tu l’as toujours su. »
            </span>
          </p>
        </div>
      </motion.div>

      {/* 右栏：Description 说明（已互换） */}
      <motion.div
        className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <div className="text-sm leading-relaxed text-gray-600 space-y-3">
          <p className="font-semibold text-purple-500">📖 What is the description?</p>
          <p>
            You can briefly describe the background, time, emotion, or meaning of the photo.
            <br />
            <span className="text-purple-400 italic">
              Vous pouvez brièvement décrire le contexte, le moment, l’émotion ou la signification de la photo.
            </span>
          </p>
          <p>
            It will appear next to the image, like a “caption fragment” you wrote for it.
            <br />
            <span className="text-purple-400 italic">
              Elle apparaîtra à côté de l’image, comme une « annotation fragmentée » que vous avez écrite.
            </span>
          </p>
          <p className="italic text-purple-400">
            For example: “The sunlight was perfect that day, and I only captured your back.”
            <br />
            <span className="text-purple-400 italic">
              Par exemple : « Ce jour-là, la lumière était parfaite, et je n’ai capté que ton dos. »
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
