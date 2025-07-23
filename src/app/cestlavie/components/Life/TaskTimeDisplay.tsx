'use client'

import { useState, useEffect, useMemo } from 'react'

interface TaskRecord {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
  remind_before: number
  plan: string[]
  priority_quadrant: string
  note: string
  actual_start?: string
  actual_end?: string
  budget_time: number
  actual_time: number
  quality_rating?: number
  next?: string
  is_plan_critical?: boolean
  timer_status?: string
}

interface TaskTimeDisplayProps {
  task: TaskRecord
}

// Calculate total elapsed time for a task
const calculateTotalElapsedTime = (task: TaskRecord): number => {
  let totalTime = task.actual_time || 0
  
  if (task.timer_status === 'running' && task.actual_start) {
    const startTime = new Date(task.actual_start).getTime()
    const currentTime = Date.now()
    const runningTimeHours = (currentTime - startTime) / (1000 * 60 * 60)
    totalTime += runningTimeHours
  }
  
  return totalTime
}

export default function TaskTimeDisplay({ task }: TaskTimeDisplayProps) {
  const [totalElapsedTime, setTotalElapsedTime] = useState(0)
  
  // Memoize the time calculation to avoid unnecessary recalculations
  const timeInfo = useMemo(() => {
    const elapsed = calculateTotalElapsedTime(task)
    const isRunning = task.timer_status === 'running'
    const isPaused = task.timer_status === 'paused'
    const isCompleted = task.timer_status === 'completed' || task.actual_time > 0
    const hasbudget = task.budget_time > 0
    
    return {
      elapsed,
      isRunning,
      isPaused,
      isCompleted,
      hasbudget,
      showTimeInfo: isRunning || isPaused || (isCompleted && hasbudget)
    }
  }, [task.actual_start, task.actual_end, task.actual_time, task.timer_status, task.budget_time])
  
  useEffect(() => {
    const updateElapsed = () => {
      setTotalElapsedTime(calculateTotalElapsedTime(task))
    }
    
    updateElapsed()
    
    // Only update every second if timer is running
    if (timeInfo.isRunning) {
      const interval = setInterval(updateElapsed, 1000)
      return () => clearInterval(interval)
    }
  }, [task, timeInfo.isRunning])
  
  // Don't render if there's no relevant time information
  if (!timeInfo.showTimeInfo) return null
  
  const getStatusDisplay = () => {
    if (timeInfo.isRunning) {
      return {
        label: 'Running',
        className: 'text-green-600 font-medium'
      }
    } else if (timeInfo.isPaused) {
      return {
        label: 'Paused',
        className: 'text-orange-600 font-medium'
      }
    } else if (timeInfo.isCompleted) {
      return {
        label: task.status === 'Completed' ? 'Time' : 'Completed',
        className: 'text-gray-600 font-medium'
      }
    }
    return null
  }
  
  const statusDisplay = getStatusDisplay()
  if (!statusDisplay) return null
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className={statusDisplay.className}>
          {statusDisplay.label}
        </span>
        <span className="font-medium text-purple-700">
          {totalElapsedTime.toFixed(1)}h
          {timeInfo.hasbudget && ` / ${task.budget_time}h`}
        </span>
      </div>
      
      {/* Progress bar for budget vs actual time */}
      {timeInfo.hasbudget && (
        <div className="mt-1">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                totalElapsedTime > task.budget_time 
                  ? 'bg-red-500' 
                  : timeInfo.isRunning 
                    ? 'bg-green-500' 
                    : 'bg-purple-500'
              }`}
              style={{ 
                width: `${Math.min((totalElapsedTime / task.budget_time) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}