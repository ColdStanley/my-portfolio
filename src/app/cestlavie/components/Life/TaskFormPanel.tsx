'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { TaskRecord, TaskFormData, TaskFormPanelProps, PlanOption, StrategyOption } from '../../types/task'
import { toDatetimeLocal, toUTC, getDefaultStartTime, getDefaultEndTime } from '@/utils/dateUtils'



// Utility functions - using dayjs utility


export default function TaskFormPanel({ 
  isOpen, 
  onClose, 
  task, 
  onSave, 
  statusOptions, 
  planOptions = [],
  strategyOptions = [],
  allTasks 
}: TaskFormPanelProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    status: '',
    start_date: '',
    end_date: '',
    all_day: false,
    remind_before: 15,
    plan: '',
    note: '',
    importance_percentage: 0
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  


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
        plan: task.plan || '',
        note: task.note || '',
        importance_percentage: task.importance_percentage || 0
      })
    } else {
      const defaultStart = getDefaultStartTime()
      const defaultEnd = getDefaultEndTime()
      
      // Check for default plan ID from window
      const defaultPlanId = (window as any).__defaultPlanId || ''
      
      setFormData({
        title: '',
        status: '',
        start_date: defaultStart,
        end_date: defaultEnd,
        all_day: false,
        remind_before: 15,
        plan: defaultPlanId,
        note: '',
        importance_percentage: 0
      })
    }
  }, [task, isOpen])

  // Get strategy for selected plan
  const selectedPlanStrategy = useMemo(() => {
    if (!formData.plan) return null
    const selectedPlan = planOptions.find(plan => plan.id === formData.plan)
    if (!selectedPlan || !selectedPlan.strategy) return null
    const strategy = strategyOptions.find(s => s.id === selectedPlan.strategy)
    return strategy?.objective || null
  }, [formData.plan, planOptions, strategyOptions])

  // Calculate current total percentage within the selected Plan, excluding the edited task
  const currentTotal = useMemo(() => {
    if (!formData.plan) return 0
    
    const tasksInSamePlan = allTasks.filter(t => 
      t.plan === formData.plan && t.id !== task?.id
    )
    return tasksInSamePlan.reduce((sum, t) => sum + (t.importance_percentage || 0), 0)
  }, [allTasks, formData.plan, task?.id])

  // Calculate what the total would be with current form data
  const projectedTotal = useMemo(() => {
    return currentTotal + (formData.importance_percentage || 0)
  }, [currentTotal, formData.importance_percentage])

  // Validation check
  const isValid = useMemo(() => {
    if (!formData.plan) return true // No validation if no plan selected
    if (!formData.importance_percentage || formData.importance_percentage === 0) {
      return true // Allow 0 or empty percentage
    }
    return projectedTotal <= 100
  }, [projectedTotal, formData.importance_percentage, formData.plan])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // Check 100% constraint for Tasks within Plan
    if (!isValid && formData.plan) {
      setValidationError(`Total percentage within this Plan cannot exceed 100%. Current total: ${projectedTotal}%`)
      return
    }
    
    setValidationError(null)
    
    // Convert local datetime to UTC for saving
    const processedFormData = {
      ...formData,
      start_date: toUTC(formData.start_date),
      end_date: toUTC(formData.end_date)
    }
    
    onSave(processedFormData)
  }, [formData, onSave, isValid, projectedTotal])


  return (
    <>
      {/* Task Form Panel - Sidebar Style Drawer */}
      <div 
        className={`hidden md:block fixed top-32 right-2 w-80 h-[calc(100vh-12rem)] bg-white/95 backdrop-blur-md rounded-xl shadow-xl z-50 transform transition-all duration-400 flex flex-col ${
          isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-lg'
        }`}
        style={{
          transitionTimingFunction: isOpen 
            ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' 
            : 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {/* Header with Close Button */}
        <div className="flex justify-between items-center p-4 flex-shrink-0">
          <h2 className="text-sm font-medium text-purple-800">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-purple-700/100 rounded transition-colors">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-3 overflow-y-auto min-h-0 flex-1 space-y-3">

          {/* Task Title */}
          <div>
            <label className="block text-xs font-medium text-purple-600 mb-1">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-md 
                        focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-purple-700 text-sm
                        hover:border-gray-300 transition-all duration-200"
              required
              placeholder="Enter task title..."
            />
          </div>

          {/* Status */}
          <div>
              <label className="block text-xs font-medium text-purple-600 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
                required
              >
                <option value="">Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

          {/* Importance Percentage */}
          <div>
            <label className="block text-xs font-medium text-purple-600 mb-1">
              重要性占比
              <span className="text-xs text-purple-400 ml-1">(%)</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.importance_percentage || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0
                setFormData(prev => ({ 
                  ...prev, 
                  importance_percentage: value 
                }))
                // Clear validation error when user types
                if (validationError) setValidationError(null)
              }}
              className={`w-full px-3 py-2 border rounded-md 
                        focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-purple-700 text-sm
                        hover:border-gray-300 transition-all duration-200
                        ${!isValid ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              placeholder="25"
            />
            {/* Percentage info for Plan */}
            {formData.plan && (
              <div className="mt-1 text-xs">
                <span className={projectedTotal > 100 ? 'text-red-600' : 'text-purple-400'}>
                  Plan Total: {projectedTotal}% / 100%
                </span>
                {projectedTotal > 100 && (
                  <span className="text-red-600 ml-2">⚠ Exceeds 100%</span>
                )}
              </div>
            )}
          </div>

          {/* Plan & Strategy - 2 Column Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Plan Selection */}
            <div>
              <label className="block text-xs font-medium text-purple-600 mb-1">Plan *</label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
                required
              >
                <option value="">Select Plan</option>
                {planOptions.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.objective}</option>
                ))}
              </select>
            </div>

            {/* Strategy Display */}
            <div>
              <label className="block text-xs font-medium text-purple-600 mb-1">Strategy</label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-md 
                            bg-purple-600/50 text-purple-500 text-sm min-h-[2.375rem] flex items-center">
                {selectedPlanStrategy || 'Auto-selected'}
              </div>
            </div>
          </div>

          {/* Time Range - 2 Row Layout */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-purple-600 mb-1">
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
                          bg-white text-purple-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
                required
                step="60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-purple-600 mb-1">
                End Time *
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
                required
                step="60"
              />
            </div>
          </div>



          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-purple-600 mb-1">Notes</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-md 
                        focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-purple-700 text-sm max-h-20
                        hover:border-gray-300 transition-all duration-200 resize-none"
              placeholder="Add task notes or description..."
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-600">{validationError}</p>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={!isValid && formData.plan && formData.importance_percentage !== 0}
              className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500
                        transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md
                        ${!isValid && formData.plan && formData.importance_percentage !== 0
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
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
        <div className="flex justify-between items-center p-4 flex-shrink-0">
          <h2 className="text-lg font-medium text-purple-800">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-purple-700/100 rounded transition-colors">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Form Content */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto min-h-0 flex-1 space-y-4">

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-purple-600 mb-2">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-purple-700
                        hover:border-gray-300 transition-all duration-200"
              required
              placeholder="Enter task title..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-purple-600 mb-2">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-purple-700
                        hover:border-gray-300 transition-all duration-200"
              required
            >
              <option value="">Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>


          {/* Importance Percentage - Mobile */}
          <div>
            <label className="block text-sm font-medium text-purple-600 mb-2">
              重要性占比
              <span className="text-xs text-purple-400 ml-2">(%)</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.importance_percentage || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0
                setFormData(prev => ({ 
                  ...prev, 
                  importance_percentage: value 
                }))
                // Clear validation error when user types
                if (validationError) setValidationError(null)
              }}
              className={`w-full px-4 py-3 border rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-purple-700
                        hover:border-gray-300 transition-all duration-200
                        ${!isValid ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              placeholder="25"
            />
            {/* Percentage info for Plan - Mobile */}
            {formData.plan && (
              <div className="mt-2 text-sm">
                <span className={projectedTotal > 100 ? 'text-red-600' : 'text-purple-400'}>
                  Plan Total: {projectedTotal}% / 100%
                </span>
                {projectedTotal > 100 && (
                  <span className="text-red-600 ml-2">⚠ Exceeds 100%</span>
                )}
              </div>
            )}
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-purple-600 mb-2">Plan *</label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-purple-700
                        hover:border-gray-300 transition-all duration-200"
              required
            >
              <option value="">Select Plan</option>
              {planOptions.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.objective}</option>
              ))}
            </select>
          </div>

          {/* Strategy Display */}
          <div>
            <label className="block text-sm font-medium text-purple-600 mb-2">Strategy</label>
            <div className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                          bg-purple-600/50 text-purple-500 min-h-[3rem] flex items-center">
              {selectedPlanStrategy || 'Auto-selected based on Plan'}
            </div>
          </div>

          {/* Time Range */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-600 mb-2">
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
                          bg-white text-purple-700
                          hover:border-gray-300 transition-all duration-200"
                required
                step="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-600 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700
                          hover:border-gray-300 transition-all duration-200"
                required
                step="60"
              />
            </div>
          </div>


          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-purple-600 mb-2">Notes</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-purple-700 max-h-24
                        hover:border-gray-300 transition-all duration-200 resize-none"
              placeholder="Add task notes or description..."
            />
          </div>

          {/* Validation Error - Mobile */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{validationError}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pb-6">
            <button
              type="submit"
              disabled={!isValid && formData.plan && formData.importance_percentage !== 0}
              className={`w-full py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                        transition-colors duration-200 font-medium shadow-md hover:shadow-lg
                        ${!isValid && formData.plan && formData.importance_percentage !== 0
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}