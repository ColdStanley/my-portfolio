'use client'

import { useEffect, useState } from 'react'
import { useOutlookAuth } from '@/hooks/useOutlookAuth'
import TaskCompletionModal from './TaskCompletionModal'
import RenderBlock from '@/components/notion/RenderBlock'

// Task Progress Distribution Chart Component
function TaskProgressChart({ tasks }: { tasks: TaskRecord[] }) {
  if (tasks.length === 0) return null

  const completedTasks = tasks.filter(task => task.status === 'Completed').length
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length
  const notStartedTasks = tasks.filter(task => task.status === 'Not Started').length
  const otherTasks = tasks.length - completedTasks - inProgressTasks - notStartedTasks

  const total = tasks.length
  const completedPercentage = (completedTasks / total) * 100
  const inProgressPercentage = (inProgressTasks / total) * 100
  const notStartedPercentage = (notStartedTasks / total) * 100
  const otherPercentage = (otherTasks / total) * 100

  const statusColors = {
    'Completed': '#10b981',
    'In Progress': '#f59e0b',
    'Not Started': '#6b7280',
    'Other': '#a1a1aa'
  }

  const statusData = [
    { name: 'Completed', count: completedTasks, percentage: completedPercentage, color: statusColors['Completed'] },
    { name: 'In Progress', count: inProgressTasks, percentage: inProgressPercentage, color: statusColors['In Progress'] },
    { name: 'Not Started', count: notStartedTasks, percentage: notStartedPercentage, color: statusColors['Not Started'] },
    { name: 'Other', count: otherTasks, percentage: otherPercentage, color: statusColors['Other'] }
  ].filter(item => item.count > 0)

  return (
    <div>
      <h4 className="text-xs font-medium text-purple-700 mb-2">Progress Distribution</h4>
      <div className="flex items-center gap-3">
        {/* Progress bar */}
        <div className="flex-1">
          <div className="flex h-3 bg-gray-100 rounded-full overflow-hidden">
            {statusData.map((status) => (
              <div
                key={status.name}
                className="h-full"
                style={{
                  width: `${status.percentage}%`,
                  backgroundColor: status.color
                }}
                title={`${status.name}: ${status.count} tasks (${status.percentage.toFixed(1)}%)`}
              />
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {completedPercentage.toFixed(0)}%
        </div>
      </div>
      {/* Legend */}
      <div className="mt-2 space-y-1">
        {statusData.map((status) => (
          <div key={status.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-xs text-gray-600 flex-1" title={status.name}>
              {status.name}
            </span>
            <span className="text-xs text-gray-400 font-medium">({status.count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Task Plan Distribution Chart Component
function TaskPlanChart({ tasks, planOptions }: { tasks: TaskRecord[], planOptions: PlanOption[] }) {
  const planCounts = tasks.reduce((acc, task) => {
    const planId = task.plan?.[0] || 'No Plan'
    const planName = planId === 'No Plan' ? 'No Plan' : 
      planOptions.find(p => p.id === planId)?.title || 'Unknown Plan'
    acc[planName] = (acc[planName] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Color scheme for better differentiation
  const colors = [
    '#8b5cf6',
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#ec4899',
    '#6366f1',
    '#84cc16'
  ]
  const entries = Object.entries(planCounts)
  const total = tasks.length

  if (entries.length === 0) return null

  return (
    <div>
      <h4 className="text-xs font-medium text-purple-700 mb-2">Plans Distribution</h4>
      <div className="flex items-center gap-3">
        {/* Simple visual bars instead of pie chart for better mobile display */}
        <div className="flex-1">
          <div className="flex h-3 bg-gray-100 rounded-full overflow-hidden">
            {entries.map(([planName, count], index) => {
              const percentage = (count / total) * 100
              return (
                <div
                  key={planName}
                  className="h-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                  title={`${planName}: ${count} tasks (${percentage.toFixed(1)}%)`}
                />
              )
            })}
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono">{total}</div>
      </div>
      {/* Legend - each plan on its own line */}
      <div className="mt-2 space-y-1">
        {entries.map(([planName, count], index) => (
          <div key={planName} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-xs text-gray-600 flex-1" title={planName}>
              {planName}
            </span>
            <span className="text-xs text-gray-400 font-medium">({count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Task Priority Quadrant Chart Component  
function TaskQuadrantChart({ tasks }: { tasks: TaskRecord[] }) {
  const quadrantCounts = tasks.reduce((acc, task) => {
    const quadrant = task.priority_quadrant || 'No Priority'
    acc[quadrant] = (acc[quadrant] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const quadrantColors: Record<string, string> = {
    'Important & Urgent': '#dc2626',
    'Important & Not Urgent': '#f97316',
    'Not Important & Urgent': '#eab308', 
    'Not Important & Not Urgent': '#6b7280',
    'No Priority': '#a1a1aa'
  }

  // Define simplified labels for better display
  const getQuadrantLabel = (quadrant: string) => {
    switch (quadrant) {
      case 'Important & Urgent': return 'Important & Urgent'
      case 'Important & Not Urgent': return 'Important & Not Urgent'
      case 'Not Important & Urgent': return 'Not Important & Urgent'
      case 'Not Important & Not Urgent': return 'Not Important & Not Urgent'
      case 'No Priority': return 'No Priority'
      default: return quadrant
    }
  }

  const entries = Object.entries(quadrantCounts)
  const total = tasks.length

  if (entries.length === 0) return null

  return (
    <div>
      <h4 className="text-xs font-medium text-purple-700 mb-2">Priority Distribution</h4>
      <div className="flex items-center gap-3">
        {/* Simple visual bars */}
        <div className="flex-1">
          <div className="flex h-3 bg-gray-100 rounded-full overflow-hidden">
            {entries.map(([quadrant, count]) => {
              const percentage = (count / total) * 100
              return (
                <div
                  key={quadrant}
                  className="h-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: quadrantColors[quadrant] || '#9333ea'
                  }}
                  title={`${getQuadrantLabel(quadrant)}: ${count} tasks (${percentage.toFixed(1)}%)`}
                />
              )
            })}
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono">{total}</div>
      </div>
      {/* Legend - each priority on its own line */}
      <div className="mt-2 space-y-1">
        {entries.map(([quadrant, count]) => (
          <div key={quadrant} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: quadrantColors[quadrant] || '#9333ea' }}
            />
            <span className="text-xs text-gray-600 flex-1" title={quadrant}>
              {getQuadrantLabel(quadrant)}
            </span>
            <span className="text-xs text-gray-400 font-medium">({count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

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
}

interface TaskFormData {
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
  remind_before: number
  plan: string[]
  priority_quadrant: string
  note: string
}

interface PlanOption {
  id: string
  title: string
}

interface TaskFormPanelProps {
  isOpen: boolean
  onClose: () => void
  task?: TaskRecord | null
  onSave: (task: TaskFormData) => void
  statusOptions: string[]
  priorityOptions: string[]
  planOptions: PlanOption[]
  allTasks: TaskRecord[]
}

function TaskFormPanel({ isOpen, onClose, task, onSave, statusOptions, priorityOptions, planOptions, allTasks }: TaskFormPanelProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    status: '',
    start_date: '',
    end_date: '',
    all_day: false,
    remind_before: 15,
    plan: [],
    priority_quadrant: '',
    note: ''
  })
  
  const [conflictingTasks, setConflictingTasks] = useState<TaskRecord[]>([])


  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        status: task.status || '',
        start_date: convertFromUTCForDisplay(task.start_date || ''),
        end_date: convertFromUTCForDisplay(task.end_date || ''),
        all_day: task.all_day || false,
        remind_before: task.remind_before || 15,
        plan: task.plan || [],
        priority_quadrant: task.priority_quadrant || '',
        note: task.note || '',
      })
    } else {
      // When creating a new task, use current time as default
      const defaultStart = getDefaultDateTime()
      const defaultEnd = new Date(Date.now() + 60 * 60 * 1000) // 1 hour later
      const defaultEndStr = defaultEnd.getFullYear() + '-' +
                            String(defaultEnd.getMonth() + 1).padStart(2, '0') + '-' +
                            String(defaultEnd.getDate()).padStart(2, '0') + 'T' +
                            String(defaultEnd.getHours()).padStart(2, '0') + ':' +
                            String(defaultEnd.getMinutes()).padStart(2, '0')
      
      setFormData({
        title: '',
        status: '',
        start_date: defaultStart,
        end_date: defaultEndStr,
        all_day: false,
        remind_before: 15,
        plan: [],
        priority_quadrant: '',
        note: '',
      })
    }
  }, [task, isOpen])



  // Detect time conflicts when start_date or end_date changes
  useEffect(() => {
    if (formData.start_date && formData.end_date && allTasks.length > 0) {
      const conflicts = detectTimeConflicts(
        formData.start_date,
        formData.start_date,
        formData.end_date,
        allTasks,
        task?.id
      )
      setConflictingTasks(conflicts)
    } else {
      setConflictingTasks([])
    }
  }, [formData.start_date, formData.end_date, allTasks, task?.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Transparent click area, click to close */}
      <div 
        className="fixed top-0 left-0 h-full z-40 md:block hidden"
        style={{ width: 'calc(100vw - 384px)' }}
        onClick={onClose}
      ></div>
      
      {/* Mobile full screen overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      ></div>
      
      {/* Form panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 md:border-l border-purple-200 flex flex-col">
      <div className="p-4 border-b border-purple-200 flex items-center justify-between">
        <h4 className="text-lg font-semibold text-purple-900">
          {task ? 'Edit Task' : 'New Task'}
        </h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
        >
          ×
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Related Plan *</label>
          <select
            value={formData.plan[0] || ''}
            onChange={(e) => {
              const planId = e.target.value
              setFormData(prev => ({ 
                ...prev, 
                plan: planId ? [planId] : [] 
              }))
              
              // Find and set budget information for selected Plan
              if (planId) {
                const selectedPlan = planOptions.find(p => p.id === planId)
              } else {
                setSelectedPlanBudget(null)
                setRemainingTime(null)
              }
            }}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Select a Plan First</option>
            {planOptions.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.title}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Each task must belong to a plan</p>
          
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Status</option>
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Priority Quadrant</label>
            <select
              value={formData.priority_quadrant}
              onChange={(e) => setFormData(prev => ({ ...prev, priority_quadrant: e.target.value }))}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Quadrant</option>
              {priorityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">Time Settings</label>
            
            {/* Time input */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-purple-600 w-12 flex-shrink-0">Start:</label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => {
                    const newStartDate = e.target.value
                    setFormData(prev => {
                      const updates = { ...prev, start_date: newStartDate }
                      
                      // If start time is set and end time is empty or earlier than start time, automatically set end time
                      if (newStartDate && (!prev.end_date || prev.end_date <= newStartDate)) {
                        const startDate = new Date(newStartDate)
                        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // Default 1 hour later
                        const endDateStr = endDate.getFullYear() + '-' +
                                          String(endDate.getMonth() + 1).padStart(2, '0') + '-' +
                                          String(endDate.getDate()).padStart(2, '0') + 'T' +
                                          String(endDate.getHours()).padStart(2, '0') + ':' +
                                          String(endDate.getMinutes()).padStart(2, '0')
                        updates.end_date = endDateStr
                      }
                      
                      
                      return updates
                    })
                  }}
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-purple-600 w-12 flex-shrink-0">End:</label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => {
                    const newEndDate = e.target.value
                    setFormData(prev => {
                      const updates = { ...prev, end_date: newEndDate }
                      
                      
                      return updates
                    })
                  }}
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Reminder (min)</label>
          <input
            type="number"
            min="0"
            value={formData.remind_before}
            onChange={(e) => setFormData(prev => ({ ...prev, remind_before: parseInt(e.target.value) || 15 }))}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>


        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.all_day}
              onChange={(e) => setFormData(prev => ({ ...prev, all_day: e.target.checked }))}
              className="mr-2 rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-purple-700">All Day Task</span>
          </label>
        </div>


        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Note</label>
          <textarea
            rows={3}
            value={formData.note}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Time Conflict Warning */}
        {conflictingTasks.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h4 className="text-sm font-semibold text-red-800 mb-2">Time Conflict Warning</h4>
            <p className="text-sm text-red-700 mb-2">This task overlaps with:</p>
            <ul className="text-sm text-red-700 space-y-1 mb-3">
              {conflictingTasks.map((conflictTask) => (
                <li key={conflictTask.id} className="flex items-center">
                  <span className="mr-2">-</span>
                  <span className="font-medium">{conflictTask.title}</span>
                  <span className="ml-2 text-red-600">
                    ({formatTimeRange(conflictTask.start_date, conflictTask.end_date)})
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-red-600">
              You can still save this task, but please review your schedule.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
            title="Cancel and close form"
          >
            <span>✕</span>
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
            title={task ? "Update this task" : "Create new task"}
          >
            <span>{task ? '📝' : '✨'}</span>
            <span>{task ? 'Update' : 'Create'}</span>
          </button>
        </div>
      </form>
      </div>
    </>
  )
}

// Format time display, avoid timezone conversion, use 24-hour format
function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return ''
  
  try {
    // If input is datetime-local format, use directly
    if (dateTimeString.includes('T') && !dateTimeString.includes('Z')) {
      const [datePart, timePart] = dateTimeString.split('T')
      const [year, month, day] = datePart.split('-')
      const [hour, minute] = timePart.split(':')
      
      return `${month}/${day} ${hour}:${minute}`
    }
    
    // Otherwise handle as ISO string
    const date = new Date(dateTimeString)
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric' 
    }) + ' ' + date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch (error) {
    return dateTimeString
  }
}

// Format time range display
function formatTimeRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return ''
  
  const start = startDate ? formatDateTime(startDate) : ''
  const end = endDate ? formatDateTime(endDate) : ''
  
  if (start && end) {
    // If same day, only show time range
    const startDay = start.split(' ')[0]
    const endDay = end.split(' ')[0]
    const startTime = start.split(' ')[1]
    const endTime = end.split(' ')[1]
    
    if (startDay === endDay) {
      return `${startDay} ${startTime}-${endTime}`
    } else {
      return `${start} - ${end}`
    }
  }
  
  return start || end
}

// Check if task is currently running
function isTaskRunning(task: TaskRecord): boolean {
  return !!(task.actual_start && !task.actual_end)
}

// Calculate running time (hours)
function calculateElapsedTime(actualStart: string): number {
  if (!actualStart) return 0
  const start = new Date(actualStart)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  return Math.max(0, diffMs / (1000 * 60 * 60)) // 转换为小时
}

// Calculate total elapsed time including accumulated time
function calculateTotalElapsedTime(task: TaskRecord): number {
  const accumulatedTime = task.actual_time || 0
  if (task.timer_status === 'running' && task.actual_start) {
    const currentSessionTime = calculateElapsedTime(task.actual_start)
    return accumulatedTime + currentSessionTime
  }
  return accumulatedTime
}

// Check if two time ranges overlap
function isTimeOverlapping(start1: string, end1: string, start2: string, end2: string): boolean {
  if (!start1 || !end1 || !start2 || !end2) return false
  
  const startTime1 = new Date(start1).getTime()
  const endTime1 = new Date(end1).getTime()
  const startTime2 = new Date(start2).getTime()
  const endTime2 = new Date(end2).getTime()
  
  // Check if ranges overlap: start1 < end2 && start2 < end1
  return startTime1 < endTime2 && startTime2 < endTime1
}

// Detect time conflicts with existing tasks on the same day
function detectTimeConflicts(
  taskDate: string, 
  startTime: string, 
  endTime: string, 
  allTasks: TaskRecord[], 
  excludeTaskId?: string
): TaskRecord[] {
  if (!taskDate || !startTime || !endTime) return []
  
  const newTaskLocalDate = new Date(taskDate)
  const newTaskDateStr = newTaskLocalDate.toLocaleDateString('en-CA')
  
  return allTasks.filter(task => {
    if (task.id === excludeTaskId) return false // Exclude current editing task
    if (!task.start_date || !task.end_date) return false
    
    // Check if on the same date using local timezone
    const taskLocalDate = new Date(task.start_date)
    const taskDateStr = taskLocalDate.toLocaleDateString('en-CA')
    if (taskDateStr !== newTaskDateStr) return false
    
    // Check time overlap
    return isTimeOverlapping(startTime, endTime, task.start_date, task.end_date)
  })
}

// Check if a task has time conflicts with other tasks
function hasTimeConflicts(task: TaskRecord, allTasks: TaskRecord[]): boolean {
  if (!task.start_date || !task.end_date) return false
  
  const conflicts = detectTimeConflicts(
    task.start_date,
    task.start_date,
    task.end_date,
    allTasks,
    task.id
  )
  
  return conflicts.length > 0
}

// 时间显示组件
function TimeDisplay({ task }: { task: TaskRecord }) {
  const [totalElapsedTime, setTotalElapsedTime] = useState(0)
  
  useEffect(() => {
    const updateElapsed = () => {
      setTotalElapsedTime(calculateTotalElapsedTime(task))
    }
    
    updateElapsed()
    
    // 只有在运行状态时才需要定时更新
    if (task.timer_status === 'running') {
      const interval = setInterval(updateElapsed, 1000) // 每秒更新
      return () => clearInterval(interval)
    }
  }, [task.actual_start, task.actual_end, task.actual_time, task.timer_status])
  
  // 显示时间信息：运行中、暂停中或已完成且有时间记录
  if (task.timer_status === 'running') {
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-green-600 font-medium">Running</span>
          <span className="font-medium text-purple-700">
            {totalElapsedTime.toFixed(1)}h
          </span>
        </div>
      </div>
    )
  } else if (task.timer_status === 'paused') {
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-orange-600 font-medium">Paused</span>
          <span className="font-medium text-purple-700">
            {totalElapsedTime.toFixed(1)}h
          </span>
        </div>
      </div>
    )
  } else if (task.timer_status === 'completed' || task.actual_time > 0) {
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">
            {task.status === 'Completed' ? 'Time' : 'Completed'}
          </span>
          <span className="font-medium text-purple-700">
            {totalElapsedTime.toFixed(1)}h
          </span>
        </div>
      </div>
    )
  }
  
  return null
}

// 将datetime-local格式转换为显示格式
function convertToDateTimeLocal(isoString: string): string {
  if (!isoString) return ''
  
  try {
    const date = new Date(isoString)
    // Format as YYYY-MM-DDTHH:MM
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0') + 'T' +
           String(date.getHours()).padStart(2, '0') + ':' +
           String(date.getMinutes()).padStart(2, '0')
  } catch (error) {
    return isoString
  }
}

// 将datetime-local格式转换为UTC ISO字符串（用于Notion API）
function convertToUTCForNotion(localDateTimeString: string): string {
  if (!localDateTimeString) return ''
  
  try {
    // 将本地时间字符串转换为Date对象
    const localDate = new Date(localDateTimeString)
    // 转换为UTC ISO字符串
    return localDate.toISOString()
  } catch (error) {
    console.error('Error converting to UTC:', error)
    return localDateTimeString
  }
}

// 从UTC ISO字符串转换为本地时间字符串（用于表单显示）
function convertFromUTCForDisplay(utcISOString: string): string {
  if (!utcISOString) return ''
  
  try {
    const date = new Date(utcISOString)
    // 转换为本地时间的datetime-local格式
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0') + 'T' +
           String(date.getHours()).padStart(2, '0') + ':' +
           String(date.getMinutes()).padStart(2, '0')
  } catch (error) {
    console.error('Error converting from UTC:', error)
    return utcISOString
  }
}

// 获取当前日期时间的默认值
function getDefaultDateTime(): string {
  const now = new Date()
  return now.getFullYear() + '-' +
         String(now.getMonth() + 1).padStart(2, '0') + '-' +
         String(now.getDate()).padStart(2, '0') + 'T' +
         String(now.getHours()).padStart(2, '0') + ':' +
         String(now.getMinutes()).padStart(2, '0')
}

export default function TaskPanel() {
  const [data, setData] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formPanelOpen, setFormPanelOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('all')
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [priorityOptions, setPriorityOptions] = useState<string[]>([])
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [addingToCalendar, setAddingToCalendar] = useState<string | null>(null)
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all')
  
  // 计时器相关状态
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())
  const [updatingTimer, setUpdatingTimer] = useState<string | null>(null)
  
  // 任务完成反馈浮窗状态
  const [completionModal, setCompletionModal] = useState<{
    isOpen: boolean;
    task: TaskRecord | null;
  }>({ isOpen: false, task: null })
  
  // 日历相关状态
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'))
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const { isAuthenticated, authenticate, addToCalendar } = useOutlookAuth()

  // Function to filter tasks by plan
  const filterTasksByPlan = (tasks: TaskRecord[]) => {
    if (selectedPlanFilter === 'all') return tasks
    return tasks.filter(task => {
      if (!task.plan || task.plan.length === 0) return selectedPlanFilter === 'none'
      return task.plan.includes(selectedPlanFilter)
    })
  }

  // 获取本周任务的函数
  const getThisWeekTasks = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // 获取本周一（周的开始）
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    
    // 获取本周日（周的结束）
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    const weekTasks = data.filter(task => {
      if (!task.start_date) return false
      // 使用本地时区的日期进行比较
      const taskLocalDate = new Date(task.start_date)
      const taskDateOnly = new Date(taskLocalDate.getFullYear(), taskLocalDate.getMonth(), taskLocalDate.getDate())
      return taskDateOnly >= monday && taskDateOnly <= sunday
    }).sort((a, b) => {
      const dateA = new Date(a.start_date)
      const dateB = new Date(b.start_date)
      return dateA.getTime() - dateB.getTime()
    })
    
    return filterTasksByPlan(weekTasks)
  }

  const thisWeekTasks = getThisWeekTasks()

  // 获取本月任务的函数
  const getThisMonthTasks = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    
    // 获取本月第一天
    const firstDayOfMonth = new Date(year, month, 1)
    
    // 获取本月最后一天
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    const monthTasks = data.filter(task => {
      if (!task.start_date) return false
      // 使用本地时区的日期进行比较
      const taskLocalDate = new Date(task.start_date)
      const taskDateOnly = new Date(taskLocalDate.getFullYear(), taskLocalDate.getMonth(), taskLocalDate.getDate())
      return taskDateOnly >= firstDayOfMonth && taskDateOnly <= lastDayOfMonth
    }).sort((a, b) => {
      const dateA = new Date(a.start_date)
      const dateB = new Date(b.start_date)
      return dateA.getTime() - dateB.getTime()
    })
    
    return filterTasksByPlan(monthTasks)
  }

  const thisMonthTasks = getThisMonthTasks()

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Not Started': return '⭕'
      case 'In Progress': return '🔄'
      case 'Completed': return '✅'
      case 'On Hold': return '⏸️'
      case 'Cancelled': return '❌'
      default: return '📋'
    }
  }

  // 获取优先级颜色（与图表一致的颜色方案）
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '重要且紧急': return 'bg-red-100 text-red-800 border-red-300'
      case '重要不紧急': return 'bg-orange-100 text-orange-800 border-orange-300'
      case '不重要但紧急': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case '不重要不紧急': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'Important & Urgent': return 'bg-red-100 text-red-800 border-red-300'
      case 'Important & Not Urgent': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'Not Important & Urgent': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Not Important & Not Urgent': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-purple-100 text-purple-800 border-purple-200'
    }
  }

  // 格式化日期时间，包含星期几
  const formatDateTimeWithWeekday = (dateTimeString: string) => {
    if (!dateTimeString) return ''
    
    const date = new Date(dateTimeString)
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[date.getDay()]
    
    const dateStr = date.toLocaleDateString('zh-CN', { 
      month: 'numeric', 
      day: 'numeric' 
    })
    
    const timeStr = date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
    
    return `${dateStr} 周${weekday} ${timeStr}`
  }

  // Format time range display
  const formatTimeRange = (startDate: string, endDate?: string) => {
    if (!startDate) return ''
    
    const start = new Date(startDate)
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[start.getDay()]
    
    const dateStr = start.toLocaleDateString('zh-CN', { 
      month: 'numeric', 
      day: 'numeric' 
    })
    
    const startTime = start.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
    
    if (!endDate) {
      return `${dateStr} 周${weekday} ${startTime}`
    }
    
    const end = new Date(endDate)
    const endTime = end.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
    
    // 检查是否同一天
    const isSameDay = start.toDateString() === end.toDateString()
    
    if (isSameDay) {
      return `${dateStr} 周${weekday} ${startTime} - ${endTime}`
    } else {
      const endDateStr = end.toLocaleDateString('zh-CN', { 
        month: 'numeric', 
        day: 'numeric' 
      })
      const endWeekday = weekdays[end.getDay()]
      return `${dateStr} 周${weekday} ${startTime} - ${endDateStr} 周${endWeekday} ${endTime}`
    }
  }

  // 格式化日期和星期（不含时间）
  const formatDateWithWeekday = (dateTimeString: string) => {
    if (!dateTimeString) return ''
    
    const date = new Date(dateTimeString)
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[date.getDay()]
    
    const dateStr = date.toLocaleDateString('zh-CN', { 
      month: 'numeric', 
      day: 'numeric' 
    })
    
    return `${dateStr} 周${weekday}`
  }

  // 格式化时间范围（仅时间部分）
  const formatTimeOnly = (startDate: string, endDate?: string) => {
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
    
    // 检查是否同一天
    const isSameDay = start.toDateString() === end.toDateString()
    
    if (isSameDay) {
      return `${startTime} - ${endTime}`
    } else {
      // 跨天的情况，需要显示完整信息
      return formatTimeRange(startDate, endDate)
    }
  }

  // 日历辅助函数
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // 添加上个月的日期填充
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: prevDate.toLocaleDateString('en-CA')
      })
    }
    
    // 添加当前月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        dateString: currentDate.toLocaleDateString('en-CA')
      })
    }
    
    // 添加下个月的日期填充
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: nextDate.toLocaleDateString('en-CA')
      })
    }
    
    return days
  }

  const isToday = (dateString: string) => {
    const today = new Date().toLocaleDateString('en-CA')
    return dateString === today
  }

  const getTasksForDate = (dateString: string) => {
    const dateTasks = data.filter(task => {
      if (!task.start_date && !task.end_date) return false
      
      const taskDate = task.start_date || task.end_date
      if (!taskDate) return false
      
      // 转换UTC时间到本地时区获取正确的日期
      const taskLocalDate = new Date(taskDate)
      const taskDateString = taskLocalDate.toLocaleDateString('en-CA') // 'en-CA' gives YYYY-MM-DD format
      return taskDateString === dateString
    }).sort((a, b) => {
      // 首先按status排序：completed任务排在最后
      const aCompleted = a.status === 'Completed'
      const bCompleted = b.status === 'Completed'
      
      if (aCompleted && !bCompleted) return 1  // a是completed，排在后面
      if (!aCompleted && bCompleted) return -1 // b是completed，a排在前面
      
      // 如果两个任务的completed状态相同，再按时间排序
      const aTime = a.start_date || a.end_date
      const bTime = b.start_date || b.end_date
      if (!aTime || !bTime) return 0
      return aTime.localeCompare(bTime)
    })
    
    return filterTasksByPlan(dateTasks)
  }

  const getTaskCountForDate = (dateString: string) => {
    return getTasksForDate(dateString).length
  }

  const getTimeGroup = (task: TaskRecord) => {
    const timeStr = task.start_date || task.end_date
    if (!timeStr) return '其他'
    
    const hour = new Date(timeStr).getHours()
    if (hour >= 6 && hour < 12) return '上午'
    if (hour >= 12 && hour < 18) return '下午'
    if (hour >= 18 && hour < 24) return '晚上'
    return '深夜'
  }

  const getTimeGroupIcon = (timeGroup: string) => {
    switch (timeGroup) {
      case '上午': return '🌅'
      case '下午': return '☀️'
      case '晚上': return '🌙'
      case '深夜': return '🌃'
      default: return '⏰'
    }
  }

  const getGroupedTasks = (tasks: TaskRecord[]) => {
    const groups = {
      '上午': [] as TaskRecord[],
      '下午': [] as TaskRecord[],
      '晚上': [] as TaskRecord[],
      '深夜': [] as TaskRecord[],
      '其他': [] as TaskRecord[]
    }
    
    tasks.forEach(task => {
      const group = getTimeGroup(task)
      groups[group].push(task)
    })
    
    return groups
  }

  useEffect(() => {
    fetchTasks()
    fetchSchema()
    fetchPlanOptions()
  }, [])
  
  // 更新正在运行的任务状态
  useEffect(() => {
    const running = new Set<string>()
    data.forEach(task => {
      if (isTaskRunning(task)) {
        running.add(task.id)
      }
    })
    setRunningTasks(running)
  }, [data])

  const fetchSchema = async () => {
    try {
      const response = await fetch('/api/tasks?action=schema')
      if (response.ok) {
        const result = await response.json()
        setStatusOptions(result.schema?.statusOptions || [])
        setPriorityOptions(result.schema?.priorityOptions || [])
      }
    } catch (err) {
      console.error('Failed to fetch schema:', err)
    }
  }

  const fetchPlanOptions = async () => {
    try {
      const response = await fetch('/api/plan')
      if (response.ok) {
        const result = await response.json()
        const plans = result.data?.map((p: any) => ({
          id: p.id,
          title: p.objective || 'Untitled Plan'
        })) || []
        setPlanOptions(plans)
      }
    } catch (err) {
      console.error('Failed to fetch plan options:', err)
    }
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/tasks')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setData(result.data || [])
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchTasks(), fetchPlanOptions()])
    setRefreshing(false)
  }

  const handleSaveTask = async (taskData: TaskFormData) => {
    try {
      // 转换时间为UTC格式，用于Notion API
      const utcTaskData = {
        ...taskData,
        start_date: taskData.start_date ? convertToUTCForNotion(taskData.start_date) : '',
        end_date: taskData.end_date ? convertToUTCForNotion(taskData.end_date) : ''
      }
      
      // 如果是编辑模式，添加任务ID
      const dataToSend = editingTask 
        ? { ...utcTaskData, id: editingTask.id }
        : utcTaskData
        
      console.log('Saving task with UTC times:', dataToSend)
        
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        throw new Error('Failed to save task')
      }

      setFormPanelOpen(false)
      setEditingTask(null)
      fetchTasks()
    } catch (err) {
      console.error('Failed to save task:', err)
      setError(err instanceof Error ? err.message : 'Failed to save task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      fetchTasks()
    } catch (err) {
      console.error('Failed to delete task:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const handleAddToOutlook = async (task: TaskRecord) => {
    try {
      setAddingToCalendar(task.id)
      
      if (!isAuthenticated) {
        await authenticate()
        return
      }

      const success = await addToCalendar(task)
      
      if (success) {
        setError(null)
        alert('Task successfully added to Outlook Calendar!')
      }
    } catch (err) {
      console.error('Failed to add to Outlook:', err)
      setError(err instanceof Error ? err.message : 'Failed to add to Outlook Calendar')
    } finally {
      setAddingToCalendar(null)
    }
  }

  const handleStartStopTimer = async (task: TaskRecord) => {
    try {
      setUpdatingTimer(task.id)
      
      const isRunning = isTaskRunning(task)
      const now = new Date().toISOString() // 已经是UTC格式
      
      if (isRunning) {
        // 任务结束 - 显示反馈浮窗
        setUpdatingTimer(null)
        const taskWithEndTime = {
          ...task,
          actual_end: now,
          timer_status: 'completed'
        }
        setCompletionModal({ isOpen: true, task: taskWithEndTime })
        return
      }
      
      // 任务开始 - 直接更新为"In Progress"
      const updateData = {
        id: task.id,
        title: task.title,
        status: 'In Progress', // 开始时设为"In Progress"
        start_date: task.start_date, // 保持原有UTC格式，不重新转换
        end_date: task.end_date, // 保持原有UTC格式，不重新转换
        all_day: task.all_day,
        remind_before: task.remind_before,
        plan: task.plan,
        priority_quadrant: task.priority_quadrant,
        note: task.note,
        actual_start: now, // UTC格式的当前时间
        actual_end: undefined, // 清除结束时间
        timer_status: 'running'
      }
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update timer')
      }
      
      // 更新本地状态
      setRunningTasks(prev => new Set(prev).add(task.id))
      
      fetchTasks() // 刷新任务列表
      
    } catch (err) {
      console.error('Failed to update timer:', err)
      setError(err instanceof Error ? err.message : 'Failed to update timer')
    } finally {
      setUpdatingTimer(null)
    }
  }

  // 处理暂停/继续计时
  const handlePauseContinueTimer = async (task: TaskRecord) => {
    try {
      setUpdatingTimer(task.id)
      
      const isRunning = task.timer_status === 'running'
      const now = new Date().toISOString()
      
      if (isRunning) {
        // 暂停：累加当前会话时间到actual_time
        const sessionTime = task.actual_start ? calculateElapsedTime(task.actual_start) : 0
        const newActualTime = (task.actual_time || 0) + sessionTime
        
        const updateData = {
          id: task.id,
          title: task.title,
          status: task.status,
          start_date: task.start_date,
          end_date: task.end_date,
          all_day: task.all_day,
          remind_before: task.remind_before,
          plan: task.plan,
          priority_quadrant: task.priority_quadrant,
          note: task.note,
          actual_start: null, // 清除当前会话开始时间
          actual_end: task.actual_end,
          actual_time: newActualTime,
          timer_status: 'paused'
        }
        
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
        
        if (!response.ok) throw new Error('Failed to pause task')
        
        // 刷新数据
        await fetchData()
      } else {
        // 继续：重新开始计时
        const updateData = {
          id: task.id,
          title: task.title,
          status: task.status,
          start_date: task.start_date,
          end_date: task.end_date,
          all_day: task.all_day,
          remind_before: task.remind_before,
          plan: task.plan,
          priority_quadrant: task.priority_quadrant,
          note: task.note,
          actual_start: now,
          actual_end: task.actual_end,
          actual_time: task.actual_time,
          timer_status: 'running'
        }
        
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
        
        if (!response.ok) throw new Error('Failed to continue task')
        
        // 刷新数据
        await fetchData()
      }
    } catch (error) {
      console.error('Error handling pause/continue timer:', error)
      alert('Failed to update timer. Please try again.')
    } finally {
      setUpdatingTimer(null)
    }
  }

  // 处理任务完成反馈提交
  const handleTaskCompletionSubmit = async (qualityRating: number, nextStep: string, isPlanCritical: boolean) => {
    if (!completionModal.task) return

    try {
      const updateData = {
        id: completionModal.task.id,
        title: completionModal.task.title,
        status: 'Completed', // 设为已完成
        start_date: completionModal.task.start_date,
        end_date: completionModal.task.end_date,
        all_day: completionModal.task.all_day,
        remind_before: completionModal.task.remind_before,
        plan: completionModal.task.plan,
        priority_quadrant: completionModal.task.priority_quadrant,
        note: completionModal.task.note,
        actual_start: completionModal.task.actual_start,
        actual_end: completionModal.task.actual_end, // 使用浮窗打开时设置的结束时间
        quality_rating: qualityRating,
        next: nextStep,
        is_plan_critical: isPlanCritical,
        timer_status: 'completed'
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Failed to complete task')
      }

      // 更新本地状态
      setRunningTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(completionModal.task!.id)
        return newSet
      })

      fetchTasks() // 刷新任务列表

    } catch (error) {
      console.error('Failed to complete task:', error)
      throw error // 重新抛出错误，让浮窗处理
    }
  }

  const handleAddToOutlookWeb = (task: TaskRecord) => {
    const startDate = task.start_date || new Date().toISOString()
    const endDate = task.end_date || new Date(Date.now() + 60 * 60 * 1000).toISOString()
    
    const eventBody = [
      task.note,
      task.priority_quadrant ? `Priority: ${task.priority_quadrant}` : '',
      task.status ? `Status: ${task.status}` : '',
    ].filter(Boolean).join('\n\n')

    const params = new URLSearchParams({
      subject: task.title,
      body: eventBody,
      startdt: startDate,
      enddt: endDate,
      allday: task.all_day ? 'true' : 'false'
    })

    window.open(`https://outlook.live.com/calendar/0/deeplink/compose?${params}`, '_blank')
  }

  
  const getPlanTitle = (planIds: string[]) => {
    if (!planIds || planIds.length === 0) return null
    const plan = planOptions.find(p => p.id === planIds[0])
    return plan?.title || 'Unknown Plan'
  }

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case '重要且紧急': return 'bg-red-100 text-red-800'
      case '重要不紧急': return 'bg-orange-100 text-orange-800'
      case '不重要但紧急': return 'bg-yellow-100 text-yellow-800'
      case '不重要不紧急': return 'bg-gray-100 text-gray-800'
      case 'Important & Urgent': return 'bg-red-100 text-red-800'
      case 'Important & Not Urgent': return 'bg-orange-100 text-orange-800'
      case 'Not Important & Urgent': return 'bg-yellow-100 text-yellow-800'
      case 'Not Important & Not Urgent': return 'bg-gray-100 text-gray-800'
      default: return 'bg-purple-100 text-purple-800'
    }
  }

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    // 检查是否是Notion配置相关的错误
    const isConfigError = error.toLowerCase().includes('notion') || 
                         error.toLowerCase().includes('configured') ||
                         error.toLowerCase().includes('configuration')
    
    if (isConfigError) {
      return (
        <div className="w-full py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-500 text-xl">⚙️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Notion Configuration Required</h3>
                <p className="mt-2 text-sm text-yellow-700">
                  To use the task management features, you need to configure your Notion integration. 
                  Click the settings button (⚙️) in the top-right corner to set up your Notion API key and database IDs.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => {
                      // 触发配置模态框打开
                      const configButton = document.querySelector('[title="Notion Configuration"]') as HTMLButtonElement
                      if (configButton) {
                        configButton.click()
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    <span>⚙️</span>
                    <span>Configure Notion</span>
                  </button>
                  <button
                    onClick={fetchTasks}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-all duration-200"
                    title="Retry loading tasks"
                  >
                    <span>🔄</span>
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    // 其他错误显示通用错误信息
    return (
      <div className="w-full py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-500 text-xl">!</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Failed to load tasks</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchTasks}
                className="flex items-center gap-2 mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                title="Retry loading tasks"
              >
                <span>🔄</span>
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const calendarDays = getDaysInMonth(currentMonth)
  const selectedDateTasks = getTasksForDate(selectedDate)
  const groupedTasks = getGroupedTasks(selectedDateTasks)

  return (
    <div className="w-full py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-purple-900">Task Management</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600">Outlook Calendar:</span>
            <span className={`text-xs px-2 py-1 rounded ${
              isAuthenticated 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isAuthenticated ? '✓ Connected' : '○ Not Connected'}
            </span>
            {!isAuthenticated && (
              <button
                onClick={authenticate}
                className="text-xs text-purple-600 hover:text-purple-800 underline transition-all duration-200 transform hover:scale-105 active:scale-95"
                title="Connect to Microsoft Outlook"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 移动端顶部：日历、今日任务和New Task按钮 */}
      <div className="md:hidden mb-6">
        {/* New Task按钮 */}
        <div className="flex justify-start mb-4">
          <button
            onClick={() => {
              setEditingTask(null)
              setFormPanelOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
          >
            <span>+</span>
            <span className="whitespace-nowrap">New Task</span>
          </button>
        </div>

        {/* Refresh按钮与筛选框 - 移动端 */}
        <div className="flex flex-col sm:flex-row justify-start items-stretch sm:items-center gap-3 mb-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-md hover:bg-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            <div className={`${refreshing ? 'animate-spin' : ''}`}>
              {refreshing ? '⟳' : '↻'}
            </div>
            <span className="whitespace-nowrap">Refresh</span>
          </button>
          
          {/* Plan筛选框 */}
          <select
            value={selectedPlanFilter}
            onChange={(e) => setSelectedPlanFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-purple-200 rounded-md text-sm text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-300 transition-all duration-200 flex-1 sm:flex-initial"
          >
            <option value="all">All Plans</option>
            <option value="none">No Plan</option>
            {planOptions.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.title}
              </option>
            ))}
          </select>
        </div>

        {/* 移动端紧凑日历 */}
        <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-3 mb-6">
          {/* 日历头部 */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
            >
              <span className="text-purple-600 text-lg">‹</span>
            </button>
            <h2 className="text-base font-semibold text-purple-900">
              {currentMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
            </h2>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
            >
              <span className="text-purple-600 text-lg">›</span>
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
              <div key={index} className="text-center text-xs font-medium text-purple-700 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* 日历天数 - 移动端紧凑版 */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((day, index) => {
              const taskCount = getTaskCountForDate(day.dateString)
              const isSelected = selectedDate === day.dateString
              const isTodayDate = isToday(day.dateString)
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day.dateString)}
                  disabled={!day.inCurrentMonth}
                  className={`
                    relative p-1.5 text-xs font-medium transition-all duration-200 rounded
                    ${!day.inCurrentMonth 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : isSelected 
                        ? 'bg-purple-600 text-white' 
                        : isTodayDate 
                          ? 'bg-purple-100 text-purple-800 font-bold border border-purple-300' 
                          : taskCount > 0 
                            ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' 
                            : 'text-gray-700 hover:bg-purple-50'
                    }
                  `}
                >
                  <span className="block">{day.date.getDate()}</span>
                  {taskCount > 0 && !isSelected && (
                    <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full text-xs flex items-center justify-center ${
                      isTodayDate ? 'bg-purple-600 text-white' : 'bg-purple-400 text-white'
                    }`}>
                      {taskCount > 9 ? '9+' : taskCount}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
        {/* 今日任务 */}
        <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900">
              {isToday(selectedDate) ? '今日任务' : '选定日期任务'}
            </h3>
            <span className="text-sm text-gray-500">
              {selectedDateTasks.length} 个任务
            </span>
          </div>

          {selectedDateTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-3xl font-light">📅</div>
              <p className="text-gray-600 mt-2">这一天没有任务</p>
              <button
                onClick={() => {
                  setEditingTask(null)
                  setFormPanelOpen(true)
                }}
                className="mt-2 text-purple-600 hover:text-purple-700 text-sm underline"
              >
                添加任务
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedTasks).map(([timeGroup, tasks]) => 
                tasks.length > 0 && (
                  <div key={timeGroup} className="space-y-2">
                    {/* 时间段标题 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{getTimeGroupIcon(timeGroup)}</span>
                      <span className="text-sm font-semibold text-purple-800">{timeGroup}</span>
                      <div className="flex-1 h-px bg-purple-200"></div>
                      <span className="text-xs text-gray-500">{tasks.length}个</span>
                    </div>
                    
                    {/* 该时间段的任务列表 - 简化移动端显示 */}
                    {tasks.map((task) => {
                      const isRunning = isTaskRunning(task)
                      const hasConflicts = hasTimeConflicts(task, data)
                      
                      return (
                        <div
                          key={task.id}
                          className={`bg-gradient-to-r from-purple-50 to-white rounded-lg border p-4 relative ${
                            hasConflicts ? 'border-l-4 border-red-500 bg-red-50' :
                            isRunning ? 'border-purple-400 bg-purple-50' : 'border-purple-200'
                          }`}
                        >
                          {/* 顶部：标题和时间 */}
                          <div className="mb-3">
                            <h4 
                              className="font-bold text-purple-900 text-base mb-2 line-clamp-2 pr-20 cursor-pointer hover:text-purple-600 hover:underline transition-colors flex items-center gap-1"
                              onClick={() => {
                                // 构建Notion页面URL
                                const notionPageUrl = `https://www.notion.so/${task.id.replace(/-/g, '')}`
                                window.open(notionPageUrl, '_blank')
                              }}
                              title="Click to edit in Notion"
                            >
                              {task.title}
                              <span className="text-xs text-gray-400">🔗</span>
                            </h4>
                            
                            {/* Time Conflict Indicator */}
                            {hasConflicts && (
                              <div className="text-xs text-red-600 mb-2 font-medium">
                                Time Conflict - Please review schedule
                              </div>
                            )}
                            
                            {/* 时间显示 */}
                            <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              isRunning ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white'
                            }`}>
                              {task.start_date && task.end_date ? (
                                formatTimeRange(task.start_date, task.end_date)
                              ) : (task.start_date || task.end_date) ? (
                                formatDateTime(task.start_date || task.end_date).split(' ')[1]
                              ) : (
                                '--:--'
                              )}
                            </div>
                          </div>
                          
                          {/* 中部：标签信息 - 左对齐，简化文案 */}
                          <div className="space-y-2 mb-3">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-medium">
                                {task.status}
                              </span>
                              {task.priority_quadrant && (
                                <span className={`px-2 py-1 rounded border font-medium ${getPriorityColor(task.priority_quadrant)}`}>
                                  {task.priority_quadrant}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* 中部：Note */}
                          {task.note && (
                            <div className="mb-3 pb-3 border-b border-purple-200">
                              <div className="flex items-start gap-2">
                                <span className="text-purple-500 text-xs">📝</span>
                                <p className="text-xs text-purple-700 line-clamp-2 flex-1">{task.note}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* 底部：操作按钮 - 右下角 */}
                          <div className="flex justify-end">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  // 构建Outlook日历添加链接
                                  const subject = encodeURIComponent(task.title || 'Task')
                                  const startDate = task.start_date ? new Date(task.start_date) : new Date()
                                  const endDate = task.end_date ? new Date(task.end_date) : new Date(startDate.getTime() + 60 * 60 * 1000) // 默认1小时
                                  
                                  const formatDate = (date: Date) => {
                                    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
                                  }
                                  
                                  const body = encodeURIComponent(
                                    `Status: ${task.status || 'N/A'}\n` +
                                    `Priority: ${task.priority_quadrant || 'N/A'}\n` +
                                                    `${task.note ? '\nNote: ' + task.note : ''}`
                                  )
                                  
                                  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&startdt=${formatDate(startDate)}&enddt=${formatDate(endDate)}&body=${body}&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent`
                                  
                                  window.open(outlookUrl, '_blank')
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Add to Outlook Calendar"
                              >
                                🌐
                              </button>
                              <button
                                onClick={() => {
                                  setEditingTask(task)
                                  setFormPanelOpen(true)
                                }}
                                className="p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                                title="Edit task"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete task"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* 日历和任务布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧日历 */}
        <div className="lg:col-span-5">
          {/* Refresh按钮与筛选框 */}
          <div className="flex flex-col sm:flex-row justify-start items-stretch sm:items-center gap-3 mb-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-md hover:bg-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              <div className={`${refreshing ? 'animate-spin' : ''}`}>
                {refreshing ? '⟳' : '↻'}
              </div>
              <span className="whitespace-nowrap">Refresh</span>
            </button>
            
            {/* Plan筛选框 */}
            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-purple-200 rounded-md text-sm text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-300 transition-all duration-200 flex-1 sm:flex-initial"
            >
              <option value="all">All Plans</option>
              <option value="none">No Plan</option>
              {planOptions.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
              ))}
            </select>
          </div>
          {/* Web端日历 - 保持原样 */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm border border-purple-200 p-6">
            {/* 日历头部 */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              >
                <span className="text-purple-600">‹</span>
              </button>
              <h2 className="text-lg font-semibold text-purple-900">
                {currentMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              >
                <span className="text-purple-600">›</span>
              </button>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* 日历天数 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const taskCount = getTaskCountForDate(day.dateString)
                const isSelected = selectedDate === day.dateString
                const isTodayDate = isToday(day.dateString)
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.dateString)}
                    className={`
                      relative p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 min-h-[3rem]
                      ${day.isCurrentMonth 
                        ? 'text-gray-900 hover:bg-purple-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                      }
                      ${isSelected 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : ''
                      }
                      ${isTodayDate && !isSelected 
                        ? 'bg-purple-100 text-purple-700 font-semibold' 
                        : ''
                      }
                    `}
                  >
                    {day.date.getDate()}
                    {taskCount > 0 && (
                      <div className={`
                        absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center
                        ${isSelected ? 'bg-white text-purple-600' : 'bg-purple-600 text-white'}
                      `}>
                        {taskCount}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          
          {/* Task Analytics - 共享组件 */}
          <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-3 md:p-6 mt-6">
            <p className="text-sm text-gray-600 mb-3">
              Selected: <span className="font-medium text-purple-700">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'No date selected'}
              </span>
              <span className="text-xs text-gray-500 ml-2">({selectedDateTasks.length} tasks)</span>
            </p>
            
            {selectedDateTasks.length > 0 && (
              <div className="space-y-3">
                {/* Progress Distribution */}
                <TaskProgressChart tasks={selectedDateTasks} />
                
                {/* Plans Distribution */}
                <TaskPlanChart tasks={selectedDateTasks} planOptions={planOptions} />
                
                {/* Priority Quadrant Distribution */}
                <TaskQuadrantChart tasks={selectedDateTasks} />
              </div>
            )}
          </div>
          
          {/* 本周任务 */}
          {thisWeekTasks.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-purple-200 p-3 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-900">This Week Tasks</h3>
                <span className="text-sm text-purple-600">{thisWeekTasks.length} tasks</span>
              </div>
              
              {/* Week Analytics Charts */}
              <div className="mb-6 space-y-3">
                {/* Progress Distribution */}
                <TaskProgressChart tasks={thisWeekTasks} />
                
                {/* Plans Distribution */}
                <TaskPlanChart tasks={thisWeekTasks} planOptions={planOptions} />
                
                {/* Priority Quadrant Distribution */}
                <TaskQuadrantChart tasks={thisWeekTasks} />
              </div>
              
              <div className="space-y-3">
                {thisWeekTasks.map(task => {
                  const isRunning = isTaskRunning(task)
                  const isUpdating = updatingTimer === task.id
                  
                  return (
                    <div key={task.id} className="p-3 md:p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                        {/* 左侧时间列 */}
                        <div className="md:w-24 flex-shrink-0">
                          {/* 日期和星期 */}
                          <div className="text-xs text-purple-600 font-medium mb-1">
                            {formatDateWithWeekday(task.start_date)}
                          </div>
                          {/* 时间 */}
                          <div className="text-xs text-purple-800 font-semibold">
                            {formatTimeOnly(task.start_date, task.end_date)}
                          </div>
                        </div>
                        
                        {/* 右侧内容列 */}
                        <div className="flex-1 flex flex-col">
                          {/* 标题行 - 可点击跳转到Notion */}
                          <div className="mb-2">
                            <span 
                              className="font-semibold text-purple-900 cursor-pointer hover:text-purple-600 hover:underline transition-colors flex items-center gap-1"
                              onClick={() => {
                                // 构建Notion页面URL
                                const notionPageUrl = `https://www.notion.so/${task.id.replace(/-/g, '')}`
                                window.open(notionPageUrl, '_blank')
                              }}
                              title="Click to edit in Notion"
                            >
                              {task.title}
                              <span className="text-xs text-gray-400">🔗</span>
                            </span>
                          </div>
                          
                          {/* Status行 */}
                          <div className="mb-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              Status: {task.status}
                            </span>
                          </div>
                          
                          {/* Priority行 */}
                          {task.priority_quadrant && (
                            <div className="mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority_quadrant)}`}>
                                Priority: {task.priority_quadrant}
                              </span>
                            </div>
                          )}
                          
                          {/* All day indicator */}
                          {task.all_day && (
                            <div className="mb-2">
                              {task.all_day && (
                                <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded border border-purple-200">
                                  All Day
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* 时间显示 */}
                          <TimeDisplay task={task} />
                          
                          {/* 实际运行时间显示 */}
                          {(task.actual_start || task.actual_end) && (
                            <div className="text-xs text-purple-700 mt-1 font-mono mb-2">
                              Actual: {task.actual_start ? (formatDateTime(task.actual_start).split(' ')[1] || '--:--') : '--:--'} - 
                              {task.actual_end ? (formatDateTime(task.actual_end).split(' ')[1] || '--:--') : (isRunning ? 'In Progress' : '--:--')}
                            </div>
                          )}

                          {/* 质量评分显示 */}
                          {task.quality_rating !== null && task.quality_rating !== undefined && task.quality_rating > 0 && (
                            <div className="text-xs text-purple-700 mt-1 font-medium">
                              Quality Score: {task.quality_rating} / 5
                            </div>
                          )}

                          
                          {/* 操作按钮 - 右列底部 */}
                          <div className="mt-auto">
                            <div className="flex gap-1 justify-end">
                          {/* 计时器按钮 */}
                          <button
                            onClick={() => handleStartStopTimer(task)}
                            disabled={isUpdating}
                            className={`px-2 py-1 text-xs rounded border transition-all duration-200 ${
                              isRunning 
                                ? 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200' 
                                : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={isRunning ? 'Stop timer' : 'Start timer'}
                          >
                            {isUpdating ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                            ) : (
                              isRunning ? '⏹️' : '▶️'
                            )}
                          </button>
                          
                          {/* API按钮 */}
                          <button
                            onClick={() => handleAddToOutlook(task)}
                            disabled={addingToCalendar === task.id}
                            className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100 transition-all duration-200 disabled:opacity-50"
                            title={isAuthenticated ? "Add to Outlook Calendar via API" : "Connect to Outlook first"}
                          >
                            {addingToCalendar === task.id ? (
                              <div className="animate-spin rounded-full h-2 w-2 border-b border-purple-600"></div>
                            ) : (
                              'API'
                            )}
                          </button>
                          
                          {/* Web按钮 */}
                          <button
                            onClick={() => handleAddToOutlookWeb(task)}
                            className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100 transition-all duration-200"
                            title="Add to Outlook Calendar via web interface"
                          >
                            Web
                          </button>
                          
                          {/* 编辑按钮 */}
                          <button
                            onClick={() => {
                              setEditingTask(task)
                              setFormPanelOpen(true)
                            }}
                            className="px-2 py-1 text-purple-600 hover:text-white hover:bg-purple-600 text-xs rounded transition-all duration-200 border border-purple-200 hover:border-purple-600"
                            title="Edit this task"
                          >
                            ✏️
                          </button>
                          
                          {/* 删除按钮 */}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="px-2 py-1 text-red-600 hover:text-white hover:bg-red-600 text-xs rounded transition-all duration-200 border border-red-200 hover:border-red-600"
                            title="Delete this task"
                          >
                            🗑️
                          </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Next占满整行（如果有） - 在Note之前，更重要 */}
                      {task.next && (
                        <div className="mt-3 pt-3 border-t border-purple-200 bg-purple-50 rounded-lg">
                          <div className="flex items-start gap-2 px-3 py-2">
                            <span className="text-purple-600 text-sm font-semibold mt-0.5">🎯</span>
                            <div className="flex-1">
                              <span className="font-semibold text-purple-800 text-sm">Next Steps:</span>
                              <div className="mt-1 text-sm text-purple-700">
                                {Array.isArray(task.next) ? (
                                  <RenderBlock blocks={task.next} />
                                ) : (
                                  <span className="whitespace-pre-wrap">{task.next}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Note占满整行（如果有） */}
                      {task.note && (
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          <div className="flex items-start gap-2">
                            <span className="text-purple-500 text-xs mt-0.5">📝</span>
                            <p className="text-sm text-purple-700 whitespace-pre-wrap break-words flex-1">
                              {task.note}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* 本月任务 */}
          {thisMonthTasks.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-purple-200 p-3 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-900">This Month Tasks</h3>
                <span className="text-sm text-purple-600">{thisMonthTasks.length} tasks</span>
              </div>
              
              {/* Month Analytics Charts */}
              <div className="mb-6 space-y-3">
                {/* Progress Distribution */}
                <TaskProgressChart tasks={thisMonthTasks} />
                
                {/* Plans Distribution */}
                <TaskPlanChart tasks={thisMonthTasks} planOptions={planOptions} />
                
                {/* Priority Quadrant Distribution */}
                <TaskQuadrantChart tasks={thisMonthTasks} />
              </div>
              
              <div className="space-y-3">
                {thisMonthTasks.map(task => {
                  const isRunning = isTaskRunning(task)
                  const isUpdating = updatingTimer === task.id
                  
                  return (
                    <div key={task.id} className="p-3 md:p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                        {/* 左侧时间列 */}
                        <div className="md:w-24 flex-shrink-0">
                          {/* 日期和星期 */}
                          <div className="text-xs text-purple-600 font-medium mb-1">
                            {formatDateWithWeekday(task.start_date)}
                          </div>
                          {/* 时间 */}
                          <div className="text-xs text-purple-800 font-semibold">
                            {formatTimeOnly(task.start_date, task.end_date)}
                          </div>
                        </div>
                        
                        {/* 右侧内容列 */}
                        <div className="flex-1 flex flex-col">
                          {/* 标题行 - 可点击跳转到Notion */}
                          <div className="mb-2">
                            <span 
                              className="font-semibold text-purple-900 cursor-pointer hover:text-purple-600 hover:underline transition-colors flex items-center gap-1"
                              onClick={() => {
                                // 构建Notion页面URL
                                const notionPageUrl = `https://www.notion.so/${task.id.replace(/-/g, '')}`
                                window.open(notionPageUrl, '_blank')
                              }}
                              title="Click to edit in Notion"
                            >
                              {task.title}
                              <span className="text-xs text-gray-400">🔗</span>
                            </span>
                          </div>
                          
                          {/* Status行 */}
                          <div className="mb-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              Status: {task.status}
                            </span>
                          </div>
                          
                          {/* Priority行 */}
                          {task.priority_quadrant && (
                            <div className="mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority_quadrant)}`}>
                                Priority: {task.priority_quadrant}
                              </span>
                            </div>
                          )}
                          
                          {/* All day indicator */}
                          {task.all_day && (
                            <div className="mb-2">
                              {task.all_day && (
                                <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded border border-purple-200">
                                  All Day
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* 时间显示 */}
                          <TimeDisplay task={task} />
                          
                          {/* 实际运行时间显示 */}
                          {(task.actual_start || task.actual_end) && (
                            <div className="text-xs text-purple-700 mt-1 font-mono mb-2">
                              Actual: {task.actual_start ? (formatDateTime(task.actual_start).split(' ')[1] || '--:--') : '--:--'} - 
                              {task.actual_end ? (formatDateTime(task.actual_end).split(' ')[1] || '--:--') : (isRunning ? 'In Progress' : '--:--')}
                            </div>
                          )}

                          {/* 质量评分显示 */}
                          {task.quality_rating !== null && task.quality_rating !== undefined && task.quality_rating > 0 && (
                            <div className="text-xs text-purple-700 mt-1 font-medium">
                              Quality Score: {task.quality_rating} / 5
                            </div>
                          )}

                          
                          {/* 操作按钮 - 右列底部 */}
                          <div className="mt-auto">
                            <div className="flex gap-1 justify-end">
                          {/* 计时器按钮 */}
                          <button
                            onClick={() => handleStartStopTimer(task)}
                            disabled={isUpdating}
                            className={`px-2 py-1 text-xs rounded border transition-all duration-200 ${
                              isRunning 
                                ? 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200' 
                                : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={isRunning ? 'Stop timer' : 'Start timer'}
                          >
                            {isUpdating ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                            ) : (
                              isRunning ? '⏹️' : '▶️'
                            )}
                          </button>
                          
                          {/* API按钮 */}
                          <button
                            onClick={() => handleAddToOutlook(task)}
                            disabled={addingToCalendar === task.id}
                            className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100 transition-all duration-200 disabled:opacity-50"
                            title={isAuthenticated ? "Add to Outlook Calendar via API" : "Connect to Outlook first"}
                          >
                            {addingToCalendar === task.id ? (
                              <div className="animate-spin rounded-full h-2 w-2 border-b border-purple-600"></div>
                            ) : (
                              'API'
                            )}
                          </button>
                          
                          {/* Web按钮 */}
                          <button
                            onClick={() => handleAddToOutlookWeb(task)}
                            className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100 transition-all duration-200"
                            title="Add to Outlook Calendar via web interface"
                          >
                            Web
                          </button>
                          
                          {/* 编辑按钮 */}
                          <button
                            onClick={() => {
                              setEditingTask(task)
                              setFormPanelOpen(true)
                            }}
                            className="px-2 py-1 text-purple-600 hover:text-white hover:bg-purple-600 text-xs rounded transition-all duration-200 border border-purple-200 hover:border-purple-600"
                            title="Edit this task"
                          >
                            ✏️
                          </button>
                          
                          {/* 删除按钮 */}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="px-2 py-1 text-red-600 hover:text-white hover:bg-red-600 text-xs rounded transition-all duration-200 border border-red-200 hover:border-red-600"
                            title="Delete this task"
                          >
                            🗑️
                          </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Next占满整行（如果有） - 在Note之前，更重要 */}
                      {task.next && (
                        <div className="mt-3 pt-3 border-t border-purple-200 bg-purple-50 rounded-lg">
                          <div className="flex items-start gap-2 px-3 py-2">
                            <span className="text-purple-600 text-sm font-semibold mt-0.5">🎯</span>
                            <div className="flex-1">
                              <span className="font-semibold text-purple-800 text-sm">Next Steps:</span>
                              <div className="mt-1 text-sm text-purple-700">
                                {Array.isArray(task.next) ? (
                                  <RenderBlock blocks={task.next} />
                                ) : (
                                  <span className="whitespace-pre-wrap">{task.next}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Note占满整行（如果有） */}
                      {task.note && (
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          <div className="flex items-start gap-2">
                            <span className="text-purple-500 text-xs mt-0.5">📝</span>
                            <p className="text-sm text-purple-700 whitespace-pre-wrap break-words flex-1">
                              {task.note}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 右侧任务列表 - 桌面端 */}
        <div className="lg:col-span-7">
          {/* NewTask按钮与今日任务左对齐 - 仅桌面端显示 */}
          <div className="hidden md:flex justify-start mb-4">
            <button
              onClick={() => {
                setEditingTask(null)
                setFormPanelOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
            >
              <span>+</span>
              <span className="whitespace-nowrap">New Task</span>
            </button>
          </div>
          <div className="hidden md:block bg-white rounded-lg shadow-sm border border-purple-200 p-3 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-900">
                {isToday(selectedDate) ? '今日任务' : '选定日期任务'}
              </h3>
              <span className="text-sm text-gray-500">
                {selectedDateTasks.length} 个任务
              </span>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl font-light">📅</div>
                <p className="text-gray-600 mt-4">这一天没有任务</p>
                <button
                  onClick={() => {
                    setEditingTask(null)
                    setFormPanelOpen(true)
                  }}
                  className="mt-2 text-purple-600 hover:text-purple-700 text-sm underline"
                >
                  添加任务
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedTasks).map(([timeGroup, tasks]) => 
                  tasks.length > 0 && (
                    <div key={timeGroup} className="space-y-2">
                      {/* 时间段标题 */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{getTimeGroupIcon(timeGroup)}</span>
                        <span className="text-sm font-semibold text-purple-800">{timeGroup}</span>
                        <div className="flex-1 h-px bg-purple-200"></div>
                        <span className="text-xs text-gray-500">{tasks.length}个任务</span>
                      </div>
                      
                      {/* 该时间段的任务列表 */}
                      {tasks.map((task) => {
                        const isRunning = isTaskRunning(task)
                        const isUpdating = updatingTimer === task.id
                        const hasConflicts = hasTimeConflicts(task, data)
                        
                        return (
                        <div
                          key={task.id}
                          className={`bg-gradient-to-r from-purple-50 to-white rounded-lg border p-3 hover:shadow-md transition-all duration-200 ${
                            hasConflicts ? 'border-l-4 border-red-500 bg-red-50' :
                            isRunning ? 'border-purple-400 bg-purple-50' : 'border-purple-200'
                          }`}
                        >
                          {/* 移动端垂直布局，桌面端三列布局 */}
                          <div className="flex flex-col md:flex-row md:items-start gap-3">
                            {/* 第一列：时间范围显示 */}
                            <div className="flex-shrink-0 text-center">
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                isRunning ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white'
                              }`}>
                                {task.start_date && task.end_date ? (
                                  formatTimeRange(task.start_date, task.end_date)
                                ) : (task.start_date || task.end_date) ? (
                                  formatDateTime(task.start_date || task.end_date).split(' ')[1]
                                ) : (
                                  '--:--'
                                )}
                              </div>
                            </div>
                            
                            {/* 第二列：任务信息 */}
                            <div className="flex-1 min-w-0">
                              <h4 
                                className="text-sm font-semibold text-purple-900 truncate mb-2 cursor-pointer hover:text-purple-600 hover:underline transition-colors flex items-center gap-1"
                                onClick={() => {
                                  // 构建Notion页面URL
                                  const notionPageUrl = `https://www.notion.so/${task.id.replace(/-/g, '')}`
                                  window.open(notionPageUrl, '_blank')
                                }}
                                title="Click to edit in Notion"
                              >
                                {task.title || 'Untitled Task'}
                                <span className="text-xs text-gray-400">🔗</span>
                              </h4>
                              
                              {/* Time Conflict Indicator */}
                              {hasConflicts && (
                                <div className="text-xs text-red-600 mb-2 font-medium">
                                  Time Conflict - Please review schedule
                                </div>
                              )}
                              
                              {/* Plan attribution display */}
                              {getPlanTitle(task.plan) && (
                                <div className="text-xs text-purple-600 mb-2">
                                  📋 {getPlanTitle(task.plan)}
                                </div>
                              )}
                              
                              {/* 元信息行 */}
                              <div className="space-y-1">
                                {task.status && (
                                  <div>
                                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                                      {task.status}
                                    </span>
                                  </div>
                                )}
                                {task.priority_quadrant && (
                                  <div>
                                    <span className={`px-1.5 py-0.5 text-xs rounded ${getQuadrantColor(task.priority_quadrant)}`}>
                                      {task.priority_quadrant}
                                    </span>
                                  </div>
                                )}
                                {task.actual_time > 0 && (
                                  <div className="text-xs">
                                    {task.actual_time > 0 && (
                                      <span className="text-purple-700 font-medium">
                                        Actual: {task.actual_time}h
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* 时间显示 */}
                              <TimeDisplay task={task} />
                              
                              {/* 实际运行时间显示 */}
                              {(task.actual_start || task.actual_end) && (
                                <div className="text-xs text-purple-700 mt-1 font-mono">
                                  Actual: {task.actual_start ? (formatDateTime(task.actual_start).split(' ')[1] || '--:--') : '--:--'} - 
                                  {task.actual_end ? (formatDateTime(task.actual_end).split(' ')[1] || '--:--') : (isRunning ? 'In Progress' : '--:--')}
                                </div>
                              )}

                              {/* 质量评分显示 */}
                              {task.quality_rating !== null && task.quality_rating !== undefined && task.quality_rating > 0 && (
                                <div className="text-xs text-purple-700 mt-1 font-medium">
                                  Quality Score: {task.quality_rating} / 5
                                </div>
                              )}

                            </div>
                            
                            {/* 第三列：操作按钮移动端横向，桌面端竖向 */}
                            <div className="flex md:flex-col gap-1 flex-shrink-0 justify-center md:justify-start flex-wrap">
                              {/* 计时器按钮 */}
                              <button
                                onClick={() => handleStartStopTimer(task)}
                                disabled={isUpdating}
                                className={`px-2 py-1 text-xs rounded border transition-all duration-200 ${
                                  isRunning 
                                    ? 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200' 
                                    : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                title={isRunning ? 'Stop timer' : 'Start timer'}
                              >
                                {isUpdating ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                                ) : (
                                  isRunning ? '⏹️' : '▶️'
                                )}
                              </button>
                              
                              {/* 暂停/继续按钮 - 仅今日任务显示 */}
                              <button
                                onClick={() => handlePauseContinueTimer(task)}
                                disabled={isUpdating || (!task.timer_status || task.timer_status === 'completed')}
                                className={`px-2 py-1 text-xs rounded border transition-all duration-200 ${
                                  task.timer_status === 'running'
                                    ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200' 
                                    : task.timer_status === 'paused'
                                    ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-400 border-gray-300'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                title={
                                  task.timer_status === 'running' ? 'Pause timer' :
                                  task.timer_status === 'paused' ? 'Continue timer' :
                                  'Timer not active'
                                }
                              >
                                {isUpdating ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                                ) : (
                                  task.timer_status === 'running' ? '⏸️' : 
                                  task.timer_status === 'paused' ? '▶️' : '⏸️'
                                )}
                              </button>
                              
                              {/* API按钮 */}
                              <button
                                onClick={() => handleAddToOutlook(task)}
                                disabled={addingToCalendar === task.id}
                                className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100 transition-all duration-200 disabled:opacity-50"
                                title={isAuthenticated ? "Add to Outlook Calendar via API" : "Connect to Outlook first"}
                              >
                                {addingToCalendar === task.id ? (
                                  <div className="animate-spin rounded-full h-2 w-2 border-b border-purple-600"></div>
                                ) : (
                                  'API'
                                )}
                              </button>
                              
                              {/* Web按钮 */}
                              <button
                                onClick={() => handleAddToOutlookWeb(task)}
                                className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100 transition-all duration-200"
                                title="Add to Outlook Calendar via web interface"
                              >
                                Web
                              </button>
                              
                              {/* 编辑按钮 */}
                              <button
                                onClick={() => {
                                  setEditingTask(task)
                                  setFormPanelOpen(true)
                                }}
                                className="px-2 py-1 text-purple-600 hover:text-white hover:bg-purple-600 text-xs rounded transition-all duration-200 border border-purple-200 hover:border-purple-600"
                                title="Edit this task"
                              >
                                ✏️
                              </button>
                              
                              {/* 删除按钮 */}
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="px-2 py-1 text-red-600 hover:text-white hover:bg-red-600 text-xs rounded transition-all duration-200 border border-red-200 hover:border-red-600"
                                title="Delete this task"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          
                          {/* Next独占一整行（如果有） - 在Note之前，更重要 */}
                          {task.next && (
                            <div className="mt-3 pt-3 border-t border-purple-200 bg-purple-50 rounded-lg">
                              <div className="flex items-start gap-2 px-3 py-2">
                                <span className="text-purple-600 text-sm font-semibold mt-0.5">🎯</span>
                                <div className="flex-1">
                                  <span className="font-semibold text-purple-800 text-sm">Next Steps:</span>
                                  <div className="mt-1 text-sm text-purple-700">
                                    {Array.isArray(task.next) ? (
                                      <RenderBlock blocks={task.next} />
                                    ) : (
                                      <span className="whitespace-pre-wrap">{task.next}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Note独占底部一整行 */}
                          {task.note && (
                            <div className="mt-3 pt-3 border-t border-purple-200">
                              <p className="text-xs text-gray-600 whitespace-pre-wrap break-words">
                                {task.note}
                              </p>
                            </div>
                          )}
                        </div>
                        )
                      })}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskFormPanel
        isOpen={formPanelOpen}
        onClose={() => {
          setFormPanelOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
        onSave={handleSaveTask}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        planOptions={planOptions}
        allTasks={data}
      />

      <TaskCompletionModal
        isOpen={completionModal.isOpen}
        onClose={() => setCompletionModal({ isOpen: false, task: null })}
        onSubmit={handleTaskCompletionSubmit}
        taskTitle={completionModal.task?.title || ''}
      />
    </div>
  )
}