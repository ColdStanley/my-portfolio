'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Copy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  word: string | null
  explanation: string | null
  onClose: () => void
}

export default function MobileWordExplainer({
  open,
  word,
  explanation,
  onClose,
}: Props) {
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

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="sm:max-w-full p-6 pb-10 rounded-t-3xl shadow-xl bg-white transition-all duration-300"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-purple-700 text-xl font-bold tracking-tight">
            {word || '—'}
          </SheetTitle>
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
              {copied ? (
                '✅ Copied'
              ) : (
                <>
                  <Copy className="inline-block mr-1 h-4 w-4" /> Copy Explanation
                </>
              )}
            </button>
          )}
        </section>
      </SheetContent>
    </Sheet>
  )
}
