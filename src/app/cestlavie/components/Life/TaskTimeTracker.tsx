'use client'

import { useCountdown } from './useCountdown'
import { useEffect, useState, useRef } from 'react'

interface TaskRecord {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  actual_start?: string
  actual_end?: string
}

interface TaskTimeTrackerProps {
  task: TaskRecord
  onTimeExpired: (task: TaskRecord) => void
  onTaskStart: (task: TaskRecord) => void  
  onTaskEnd: (task: TaskRecord) => void
  onExtendTime?: (task: TaskRecord, minutes: number) => void
}

export default function TaskTimeTracker({
  task,
  onTimeExpired,
  onTaskStart,
  onTaskEnd,
  onExtendTime
}: TaskTimeTrackerProps) {
  const isStarted = !!task.actual_start && !task.actual_end
  const isCompleted = task.status === 'Completed' || !!task.actual_end
  
  // Use countdown only for started tasks
  const { timeLeft, isExpired, reset } = useCountdown(
    isStarted ? task.end_date : null
  )

  // Handle time expiration
  useEffect(() => {
    if (isExpired && isStarted) {
      onTimeExpired(task)
    }
  }, [isExpired, isStarted, task, onTimeExpired])

  const handleStart = () => {
    onTaskStart(task)
  }

  const handleEnd = () => {
    onTaskEnd(task)
  }

  const handleExtend = (minutes: number) => {
    const newEndTime = new Date(Date.now() + minutes * 60 * 1000).toISOString()
    reset(newEndTime)
  }

  // Don't show anything for completed tasks
  if (isCompleted) {
    return null
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