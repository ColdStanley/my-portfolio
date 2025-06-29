'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { PauseCircle, PlayCircle } from 'lucide-react'

interface GameControllerButtonProps {
  isPlaying: boolean
  onToggle: () => void
}

export default function GameControllerButton({ isPlaying, onToggle }: GameControllerButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-24 z-50 bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
    >
      {isPlaying ? (
        <>
          <PauseCircle size={20} />
          <span className="font-semibold">Pause</span>
        </>
      ) : (
        <>
          <PlayCircle size={20} />
          <span className="font-semibold">Play Game</span>
        </>
      )}
    </motion.button>
  )
}
