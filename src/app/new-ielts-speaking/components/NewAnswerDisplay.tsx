'use client'

import { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent } from '@/components/ui/card'
import { Volume2 } from 'lucide-react'
import MobileWordExplainer from './MobileWordExplainer'

interface AnswerData {
  band: number
  text: string
  keywords: string[]
  explanations: Record<string, string> | string
  templateSentence?: string
}

interface Props {
  questionText: string | null
}

export default function NewAnswerDisplay({ questionText }: Props) {
  const [answers, setAnswers] = useState<AnswerData[]>([])
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    if (!questionText) return

    const fetchAnswers = async () => {
      try {
        const res = await fetch(`/api/new-ielts-speaking/supabase-band-answers?questionId=${encodeURIComponent(questionText)}`)
        const data = await res.json()
        setAnswers(data.answers || [])
      } catch (error) {
        console.error('❌ 获取答案失败:', error)
      }
    }

    fetchAnswers()
  }, [questionText])

  const handleWordClick = (word: string) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSelectedWord(word)
      setIsSheetOpen(true)
    }
  }

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
          <Card
            key={index}
            className="shadow-lg border border-gray-200 transition duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
          >
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="text-lg font-bold text-purple-700">Band {answer.band}</h3>
              <p className="text-gray-800 leading-relaxed text-sm sm:text-base">
                {renderHighlightedText(answer.text, answer.keywords, parseExplanation(answer.explanations), handleWordClick)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <MobileWordExplainer
        open={isSheetOpen}
        word={selectedWord}
        explanation={getExplanation(selectedWord, answers)}
        onClose={() => setIsSheetOpen(false)}
      />
    </TooltipProvider>
  )
}

function playAudio(word: string) {
  const url = `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${word.toLowerCase()}--_us_1.mp3`
  const audio = new Audio(url)

  audio.onerror = () => {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    speechSynthesis.speak(utterance)
  }

  audio.play().catch(() => {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    speechSynthesis.speak(utterance)
  })
}

function getExplanation(word: string | null, answers: AnswerData[]): string | null {
  if (!word) return null
  for (const ans of answers) {
    const explanationMap = parseExplanation(ans.explanations)
    if (explanationMap[word]) return explanationMap[word]
  }
  return null
}

function renderHighlightedText(
  text: string,
  keywords: string[],
  explanations: Record<string, string>,
  onClick: (word: string) => void
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
        if (index > 0) parts.push(remaining.slice(0, index))

        const matchedWord = remaining.slice(index, index + word.length)

        parts.push(
          <Tooltip key={`${matchedWord}-${index}`} delayDuration={0}>
            <TooltipTrigger asChild>
              <span
                onPointerDown={() => onClick(word)}
                className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95 hover:bg-purple-200 cursor-help inline-block"
              >
                {matchedWord}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[80vw] sm:max-w-[240px] text-sm">
              <div className="flex items-center gap-2">
                <span>{explanations[word] ?? '暂无解释'}</span>
                <button onClick={() => playAudio(word)} className="text-purple-500 hover:text-purple-700">
                  <Volume2 size={16} />
                </button>
              </div>
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

function parseExplanation(input: Record<string, string> | string): Record<string, string> {
  if (typeof input !== 'string') return input || {}

  const result: Record<string, string> = {}
  const lines = input.split('\n')

  for (const line of lines) {
    const [key, ...rest] = line.split(':')
    if (key && rest.length > 0) {
      const cleanedKey = key.trim().toLowerCase()
      const value = rest.join(':').trim()
      if (cleanedKey && value) {
        result[cleanedKey] = value
      }
    }
  }

  return result
}
