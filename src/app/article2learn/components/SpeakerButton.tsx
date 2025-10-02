'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { theme } from '@/styles/theme.config'

interface SpeakerButtonProps {
  text: string
  language?: string
  size?: 'sm' | 'md'
}

export default function SpeakerButton({ text, language, size = 'md' }: SpeakerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const handlePlay = async () => {
    if (isPlaying && audio) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    try {
      setIsPlaying(true)

      const response = await fetch('/api/article2learn/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      })

      if (!response.ok) throw new Error('TTS failed')

      const blob = await response.blob()
      const audioUrl = URL.createObjectURL(blob)
      const newAudio = new Audio(audioUrl)

      newAudio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      newAudio.onerror = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      setAudio(newAudio)
      await newAudio.play()
    } catch (error) {
      console.error('TTS Error:', error)
      setIsPlaying(false)
    }
  }

  const buttonSize = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'
  const iconSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'

  return (
    <motion.button
      onClick={handlePlay}
      className={`${buttonSize} inline-flex items-center justify-center rounded-full transition-all duration-200`}
      style={{
        backgroundColor: isPlaying ? theme.accent : theme.neutralLight,
        border: `1px solid ${theme.neutralDark}`,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isPlaying ? 'Stop' : 'Play'}
    >
      {isPlaying ? (
        <motion.div
          className={`${iconSize} rounded-sm`}
          style={{ backgroundColor: theme.primary }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      ) : (
        <svg
          className={iconSize}
          fill="currentColor"
          viewBox="0 0 20 20"
          style={{ color: theme.primary }}
        >
          <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.06 5.5 5.5 0 010 7.78.75.75 0 001.06 1.06 7 7 0 000-9.9z" />
          <path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
        </svg>
      )}
    </motion.button>
  )
}
