'use client'

import { useState, useEffect, useCallback } from 'react'

interface StrategyRecord {
  id: string
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  category: string
}

interface StrategyFormData {
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  category: string
}

interface StrategyFormPanelProps {
  isOpen: boolean
  onClose: () => void
  strategy?: StrategyRecord | null
  onSave: (strategy: StrategyFormData) => void
  statusOptions: string[]
  priorityOptions: string[]
  categoryOptions: string[]
}

const getDefaultDate = (): string => {
  const now = new Date()
  return now.getFullYear() + '-' +
         String(now.getMonth() + 1).padStart(2, '0') + '-' +
         String(now.getDate()).padStart(2, '0')
}

export default function StrategyFormPanel({ 
  isOpen, 
  onClose, 
  strategy, 
  onSave, 
  statusOptions, 
  priorityOptions, 
  categoryOptions
}: StrategyFormPanelProps) {
  const [formData, setFormData] = useState<StrategyFormData>({
    objective: '',
    description: '',
    start_date: '',
    due_date: '',
    status: '',
    priority_quadrant: '',
    category: ''
  })

  // Initialize form data when strategy changes
  useEffect(() => {
    if (strategy) {
      setFormData({
        objective: strategy.objective || '',
        description: strategy.description || '',
        start_date: strategy.start_date ? strategy.start_date.split('T')[0] : '',
        due_date: strategy.due_date ? strategy.due_date.split('T')[0] : '',
        status: strategy.status || '',
        priority_quadrant: strategy.priority_quadrant || '',
        category: strategy.category || ''
      })
    } else {
      const defaultDate = getDefaultDate()
      
      setFormData({
        objective: '',
        description: '',
        start_date: defaultDate,
        due_date: defaultDate,
        status: '',
        priority_quadrant: '',
        category: ''
      })
    }
  }, [strategy, isOpen])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert dates to UTC format
    const processedFormData = {
      ...formData,
      start_date: new Date(formData.start_date + 'T00:00:00').toISOString(),
      due_date: new Date(formData.due_date + 'T23:59:59').toISOString()
    }
    
    onSave(processedFormData)
  }, [formData, onSave])

  return (
    <>
      {/* Strategy Form Panel - Sidebar Style Drawer */}
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
            {strategy ? 'Edit Strategy' : 'New Strategy'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-3 overflow-y-auto min-h-0 flex-1 space-y-3">
          {/* Strategy Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Strategy Title *</label>
            <input
              type="text"
              value={formData.objective}
              onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-md 
                        focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700 text-sm
                        hover:border-gray-300 transition-all duration-200"
              required
              placeholder="Enter strategy objective..."
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

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-md 
                        focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700 text-sm
                        hover:border-gray-300 transition-all duration-200"
            >
              <option value="">Select Category</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Date Range - 2 Row Layout */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Date *
                <span className="text-xs text-gray-400 ml-1">(Strategy start date)</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-gray-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Due Date *
                <span className="text-xs text-gray-400 ml-1">(Strategy deadline)</span>
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-gray-700 text-sm
                          hover:border-gray-300 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-md 
                        focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700 text-sm max-h-20
                        hover:border-gray-300 transition-all duration-200 resize-none"
              placeholder="Describe the strategy details..."
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
              {strategy ? 'Update Strategy' : 'Create Strategy'}
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
            {strategy ? 'Edit Strategy' : 'New Strategy'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Form Content */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto min-h-0 flex-1 space-y-4">
          {/* Strategy Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Strategy Title *</label>
            <input
              type="text"
              value={formData.objective}
              onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700
                        hover:border-gray-300 transition-all duration-200"
              required
              placeholder="Enter strategy objective..."
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

          {/* Priority */}
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

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700
                        hover:border-gray-300 transition-all duration-200"
            >
              <option value="">Select Category</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Start Date *
                <span className="text-xs text-gray-400 ml-2">(Strategy start date)</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-gray-700
                          hover:border-gray-300 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Due Date *
                <span className="text-xs text-gray-400 ml-2">(Strategy deadline)</span>
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                          bg-white text-gray-700
                          hover:border-gray-300 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        bg-white text-gray-700 max-h-24
                        hover:border-gray-300 transition-all duration-200 resize-none"
              placeholder="Describe the strategy details..."
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
              {strategy ? 'Update Strategy' : 'Create Strategy'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}