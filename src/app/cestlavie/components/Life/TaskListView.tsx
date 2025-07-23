'use client'

import { useMemo, useCallback, useState, useRef } from 'react'
import TaskExtensionModal from './TaskExtensionModal'
import SimpleTaskTimer from './SimpleTaskTimer'
import TimeRecordTooltip from './TimeRecordTooltip'
import TimeComparisonTooltip from './TimeComparisonTooltip'
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

interface TaskListViewProps {
  tasks: TaskRecord[]
  selectedDate: string
  onTaskClick?: (task: TaskRecord) => void
  onTaskDelete?: (taskId: string) => void
  onCreateTask?: (date: string) => void
  onTaskComplete?: (task: TaskRecord) => void
  onTaskStart?: (task: TaskRecord) => void
  onTaskEnd?: (task: TaskRecord) => void
  onRecordTime?: (task: TaskRecord, startTime?: string, endTime?: string) => void
  formatTimeRange?: (startDate: string, endDate?: string) => string
  getPriorityColor?: (priority: string) => string
  hasTimeConflicts?: (task: TaskRecord) => boolean
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
  hasTimeConflicts
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
  
  const timeRecordButtonRefs = useRef<{[taskId: string]: HTMLButtonElement}>({}) // taskId -> new end time

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
      const date = new Date(dateStr)
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
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

  const handleRecordTimeSave = useCallback((startTime?: string, endTime?: string) => {
    if (timeRecordTooltip.task && onRecordTime) {
      onRecordTime(timeRecordTooltip.task, startTime, endTime)
    }
    setTimeRecordTooltip({ isOpen: false, task: null, triggerElement: null })
  }, [timeRecordTooltip.task, onRecordTime])

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
    <div className="bg-white rounded-lg border border-purple-200">
      {/* Header */}
      <div className="p-6 border-b border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-purple-900">Tasks for {dateDisplayName}</h2>
            <p className="text-sm text-purple-600 mt-1">
              {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          <button
            onClick={() => onCreateTask && onCreateTask(selectedDate)}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 
                     transition-all duration-200 font-medium shadow-sm hover:shadow-md
                     transform hover:scale-105 active:scale-95"
          >
            New Task
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="p-6">
        {selectedDateTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No tasks scheduled</h3>
            <p className="text-gray-600 mb-6">This day is free. Would you like to add a task?</p>
            <button
              onClick={() => onCreateTask && onCreateTask(selectedDate)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
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
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200
                    ${isCompleted 
                      ? 'border-purple-300 bg-purple-100 opacity-75' 
                      : isConflicted
                      ? 'border-purple-400 bg-purple-100'
                      : 'border-purple-200 bg-purple-50'
                    }`}
                >
                  {/* Status indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                    isCompleted ? 'bg-purple-600' : 
                    task.status === 'In Progress' ? 'bg-purple-500' :
                    task.status === 'On Hold' ? 'bg-purple-400' :
                    'bg-purple-300'
                  }`} />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pl-3 pr-4">
                      {/* Title and Status */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 
                          className={`text-lg font-semibold ${
                            isCompleted ? 'text-purple-700 line-through' : 'text-purple-900'
                          } truncate cursor-pointer hover:underline hover:text-purple-700 transition-colors`}
                          onClick={(e) => handleNotionClick(task, e)}
                          title="Click to edit in Notion"
                        >
                          {task.title}
                        </h3>
                        
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                          isCompleted ? 'bg-purple-200 text-purple-800 border-purple-300' :
                          task.status === 'In Progress' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                          task.status === 'On Hold' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {task.status}
                        </span>

                        {task.priority_quadrant && getPriorityColor && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority_quadrant)}`}>
                            {task.priority_quadrant.includes('&') 
                              ? task.priority_quadrant.split(' & ').map(part => part.charAt(0)).join('')
                              : task.priority_quadrant.charAt(0)
                            }
                          </span>
                        )}
                      </div>

                      {/* Time */}
                      {(task.start_date || task.end_date) && (
                        <div className="flex items-center gap-2 mb-2">
                          <TimeComparisonTooltip task={task}>
                            <span className="text-sm font-medium text-purple-700 cursor-help">
                              {formatTimeOnly(task.start_date, task.end_date)}
                            </span>
                          </TimeComparisonTooltip>
                          {task.budget_time > 0 && (
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                              {task.budget_time}h budgeted
                            </span>
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
                      )}

                      {/* Note */}
                      {task.note && (
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {task.note}
                        </p>
                      )}

                      {/* Conflict warning */}
                      {isConflicted && (
                        <div className="flex items-center gap-2 text-xs text-purple-800 bg-purple-100 px-2 py-1 rounded-md border border-purple-200">
                          <span className="font-medium">Time Conflict</span>
                          <span>This task overlaps with other scheduled tasks</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons - Always visible vertical layout */}
                    <div className="flex flex-col gap-1 min-w-[80px] flex-shrink-0">
                      {/* Task execution buttons */}
                      {!isCompleted && (
                        <>
                          {!task.actual_start ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onTaskStart && onTaskStart(task)
                                }}
                                className="px-3 py-1 text-xs text-purple-600 bg-white border border-purple-200 
                                         rounded hover:bg-purple-600 hover:text-white hover:border-purple-600
                                         transition-all duration-200 font-medium"
                              >
                                Start Task
                              </button>
                              <button
                                ref={(el) => {
                                  if (el) timeRecordButtonRefs.current[task.id] = el
                                }}
                                onClick={(e) => handleRecordTimeClick(task, e)}
                                className="px-3 py-1 text-xs text-purple-600 bg-white border border-purple-200 
                                         rounded hover:bg-purple-600 hover:text-white hover:border-purple-600
                                         transition-all duration-200 font-medium"
                              >
                                Complete
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onTaskEnd && onTaskEnd(task)
                              }}
                              className="px-3 py-1 text-xs text-purple-600 bg-white border border-purple-200 
                                       rounded hover:bg-purple-600 hover:text-white hover:border-purple-600
                                       transition-all duration-200 font-medium"
                            >
                              End Task
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* Common action buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onTaskClick && onTaskClick(task)
                        }}
                        className="px-3 py-1 text-xs text-gray-600 bg-white border border-gray-200 
                                 rounded hover:bg-gray-100 hover:text-gray-800 hover:border-gray-300
                                 transition-all duration-200 font-medium"
                      >
                        Edit
                      </button>
                      {onTaskDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Are you sure you want to delete this task?')) {
                              onTaskDelete(task.id)
                            }
                          }}
                          className="px-3 py-1 text-xs text-red-600 bg-white border border-red-200 
                                   rounded hover:bg-red-600 hover:text-white hover:border-red-600
                                   transition-all duration-200 font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
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
    </div>
  )
}