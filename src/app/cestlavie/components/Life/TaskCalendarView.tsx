'use client'

import { useMemo, useCallback } from 'react'

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
}

interface TaskCalendarViewProps {
  tasks: TaskRecord[]
  currentMonth: Date
  selectedDate: string
  onDateSelect: (date: string) => void
  onMonthChange: (date: Date) => void
  selectedPlanFilter: string
  onTaskClick?: (task: TaskRecord) => void
  onTaskDelete?: (taskId: string) => void
  formatTimeRange?: (startDate: string, endDate?: string) => string
  getPriorityColor?: (priority: string) => string
  hasTimeConflicts?: (task: TaskRecord) => boolean
  compact?: boolean  // New prop for compact mode
}

export default function TaskCalendarView({ 
  tasks, 
  currentMonth, 
  selectedDate, 
  onDateSelect, 
  onMonthChange,
  selectedPlanFilter,
  onTaskClick,
  onTaskDelete,
  formatTimeRange,
  getPriorityColor,
  hasTimeConflicts,
  compact = false
}: TaskCalendarViewProps) {
  
  // Filter tasks by plan
  const filteredTasks = useMemo(() => {
    if (selectedPlanFilter === 'all') return tasks
    return tasks.filter(task => {
      if (!task.plan || task.plan.length === 0) return selectedPlanFilter === 'none'
      return task.plan.includes(selectedPlanFilter)
    })
  }, [tasks, selectedPlanFilter])

  // Calendar helper functions
  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add previous month's dates for padding
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: prevDate.toLocaleDateString('en-CA')
      })
    }
    
    // Add current month's dates
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        dateString: currentDate.toLocaleDateString('en-CA')
      })
    }
    
    // Add next month's dates for padding
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: nextDate.toLocaleDateString('en-CA')
      })
    }
    
    return days
  }, [])

  const isToday = useCallback((dateString: string) => {
    const today = new Date().toLocaleDateString('en-CA')
    return dateString === today
  }, [])

  const getTasksForDate = useCallback((dateString: string) => {
    const dateTasks = filteredTasks.filter(task => {
      if (!task.start_date && !task.end_date) return false
      
      const taskDate = task.start_date || task.end_date
      if (!taskDate) return false
      
      // Extract date part from UTC date string
      const taskDateString = new Date(taskDate).toLocaleDateString('en-CA') // YYYY-MM-DD format
      return taskDateString === dateString
    }).sort((a, b) => {
      // Sort by status: completed tasks last
      const aCompleted = a.status === 'Completed'
      const bCompleted = b.status === 'Completed'
      
      if (aCompleted && !bCompleted) return 1
      if (!aCompleted && bCompleted) return -1
      
      // If same completion status, sort by time
      const aTime = a.start_date || a.end_date
      const bTime = b.start_date || b.end_date
      if (!aTime || !bTime) return 0
      return aTime.localeCompare(bTime)
    })
    
    return dateTasks
  }, [filteredTasks])

  const getTaskCountForDate = useCallback((dateString: string) => {
    return getTasksForDate(dateString).length
  }, [getTasksForDate])

  const calendarDays = useMemo(() => getDaysInMonth(currentMonth), [currentMonth, getDaysInMonth])

  const handlePrevMonth = useCallback(() => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    onMonthChange(newMonth)
  }, [currentMonth, onMonthChange])

  const handleNextMonth = useCallback(() => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    onMonthChange(newMonth)
  }, [currentMonth, onMonthChange])

  const formatTimeOnly = useCallback((startDate: string, endDate?: string) => {
    if (!startDate) return ''
    
    const startTime = new Date(startDate).toLocaleTimeString('en-US', {
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false
    })
    
    if (!endDate) {
      return startTime
    }
    
    const endTime = new Date(endDate).toLocaleTimeString('en-US', {
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false
    })
    
    // Display as time range
    return `${startTime} - ${endTime}`
  }, [])


  return (
    <div className="bg-white rounded-lg border border-purple-200">
      {/* Calendar Header */}
      <div className="p-4 border-b border-purple-200 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-purple-50 rounded-md transition-colors"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-purple-900">
          {currentMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-purple-50 rounded-md transition-colors"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-purple-500 py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {calendarDays.map(({ date, isCurrentMonth, dateString }) => {
          const dayTasks = getTasksForDate(dateString)
          const isSelected = selectedDate === dateString
          const isCurrentDay = isToday(dateString)
          
          return (
            <div
              key={dateString}
              className={`
                relative h-12 cursor-pointer transition-colors duration-200 rounded-lg
                ${isSelected 
                  ? 'bg-purple-500 text-white' 
                  : isCurrentDay 
                  ? 'bg-purple-100 text-purple-700'
                  : 'hover:bg-gray-50'
                }
              `}
              onClick={() => onDateSelect(dateString)}
            >
              {/* 日期数字 - 居中 */}
              <div className="flex items-center justify-center h-full">
                <span className={`text-sm ${
                  isCurrentMonth ? '' : 'text-gray-400'
                }`}>
                  {date.getDate()}
                </span>
              </div>
              
              {/* 任务数 - 左上角小标识 */}
              {dayTasks.length > 0 && (
                <div className="absolute top-1 left-1">
                  <div className={`
                    w-4 h-4 rounded-full text-xs font-medium
                    flex items-center justify-center
                    ${isSelected 
                      ? 'bg-white text-purple-500' 
                      : 'bg-purple-500 text-white'
                    }
                  `}>
                    {dayTasks.length}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}