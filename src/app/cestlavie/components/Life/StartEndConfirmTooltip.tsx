'use client'

import { useState, useEffect, useRef } from 'react'

interface StartEndConfirmTooltipProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (surveyData?: {
    quality_rating?: number
    is_plan_critical?: boolean
    next?: string
  }) => void
  action: 'start' | 'end'
  taskTitle: string
  triggerElement: HTMLElement | null
}

export default function StartEndConfirmTooltip({
  isOpen,
  onClose,
  onConfirm,
  action,
  taskTitle,
  triggerElement
}: StartEndConfirmTooltipProps) {
  const [qualityRating, setQualityRating] = useState<number>(0)
  const [isPlanCritical, setIsPlanCritical] = useState<boolean>(false)
  const [nextAction, setNextAction] = useState<string>('')
  const tooltipRef = useRef<HTMLDivElement>(null)

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

  const getTooltipPosition = () => {
    if (!triggerElement) return { position: 'fixed' as const, top: '50px', left: '50px', zIndex: 1000 }
    
    const triggerRect = triggerElement.getBoundingClientRect()
    
    // Use default tooltip dimensions if not yet rendered (adjust based on action type)
    const tooltipWidth = tooltipRef.current?.getBoundingClientRect().width || (action === 'end' ? 384 : 256) // w-96 for end, w-64 for start
    const tooltipHeight = tooltipRef.current?.getBoundingClientRect().height || (action === 'end' ? 350 : 120) // estimated height
    
    // Check if there's enough space to the right
    const spaceRight = window.innerWidth - triggerRect.right - 8
    
    let top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2)
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

  const handleConfirm = () => {
    if (action === 'end') {
      // For end action, include survey data
      const surveyData = {
        quality_rating: qualityRating > 0 ? qualityRating : undefined,
        is_plan_critical: isPlanCritical,
        next: nextAction.trim() || undefined
      }
      onConfirm(surveyData)
    } else {
      // For start action, no survey data needed
      onConfirm()
    }
    onClose()
  }

  const getActionText = () => {
    return action === 'start' ? 'start' : 'end'
  }

  if (!isOpen) return null

  return (
    <div
      ref={tooltipRef}
      className={`bg-white border-2 border-purple-200 rounded-lg shadow-lg p-3 ${
        action === 'end' ? 'w-96' : 'w-64'
      }`}
      style={getTooltipPosition()}
    >
      <div className="text-sm">
        <div className="font-semibold text-purple-900 mb-2">
          {action === 'start' ? 'Start Task' : 'End Task'}
        </div>
        
        <div className="text-gray-700 mb-3">
          Are you sure you want to {getActionText()} "{taskTitle}"?
        </div>

        {/* Survey for End Action */}
        {action === 'end' && (
          <div className="border-t border-purple-200 pt-3 mb-4">
            <h5 className="text-xs font-semibold text-purple-900 mb-3">Task Completion Survey</h5>
            
            {/* Quality Rating */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-purple-700 mb-2">
                Quality Rating (1-5 stars)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setQualityRating(rating)}
                    className={`w-6 h-6 text-sm ${
                      rating <= qualityRating 
                        ? 'text-yellow-500' 
                        : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    ⭐
                  </button>
                ))}
                {qualityRating > 0 && (
                  <button
                    type="button"
                    onClick={() => setQualityRating(0)}
                    className="ml-2 text-xs text-gray-500 underline hover:text-gray-700"
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
        )}

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 px-2 py-1 bg-purple-600 text-white text-xs rounded-md 
                     hover:bg-purple-700 transition-colors font-medium"
          >
            {action === 'start' ? 'Start Task' : 'Complete Task'}
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 text-purple-600 text-xs rounded-md border border-purple-200 
                     hover:bg-purple-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}