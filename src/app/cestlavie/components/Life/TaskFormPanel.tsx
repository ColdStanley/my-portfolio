'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { TaskRecord, TaskFormData, TaskFormPanelProps, PlanOption, StrategyOption } from '../../types/task'
import { toDatetimeLocal, toUTC, getDefaultStartTime, getDefaultEndTime } from '@/utils/dateUtils'
import { openNotionPage } from '../../utils/planUtils'

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
    plan: '',
    note: '',
    importance_percentage: 0
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const [syncingToOutlook, setSyncingToOutlook] = useState(false)

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        status: task.status || '',
        start_date: task.start_date ? toDatetimeLocal(task.start_date) : '',
        end_date: task.end_date ? toDatetimeLocal(task.end_date) : '',
        all_day: task.all_day || false,
        plan: task.plan || '',
        note: task.note || '',
        importance_percentage: task.importance_percentage || 0
      })
    } else {
      // Check for default plan ID from window
      const defaultPlanId = (window as any).__defaultPlanId || ''
      
      setFormData({
        title: '',
        status: '',
        start_date: getDefaultStartTime(),
        end_date: getDefaultEndTime(),
        all_day: false,
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
    
    const tasksInSamePlan = allTasks?.filter(t => 
      t.plan === formData.plan && t.id !== task?.id
    ) || []
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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

    // Save the task first
    await onSave(processedFormData)

    // Auto-sync to Outlook if it's an existing task being updated
    if (task && task.id) {
      try {
        setSyncingToOutlook(true)

        const response = await fetch('/api/cestlavie-life/outlook/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: task.outlook_event_id ? 'update' : 'create',
            taskData: {
              id: task.id,
              title: processedFormData.title,
              start_date: processedFormData.start_date,
              end_date: processedFormData.end_date,
              note: processedFormData.note,
              outlook_event_id: task.outlook_event_id
            }
          })
        })

        const result = await response.json()

        if (result.success) {
          console.log(`Outlook auto-sync successful: ${result.message}`)
        } else {
          console.warn(`Outlook auto-sync failed: ${result.error}`)
        }
      } catch (error: any) {
        console.error(`Outlook auto-sync error: ${error.message}`)
      } finally {
        setSyncingToOutlook(false)
      }
    }
  }, [formData, onSave, isValid, projectedTotal, task])

  const handleOutlookSync = useCallback(async () => {
    if (!task) return

    setSyncingToOutlook(true)
    try {
      const response = await fetch('http://localhost:5678/webhook/Sync Task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          data: {
            id: task.id,
            title: task.title,
            start_date: task.start_date,
            end_date: task.end_date,
            note: task.note
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('n8n sync successful:', result)
        // n8n should handle writing outlook_event_id back to Notion
        // Optionally refresh the task data here if needed
      } else {
        console.error('n8n sync failed:', response.statusText)
      }
    } catch (error) {
      console.error('n8n sync error:', error)
    } finally {
      setSyncingToOutlook(false)
    }
  }, [task])

  if (!isOpen) return null

  const modalContent = (
    <>
      {/* Task Form Panel - Modal Style */}
      <div
        className="hidden md:block fixed inset-0 z-50"
        onClick={onClose}
      >
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-h-[90vh] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close Button */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-lg font-semibold text-purple-800">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-purple-700/100 rounded transition-colors">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Form Content */}
          <form id="task-form" onSubmit={handleSubmit} className="px-6 py-4 overflow-y-auto min-h-0 flex-1 space-y-4">
            {/* Plan Selection */}
            <div>
              <label className="block text-xs font-medium text-purple-600 mb-1">Plan</label>
              <select
                value={formData.plan || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
              >
                <option value="">No Plan</option>
                {planOptions
                  .sort((a, b) => (b.importance_percentage || 0) - (a.importance_percentage || 0))
                  .map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.objective || 'Untitled Plan'} - {plan.importance_percentage || 0}%
                  </option>
                ))}
              </select>
              {/* Strategy info for selected plan */}
              {selectedPlanStrategy && (
                <p className="text-xs text-purple-400 mt-1">Strategy: {selectedPlanStrategy}</p>
              )}
            </div>

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

            {/* All Day Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="all-day"
                checked={formData.all_day}
                onChange={(e) => setFormData(prev => ({ ...prev, all_day: e.target.checked }))}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="all-day" className="text-xs font-medium text-purple-600">
                All Day Event
              </label>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-purple-600 mb-1">
                  Start Date *
                  <span className="text-xs text-purple-400 ml-1">(Task start time)</span>
                </label>
                <input
                  type={formData.all_day ? "date" : "datetime-local"}
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md 
                            focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                            bg-white text-purple-700 text-sm
                            hover:border-gray-300 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-purple-600 mb-1">
                  End Date *
                  <span className="text-xs text-purple-400 ml-1">(Task end time)</span>
                </label>
                <input
                  type={formData.all_day ? "date" : "datetime-local"}
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md 
                            focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                            bg-white text-purple-700 text-sm
                            hover:border-gray-300 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-medium text-purple-600 mb-1">Note</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700 text-sm max-h-20
                          hover:border-gray-300 transition-all duration-200 resize-none"
                placeholder="Task notes..."
              />
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-600">{validationError}</p>
              </div>
            )}
          </form>
          
          {/* Footer with Submit Button */}
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
            {task && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  openNotionPage(task.id)
                }}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                title="Open in Notion"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.934zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933l3.222-.14z"/>
                </svg>
              </button>
            )}
            {task && (
              <button
                type="button"
                onClick={handleOutlookSync}
                disabled={syncingToOutlook || !!task.outlook_event_id}
                className={`p-2.5 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md flex-shrink-0 ${
                  syncingToOutlook || task.outlook_event_id
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700'
                }`}
                title={task.outlook_event_id ? 'Already synced to Outlook' : 'Sync to Outlook'}
              >
                {syncingToOutlook ? (
                  <div className="w-4 h-4 animate-spin border-2 border-blue-600 border-t-transparent rounded-full"></div>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                )}
              </button>
            )}
            <button
              type="submit"
              form="task-form"
              disabled={!isValid && formData.plan && formData.importance_percentage !== 0}
              className={`flex-1 py-2.5 px-4 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500
                        transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md
                        ${!isValid && formData.plan && formData.importance_percentage !== 0
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Modal */}
      <div 
        className={`md:hidden fixed inset-4 flex items-center justify-center z-50 transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div 
          className="w-full max-w-sm max-h-full bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
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
            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-purple-600 mb-2">Plan</label>
              <select
                value={formData.plan || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700
                          hover:border-gray-300 transition-all duration-200"
              >
                <option value="">No Plan</option>
                {planOptions
                  .sort((a, b) => (b.importance_percentage || 0) - (a.importance_percentage || 0))
                  .map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.objective || 'Untitled Plan'} - {plan.importance_percentage || 0}%
                  </option>
                ))}
              </select>
              {/* Strategy info for selected plan */}
              {selectedPlanStrategy && (
                <p className="text-sm text-purple-400 mt-1">Strategy: {selectedPlanStrategy}</p>
              )}
            </div>

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

            {/* All Day Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="all-day-mobile"
                checked={formData.all_day}
                onChange={(e) => setFormData(prev => ({ ...prev, all_day: e.target.checked }))}
                className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="all-day-mobile" className="text-sm font-medium text-purple-600">
                All Day Event
              </label>
            </div>

            {/* Date Range */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-600 mb-2">
                  Start Date *
                  <span className="text-xs text-purple-400 ml-2">(Task start time)</span>
                </label>
                <input
                  type={formData.all_day ? "date" : "datetime-local"}
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                            bg-white text-purple-700
                            hover:border-gray-300 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-600 mb-2">
                  End Date *
                  <span className="text-xs text-purple-400 ml-2">(Task end time)</span>
                </label>
                <input
                  type={formData.all_day ? "date" : "datetime-local"}
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                            bg-white text-purple-700
                            hover:border-gray-300 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-purple-600 mb-2">Note</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700 max-h-24
                          hover:border-gray-300 transition-all duration-200 resize-none"
                placeholder="Task notes..."
              />
            </div>

            {/* Validation Error - Mobile */}
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{validationError}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pb-6 flex gap-3">
              {task && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    openNotionPage(task.id)
                  }}
                  className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex-shrink-0"
                  title="Open in Notion"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.934zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933l3.222-.14z"/>
                  </svg>
                </button>
              )}
              {task && (
                <button
                  type="button"
                  onClick={handleOutlookSync}
                  disabled={syncingToOutlook || !!task.outlook_event_id}
                  className={`p-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex-shrink-0 ${
                    syncingToOutlook || task.outlook_event_id
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700'
                  }`}
                  title={task.outlook_event_id ? 'Already synced to Outlook' : 'Sync to Outlook'}
                >
                  {syncingToOutlook ? (
                    <div className="w-5 h-5 animate-spin border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                  )}
                </button>
              )}
              <button
                type="submit"
                disabled={!isValid && formData.plan && formData.importance_percentage !== 0}
                className={`flex-1 py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
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
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}