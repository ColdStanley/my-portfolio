'use client'

import { useState, useCallback, useMemo } from 'react'
import { extractTimeOnly, extractDateOnly } from '../utils/timezone'

interface TaskRecord {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
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
}

interface SidebarCalendarProps {
  tasks: TaskRecord[]
}

interface TooltipState {
  show: boolean
  date: string
  position: { x: number, y: number }
  tasks: TaskRecord[]
}

export default function SidebarCalendar({ tasks }: SidebarCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    date: '',
    position: { x: 0, y: 0 },
    tasks: []
  })

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay.getTime() - (firstDay.getDay() * 24 * 60 * 60 * 1000))
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [currentMonth])

  // Get tasks for a specific date
  const getTasksForDate = useCallback((date: Date) => {
    const dateStr = extractDateOnly(date.toISOString())
    return tasks.filter(task => {
      if (!task.start_date) return false
      const taskDateStr = extractDateOnly(task.start_date)
      return taskDateStr === dateStr
    })
  }, [tasks])

  // Handle date click
  const handleDateClick = useCallback((date: Date, event: React.MouseEvent) => {
    const dateTasks = getTasksForDate(date)
    
    if (dateTasks.length === 0) {
      setTooltip({ show: false, date: '', position: { x: 0, y: 0 }, tasks: [] })
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({
      show: true,
      date: date.toDateString(),
      position: { 
        x: rect.right + 8, // Position to the right of the clicked date
        y: rect.top 
      },
      tasks: dateTasks
    })
  }, [getTasksForDate])

  // Handle task click (open in Notion)
  const handleTaskClick = useCallback((task: TaskRecord) => {
    const notionPageUrl = `https://www.notion.so/${task.id.replace(/-/g, '')}`
    window.open(notionPageUrl, '_blank')
  }, [])

  // Format time for display
  const formatTaskTime = useCallback((startDate: string, endDate?: string) => {
    const startTime = extractTimeOnly(startDate)
    if (!endDate) return startTime
    const endTime = extractTimeOnly(endDate)
    return `${startTime}-${endTime}`
  }, [])

  // Close tooltip when clicking outside
  const handleCloseTooltip = useCallback(() => {
    setTooltip({ show: false, date: '', position: { x: 0, y: 0 }, tasks: [] })
  }, [])

  // Month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    handleCloseTooltip()
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    handleCloseTooltip()
  }

  const today = new Date()
  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth()
  const isToday = (date: Date) => 
    date.getDate() === today.getDate() && 
    date.getMonth() === today.getMonth() && 
    date.getFullYear() === today.getFullYear()

  return (
    <>
      <div className="bg-white border-t border-gray-200 p-3">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-purple-100 rounded transition-colors"
          >
            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="text-sm font-semibold text-purple-900">
            {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </h3>
          
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-purple-100 rounded transition-colors"
          >
            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-xs font-medium text-gray-500 text-center py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const dayTasks = getTasksForDate(date)
            const hasEvents = dayTasks.length > 0
            
            return (
              <button
                key={index}
                onClick={(e) => handleDateClick(date, e)}
                className={`
                  aspect-square text-xs p-1 rounded transition-all duration-200 relative
                  ${!isCurrentMonth(date) 
                    ? 'text-gray-300 hover:bg-gray-50' 
                    : isToday(date)
                    ? 'bg-purple-600 text-white font-semibold hover:bg-purple-700'
                    : hasEvents
                    ? 'bg-purple-100 text-purple-900 font-medium hover:bg-purple-200'
                    : 'text-gray-700 hover:bg-purple-50'
                  }
                `}
              >
                {date.getDate()}
                {hasEvents && (
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleCloseTooltip}
          />
          <div
            className="fixed z-50 bg-white border border-purple-200 rounded-lg shadow-lg p-3 min-w-[200px] max-w-[300px]"
            style={{
              left: tooltip.position.x,
              top: tooltip.position.y,
            }}
          >
            <div className="text-xs font-semibold text-purple-900 mb-2 border-b border-purple-100 pb-1">
              {new Date(tooltip.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {tooltip.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="flex items-center gap-2 p-1.5 hover:bg-purple-50 rounded cursor-pointer group transition-colors"
                >
                  <span className="text-xs text-purple-600 font-medium flex-shrink-0">
                    {formatTaskTime(task.start_date, task.end_date)}
                  </span>
                  <span className="text-xs text-gray-800 truncate group-hover:text-purple-900 transition-colors">
                    {task.title || 'Untitled Task'}
                  </span>
                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    🔗
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}