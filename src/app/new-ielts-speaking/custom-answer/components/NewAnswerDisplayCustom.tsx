'use client'

import { motion } from 'framer-motion'

interface Props {
  answers: {
    band6?: string
    band7?: string
    band8?: string
  }
}

export default function NewAnswerDisplayCustom({ answers }: Props) {
  return (
    <div className="mt-10 space-y-6">
      {answers.band6 && <AnswerCard level="Band 6" text={answers.band6} />}
      {answers.band7 && <AnswerCard level="Band 7" text={answers.band7} />}
      {answers.band8 && <AnswerCard level="Band 8" text={answers.band8} />}

      {!answers.band6 && !answers.band7 && !answers.band8 && (
        <div className="text-sm text-gray-500">⚠️ No valid answers were returned by the model.</div>
      )}
    </div>
  )
}

function AnswerCard({ level, text }: { level: string; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      className="border border-purple-200 rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-transform"
    >
      <div className="mb-3">
        <h3 className="text-lg font-bold text-purple-700">{level} Answer</h3>
      </div>
      <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
        {text || '⚠️ No answer available.'}
      </p>
    </motion.div>
  )
}
