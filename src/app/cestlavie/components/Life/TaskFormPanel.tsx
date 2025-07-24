'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { addTorontoTimezone, toDatetimeLocal, extractDateOnly } from '../../utils/timezone'

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
  actual_time: number
  quality_rating?: number
  next?: string
  is_plan_critical?: boolean
  timer_status?: string
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
  budget_money?: number
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

// Utility functions - using timezone utility

const getDefaultDateTime = (): string => {
  const now = new Date()
  return now.getFullYear() + '-' +
         String(now.getMonth() + 1).padStart(2, '0') + '-' +
         String(now.getDate()).padStart(2, '0') + 'T' +
         String(now.getHours()).padStart(2, '0') + ':' +
         String(now.getMinutes()).padStart(2, '0')
}

// Time conflict detection
const isTimeOverlapping = (start1: string, end1: string, start2: string, end2: string): boolean => {
  // Parse Toronto timezone strings, remove timezone suffix for local parsing
  const startTime1 = new Date(start1.replace(/-04:00$/, '')).getTime()
  const endTime1 = new Date(end1.replace(/-04:00$/, '')).getTime()
  const startTime2 = new Date(start2.replace(/-04:00$/, '')).getTime()
  const endTime2 = new Date(end2.replace(/-04:00$/, '')).getTime()
  
  return startTime1 < endTime2 && startTime2 < endTime1
}

const detectTimeConflicts = (
  taskDate: string, 
  startTime: string, 
  endTime: string, 
  allTasks: TaskRecord[], 
  excludeTaskId?: string
): TaskRecord[] => {
  if (!taskDate || !startTime || !endTime) return []
  
  // Extract date part from startTime string (format: "2025-07-23T01:20:00-04:00")
  const newTaskDateStr = extractDateOnly(startTime)
  
  return allTasks.filter(task => {
    if (task.id === excludeTaskId) return false
    if (!task.start_date || !task.end_date) return false
    
    // Extract date part from existing task with timezone
    const taskDateStr = extractDateOnly(task.start_date)
    if (taskDateStr !== newTaskDateStr) return false
    
    return isTimeOverlapping(startTime, endTime, task.start_date, task.end_date)
  })
}

export default function TaskFormPanel({ 
  isOpen, 
  onClose, 
  task, 
  onSave, 
  statusOptions, 
  priorityOptions, 
  planOptions, 
  allTasks 
}: TaskFormPanelProps) {
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


  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        status: task.status || '',
        start_date: toDatetimeLocal(task.start_date || ''),
        end_date: toDatetimeLocal(task.end_date || ''),
        all_day: task.all_day || false,
        remind_before: task.remind_before || 15,
        plan: task.plan || [],
        priority_quadrant: task.priority_quadrant || '',
        note: task.note || ''
      })
    } else {
      const defaultStart = getDefaultDateTime()
      const defaultEnd = new Date(Date.now() + 60 * 60 * 1000)
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
        note: ''
      })
    }
  }, [task, isOpen])


  // Detect time conflicts
  useEffect(() => {
    if (formData.start_date && formData.end_date && allTasks.length > 0) {
      // Convert to Toronto timezone format for conflict detection
      const startWithTz = addTorontoTimezone(formData.start_date)
      const endWithTz = addTorontoTimezone(formData.end_date)
      
      const conflicts = detectTimeConflicts(
        formData.start_date,
        startWithTz,
        endWithTz,
        allTasks,
        task?.id
      )
      setConflictingTasks(conflicts)
    } else {
      setConflictingTasks([])
    }
  }, [formData.start_date, formData.end_date, allTasks, task?.id])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // Add Toronto timezone to datetime fields before saving
    const processedFormData = {
      ...formData,
      start_date: addTorontoTimezone(formData.start_date),
      end_date: addTorontoTimezone(formData.end_date)
    }
    
    onSave(processedFormData)
  }, [formData, onSave])

  const handlePlanChange = useCallback((planId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      plan: planId ? [planId] : [] 
    }))
  }, [])

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
          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Related Plan *</label>
            <select
              value={formData.plan[0] || ''}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-900 font-medium
                        hover:border-purple-300 transition-all duration-200"
              required
            >
              <option value="">Select a Plan First</option>
              {planOptions.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.title || 'Untitled Plan'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Each task must belong to a plan</p>
            
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-900 font-medium
                        hover:border-purple-300 transition-all duration-200"
              required
              placeholder="Enter task title..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-900 font-medium
                        hover:border-purple-300 transition-all duration-200"
              required
            >
              <option value="">Select Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Priority Quadrant */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Priority Quadrant *</label>
            <select
              value={formData.priority_quadrant}
              onChange={(e) => setFormData(prev => ({ ...prev, priority_quadrant: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-900 font-medium
                        hover:border-purple-300 transition-all duration-200"
              required
            >
              <option value="">Select Priority</option>
              {priorityOptions.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          {/* Time Range - 2 Row Layout */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Start Time *
                <span className="text-xs text-gray-500 ml-2">(Set precise time for daily tasks)</span>
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-gray-900 font-medium
                          hover:border-purple-300 transition-all duration-200
                          [&::-webkit-calendar-picker-indicator]:bg-purple-100 
                          [&::-webkit-calendar-picker-indicator]:rounded-md
                          [&::-webkit-calendar-picker-indicator]:p-1
                          [&::-webkit-calendar-picker-indicator]:cursor-pointer
                          [&::-webkit-calendar-picker-indicator]:hover:bg-purple-200"
                required
                step="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                End Time *
                <span className="text-xs text-gray-500 ml-2">(Set precise end time)</span>
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-gray-900 font-medium
                          hover:border-purple-300 transition-all duration-200
                          [&::-webkit-calendar-picker-indicator]:bg-purple-100 
                          [&::-webkit-calendar-picker-indicator]:rounded-md
                          [&::-webkit-calendar-picker-indicator]:p-1
                          [&::-webkit-calendar-picker-indicator]:cursor-pointer
                          [&::-webkit-calendar-picker-indicator]:hover:bg-purple-200"
                required
                step="60"
              />
            </div>
          </div>

          {/* Time Conflicts Warning */}
          {conflictingTasks.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 px-3 py-2 rounded-lg">
              <span className="text-purple-800 font-medium text-sm">
                Time conflict: overlaps with {conflictingTasks.slice(0, 1).map(task => `"${task.title}"`).join(', ')}
                {conflictingTasks.length > 1 && ` and ${conflictingTasks.length - 1} more task${conflictingTasks.length > 2 ? 's' : ''}`}
              </span>
            </div>
          )}


          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Notes</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-900 font-medium
                        hover:border-purple-300 transition-all duration-200 resize-none"
              placeholder="Add task notes or description..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 
                        rounded-lg hover:from-purple-700 hover:to-purple-800 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                        transition-all duration-200 font-semibold text-sm
                        transform hover:scale-[1.02] active:scale-[0.98]
                        shadow-lg hover:shadow-xl"
            >
              {task ? '✏️ Update Task' : '🎯 Create Task'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}