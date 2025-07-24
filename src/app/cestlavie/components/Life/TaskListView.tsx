'use client'

import { useMemo, useCallback, useState, useRef } from 'react'
import TaskExtensionModal from './TaskExtensionModal'
import SimpleTaskTimer from './SimpleTaskTimer'
import TimeRecordTooltip from './TimeRecordTooltip'
import TimeComparisonTooltip from './TimeComparisonTooltip'
import StartEndConfirmTooltip from './StartEndConfirmTooltip'
import DeleteConfirmTooltip from './DeleteConfirmTooltip'
import { extractTimeOnly, extractDateOnly } from '../../utils/timezone'

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

interface PlanOption {
  id: string
  title: string
  parent_goal?: string[]
}

interface StrategyOption {
  id: string
  objective: string
}

interface TaskListViewProps {
  tasks: TaskRecord[]
  selectedDate: string
  onTaskClick?: (task: TaskRecord) => void
  onTaskDelete?: (taskId: string) => void
  onCreateTask?: (date: string) => void
  onTaskComplete?: (task: TaskRecord) => void
  onTaskStart?: (task: TaskRecord) => void
  onTaskEnd?: (task: TaskRecord, surveyData?: {
    quality_rating?: number
    is_plan_critical?: boolean
    next?: string
  }) => void
  onRecordTime?: (task: TaskRecord, startTime?: string, endTime?: string, surveyData?: {
    quality_rating?: number
    is_plan_critical?: boolean
    next?: string
  }) => void
  formatTimeRange?: (startDate: string, endDate?: string) => string
  getPriorityColor?: (priority: string) => string
  hasTimeConflicts?: (task: TaskRecord) => boolean
  planOptions?: PlanOption[]
  strategyOptions?: StrategyOption[]
}

export default function TaskListView({ 
  tasks, 
  selectedDate, 
  onTaskClick,
  onTaskDelete,
  onCreateTask,
  onTaskComplete,
  onTaskStart,
  onTaskEnd,
  onRecordTime,
  formatTimeRange,
  getPriorityColor,
  hasTimeConflicts,
  planOptions = [],
  strategyOptions = []
}: TaskListViewProps) {
  const [extensionModal, setExtensionModal] = useState<{
    isOpen: boolean
    task: TaskRecord | null
  }>({ isOpen: false, task: null })
  
  const [extendedTasks, setExtendedTasks] = useState<{[taskId: string]: string}>({})
  
  const [timeRecordTooltip, setTimeRecordTooltip] = useState<{
    isOpen: boolean
    task: TaskRecord | null
    triggerElement: HTMLElement | null
  }>({ isOpen: false, task: null, triggerElement: null })

  const [startEndTooltip, setStartEndTooltip] = useState<{
    isOpen: boolean
    task: TaskRecord | null
    action: 'start' | 'end'
    triggerElement: HTMLElement | null
  }>({ isOpen: false, task: null, action: 'start', triggerElement: null })

  const [deleteTooltip, setDeleteTooltip] = useState<{
    isOpen: boolean
    task: TaskRecord | null
    triggerElement: HTMLElement | null
  }>({ isOpen: false, task: null, triggerElement: null })
  
  const timeRecordButtonRefs = useRef<{[taskId: string]: HTMLButtonElement}>({})
  const startEndButtonRefs = useRef<{[taskId: string]: HTMLButtonElement}>({})
  const deleteButtonRefs = useRef<{[taskId: string]: HTMLButtonElement}>({}) // taskId -> new end time

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return []
    
    return tasks.filter(task => {
      if (!task.start_date && !task.end_date) return false
      
      const taskDate = task.start_date || task.end_date
      if (!taskDate) return false
      
      // Extract date part from task date string with timezone
      const taskDateString = extractDateOnly(taskDate)
      return taskDateString === selectedDate
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
  }, [tasks, selectedDate])

  const formatTimeOnly = useCallback((startDate: string, endDate?: string) => {
    if (!startDate) return ''
    
    const startTime = extractTimeOnly(startDate)
    
    if (!endDate) {
      return startTime
    }
    
    const endTime = extractTimeOnly(endDate)
    
    // Display as simple time range
    return `${startTime} - ${endTime}`
  }, [])

  const handleNotionClick = useCallback((task: TaskRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    // Open Notion page in new tab
    const notionPageUrl = `https://www.notion.so/${task.id.replace(/-/g, '')}`
    window.open(notionPageUrl, '_blank')
  }, [])

  const handleOutlookClick = useCallback((task: TaskRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Format start and end dates for Outlook
    const formatDateForOutlook = (dateStr: string) => {
      if (!dateStr) return ''
      
      // Manual parsing of Toronto time format: "2024-07-24T09:00:00-04:00"
      // Extract date and time parts
      const [datePart, timePart] = dateStr.split('T')
      const [year, month, day] = datePart.split('-')
      const [hour, minute, second] = timePart.replace('-04:00', '').replace('.000', '').split(':')
      
      // Convert Toronto time to UTC (add 4 hours)
      const torontoDate = new Date(
        parseInt(year), 
        parseInt(month) - 1, // month is 0-indexed
        parseInt(day), 
        parseInt(hour), 
        parseInt(minute), 
        parseInt(second)
      )
      
      // Add 4 hours to convert Toronto (-04:00) to UTC
      const utcDate = new Date(torontoDate.getTime() + (4 * 60 * 60 * 1000))
      
      // Format as Outlook expects: YYYYMMDDTHHMMSSZ
      const utcYear = utcDate.getFullYear()
      const utcMonth = String(utcDate.getMonth() + 1).padStart(2, '0')
      const utcDay = String(utcDate.getDate()).padStart(2, '0')
      const utcHour = String(utcDate.getHours()).padStart(2, '0')
      const utcMinute = String(utcDate.getMinutes()).padStart(2, '0')
      const utcSecond = String(utcDate.getSeconds()).padStart(2, '0')
      
      return `${utcYear}${utcMonth}${utcDay}T${utcHour}${utcMinute}${utcSecond}Z`
    }
    
    const startDate = formatDateForOutlook(task.start_date)
    const endDate = formatDateForOutlook(task.end_date)
    
    // Create Outlook Calendar URL
    const outlookParams = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: task.title,
      body: task.note || '',
      startdt: startDate,
      enddt: endDate,
      allday: task.all_day ? 'true' : 'false'
    })
    
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`
    window.open(outlookUrl, '_blank')
  }, [])

  const handleTimeExpired = useCallback((task: TaskRecord) => {
    setExtensionModal({ isOpen: true, task })
  }, [])

  const handleExtend = useCallback((minutes: number) => {
    if (extensionModal.task) {
      const newEndTime = new Date(Date.now() + minutes * 60 * 1000).toISOString()
      setExtendedTasks(prev => ({
        ...prev,
        [extensionModal.task!.id]: newEndTime
      }))
    }
    setExtensionModal({ isOpen: false, task: null })
  }, [extensionModal.task])

  const handleCompleteFromModal = useCallback(() => {
    if (extensionModal.task && onTaskEnd) {
      onTaskEnd(extensionModal.task)
    }
    setExtensionModal({ isOpen: false, task: null })
  }, [extensionModal.task, onTaskEnd])

  const handleRecordTimeClick = useCallback((task: TaskRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    const button = e.currentTarget as HTMLButtonElement
    setTimeRecordTooltip({
      isOpen: true,
      task,
      triggerElement: button
    })
  }, [])

  const handleRecordTimeSave = useCallback((startTime?: string, endTime?: string, surveyData?: {
    quality_rating?: number
    is_plan_critical?: boolean
    next?: string
  }) => {
    if (timeRecordTooltip.task && onRecordTime) {
      onRecordTime(timeRecordTooltip.task, startTime, endTime, surveyData)
    }
    setTimeRecordTooltip({ isOpen: false, task: null, triggerElement: null })
  }, [timeRecordTooltip.task, onRecordTime])

  const handleStartEndClick = useCallback((task: TaskRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    const button = e.currentTarget as HTMLButtonElement
    
    const action: 'start' | 'end' = !task.actual_start ? 'start' : 'end'

    setStartEndTooltip({
      isOpen: true,
      task,
      action,
      triggerElement: button
    })
  }, [])

  const handleStartEndConfirm = useCallback((surveyData?: {
    quality_rating?: number
    is_plan_critical?: boolean
    next?: string
  }) => {
    if (startEndTooltip.task) {
      const task = startEndTooltip.task
      if (startEndTooltip.action === 'start') {
        onTaskStart && onTaskStart(task)
      } else if (startEndTooltip.action === 'end') {
        onTaskEnd && onTaskEnd(task, surveyData)
      }
    }
    setStartEndTooltip({ isOpen: false, task: null, action: 'start', triggerElement: null })
  }, [startEndTooltip.task, startEndTooltip.action, onTaskStart, onTaskEnd])

  const handleDeleteClick = useCallback((task: TaskRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    const button = e.currentTarget as HTMLButtonElement
    setDeleteTooltip({
      isOpen: true,
      task,
      triggerElement: button
    })
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTooltip.task && onTaskDelete) {
      onTaskDelete(deleteTooltip.task.id)
    }
    setDeleteTooltip({ isOpen: false, task: null, triggerElement: null })
  }, [deleteTooltip.task, onTaskDelete])

  if (!selectedDate) {
    return (
      <div className="bg-white rounded-lg border border-purple-200 p-8">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Date</h3>
          <p className="text-gray-600">Choose a date from the calendar to view and manage tasks</p>
        </div>
      </div>
    )
  }

  const selectedDateObj = new Date(selectedDate + 'T00:00:00')
  const dateDisplayName = selectedDateObj.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-purple-500">Tasks for {dateDisplayName}</h2>
          <p className="text-sm text-purple-400 mt-1">
            {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <button
          onClick={() => onCreateTask && onCreateTask(selectedDate)}
          className="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 
                   transition-all duration-200 font-medium shadow-sm hover:shadow-md
                   transform hover:scale-105 active:scale-95"
        >
          New Task
        </button>
      </div>

      {/* Task List */}
      <div>
        {selectedDateTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No tasks scheduled</h3>
            <p className="text-gray-600 mb-6">This day is free. Would you like to add a task?</p>
            <button
              onClick={() => onCreateTask && onCreateTask(selectedDate)}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 
                       transition-all duration-200 font-medium shadow-sm hover:shadow-md
                       transform hover:scale-105 active:scale-95"
            >
              Add First Task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateTasks.map(task => {
              const isConflicted = hasTimeConflicts && hasTimeConflicts(task)
              const isCompleted = task.status === 'Completed'
              
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md
                    ${isCompleted 
                      ? 'bg-gradient-to-r from-purple-50 to-purple-100 opacity-75' 
                      : 'bg-white hover:bg-gradient-to-r hover:from-purple-25 hover:to-purple-50'
                    }`}
                >
                  {/* Desktop: Three column layout, Mobile: Vertical layout */}
                  <div className="lg:flex lg:items-start lg:justify-between lg:mb-3">
                    {/* Desktop Left Column / Mobile Top Row - Time Info */}
                    <div className="flex flex-col gap-1 lg:min-w-[100px] mb-3 lg:mb-0">
                      {(task.start_date || task.end_date) && (
                        <TimeComparisonTooltip task={task}>
                          <span className="text-sm font-semibold text-purple-500 cursor-help">
                            {formatTimeOnly(task.start_date, task.end_date)}
                          </span>
                        </TimeComparisonTooltip>
                      )}
                      {/* Show countdown for started tasks */}
                      {task.actual_start && !task.actual_end && (
                        <SimpleTaskTimer
                          task={task}
                          extendedEndTime={extendedTasks[task.id]}
                          onTimeExpired={handleTimeExpired}
                          onTaskStart={onTaskStart || (() => {})}
                          onTaskEnd={onTaskEnd || (() => {})}
                          displayOnly={true}
                        />
                      )}
                    </div>

                    {/* Desktop Middle Column / Mobile Middle Row - Task Main Content */}
                    <div className="flex-1 min-w-0 lg:px-4 mb-3 lg:mb-0">
                      {/* Task Title */}
                      <h3 
                        className={`text-lg font-semibold mb-2 ${
                          isCompleted ? 'text-purple-500 line-through' : 'text-purple-600'
                        } cursor-pointer hover:underline hover:text-purple-500 transition-colors`}
                        onClick={(e) => handleNotionClick(task, e)}
                        title="Click to edit in Notion"
                      >
                        {task.title}
                      </h3>

                      {/* Status and Priority Labels */}
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 text-xs rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 shadow-purple-100/50">
                          {task.status}
                        </span>

                        {task.priority_quadrant && (
                          <span className="px-3 py-1.5 text-xs rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 shadow-purple-100/50">
                            {task.priority_quadrant}
                          </span>
                        )}
                      </div>

                      {/* Strategy and Plan Labels - Separate Row */}
                      <div className="flex items-center gap-2 mt-2">
                        {/* Strategy Label - First */}
                        {task.plan && task.plan[0] && (() => {
                          const plan = planOptions.find(p => p.id === task.plan[0])
                          if (plan && plan.parent_goal && plan.parent_goal[0]) {
                            const strategy = strategyOptions.find(s => s.id === plan.parent_goal[0])
                            if (strategy) {
                              return (
                                <>
                                  <span 
                                    className="px-3 py-1.5 text-xs rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm bg-gradient-to-r from-violet-100 to-violet-200 text-violet-700 shadow-violet-100/50 cursor-pointer hover:underline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const notionPageUrl = `https://www.notion.so/${strategy.id.replace(/-/g, '')}`
                                      window.open(notionPageUrl, '_blank')
                                    }}
                                    title="Click to edit in Notion"
                                  >
                                    {strategy.objective}
                                  </span>
                                  {/* Arrow connector */}
                                  <span className="text-violet-400 text-xs">→</span>
                                </>
                              )
                            }
                          }
                          return null
                        })()}

                        {/* Plan Label - Second */}
                        {task.plan && task.plan[0] && (() => {
                          const plan = planOptions.find(p => p.id === task.plan[0])
                          if (plan) {
                            return (
                              <span 
                                className="px-3 py-1.5 text-xs rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm bg-gradient-to-r from-violet-100 to-violet-200 text-violet-700 shadow-violet-100/50 cursor-pointer hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const notionPageUrl = `https://www.notion.so/${plan.id.replace(/-/g, '')}`
                                  window.open(notionPageUrl, '_blank')
                                }}
                                title="Click to edit in Notion"
                              >
                                {plan.title}
                              </span>
                            )
                          }
                          return null
                        })()}
                      </div>
                    </div>

                    {/* Desktop: Right Column with Vertical Icons, Mobile: Bottom Row with Horizontal Icons */}
                    <div className="flex lg:flex-col gap-2 lg:min-w-[32px] flex-shrink-0 justify-center">
                      {/* 1. Add to Outlook */}
                      <div className="relative group">
                        <button
                          onClick={(e) => handleOutlookClick(task, e)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-500 flex items-center justify-center 
                                   transition-all duration-100 hover:scale-110 group"
                        >
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <div className="absolute lg:right-10 bottom-10 lg:bottom-auto lg:top-1/2 lg:transform lg:-translate-y-1/2 
                                      left-1/2 lg:left-auto transform -translate-x-1/2 lg:translate-x-0
                                      bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap 
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                          Add to Outlook
                        </div>
                      </div>

                      {/* 2. Complete Early */}
                      <div className="relative group">
                        <button
                          ref={(el) => {
                            if (el) timeRecordButtonRefs.current[task.id] = el
                          }}
                          onClick={(e) => handleRecordTimeClick(task, e)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-500 flex items-center justify-center 
                                   transition-all duration-100 hover:scale-110 group"
                        >
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <div className="absolute lg:right-10 bottom-10 lg:bottom-auto lg:top-1/2 lg:transform lg:-translate-y-1/2 
                                      left-1/2 lg:left-auto transform -translate-x-1/2 lg:translate-x-0
                                      bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap 
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                          Complete Early
                        </div>
                      </div>

                      {/* 3. Start/End Task */}
                      <div className="relative group">
                        <button
                          ref={(el) => {
                            if (el) startEndButtonRefs.current[task.id] = el
                          }}
                          onClick={(e) => handleStartEndClick(task, e)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-500 flex items-center justify-center 
                                   transition-all duration-100 hover:scale-110 group"
                        >
                          {!task.actual_start ? (
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-100" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-100" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 6h12v12H6z"/>
                            </svg>
                          )}
                        </button>
                        <div className="absolute lg:right-10 bottom-10 lg:bottom-auto lg:top-1/2 lg:transform lg:-translate-y-1/2 
                                      left-1/2 lg:left-auto transform -translate-x-1/2 lg:translate-x-0
                                      bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap 
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                          {!task.actual_start ? 'Start Task' : 'End Task'}
                        </div>
                      </div>

                      {/* 4. Edit */}
                      <div className="relative group">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onTaskClick && onTaskClick(task)
                          }}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-500 flex items-center justify-center 
                                   transition-all duration-100 hover:scale-110 group"
                        >
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <div className="absolute lg:right-10 bottom-10 lg:bottom-auto lg:top-1/2 lg:transform lg:-translate-y-1/2 
                                      left-1/2 lg:left-auto transform -translate-x-1/2 lg:translate-x-0
                                      bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap 
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                          Edit Task
                        </div>
                      </div>

                      {/* 5. Delete */}
                      <div className="relative group">
                        <button
                          ref={(el) => {
                            if (el) deleteButtonRefs.current[task.id] = el
                          }}
                          onClick={(e) => handleDeleteClick(task, e)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-500 flex items-center justify-center 
                                   transition-all duration-100 hover:scale-110 group"
                        >
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <div className="absolute lg:right-10 bottom-10 lg:bottom-auto lg:top-1/2 lg:transform lg:-translate-y-1/2 
                                      left-1/2 lg:left-auto transform -translate-x-1/2 lg:translate-x-0
                                      bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap 
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                          Delete Task
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full Notes Display - Bottom section spanning full width */}
                  {task.note && task.note.trim() && (
                    <div className="mt-4 pt-3 border-t border-purple-100">
                      <div className="text-sm text-gray-700">
                        <div className="text-xs font-medium text-purple-500 mb-1">Notes:</div>
                        <div className="whitespace-pre-wrap">{task.note}</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Task Extension Modal */}
      <TaskExtensionModal
        isOpen={extensionModal.isOpen}
        onExtend={handleExtend}
        onComplete={handleCompleteFromModal}
        taskTitle={extensionModal.task?.title || ''}
      />

      {/* Time Record Tooltip */}
      <TimeRecordTooltip
        isOpen={timeRecordTooltip.isOpen}
        onClose={() => setTimeRecordTooltip({ isOpen: false, task: null, triggerElement: null })}
        onSave={handleRecordTimeSave}
        task={timeRecordTooltip.task}
        triggerElement={timeRecordTooltip.triggerElement}
      />

      {/* Start/End Confirm Tooltip */}
      <StartEndConfirmTooltip
        isOpen={startEndTooltip.isOpen}
        onClose={() => setStartEndTooltip({ isOpen: false, task: null, action: 'start', triggerElement: null })}
        onConfirm={handleStartEndConfirm}
        action={startEndTooltip.action}
        taskTitle={startEndTooltip.task?.title || ''}
        triggerElement={startEndTooltip.triggerElement}
      />

      {/* Delete Confirm Tooltip */}
      <DeleteConfirmTooltip
        isOpen={deleteTooltip.isOpen}
        onClose={() => setDeleteTooltip({ isOpen: false, task: null, triggerElement: null })}
        onConfirm={handleDeleteConfirm}
        taskTitle={deleteTooltip.task?.title || ''}
        triggerElement={deleteTooltip.triggerElement}
      />
    </div>
  )
}