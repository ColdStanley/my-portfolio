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
  const { band6, band7, band8 } = answers

  const hasAnswers = band6 || band7 || band8

  return (
    <div className="mt-10 space-y-6">
      {band6 && <AnswerCard level="Band 6" text={band6} />}
      {band7 && <AnswerCard level="Band 7" text={band7} />}
      {band8 && <AnswerCard level="Band 8" text={band8} />}

      {!hasAnswers && (
        <div className="text-sm text-gray-500 text-center italic py-4">
          No valid answers were returned by the model.
        </div>
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
      className="border border-purple-200 rounded-2xl bg-white p-6 shadow-sm hover:shadow-lg transition-transform"
    >
      <div className="mb-3">
        <h3 className="text-lg font-bold text-purple-700">{level} Answer</h3>
      </div>
      <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
        {text || 'No answer available.'}
      </p>
    </motion.div>
  )
}
