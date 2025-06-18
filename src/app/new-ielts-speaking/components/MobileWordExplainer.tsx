'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Copy, Volume2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  word: string | null
  explanation: string | null
  onClose: () => void
}

export default function MobileWordExplainer({ open, word, explanation, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation)
      setCopied(true)
      toast.success('✅ Copied explanation to clipboard')
    }
  }

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  const handlePlayAudio = () => {
    if (!word) return

    const lowerWord = word.toLowerCase()
    const audioUrl = `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${lowerWord}--_us_1.mp3`
    const audio = new Audio(audioUrl)

    audio.onerror = () => {
      // fallback using browser TTS
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
      toast.info('🔊 Using browser pronunciation (fallback)')
    }

    audio
      .play()
      .then(() => {
        toast.success(`▶️ Playing: ${word}`)
      })
      .catch(() => {
        toast.error('🔇 Your browser blocked audio playback.')
      })
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="sm:max-w-full p-6 pb-10 rounded-t-2xl shadow-lg border-t-4 border-purple-200">
        <SheetHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-purple-700 text-xl font-bold tracking-tight">
              {word || '—'}
            </SheetTitle>
            <button
              className="text-purple-500 hover:text-purple-700 transition"
              aria-label="Play pronunciation"
              onClick={handlePlayAudio}
            >
              <Volume2 size={20} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </SheetHeader>

        <section className="mt-4 flex flex-col gap-4">
          <SheetDescription className="text-gray-700 text-base leading-relaxed font-medium">
            {explanation || '暂无解释'}
          </SheetDescription>

          {explanation && (
            <button
              onClick={handleCopy}
              className="w-fit px-3 py-1 rounded-md border border-purple-300 bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition"
            >
              {copied ? '✅ Copied' : <><Copy className="inline-block mr-1 h-4 w-4" /> Copy Explanation</>}
            </button>
          )}
        </section>
      </SheetContent>
    </Sheet>
  )
}
