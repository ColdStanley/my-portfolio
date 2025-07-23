'use client'

import { useState, useEffect, useRef } from 'react'
import { getCurrentTorontoTime, toDatetimeLocal } from '../../utils/timezone'

interface TimeRecordTooltipProps {
  isOpen: boolean
  onClose: () => void
  onSave: (startTime?: string, endTime?: string) => void
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
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && task) {
      // Pre-fill with existing actual times if available
      setStartTime(task.actual_start ? toDatetimeLocal(task.actual_start) : '')
      setEndTime(task.actual_end ? toDatetimeLocal(task.actual_end) : '')
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
    
    onSave(startWithTz, endWithTz)
    onClose()
  }

  const getTooltipPosition = () => {
    if (!triggerElement || !tooltipRef.current) return {}
    
    const triggerRect = triggerElement.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    
    // Position above the trigger element
    const top = triggerRect.top - tooltipRect.height - 8
    const left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
    
    return {
      position: 'fixed' as const,
      top: `${Math.max(8, top)}px`,
      left: `${Math.max(8, Math.min(window.innerWidth - tooltipRect.width - 8, left))}px`,
      zIndex: 1000
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={tooltipRef}
      className="bg-white border-2 border-purple-200 rounded-lg shadow-lg p-4 w-80"
      style={getTooltipPosition()}
    >
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-purple-900 mb-1">Record Actual Time</h4>
        <p className="text-xs text-gray-600">Enter the actual execution time for this task</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-purple-700 mb-1">
            Actual Start Time
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
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={!startTime && !endTime}
          className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md 
                   hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
        >
          Save Time
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