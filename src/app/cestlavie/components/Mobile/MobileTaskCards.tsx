'use client'

import { useMemo, useCallback, useState, useRef } from 'react'
import DeleteConfirmTooltip from '../Life/DeleteConfirmTooltip'
import { TaskRecord, MobileTaskCardsProps } from '../../types/task'
import { extractTimeOnly, extractDateOnly } from '@/utils/dateUtils'

export default function MobileTaskCards({ 
  tasks, 
  selectedDate,
  onTaskClick,
  onTaskDelete,
  onTaskUpdate,
  formatTimeRange,
  getPriorityColor,
  plans = [],
  strategies = [],
  statusOptions = [],
  priorityOptions = []
}: MobileTaskCardsProps) {
  
  const [deleteTooltip, setDeleteTooltip] = useState<{
    isOpen: boolean
    task: TaskRecord | null
    triggerElement: HTMLElement | null
  }>({ isOpen: false, task: null, triggerElement: null })
  
  
  
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

  const handleFieldUpdate = useCallback(async (taskId: string, field: 'status' | 'priority_quadrant', value: string) => {
    if (!onTaskUpdate) return
    
    const updateKey = `${taskId}-${field}`
    setUpdatingFields(prev => ({ ...prev, [updateKey]: true }))
    
    try {
      await onTaskUpdate(taskId, field, value)
    } catch (error) {
      console.error('Failed to update task field:', error)
    } finally {
      setUpdatingFields(prev => ({ ...prev, [updateKey]: false }))
    }
  }, [onTaskUpdate])

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
              {/* Row 1, Col 1: Status - Dropdown Select */}
              <div className="relative">
                <select
                  value={task.status}
                  onChange={(e) => handleFieldUpdate(task.id, 'status', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 border-0 appearance-none cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => e.stopPropagation()}
                >
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Row 1, Col 2: Priority - Dropdown Select */}
              <div className="relative">
                <select
                  value={task.priority_quadrant || ''}
                  onChange={(e) => handleFieldUpdate(task.id, 'priority_quadrant', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 border-0 appearance-none cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">No Priority</option>
                  {priorityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Row 2, Col 1: Strategy - Direct lookup */}
              {(() => {
                const strategyId = task.strategy?.[0]
                const strategy = strategyId ? strategies.find(s => s.id === strategyId) : null
                
                if (strategy) {
                  return (
                    <span 
                      className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 cursor-pointer"
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
                
                return (
                  <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
                    No Strategy
                  </span>
                )
              })()}

              {/* Row 2, Col 2: Plan - Direct lookup */}
              {(() => {
                const planId = task.plan?.[0]
                const plan = planId ? plans.find(p => p.id === planId) : null
                
                if (plan) {
                  return (
                    <span 
                      className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 cursor-pointer"
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
                
                return (
                  <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
                    No Plan
                  </span>
                )
              })()}
            </div>

            {/* Note */}
            {task.note && (
              <div className="mt-3 pt-3">
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

    </div>
  )
}