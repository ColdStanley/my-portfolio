'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { TaskRecord } from './taskReducer'
import { toDatetimeLocal, toUTC, getDefaultStartTime, getDefaultEndTime } from '@/utils/dateUtils'


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
  objective: string
  parent_goal?: string[]
}

interface StrategyOption {
  id: string
  objective: string
}

interface TaskFormPanelProps {
  isOpen: boolean
  onClose: () => void
  task?: TaskRecord | null
  onSave: (task: TaskFormData) => void
  statusOptions: string[]
  priorityOptions: string[]
  planOptions: PlanOption[]
  strategyOptions: StrategyOption[]
  allTasks: TaskRecord[]
}

// Utility functions - using dayjs utility


export default function TaskFormPanel({ 
  isOpen, 
  onClose, 
  task, 
  onSave, 
  statusOptions, 
  priorityOptions, 
  planOptions, 
  strategyOptions,
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
  


  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        status: task.status || '',
        start_date: task.start_date ? toDatetimeLocal(task.start_date) : '',
        end_date: task.end_date ? toDatetimeLocal(task.end_date) : '',
        all_day: task.all_day || false,
        remind_before: task.remind_before || 15,
        plan: task.plan || [],
        priority_quadrant: task.priority_quadrant || '',
        note: task.note || ''
      })
    } else {
      const defaultStart = getDefaultStartTime()
      const defaultEnd = getDefaultEndTime()
      
      setFormData({
        title: '',
        status: '',
        start_date: defaultStart,
        end_date: defaultEnd,
        all_day: false,
        remind_before: 15,
        plan: [],
        priority_quadrant: '',
        note: ''
      })
    }
  }, [task, isOpen])



  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert local datetime to UTC for saving
    const processedFormData = {
      ...formData,
      start_date: toUTC(formData.start_date),
      end_date: toUTC(formData.end_date)
    }
    
    onSave(processedFormData)
  }, [formData, onSave])

  const handlePlanChange = useCallback((planId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      plan: planId ? [planId] : [] 
    }))
  }, [])

  return (
    <>
      {/* Task Form Panel - Sidebar Style Drawer */}
      <div 
        className={`hidden md:block fixed top-32 right-2 w-80 h-[calc(100vh-12rem)] bg-white border border-gray-200 rounded-xl shadow-lg z-50 transform transition-all duration-400 flex flex-col ${
          isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-lg'
        }`}
        style={{
          transitionTimingFunction: isOpen 
            ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' 
            : 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {/* Header with Close Button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-sm font-medium text-gray-800">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-3 overflow-y-auto min-h-0 flex-1 space-y-3">
          {/* Plan Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Related Plan *</label>
            <select
              value={formData.plan[0] || ''}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md 
                        focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700 text-sm
                        hover:border-gray-300 transition-all duration-200"
              required
            >
              <option value="">Select a Plan First</option>
              {planOptions.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.objective || 'Untitled Plan'}
                </option>
              ))}
            </select>
            
            
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-md 
                        focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700 text-sm
                        hover:border-gray-300 transition-all duration-200"
              required
              placeholder="Enter task title..."
            />
          </div>

          {/* Status & Priority - 2 Column Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-gray-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
                required
              >
                <option value="">Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Priority Quadrant */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority *</label>
              <select
                value={formData.priority_quadrant}
                onChange={(e) => setFormData(prev => ({ ...prev, priority_quadrant: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-gray-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
                required
              >
                <option value="">Priority</option>
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Range - 2 Row Layout */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => {
                  const newStartDate = e.target.value
                  setFormData(prev => ({ 
                    ...prev, 
                    start_date: newStartDate,
                    // Auto-set end_date to same value when start_date changes
                    end_date: newStartDate
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-gray-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
                required
                step="60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End Time *
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-gray-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
                required
                step="60"
              />
            </div>
          </div>



          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-md 
                        focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700 text-sm max-h-20
                        hover:border-gray-300 transition-all duration-200 resize-none"
              placeholder="Add task notes or description..."
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 
                        rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500
                        transition-colors duration-200 font-medium text-sm
                        shadow-sm hover:shadow-md"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Full Screen Modal */}
      <div 
        className={`md:hidden fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-medium text-gray-800">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Form Content */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto min-h-0 flex-1 space-y-4">
          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Related Plan *</label>
            <select
              value={formData.plan[0] || ''}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700
                        hover:border-gray-300 transition-all duration-200"
              required
            >
              <option value="">Select a Plan First</option>
              {planOptions.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.objective || 'Untitled Plan'}
                </option>
              ))}
            </select>
            
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700
                        hover:border-gray-300 transition-all duration-200"
              required
              placeholder="Enter task title..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700
                        hover:border-gray-300 transition-all duration-200"
              required
            >
              <option value="">Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Priority Quadrant */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Priority *</label>
            <select
              value={formData.priority_quadrant}
              onChange={(e) => setFormData(prev => ({ ...prev, priority_quadrant: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700
                        hover:border-gray-300 transition-all duration-200"
              required
            >
              <option value="">Priority</option>
              {priorityOptions.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => {
                  const newStartDate = e.target.value
                  setFormData(prev => ({ 
                    ...prev, 
                    start_date: newStartDate,
                    end_date: newStartDate
                  }))
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-gray-700
                          hover:border-gray-300 transition-all duration-200"
                required
                step="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-gray-700
                          hover:border-gray-300 transition-all duration-200"
                required
                step="60"
              />
            </div>
          </div>


          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Notes</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700 max-h-24
                        hover:border-gray-300 transition-all duration-200 resize-none"
              placeholder="Add task notes or description..."
            />
          </div>

          {/* Submit Button */}
          <div className="pb-6">
            <button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 
                        rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                        transition-colors duration-200 font-medium
                        shadow-md hover:shadow-lg"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}