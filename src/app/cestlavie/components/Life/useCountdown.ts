import { useState, useEffect, useCallback } from 'react'

interface CountdownResult {
  timeLeft: string
  isExpired: boolean
  reset: (newEndTime: string) => void
}

export const useCountdown = (endTime: string | null): CountdownResult => {
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00')
  const [isExpired, setIsExpired] = useState<boolean>(false)

  const formatTime = useCallback((totalSeconds: number): string => {
    if (totalSeconds <= 0) return '00:00:00'
    
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const calculateTimeLeft = useCallback((endTime: string): number => {
    const now = new Date().getTime()
    const end = new Date(endTime).getTime()
    return Math.floor((end - now) / 1000)
  }, [])

  const reset = useCallback((newEndTime: string) => {
    setIsExpired(false)
    const secondsLeft = calculateTimeLeft(newEndTime)
    setTimeLeft(formatTime(secondsLeft))
  }, [calculateTimeLeft, formatTime])

  useEffect(() => {
    if (!endTime) {
      setTimeLeft('00:00:00')
      setIsExpired(false)
      return
    }

    const updateCountdown = () => {
      const secondsLeft = calculateTimeLeft(endTime)
      
      if (secondsLeft <= 0) {
        setTimeLeft('00:00:00')
        setIsExpired(true)
        return
      }
      
      setTimeLeft(formatTime(secondsLeft))
      setIsExpired(false)
    }

    // Initial update
    updateCountdown()

    // Set up interval
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [endTime, calculateTimeLeft, formatTime])

  return { timeLeft, isExpired, reset }
}