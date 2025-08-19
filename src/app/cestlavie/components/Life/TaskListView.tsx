'use client'

import { useMemo, useCallback } from 'react'
import { extractTimeOnly, extractDateOnly, formatDateDisplayName } from '@/utils/dateUtils'
import { TaskRecord, TaskListViewProps, PlanOption, StrategyOption } from '../../types/task'


export default function TaskListView({ 
  tasks, 
  selectedDate, 
  onTaskSelect,
  onTaskDelete,
  onTaskUpdate,
  statusOptions = ['Not Started', 'In Progress', 'Completed'],
  priorityOptions = ['Important & Urgent', 'Important & Not Urgent', 'Not Important & Urgent', 'Not Important & Not Urgent']
}: TaskListViewProps) {

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
    if (onTaskDelete) {
      onTaskDelete(task.id)
    }
  }, [onTaskDelete])

  const handleFieldUpdate = useCallback(async (taskId: string, field: 'status' | 'priority_quadrant', value: string) => {
    if (!onTaskUpdate) return
    
    try {
      await onTaskUpdate(taskId, { [field]: value })
    } catch (error) {
      console.error('Failed to update task field:', error)
    }
  }, [onTaskUpdate])

  const dateDisplayName = selectedDate ? formatDateDisplayName(selectedDate) : ''

  return (
    <>
      {/* Task Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-purple-900 mb-1">
          {selectedDate ? dateDisplayName : 'Select Date'}
        </h4>
        <p className="text-xs text-gray-600">
          {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Task List */}
      {selectedDateTasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-2xl mb-2">📋</div>
          <p className="text-gray-600 text-sm">No tasks for this date</p>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedDateTasks.map(task => {
            const isCompleted = task.status === 'Completed'
            
            return (
              <div
                key={task.id}
                className={`p-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl
                  ${isCompleted 
                    ? 'bg-gradient-to-r from-purple-50 to-purple-100 opacity-75' 
                    : 'bg-white hover:bg-gradient-to-r hover:from-purple-25 hover:to-purple-50'
                  }`}
              >
                  {/* Task Content */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Time */}
                      {(task.start_date || task.end_date) && (
                        <div className="text-xs font-semibold text-purple-500 mb-1">
                          {formatTimeOnly(task.start_date, task.end_date)}
                        </div>
                      )}
                      
                      {/* Title */}
                      <h3 className={`text-sm font-semibold ${
                        isCompleted ? 'text-purple-500 line-through' : 'text-purple-900'
                      }`}>
                        {task.title}
                      </h3>
                      
                      {/* Status & Priority */}
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          value={task.status || ''}
                          onChange={(e) => handleFieldUpdate(task.id, 'status', e.target.value)}
                          className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded border-0 text-xs cursor-pointer hover:bg-purple-100 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">No Status</option>
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        
                        <select
                          value={task.priority_quadrant || ''}
                          onChange={(e) => handleFieldUpdate(task.id, 'priority_quadrant', e.target.value)}
                          className="px-2 py-0.5 bg-gray-50 text-gray-700 rounded border-0 text-xs cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">No Priority</option>
                          {priorityOptions.map(priority => (
                            <option key={priority} value={priority}>
                              {priority} {/* 显示完整选项文本 */}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onTaskSelect && onTaskSelect(task)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(task, e)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

    </>
  )
}