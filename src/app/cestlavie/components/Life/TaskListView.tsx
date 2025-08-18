'use client'

import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import DeleteConfirmTooltip from './DeleteConfirmTooltip'
import RelationsTooltip from './RelationsTooltip'
import { extractTimeOnly, extractDateOnly, formatDateDisplayName } from '@/utils/dateUtils'
import { TaskRecord } from './taskReducer'


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
  onTaskCopy?: (task: TaskRecord) => void
  onTaskUpdate?: (taskId: string, field: 'status' | 'priority_quadrant', value: string) => void
  onTaskSyncToOutlook?: (task: TaskRecord) => void
  formatTimeRange?: (startDate: string, endDate?: string) => string
  getPriorityColor?: (priority: string) => string
  planOptions?: PlanOption[]
  strategyOptions?: StrategyOption[]
  statusOptions?: string[]
  priorityOptions?: string[]
}


export default function TaskListView({ 
  tasks, 
  selectedDate, 
  onTaskClick,
  onTaskDelete,
  onCreateTask,
  onTaskComplete,
  onTaskCopy,
  onTaskUpdate,
  onTaskSyncToOutlook,
  formatTimeRange,
  getPriorityColor,
  planOptions = [],
  strategyOptions = [],
  statusOptions = ['Not Started', 'In Progress', 'Completed'],
  priorityOptions = ['Important & Urgent', 'Important & Not Urgent', 'Not Important & Urgent', 'Not Important & Not Urgent']
}: TaskListViewProps) {
  


  const [deleteTooltip, setDeleteTooltip] = useState<{
    isOpen: boolean
    task: TaskRecord | null
    triggerElement: HTMLElement | null
  }>({ isOpen: false, task: null, triggerElement: null })
  
  const [relationsTooltip, setRelationsTooltip] = useState<{
    isOpen: boolean
    task: TaskRecord | null
  }>({ isOpen: false, task: null })
  
  const [updatingFields, setUpdatingFields] = useState<{[key: string]: boolean}>({}) // taskId-field -> loading state
  
  const deleteButtonRefs = useRef<{[taskId: string]: HTMLButtonElement}>({}) // taskId -> new end time

  // Get tasks for selected date
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

  const handleNotionClick = useCallback((task: TaskRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    // Open Notion page in new tab
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

  const dateDisplayName = formatDateDisplayName(selectedDate)

  return (
    <div className="space-y-6">

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
              const isCompleted = task.status === 'Completed'
              
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl
                    ${isCompleted 
                      ? 'bg-gradient-to-r from-purple-50/90 to-purple-100/90 opacity-75' 
                      : 'bg-white/90 hover:bg-gradient-to-r hover:from-purple-25/90 hover:to-purple-50/90'
                    }`}
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      {/* Time Info */}
                      {(task.start_date || task.end_date) && (
                        <span className="text-sm font-semibold text-purple-500">
                          {formatTimeOnly(task.start_date, task.end_date)}
                        </span>
                      )}
                      
                      {/* Task Title */}
                      <h3 
                        className={`text-lg font-semibold ${
                          isCompleted ? 'text-purple-500 line-through' : 'text-purple-600'
                        } cursor-pointer hover:underline hover:text-purple-500 transition-colors`}
                        onClick={(e) => handleNotionClick(task, e)}
                        title="Click to edit in Notion"
                      >
                        {task.title}
                      </h3>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-1">
                      {/* Row 1: Sync to Outlook (if not synced), Edit, Delete */}
                      <div className="flex gap-1">
                        {/* Sync to Outlook Button - Only show if not synced */}
                        {!task.outlook_event_id && onTaskSyncToOutlook && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onTaskSyncToOutlook(task)
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Sync to Outlook"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onTaskClick && onTaskClick(task)
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          ref={(el) => {
                            if (el) deleteButtonRefs.current[task.id] = el
                          }}
                          onClick={(e) => handleDeleteClick(task, e)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Row 2: Copy, Complete */}
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onTaskCopy && onTaskCopy(task)
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                          title="Copy Task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onTaskComplete && onTaskComplete(task)
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                          title="Complete Early"
                          disabled={task.status === 'Completed'}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Labels Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                        {/* Row 1, Col 1: Status - Dropdown Select */}
                        <div className="relative">
                          <select
                            value={task.status}
                            onChange={(e) => handleFieldUpdate(task.id, 'status', e.target.value)}
                            disabled={updatingFields[`${task.id}-status`]}
                            className="w-full px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 border-0 appearance-none cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {statusOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          {updatingFields[`${task.id}-status`] && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>

                        {/* Row 1, Col 2: Priority - Dropdown Select */}
                        <div className="relative">
                          <select
                            value={task.priority_quadrant || ''}
                            onChange={(e) => handleFieldUpdate(task.id, 'priority_quadrant', e.target.value)}
                            disabled={updatingFields[`${task.id}-priority_quadrant`]}
                            className="w-full px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 border-0 appearance-none cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">No Priority</option>
                            {priorityOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          {updatingFields[`${task.id}-priority_quadrant`] && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>

                        {/* Row 2, Col 1: Strategy */}
                        {task.plan && task.plan[0] && (() => {
                          const plan = planOptions.find(p => p.id === task.plan[0])
                          if (plan && plan.parent_goal && plan.parent_goal[0]) {
                            const strategy = strategyOptions.find(s => s.id === plan.parent_goal[0])
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
                          }
                          return (
                            <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
                              No Strategy
                            </span>
                          )
                        })()}

                        {/* Row 2, Col 2: Plan */}
                        {task.plan && task.plan[0] && (() => {
                          const plan = planOptions.find(p => p.id === task.plan[0])
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
                                {plan.title}
                              </span>
                            )
                          }
                          return (
                            <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
                              No Plan
                            </span>
                          )
                        })() || (
                          <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
                            No Plan
                          </span>
                        )}
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



      {/* Delete Confirm Tooltip */}
      <DeleteConfirmTooltip
        isOpen={deleteTooltip.isOpen}
        onClose={() => setDeleteTooltip({ isOpen: false, task: null, triggerElement: null })}
        onConfirm={handleDeleteConfirm}
        taskTitle={deleteTooltip.task?.title || ''}
        triggerElement={deleteTooltip.triggerElement}
      />
      
      {/* Relations Tooltip */}
      {relationsTooltip.task && (
        <RelationsTooltip
          type="task"
          isOpen={relationsTooltip.isOpen}
          onClose={() => setRelationsTooltip({ isOpen: false, task: null })}
          parentPlan={(() => {
            const task = relationsTooltip.task
            if (task.plan && task.plan[0]) {
              const plan = planOptions.find(p => p.id === task.plan[0])
              if (plan) {
                return {
                  id: plan.id,
                  objective: plan.title,
                  status: 'Unknown',
                  total_tasks: 0,
                  completed_tasks: 0
                }
              }
            }
            return undefined
          })()}
          parentStrategy={(() => {
            const task = relationsTooltip.task
            if (task.plan && task.plan[0]) {
              const plan = planOptions.find(p => p.id === task.plan[0])
              if (plan && plan.parent_goal && plan.parent_goal[0]) {
                const strategy = strategyOptions.find(s => s.id === plan.parent_goal[0])
                if (strategy) {
                  return {
                    id: strategy.id,
                    objective: strategy.objective,
                    status: 'Unknown',
                    progress: 0
                  }
                }
              }
            }
            return undefined
          })()}
        />
      )}
    </div>
  )
}