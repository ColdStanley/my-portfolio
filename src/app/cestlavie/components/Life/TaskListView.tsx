'use client'

import { useMemo, useCallback, useState } from 'react'
import { extractTimeOnly, extractDateOnly, formatDateDisplayName } from '@/utils/dateUtils'
import { TaskRecord, TaskListViewProps, PlanOption, StrategyOption } from '../../types/task'
import { syncTaskToOutlook } from '../../services/taskService'


export default function TaskListView({ 
  tasks, 
  selectedDate, 
  onTaskSelect,
  onTaskDelete,
  onTaskUpdate,
  statusOptions = ['Not Started', 'In Progress', 'Completed']
}: TaskListViewProps) {
  // State for managing sync loading status
  const [syncingTasks, setSyncingTasks] = useState<Set<string>>(new Set())
  const [syncError, setSyncError] = useState<string | null>(null)

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

  const handleFieldUpdate = useCallback(async (taskId: string, field: 'status', value: string) => {
    if (!onTaskUpdate) return
    
    try {
      await onTaskUpdate(taskId, { [field]: value })
    } catch (error) {
      console.error('Failed to update task field:', error)
    }
  }, [onTaskUpdate])

  const handleManualSync = useCallback(async (task: TaskRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Clear any previous error
    setSyncError(null)
    
    // Add task to syncing state
    setSyncingTasks(prev => new Set(prev).add(task.id))
    
    try {
      await syncTaskToOutlook(task.id)
      
      // Show success feedback (you might want to add a toast here)
      console.log('Task synced successfully to Outlook')
      
      // The icon will disappear automatically after data refresh
      // when n8n updates the outlook_event_id
      
    } catch (error) {
      console.error('Failed to sync task to Outlook:', error)
      setSyncError(error instanceof Error ? error.message : 'Failed to sync to Outlook')
    } finally {
      // Remove task from syncing state
      setSyncingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(task.id)
        return newSet
      })
    }
  }, [])

  const dateDisplayName = selectedDate ? formatDateDisplayName(selectedDate) : ''

  return (
    <>
      {/* Task Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-purple-900 mb-1">
          {selectedDate ? dateDisplayName : 'Select Date'}
        </h4>
        <p className="text-xs text-purple-600">
          {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Task List */}
      {selectedDateTasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-purple-600 text-2xl mb-2">📋</div>
          <p className="text-purple-900 text-sm">No tasks for this date</p>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedDateTasks.map(task => {
            const isCompleted = task.status === 'Completed'
            
            return (
              <div
                key={task.id}
                className={`relative p-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl
                  ${isCompleted 
                    ? 'bg-purple-600/5 text-purple-800 border-l-4 border-purple-600' 
                    : 'bg-purple-600/5 text-purple-800 hover:bg-purple-600/10'
                  }`}
              >
                {/* Completion Check Icon - Right Top Corner */}
                {isCompleted && (
                  <div className="absolute top-2 right-2 text-purple-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                  {/* Task Content */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Time */}
                      {(task.start_date || task.end_date) && (
                        <div className="text-xs font-semibold text-purple-600 mb-1">
                          {formatTimeOnly(task.start_date, task.end_date)}
                        </div>
                      )}
                      
                      {/* Title */}
                      <h3 className="text-sm font-semibold text-purple-900">
                        {task.title}
                      </h3>
                      
                      {/* Status & Priority */}
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          value={task.status || ''}
                          onChange={(e) => handleFieldUpdate(task.id, 'status', e.target.value)}
                          className="px-2 py-0.5 bg-purple-600/10 text-purple-900 rounded border-0 text-xs cursor-pointer hover:bg-purple-600/15 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">No Status</option>
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        

                        {/* Importance Percentage */}
                        {task.importance_percentage && task.importance_percentage > 0 && (
                          <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-xs font-medium">
                            {task.importance_percentage}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-3">
                      {/* Outlook Sync Status Icon - show only if NOT synced */}
                      {!task.outlook_event_id && (
                        <button
                          onClick={(e) => handleManualSync(task, e)}
                          disabled={syncingTasks.has(task.id)}
                          className="p-1 text-purple-600 bg-purple-600/10 rounded transition-colors hover:bg-purple-600/15 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={syncingTasks.has(task.id) ? "Syncing to Outlook..." : "Click to sync to Outlook"}
                        >
                          {syncingTasks.has(task.id) ? (
                            <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onTaskSelect && onTaskSelect(task)
                        }}
                        className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-600/10 rounded transition-colors"
                        title="Edit"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(task, e)}
                        className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-600/10 rounded transition-colors"
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

      {/* Error Message */}
      {syncError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-700">{syncError}</span>
            </div>
            <button
              onClick={() => setSyncError(null)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </>
  )
}