'use client'

import { useState, useRef, useEffect } from 'react'
import { extractTimeOnly, extractDateOnly } from '../../utils/timezone'

interface TimeComparisonTooltipProps {
  task: any
  children: React.ReactNode
}

export default function TimeComparisonTooltip({ task, children }: TimeComparisonTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const hasTimeData = task.start_date || task.actual_start || task.actual_end

  const handleMouseEnter = () => {
    if (!hasTimeData) return
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setIsVisible(true)
    
    // Calculate position
    if (triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      
      const top = triggerRect.top - tooltipRect.height - 8
      const left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      
      setPosition({
        top: Math.max(8, top),
        left: Math.max(8, Math.min(window.innerWidth - tooltipRect.width - 8, left))
      })
    }
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 300) // 300ms delay to allow moving to tooltip
  }

  const handleTooltipMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleTooltipMouseLeave = () => {
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const formatTimeComparison = () => {
    const plannedDate = task.start_date ? extractDateOnly(task.start_date) : null
    const plannedStart = task.start_date ? extractTimeOnly(task.start_date) : null
    const plannedEnd = task.end_date ? extractTimeOnly(task.end_date) : null
    
    const actualStart = task.actual_start ? extractTimeOnly(task.actual_start) : null
    const actualEnd = task.actual_end ? extractTimeOnly(task.actual_end) : null
    
    return {
      plannedDate,
      plannedStart,
      plannedEnd,
      actualStart,
      actualEnd
    }
  }

  if (!hasTimeData) {
    return <div ref={triggerRef}>{children}</div>
  }

  const timeData = formatTimeComparison()

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed bg-white border-2 border-purple-200 rounded-lg shadow-lg p-3 w-64 z-50"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="text-sm">
            <div className="font-semibold text-purple-900 mb-2">Time Comparison</div>
            
            {/* Planned Time */}
            <div className="mb-2">
              <div className="text-xs font-medium text-gray-600 mb-1">Planned Time:</div>
              <div className="text-sm text-gray-800">
                {timeData.plannedStart && timeData.plannedEnd 
                  ? `${timeData.plannedStart} - ${timeData.plannedEnd}`
                  : 'Not scheduled'
                }
              </div>
            </div>
            
            {/* Actual Time */}
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Actual Time:</div>
              <div className="text-sm text-gray-800">
                {timeData.actualStart || timeData.actualEnd ? (
                  <>
                    {timeData.actualStart && (
                      <span className="text-purple-600">Started: {timeData.actualStart}</span>
                    )}
                    {timeData.actualStart && timeData.actualEnd && <br />}
                    {timeData.actualEnd && (
                      <span className="text-purple-600">Ended: {timeData.actualEnd}</span>
                    )}
                  </>
                ) : (
                  'Not recorded'
                )}
              </div>
            </div>
            
            {/* Status indicator */}
            {timeData.actualStart && timeData.actualEnd && timeData.plannedStart && timeData.plannedEnd && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  {timeData.actualStart === timeData.plannedStart && timeData.actualEnd === timeData.plannedEnd
                    ? '✅ Executed as planned'
                    : '⏰ Off-schedule execution'
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}