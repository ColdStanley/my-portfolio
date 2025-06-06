'use client'

import { motion } from 'framer-motion'

interface Props {
  answers: Record<string, string>
  onGenerate: (band: number) => void
  resultRef: React.RefObject<HTMLDivElement>
  question: string
  loading: boolean
}

export default function AnswerSection({ answers, onGenerate, resultRef, question, loading }: Props) {
  const bandDisplay = (score: number) => {
    const answer = answers[`band${score}`] || ''
    const comment = answers[`comment${score}`] || ''
    const vocab = answers[`vocab${score}`] || ''

    if (!answer && !comment && !vocab)
      return <span className="text-gray-400">点击上方按钮 🖱️</span>

    return `
【参考答案】
${answer}

【说明】
${comment}

【Vocabulary Highlights】
${vocab}
    `.trim()
  }

  const sharedButtonStyle =
    'w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 text-purple-700 hover:from-purple-200 hover:to-purple-300 hover:shadow-lg shadow transition-all text-center font-semibold transform active:scale-95 duration-300'

  const ScoreHighlight = ({ score }: { score: string }) => (
    <motion.span
      className="text-purple-600 font-bold inline-block mx-1"
      animate={{ rotate: [0, -10, 10, -10, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {score}
    </motion.span>
  )

  const getButtonText = (band: number) => {
    if (loading) return '请耐心等待，正在烤鸭 🍗...'

    switch (band) {
      case 5:
        return <>点我<ScoreHighlight score="5分" />🧐</>
      case 6:
        return <>点我<ScoreHighlight score="6分" />（不用读语言班了）🎉</>
      case 7:
        return <>点我，点我，<ScoreHighlight score="7分" />在手，天下我有 💪</>
      default:
        return '生成'
    }
  }

  return (
    <>
      <div ref={resultRef} className="w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-6">
        {/* 5分列 */}
        <div className="space-y-2">
          <button
            className={sharedButtonStyle}
            onClick={() => onGenerate(5)}
            disabled={!question || loading}
          >
            {getButtonText(5)}
          </button>
          <div className="min-h-[300px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
            {bandDisplay(5)}
          </div>
        </div>

        {/* 6分列 */}
        <div className="space-y-2">
          <button
            className={sharedButtonStyle}
            onClick={() => onGenerate(6)}
            disabled={!question || loading}
          >
            {getButtonText(6)}
          </button>
          <div className="min-h-[300px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
            {bandDisplay(6)}
          </div>
        </div>

        {/* 7分列 */}
        <div className="space-y-2">
          <button
            className={sharedButtonStyle}
            onClick={() => onGenerate(7)}
            disabled={!question || loading}
          >
            {getButtonText(7)}
          </button>
          <div className="min-h-[300px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
            {bandDisplay(7)}
          </div>
        </div>
      </div>
    </>
  )
}
