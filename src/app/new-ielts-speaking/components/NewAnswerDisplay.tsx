'use client'

import { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent } from '@/components/ui/card'
import NewExpressionPanel from './NewExpressionPanel'

interface AnswerData {
  band: number
  text: string
  keywords: string[]
  explanations: Record<string, string>
}

interface Props {
  questionText: string | null
}

export default function NewAnswerDisplay({ questionText }: Props) {
  const [answers, setAnswers] = useState<AnswerData[]>([])

  useEffect(() => {
    if (!questionText) return

    const fetchAnswers = async () => {
      try {
        const res = await fetch(`/api/new-ielts-speaking/answers?questionId=${encodeURIComponent(questionText)}`)
        const data = await res.json()
        setAnswers(data.answers || [])
      } catch (error) {
        console.error('❌ 获取答案失败:', error)
      }
    }

    fetchAnswers()
  }, [questionText])

  if (!questionText) {
    return (
      <div className="text-sm text-gray-400 italic mt-6">
        Please select a question to see reference answers.
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {answers.map((answer, index) => (
          <Card key={index} className="shadow-lg border border-gray-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-purple-700">Band {answer.band}</h3>
              <p className="text-gray-800 leading-relaxed">{answer.text}</p>

              {Array.isArray(answer.keywords) && answer.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {answer.keywords.map((kw, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm cursor-pointer">
                          {kw}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[240px] text-sm">
                        {answer.explanations?.[kw] ?? '暂无解释'}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ 新增表达训练模块 */}
      <NewExpressionPanel explanations={mergeExplanations(answers)} />
    </TooltipProvider>
  )
}

// ✅ 合并多个 Band 的 explanations
function mergeExplanations(answers: AnswerData[]): Record<string, string> {
  const all: Record<string, string> = {}
  for (const ans of answers) {
    for (const [key, val] of Object.entries(ans.explanations)) {
      all[key] = val
    }
  }
  return all
}
