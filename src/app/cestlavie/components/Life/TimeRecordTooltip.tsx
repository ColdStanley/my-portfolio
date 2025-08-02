'use client'

import { useState, useEffect, useRef } from 'react'
import { getCurrentTorontoTime, toDatetimeLocal } from '../../utils/timezone'

interface TimeRecordTooltipProps {
  isOpen: boolean
  onClose: () => void
  onSave: (startTime?: string, endTime?: string, surveyData?: {
    quality_rating?: number
    is_plan_critical?: boolean
    next?: string
  }) => void
  task: any
  triggerElement: HTMLElement | null
}

export default function TimeRecordTooltip({
  isOpen,
  onClose,
  onSave,
  task,
  triggerElement
}: TimeRecordTooltipProps) {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [qualityRating, setQualityRating] = useState<number>(0)
  const [isPlanCritical, setIsPlanCritical] = useState<boolean>(false)
  const [nextAction, setNextAction] = useState<string>('')
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && task) {
      // Pre-fill with existing actual times if available, otherwise use scheduled times as defaults
      setStartTime(
        task.actual_start 
          ? toDatetimeLocal(task.actual_start) 
          : task.start_date 
            ? toDatetimeLocal(task.start_date) 
            : ''
      )
      setEndTime(
        task.actual_end 
          ? toDatetimeLocal(task.actual_end) 
          : task.end_date 
            ? toDatetimeLocal(task.end_date) 
            : ''
      )
      
      // Pre-fill survey data - always start fresh for Complete Early action
      setQualityRating(0) // Always start with 0 stars (gray) for new evaluation
      setIsPlanCritical(task.is_plan_critical || false)
      setNextAction(task.next || '')
    }
  }, [isOpen, task])

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
          onClose()
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleSave = () => {
    // Convert to Toronto timezone format before saving
    const startWithTz = startTime ? `${startTime}:00-04:00` : undefined
    const endWithTz = endTime ? `${endTime}:00-04:00` : undefined
    
    // Prepare survey data
    const surveyData = {
      quality_rating: qualityRating > 0 ? qualityRating : undefined,
      is_plan_critical: isPlanCritical,
      next: nextAction.trim() || undefined
    }
    
    onSave(startWithTz, endWithTz, surveyData)
    onClose()
  }

  const getTooltipPosition = () => {
    if (!triggerElement) return { position: 'fixed' as const, top: '50px', left: '50px', zIndex: 1000 }
    
    const triggerRect = triggerElement.getBoundingClientRect()
    
    // Use default tooltip dimensions if not yet rendered
    const tooltipWidth = tooltipRef.current?.getBoundingClientRect().width || 384 // w-96 = 384px
    const tooltipHeight = tooltipRef.current?.getBoundingClientRect().height || 400 // estimated height for survey form
    
    // Check if there's enough space to the right
    const spaceRight = window.innerWidth - triggerRect.right - 8
    
    const top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2)
    let left = triggerRect.right + 8
    
    // If not enough space on the right, position to the left
    if (spaceRight < tooltipWidth) {
      left = triggerRect.left - tooltipWidth - 8
    }
    
    return {
      position: 'fixed' as const,
      top: `${Math.max(8, Math.min(window.innerHeight - tooltipHeight - 8, top))}px`,
      left: `${Math.max(8, left)}px`,
      zIndex: 1000
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={tooltipRef}
      className="bg-white border-2 border-purple-200 rounded-lg shadow-lg p-4 w-96"
      style={getTooltipPosition()}
    >
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-purple-900 mb-1">Complete Task Early</h4>
        <p className="text-xs text-gray-600">Record execution time and task completion survey</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-purple-700 mb-1">
            Actual Start Time
            <span className="text-xs text-gray-500 ml-1">(defaults to scheduled time)</span>
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-purple-200 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            step="60"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-purple-700 mb-1">
            Actual End Time
            <span className="text-xs text-gray-500 ml-1">(defaults to scheduled time)</span>
          </label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-purple-200 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            step="60"
          />
        </div>

        {/* Task Completion Survey */}
        <div className="border-t border-purple-200 pt-3 mt-4">
          <h5 className="text-xs font-semibold text-purple-900 mb-3">Task Completion Survey</h5>
          
          {/* Quality Rating */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-purple-700 mb-2">
              Quality Rating (1-5 stars)
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setQualityRating(rating)}
                  className={`w-6 h-6 text-lg transition-colors duration-150 ${
                    rating <= qualityRating 
                      ? 'text-yellow-500' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  ⭐
                </button>
              ))}
              {qualityRating > 0 && (
                <button
                  type="button"
                  onClick={() => setQualityRating(0)}
                  className="ml-2 text-xs text-gray-500 underline hover:text-gray-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Critical Task Checkbox */}
          <div className="mb-3">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={isPlanCritical}
                onChange={(e) => setIsPlanCritical(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-purple-200 rounded 
                         focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-purple-700 font-medium">This is a critical task</span>
            </label>
          </div>

          {/* Next Action */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-purple-700 mb-1">
              Next Action (optional)
            </label>
            <textarea
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="What's the next step or follow-up action?"
              className="w-full px-3 py-2 text-sm border border-purple-200 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                       resize-none"
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={!startTime && !endTime}
          className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md 
                   hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
        >
          Complete Task
        </button>
        <button
          onClick={onClose}
          className="px-3 py-2 text-purple-600 text-sm rounded-md border border-purple-200 
                   hover:bg-purple-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}