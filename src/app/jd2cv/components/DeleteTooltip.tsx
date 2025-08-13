import { useRef, useEffect } from 'react'

interface DeleteTooltipProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  triggerElement?: HTMLElement
}

export default function DeleteTooltip({
  isOpen,
  onClose,
  onConfirm,
  title,
  triggerElement
}: DeleteTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  // Position calculation
  const getTooltipPosition = () => {
    if (!triggerElement) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }

    const rect = triggerElement.getBoundingClientRect()
    return {
      top: `${rect.top - 8}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translate(-50%, -100%)'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div 
        ref={tooltipRef}
        style={getTooltipPosition()}
        className="absolute bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 p-3 pointer-events-auto min-w-48"
      >
        {/* Content */}
        <div className="space-y-3">
          <div className="text-sm text-gray-700">
            Delete <span className="font-medium text-gray-900">{title}</span>?
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="flex-1 px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/95"></div>
          <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
        </div>
      </div>
    </div>
  )
}