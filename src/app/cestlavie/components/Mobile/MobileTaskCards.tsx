'use client'

import { useMemo, useCallback, useState, useRef } from 'react'
import DeleteConfirmTooltip from '../Life/DeleteConfirmTooltip'
import BottomSheet from '../Life/BottomSheet'
import { TaskRecord } from '../Life/taskReducer'
import { extractTimeOnly, extractDateOnly } from '@/utils/dateUtils'

interface PlanOption {
  id: string
  objective: string
  parent_goal?: string[]
}

interface StrategyOption {
  id: string
  objective: string
}

interface MobileTaskCardsProps {
  tasks: TaskRecord[]
  selectedDate: string
  onTaskClick?: (task: TaskRecord) => void
  onTaskDelete?: (taskId: string) => void
  onTaskUpdate?: (taskId: string, field: 'status' | 'priority_quadrant', value: string) => void
  formatTimeRange?: (startDate: string, endDate?: string) => string
  getPriorityColor?: (priority: string) => string
  planOptions?: PlanOption[]
  strategyOptions?: StrategyOption[]
  statusOptions?: string[]
  priorityOptions?: string[]
}

export default function MobileTaskCards({ 
  tasks, 
  selectedDate,
  onTaskClick,
  onTaskDelete,
  onTaskUpdate,
  formatTimeRange,
  getPriorityColor,
  planOptions = [],
  strategyOptions = [],
  statusOptions = [],
  priorityOptions = []
}: MobileTaskCardsProps) {
  
  const [deleteTooltip, setDeleteTooltip] = useState<{
    isOpen: boolean
    task: TaskRecord | null
    triggerElement: HTMLElement | null
  }>({ isOpen: false, task: null, triggerElement: null })
  
  const [bottomSheet, setBottomSheet] = useState<{
    isOpen: boolean
    taskId: string | null
    field: 'status' | 'priority_quadrant' | null
    currentValue: string
  }>({ isOpen: false, taskId: null, field: null, currentValue: '' })
  
  const [updatingFields, setUpdatingFields] = useState<{[key: string]: boolean}>({})
  
  const deleteButtonRefs = useRef<{[taskId: string]: HTMLButtonElement}>({})

  // Filter tasks for selected date and sort by time
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return []
    
    return tasks.filter(task => {
      if (!task.start_date && !task.end_date) return false
      
      const taskDate = task.start_date || task.end_date
      if (!taskDate) return false
      
      // Extract date part from UTC date string
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

  const formatDateAndTime = useCallback((startDate: string, endDate?: string) => {
    if (!startDate) return ''
    
    const date = extractDateOnly(startDate)
    const time = formatTimeOnly(startDate, endDate)
    return `${date} ${time}`
  }, [formatTimeOnly])

  const handleNotionClick = useCallback((task: TaskRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    const notionPageUrl = `https://www.notion.so/${task.id.replace(/-/g, '')}`
    window.open(notionPageUrl, '_blank')
  }, [])

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

  const handleFieldClick = useCallback((taskId: string, field: 'status' | 'priority_quadrant', currentValue: string) => {
    setBottomSheet({
      isOpen: true,
      taskId,
      field,
      currentValue: currentValue || ''
    })
  }, [])

  const handleBottomSheetSelect = useCallback(async (value: string) => {
    if (!bottomSheet.taskId || !bottomSheet.field || !onTaskUpdate) return

    const updateKey = `${bottomSheet.taskId}-${bottomSheet.field}`
    setUpdatingFields(prev => ({ ...prev, [updateKey]: true }))

    try {
      await onTaskUpdate(bottomSheet.taskId, bottomSheet.field, value)
    } catch (error) {
      console.error('Failed to update task field:', error)
    } finally {
      setUpdatingFields(prev => ({ ...prev, [updateKey]: false }))
      setBottomSheet({ isOpen: false, taskId: null, field: null, currentValue: '' })
    }
  }, [bottomSheet, onTaskUpdate])

  if (selectedDateTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No tasks scheduled</h3>
        <p className="text-gray-600">This day is free. Would you like to add a task?</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {selectedDateTasks.map(task => {
        const isCompleted = task.status === 'Completed'
        
        return (
          <div
            key={task.id}
            className={`p-4 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl cursor-pointer
              ${isCompleted 
                ? 'bg-gradient-to-r from-purple-50/90 to-purple-100/90 opacity-75' 
                : 'bg-white/90 hover:bg-gradient-to-r hover:from-purple-25/90 hover:to-purple-50/90'
              }`}
            onClick={() => onTaskClick && onTaskClick(task)}
          >
            {/* Task Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 
                  className={`text-lg font-semibold ${
                    isCompleted ? 'text-purple-500 line-through' : 'text-purple-600'
                  } hover:underline transition-colors`}
                  onClick={(e) => handleNotionClick(task, e)}
                  title="Click to edit in Notion"
                >
                  {task.title}
                </h3>
                
                {/* Date and Time */}
                {(task.start_date || task.end_date) && (
                  <span className="text-sm font-medium text-purple-500">
                    {formatDateAndTime(task.start_date, task.end_date)}
                  </span>
                )}
              </div>

              {/* Delete Button */}
              <button
                ref={el => {
                  if (el) deleteButtonRefs.current[task.id] = el
                }}
                onClick={(e) => handleDeleteClick(task, e)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Delete task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Labels Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Status - Clickable */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFieldClick(task.id, 'status', task.status)
                }}
                disabled={updatingFields[`${task.id}-status`]}
                className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {task.status}
                {updatingFields[`${task.id}-status`] && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>

              {/* Priority - Clickable */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFieldClick(task.id, 'priority_quadrant', task.priority_quadrant || '')
                }}
                disabled={updatingFields[`${task.id}-priority_quadrant`]}
                className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {task.priority_quadrant || 'No Priority'}
                {updatingFields[`${task.id}-priority_quadrant`] && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>

              {/* Strategy */}
              {task.plan && task.plan[0] && (() => {
                const plan = planOptions.find(p => p.id === task.plan[0])
                if (plan && plan.parent_goal && plan.parent_goal[0]) {
                  const strategy = strategyOptions.find(s => s.id === plan.parent_goal[0])
                  if (strategy) {
                    return (
                      <span 
                        className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 cursor-pointer col-span-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          const notionPageUrl = `https://www.notion.so/${strategy.id.replace(/-/g, '')}`
                          window.open(notionPageUrl, '_blank')
                        }}
                        title="Click to edit in Notion"
                      >
                        {strategy.objective}
                      </span>
                    )
                  }
                }
                return null
              })()}

              {/* Plan */}
              {task.plan && task.plan[0] && (() => {
                const plan = planOptions.find(p => p.id === task.plan[0])
                if (plan) {
                  return (
                    <span 
                      className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 cursor-pointer col-span-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        const notionPageUrl = `https://www.notion.so/${plan.id.replace(/-/g, '')}`
                        window.open(notionPageUrl, '_blank')
                      }}
                      title="Click to edit in Notion"
                    >
                      {plan.objective}
                    </span>
                  )
                }
                return null
              })()}
            </div>

            {/* Note */}
            {task.note && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 leading-relaxed">{task.note}</p>
              </div>
            )}
          </div>
        )
      })}

      {/* Delete Confirmation Tooltip */}
      <DeleteConfirmTooltip
        isOpen={deleteTooltip.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTooltip({ isOpen: false, task: null, triggerElement: null })}
        triggerElement={deleteTooltip.triggerElement}
        taskTitle={deleteTooltip.task?.title || ''}
      />

      {/* Bottom Sheet for Status/Priority Selection */}
      <BottomSheet
        isOpen={bottomSheet.isOpen}
        onClose={() => setBottomSheet({ isOpen: false, taskId: null, field: null, currentValue: '' })}
        onSelect={handleBottomSheetSelect}
        options={
          bottomSheet.field === 'status'
            ? statusOptions.map(option => ({ value: option, label: option }))
            : bottomSheet.field === 'priority_quadrant'
            ? [{ value: '', label: 'No Priority' }, ...priorityOptions.map(option => ({ value: option, label: option }))]
            : []
        }
        currentValue={bottomSheet.currentValue}
        title={`Select ${bottomSheet.field === 'status' ? 'Status' : 'Priority'}`}
        loading={updatingFields[`${bottomSheet.taskId}-${bottomSheet.field}`]}
      />
    </div>
  )
}