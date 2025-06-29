'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  word: string
  note: string
  x: number
  y: number
}

export default function Tooltip({ word, note, x, y }: Props) {
  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  if (isMobile) {
    // ✅ 移动端：使用 Sheet 弹窗
    return (
      <AnimatePresence>
        {open && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="bottom" className="max-h-[60vh] overflow-y-auto p-6">
              <SheetTitle className="text-lg font-semibold mb-3 text-purple-700">
                🧠 {word}
              </SheetTitle>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {note}
                </p>
              </motion.div>
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    )
  }

  // ✅ 桌面端：悬浮提示框靠近词中部稍上方
  return (
    <div
      className="absolute z-50 max-w-sm bg-white text-black text-sm shadow-xl rounded-2xl px-5 py-4 border border-blue-100"
      style={{
        top: y,
        left: x,
        transform: 'translate(-50%, -110%)', // 往上浮出
        pointerEvents: 'none',
      }}
    >
      <div className="text-purple-700 font-semibold mb-2">🧠 {word}</div>
      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
        {note}
      </p>
    </div>
  )
}
