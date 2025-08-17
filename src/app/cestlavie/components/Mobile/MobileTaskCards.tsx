'use client'

import { useMemo, useCallback, useState, useRef } from 'react'
import DeleteConfirmTooltip from '../Life/DeleteConfirmTooltip'
import { TaskRecord } from '../Life/taskReducer'

interface PlanOption {
  id: string
  title: string
  parent_goal?: string[]
}

interface StrategyOption {
  id: string
  objective: string
}

interface MobileTaskCardsProps {
  tasks: TaskRecord[]
  onTaskClick?: (task: TaskRecord) => void
  onTaskDelete?: (taskId: string) => void
  formatTimeRange?: (startDate: string, endDate?: string) => string
  getPriorityColor?: (priority: string) => string
  planOptions?: PlanOption[]
  strategyOptions?: StrategyOption[]
}

export default function MobileTaskCards({ 
  tasks, 
  onTaskClick,
  onTaskDelete,
  formatTimeRange,
  getPriorityColor,
  planOptions = [],
  strategyOptions = []
}: MobileTaskCardsProps) {
  
  const [deleteTooltip, setDeleteTooltip] = useState<{
    isOpen: boolean
    task: TaskRecord | null
    triggerElement: HTMLElement | null
  }>({ isOpen: false, task: null, triggerElement: null })
  
  const deleteButtonRefs = useRef<{[taskId: string]: HTMLButtonElement}>({})

  // Sort tasks by date (most recent first)
  const sortedTasks = useMemo(() => {
    return tasks.sort((a, b) => {
      const aTime = a.start_date || a.end_date || ''
      const bTime = b.start_date || b.end_date || ''
      return bTime.localeCompare(aTime)
    })
  }, [tasks])

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
    
    return `${startTime} - ${endTime}`
  }, [])

  const formatDateAndTime = useCallback((startDate: string, endDate?: string) => {
    if (!startDate) return ''
    
    const date = new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
    
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

  if (sortedTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No tasks found</h3>
        <p className="text-gray-600">Create a new task to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedTasks.map(task => {
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
              {/* Status */}
              <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
                {task.status}
              </span>

              {/* Priority */}
              <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
                {task.priority_quadrant || 'No Priority'}
              </span>

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
                      {plan.title}
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
    </div>
  )
}