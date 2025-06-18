'use client'

import { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent } from '@/components/ui/card'

interface AnswerData {
  band: number
  text: string
  keywords: string[]
  explanations: Record<string, string>
  templateSentence?: string
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
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="text-lg font-bold text-purple-700">Band {answer.band}</h3>
              <p className="text-gray-800 leading-relaxed text-sm sm:text-base">
                {renderHighlightedText(answer.text, answer.keywords, answer.explanations)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}

// ✅ 文本中高亮关键词并加 Tooltip（标签样式 + 动效 + 响应式）
function renderHighlightedText(
  text: string,
  keywords: string[],
  explanations: Record<string, string>
): React.ReactNode[] {
  if (!keywords || keywords.length === 0) return [text]

  const parts: React.ReactNode[] = []
  let remaining = text

  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length)

  while (remaining.length > 0) {
    let matched = false

    for (const word of sortedKeywords) {
      const index = remaining.toLowerCase().indexOf(word.toLowerCase())
      if (index !== -1) {
        if (index > 0) {
          parts.push(remaining.slice(0, index))
        }

        const matchedWord = remaining.slice(index, index + word.length)
        parts.push(
          <Tooltip key={`${matchedWord}-${index}`}>
            <TooltipTrigger asChild>
              <span
                className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:bg-purple-200 cursor-help inline-block"
              >
                {matchedWord}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[80vw] sm:max-w-[240px] text-sm">
              {explanations[word] ?? '暂无解释'}
            </TooltipContent>
          </Tooltip>
        )

        remaining = remaining.slice(index + word.length)
        matched = true
        break
      }
    }

    if (!matched) {
      parts.push(remaining)
      break
    }
  }

  return parts
}
