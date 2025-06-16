'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const TARGET_DATE = new Date('2025-06-30T00:00:00')

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / (3600 * 24))
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return {
    days,
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  }
}

export default function ComingSoonCard() {
  const [isMounted, setIsMounted] = useState(false)
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState('00')
  const [minutes, setMinutes] = useState('00')
  const [seconds, setSeconds] = useState('00')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const interval = setInterval(() => {
      const msLeft = TARGET_DATE.getTime() - Date.now()
      const next = formatTime(msLeft)

      setSeconds(prev => {
        if (prev !== next.seconds) return next.seconds
        return prev
      })

      setMinutes(prev => {
        if (prev !== next.minutes) return next.minutes
        return prev
      })

      setHours(prev => {
        if (prev !== next.hours) return next.hours
        return prev
      })

      setDays(prev => {
        if (prev !== next.days) return next.days
        return prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isMounted])

  const FlipNumber = ({ value }: { value: string }) => (
    <motion.div
      key={value}
      initial={{ rotateX: -90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="inline-block px-1 md:px-1.5 text-sm md:text-lg font-mono font-semibold bg-white/80 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500"
    >
      {value}
    </motion.div>
  )

  if (!isMounted) return null

  return (
    <div className="w-full h-full rounded-xl p-6 shadow-md bg-gradient-to-br from-purple-50 via-white to-purple-100 border border-dashed border-purple-200 backdrop-blur-sm flex flex-col justify-center items-center text-center space-y-4">
      <motion.div
        className="text-xl md:text-2xl font-semibold text-purple-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🎁 Unlocking Soon
      </motion.div>

      <div className="text-xs md:text-sm text-gray-500 italic">
        Something new is coming to Technology, Knowledge & Life
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 px-3 py-2 bg-white/70 rounded-md shadow-inner">
        <span className="text-purple-500">⏳</span>
        <FlipNumber value={String(days) + 'd'} />
        <span className="text-purple-500">:</span>
        <FlipNumber value={hours + 'h'} />
        <span className="text-purple-500">:</span>
        <FlipNumber value={minutes + 'm'} />
        <span className="text-purple-500">:</span>
        <FlipNumber value={seconds + 's'} />
      </div>
    </div>
  )
}
