'use client'

import { useState, useEffect, useRef } from 'react'

interface ReadingTimerProps {
  className?: string
}

export default function ReadingTimer({ className = '' }: ReadingTimerProps) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Start timer when component mounts
    startTimer()

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseTimer()
      } else {
        startTimer()
      }
    }

    // Handle window focus/blur
    const handleFocus = () => startTimer()
    const handleBlur = () => pauseTimer()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  const startTimer = () => {
    if (!intervalRef.current) {
      setIsRunning(true)
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    }
  }

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setIsRunning(false)
    }
  }

  const toggleTimer = () => {
    if (isRunning) {
      pauseTimer()
    } else {
      startTimer()
    }
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center bg-purple-50 rounded-lg px-3 py-1 border border-purple-200">
        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isRunning ? 'bg-purple-500 animate-pulse' : 'bg-gray-400'}`}></span>
        <span className="text-purple-700 font-mono text-sm font-medium">
          {formatTime(seconds)}
        </span>
      </div>
      <button
        onClick={toggleTimer}
        className="text-purple-600 hover:text-purple-700 p-1 rounded transition-colors"
        title={isRunning ? 'Pause timer' : 'Resume timer'}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          {isRunning ? (
            // Pause icon
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          ) : (
            // Play icon
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          )}
        </svg>
      </button>
    </div>
  )
}