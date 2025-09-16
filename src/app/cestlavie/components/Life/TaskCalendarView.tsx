'use client'

import { useMemo, useCallback } from 'react'
import { TaskRecord, TaskCalendarViewProps } from '../../types/task'

export default function TaskCalendarView({ 
  tasks, 
  currentMonth, 
  selectedDate, 
  onDateSelect, 
  onMonthChange,
  onTaskSelect,
  tasksByDate
}: TaskCalendarViewProps) {

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
    if (tasksByDate) {
      return tasksByDate[dateString] || []
    }

    const dateTasks = tasks.filter(task => {
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
  }, [tasks, tasksByDate])

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
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4 h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-purple-60 rounded-md transition-colors"
        >
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-base font-semibold text-purple-900">
          {currentMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-purple-60 rounded-md transition-colors"
        >
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-purple-600 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {calendarDays.map(({ date, isCurrentMonth, dateString }) => {
          const dayTasks = getTasksForDate(dateString)
          const isSelected = selectedDate === dateString
          const isCurrentDay = isToday(dateString)
          
          return (
            <div
              key={dateString}
              className={`
                relative h-full cursor-pointer transition-colors duration-200 rounded
                ${isSelected 
                  ? 'bg-purple-600 text-white' 
                  : isCurrentDay 
                  ? 'bg-purple-100 text-purple-700'
                  : 'hover:bg-gray-50'
                }
              `}
              onClick={() => onDateSelect(dateString)}
            >
              {/* Date Number */}
              <div className="flex items-center justify-center h-full">
                <span className={`text-xs ${
                  isCurrentMonth ? '' : 'text-gray-400'
                }`}>
                  {date.getDate()}
                </span>
              </div>
              
              {/* Task Count Indicator */}
              {dayTasks.length > 0 && (
                <div className="absolute -top-0.5 -right-0.5">
                  <div className={`
                    w-3 h-3 rounded-full text-xs font-medium
                    flex items-center justify-center
                    ${isSelected 
                      ? 'bg-white text-purple-600' 
                      : 'bg-purple-600 text-white'
                    }
                  `}>
                    {dayTasks.length > 9 ? '9+' : dayTasks.length}
                  </div>
                </div>
              )}
              
              {/* Outlook Sync Status - show warning dot if any tasks are not synced */}
              {dayTasks.length > 0 && dayTasks.some(task => !task.outlook_event_id) && (
                <div className="absolute -top-0.5 -left-0.5">
                  <div className="w-2 h-2 bg-purple-600 rounded-full" title="Some tasks not synced to Outlook"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
