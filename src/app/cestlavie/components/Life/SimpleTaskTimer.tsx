'use client'

import { useState, useEffect, useCallback } from 'react'

interface TaskRecord {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  actual_start?: string
  actual_end?: string
}

interface SimpleTaskTimerProps {
  task: TaskRecord
  extendedEndTime?: string
  onTimeExpired: (task: TaskRecord) => void
  onTaskStart: (task: TaskRecord) => void
  onTaskEnd: (task: TaskRecord) => void
  displayOnly?: boolean
}

export default function SimpleTaskTimer({
  task,
  extendedEndTime,
  onTimeExpired,
  onTaskStart,
  onTaskEnd,
  displayOnly = false
}: SimpleTaskTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00')
  const [isExpired, setIsExpired] = useState<boolean>(false)

  const isStarted = !!task.actual_start && !task.actual_end
  const isCompleted = task.status === 'Completed' || !!task.actual_end

  const formatTime = useCallback((totalSeconds: number): string => {
    if (totalSeconds <= 0) return '00:00:00'
    
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const calculateTimeLeft = useCallback((endTime: string): number => {
    // Parse current time as local time string
    const now = new Date()
    const nowStr = now.getFullYear() + '-' +
                   String(now.getMonth() + 1).padStart(2, '0') + '-' +
                   String(now.getDate()).padStart(2, '0') + 'T' +
                   String(now.getHours()).padStart(2, '0') + ':' +
                   String(now.getMinutes()).padStart(2, '0') + ':' +
                   String(now.getSeconds()).padStart(2, '0')
    
    // Parse both times as local time (no timezone conversion)
    const nowTime = new Date(nowStr).getTime()
    const endTimeObj = new Date(endTime.replace('Z', '')).getTime()
    
    return Math.floor((endTimeObj - nowTime) / 1000)
  }, [])

  // Update countdown
  useEffect(() => {
    if (!isStarted) {
      setTimeLeft('00:00:00')
      setIsExpired(false)
      return
    }

    const endTime = extendedEndTime || task.end_date
    if (!endTime) return

    const updateCountdown = () => {
      const secondsLeft = calculateTimeLeft(endTime)
      
      if (secondsLeft <= 0) {
        setTimeLeft('00:00:00')
        if (!isExpired) {
          setIsExpired(true)
          onTimeExpired(task)
        }
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
  }, [isStarted, extendedEndTime, task.end_date, task, onTimeExpired, calculateTimeLeft, formatTime, isExpired])

  const handleStart = () => {
    onTaskStart(task)
  }

  const handleEnd = () => {
    onTaskEnd(task)
  }

  // Don't show anything for completed tasks
  if (isCompleted) {
    return null
  }

  // For display only mode, only show countdown for started tasks
  if (displayOnly) {
    if (!isStarted) return null
    return (
      <div className="text-sm font-mono text-purple-700 bg-purple-100 px-2 py-1 rounded">
        {timeLeft}
      </div>
    )
  }

  // Show Start button for not started tasks
  if (!isStarted) {
    return (
      <button
        onClick={handleStart}
        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg 
                  hover:bg-purple-700 transition-colors font-medium"
      >
        Start Task
      </button>
    )
  }

  // Show countdown and End button for started tasks
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm font-mono text-purple-700 bg-purple-100 px-2 py-1 rounded">
        {timeLeft}
      </div>
      <button
        onClick={handleEnd}
        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg 
                  hover:bg-purple-700 transition-colors font-medium"
      >
        End Task
      </button>
    </div>
  )
}