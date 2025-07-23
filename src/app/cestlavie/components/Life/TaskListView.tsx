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
                  className={`p-4 rounded-lg border-2 transition-all duration-200
                    ${isCompleted 
                      ? 'border-purple-300 bg-purple-100 opacity-75' 
                      : 'border-purple-200 bg-purple-50'
                    }`}
                >
                  {/* Three column layout */}
                  <div className="flex items-start justify-between mb-3">
                    {/* Left Column - Time Info */}
                    <div className="flex flex-col gap-1 min-w-[100px]">
                      {(task.start_date || task.end_date) && (
                        <TimeComparisonTooltip task={task}>
                          <span className="text-sm font-semibold text-purple-700 cursor-help">
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

                    {/* Middle Column - Task Main Content */}
                    <div className="flex-1 min-w-0 px-4">
                      {/* Task Title */}
                      <h3 
                        className={`text-lg font-semibold mb-2 ${
                          isCompleted ? 'text-purple-700 line-through' : 'text-purple-900'
                        } cursor-pointer hover:underline hover:text-purple-700 transition-colors`}
                        onClick={(e) => handleNotionClick(task, e)}
                        title="Click to edit in Notion"
                      >
                        {task.title}
                      </h3>

                      {/* Status and Priority Labels */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          isCompleted ? 'bg-green-100 text-green-800' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                          task.status === 'Not Started' ? 'bg-gray-100 text-gray-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {task.status}
                        </span>

                        {task.priority_quadrant && (
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            task.priority_quadrant.includes('Important & Urgent') ? 'bg-red-100 text-red-800' :
                            task.priority_quadrant.includes('Important & Not Urgent') ? 'bg-orange-100 text-orange-800' :
                            task.priority_quadrant.includes('Not Important & Urgent') ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.priority_quadrant}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons - Fixed 5 buttons always visible */}
                    <div className="flex flex-col gap-1 min-w-[100px] flex-shrink-0">
                      {/* 1. Add to Outlook */}
                      <button
                        onClick={(e) => handleOutlookClick(task, e)}
                        className="px-3 py-1.5 text-xs text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 
                                 border-2 border-purple-200 rounded-lg hover:from-purple-600 hover:to-purple-700 
                                 hover:text-white hover:border-purple-600 transition-all duration-300 font-semibold
                                 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                      >
                        Add to Outlook
                      </button>

                      {/* 2. Complete Early */}
                      <button
                        ref={(el) => {
                          if (el) timeRecordButtonRefs.current[task.id] = el
                        }}
                        onClick={(e) => handleRecordTimeClick(task, e)}
                        className="px-3 py-1.5 text-xs text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 
                                 border-2 border-purple-200 rounded-lg hover:from-purple-600 hover:to-purple-700 
                                 hover:text-white hover:border-purple-600 transition-all duration-300 font-semibold
                                 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                      >
                        Complete Early
                      </button>

                      {/* 3. Start/End Task */}
                      <button
                        ref={(el) => {
                          if (el) startEndButtonRefs.current[task.id] = el
                        }}
                        onClick={(e) => handleStartEndClick(task, e)}
                        className="px-3 py-1.5 text-xs text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 
                                 border-2 border-purple-200 rounded-lg hover:from-purple-600 hover:to-purple-700 
                                 hover:text-white hover:border-purple-600 transition-all duration-300 font-semibold
                                 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                      >
                        {!task.actual_start ? 'Start' : 'End'}
                      </button>

                      {/* 4. Edit */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onTaskClick && onTaskClick(task)
                        }}
                        className="px-3 py-1.5 text-xs text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 
                                 border-2 border-purple-200 rounded-lg hover:from-purple-600 hover:to-purple-700 
                                 hover:text-white hover:border-purple-600 transition-all duration-300 font-semibold
                                 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                      >
                        Edit
                      </button>

                      {/* 5. Delete */}
                      <button
                        ref={(el) => {
                          if (el) deleteButtonRefs.current[task.id] = el
                        }}
                        onClick={(e) => handleDeleteClick(task, e)}
                        className="px-3 py-1.5 text-xs text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 
                                 border-2 border-purple-200 rounded-lg hover:from-purple-600 hover:to-purple-700 
                                 hover:text-white hover:border-purple-600 transition-all duration-300 font-semibold
                                 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Full Notes Display - Bottom section spanning full width */}
                  {task.note && task.note.trim() && (
                    <div className="mt-4 pt-3 border-t border-purple-200">
                      <div className="text-sm text-gray-700">
                        <div className="text-xs font-medium text-purple-700 mb-1">Notes:</div>
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