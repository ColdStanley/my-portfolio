'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { StrategyRecord, StrategyFormData, StrategyFormPanelProps } from '../../types/strategy'
import { getDefaultStrategyFormData } from '../../utils/strategyUtils'

export default function StrategyFormPanel({ 
  isOpen, 
  onClose, 
  strategy, 
  onSave, 
  statusOptions, 
  categoryOptions,
  allStrategies = []
}: StrategyFormPanelProps) {
  const [formData, setFormData] = useState<StrategyFormData>(getDefaultStrategyFormData())
  const [validationError, setValidationError] = useState<string | null>(null)

  // Initialize form data when strategy changes
  useEffect(() => {
    if (strategy) {
      setFormData({
        objective: strategy.objective || '',
        description: strategy.description || '',
        start_date: strategy.start_date ? strategy.start_date.split('T')[0] : '',
        due_date: strategy.due_date ? strategy.due_date.split('T')[0] : '',
        status: strategy.status || '',
        category: strategy.category || '',
        importance_percentage: strategy.importance_percentage || 0
      })
    } else {
      setFormData(getDefaultStrategyFormData())
    }
  }, [strategy, isOpen])

  // Calculate current total percentage excluding the edited strategy
  const currentTotal = useMemo(() => {
    const otherStrategies = allStrategies.filter(s => s.id !== strategy?.id)
    return otherStrategies.reduce((sum, s) => sum + (s.importance_percentage || 0), 0)
  }, [allStrategies, strategy?.id])

  // Calculate what the total would be with current form data
  const projectedTotal = useMemo(() => {
    return currentTotal + (formData.importance_percentage || 0)
  }, [currentTotal, formData.importance_percentage])

  // Validation check
  const isValid = useMemo(() => {
    if (!formData.importance_percentage || formData.importance_percentage === 0) {
      return true // Allow 0 or empty percentage
    }
    return projectedTotal <= 100
  }, [projectedTotal, formData.importance_percentage])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // Check 100% constraint
    if (!isValid) {
      setValidationError(`Total percentage cannot exceed 100%. Current total: ${projectedTotal}%`)
      return
    }
    
    setValidationError(null)
    
    // Convert dates to UTC format
    const processedFormData = {
      ...formData,
      start_date: new Date(formData.start_date + 'T00:00:00').toISOString(),
      due_date: new Date(formData.due_date + 'T23:59:59').toISOString()
    }
    
    onSave(processedFormData)
  }, [formData, onSave, isValid, projectedTotal])

  return (
    <>
      {/* Strategy Form Panel - Modal Style */}
      <div 
        className={`hidden md:block fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div 
          className="w-96 max-h-[85vh] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close Button */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-lg font-semibold text-purple-800">
              {strategy ? 'Edit Strategy' : 'New Strategy'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-purple-700/100 rounded transition-colors">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Form Content */}
          <form id="strategy-form" onSubmit={handleSubmit} className="px-6 py-4 overflow-y-auto min-h-0 flex-1 space-y-4">
            {/* Strategy Title */}
            <div>
              <label className="block text-xs font-medium text-purple-600 mb-1">Strategy Title *</label>
              <input
                type="text"
                value={formData.objective}
                onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
                required
                placeholder="Enter strategy objective..."
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

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-purple-600 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
              >
                <option value="">Select Category</option>
                {categoryOptions.map(category => (
                  <option key={category} value={category}>{category}</option>
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
              {/* Percentage info */}
              <div className="mt-1 text-xs">
                <span className={projectedTotal > 100 ? 'text-red-600' : 'text-purple-400'}>
                  Total: {projectedTotal}% / 100%
                </span>
                {projectedTotal > 100 && (
                  <span className="text-red-600 ml-2">⚠ Exceeds 100%</span>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-purple-600 mb-1">
                  Start Date *
                  <span className="text-xs text-purple-400 ml-1">(Strategy start date)</span>
                </label>
                <input
                  type="date"
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
                  Due Date *
                  <span className="text-xs text-purple-400 ml-1">(Strategy deadline)</span>
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md 
                            focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                            bg-white text-purple-700 text-sm
                            hover:border-gray-300 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-purple-600 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700 text-sm max-h-20
                          hover:border-gray-300 transition-all duration-200 resize-none"
                placeholder="Describe the strategy details..."
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
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              type="submit"
              form="strategy-form"
              disabled={!isValid && formData.importance_percentage !== 0}
              className={`w-full py-2.5 px-4 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500
                        transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md
                        ${!isValid && formData.importance_percentage !== 0
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
            >
              {strategy ? 'Update Strategy' : 'Create Strategy'}
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
              {strategy ? 'Edit Strategy' : 'New Strategy'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-purple-700/100 rounded transition-colors">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Mobile Form Content */}
          <form onSubmit={handleSubmit} className="p-4 overflow-y-auto min-h-0 flex-1 space-y-4">
            {/* Strategy Title */}
            <div>
              <label className="block text-sm font-medium text-purple-600 mb-2">Strategy Title *</label>
              <input
                type="text"
                value={formData.objective}
                onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700
                          hover:border-gray-300 transition-all duration-200"
                required
                placeholder="Enter strategy objective..."
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

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-purple-600 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700
                          hover:border-gray-300 transition-all duration-200"
              >
                <option value="">Select Category</option>
                {categoryOptions.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Importance Percentage - Mobile */}
            <div>
              <label className="block text-sm font-medium text-purple-600 mb-2">
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
                className={`w-full px-4 py-3 border rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700
                          hover:border-gray-300 transition-all duration-200
                          ${!isValid ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                placeholder="25"
              />
              {/* Percentage info - Mobile */}
              <div className="mt-2 text-sm">
                <span className={projectedTotal > 100 ? 'text-red-600' : 'text-purple-400'}>
                  Total: {projectedTotal}% / 100%
                </span>
                {projectedTotal > 100 && (
                  <span className="text-red-600 ml-2">⚠ Exceeds 100%</span>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-600 mb-2">
                  Start Date *
                  <span className="text-xs text-purple-400 ml-2">(Strategy start date)</span>
                </label>
                <input
                  type="date"
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
                  Due Date *
                  <span className="text-xs text-purple-400 ml-2">(Strategy deadline)</span>
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                            bg-white text-purple-700
                            hover:border-gray-300 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-purple-600 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-purple-700 max-h-24
                          hover:border-gray-300 transition-all duration-200 resize-none"
                placeholder="Describe the strategy details..."
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
                disabled={!isValid && formData.importance_percentage !== 0}
                className={`w-full py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                          transition-colors duration-200 font-medium shadow-md hover:shadow-lg
                          ${!isValid && formData.importance_percentage !== 0
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
              >
                {strategy ? 'Update Strategy' : 'Create Strategy'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}