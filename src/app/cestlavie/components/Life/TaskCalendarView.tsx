'use client'

import { useMemo, useCallback } from 'react'

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
  getStatusIcon?: (status: string) => string
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
  getStatusIcon,
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
        dateString: prevDate.toISOString().split('T')[0]
      })
    }
    
    // Add current month's dates
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        dateString: currentDate.toISOString().split('T')[0]
      })
    }
    
    // Add next month's dates for padding
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: nextDate.toISOString().split('T')[0]
      })
    }
    
    return days
  }, [])

  const isToday = useCallback((dateString: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateString === today
  }, [])

  const getTasksForDate = useCallback((dateString: string) => {
    const dateTasks = filteredTasks.filter(task => {
      if (!task.start_date && !task.end_date) return false
      
      const taskDate = task.start_date || task.end_date
      if (!taskDate) return false
      
      const taskLocalDate = new Date(taskDate)
      const taskDateString = taskLocalDate.toLocaleDateString('en-CA')
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
    
    const start = new Date(startDate)
    const startTime = start.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
    
    if (!endDate) {
      return startTime
    }
    
    const end = new Date(endDate)
    const endTime = end.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
    
    const isSameDay = start.toDateString() === end.toDateString()
    
    if (isSameDay) {
      return `${startTime} - ${endTime}`
    } else {
      // For cross-day tasks, show full date info
      const weekdays = ['日', '一', '二', '三', '四', '五', '六']
      const startWeekday = weekdays[start.getDay()]
      const endWeekday = weekdays[end.getDay()]
      const startDateStr = start.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
      const endDateStr = end.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
      return `${startDateStr} 周${startWeekday} ${startTime} - ${endDateStr} 周${endWeekday} ${endTime}`
    }
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
          {currentMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-purple-50 rounded-md transition-colors"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Weekday Headers */}
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="bg-purple-50 p-2 text-center text-sm font-medium text-purple-700">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {calendarDays.map(({ date, isCurrentMonth, dateString }) => {
          const dayTasks = getTasksForDate(dateString)
          const isSelected = selectedDate === dateString
          const todayClass = isToday(dateString) ? 'bg-purple-100 font-semibold' : ''
          const selectedClass = isSelected ? 'ring-2 ring-purple-500' : ''
          const monthClass = isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          
          return (
            <div
              key={dateString}
              className={`bg-white p-2 ${compact ? 'min-h-[60px]' : 'min-h-[120px]'} cursor-pointer hover:bg-purple-50 transition-colors ${todayClass} ${selectedClass} flex flex-col`}
              onClick={() => onDateSelect(dateString)}
            >
              <div className={`text-sm ${monthClass} mb-1`}>
                {date.getDate()}
              </div>
              
              {/* Task indicators - different rendering for compact mode */}
              {compact ? (
                // Compact mode: only show task count
                <div className="flex-1 flex items-center justify-center">
                  {dayTasks.length > 0 && (
                    <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                      {dayTasks.length}
                    </div>
                  )}
                </div>
              ) : (
                // Full mode: show task details
                <div className="flex-1 space-y-0.5">
                  {dayTasks.slice(0, 4).map(task => {
                    const isConflicted = hasTimeConflicts && hasTimeConflicts(task)
                    return (
                      <div
                        key={task.id}
                        className={`text-xs p-1.5 rounded truncate cursor-pointer transition-colors ${
                          task.status === 'Completed' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : task.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } ${isConflicted ? 'border border-yellow-400' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onTaskClick && onTaskClick(task)
                        }}
                        title={`${task.title} - ${task.status}`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="truncate text-xs font-medium">
                            {task.title}
                          </span>
                          {task.priority_quadrant && getPriorityColor && (
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              task.priority_quadrant.includes('Important & Urgent') ? 'bg-red-500' :
                              task.priority_quadrant.includes('Important & Not Urgent') ? 'bg-orange-500' :
                              task.priority_quadrant.includes('Not Important & Urgent') ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }`} />
                          )}
                        </div>
                        {formatTimeRange && (task.start_date || task.end_date) && (
                          <div className="text-xs text-gray-600 opacity-75">
                            {formatTimeOnly(task.start_date, task.end_date)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {dayTasks.length > 4 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayTasks.length - 4} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}