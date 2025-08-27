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
        className="absolute bg-white/95 backdrop-blur-md rounded-lg shadow-xl p-3 pointer-events-auto"
      >
        {/* Minimal Content */}
        <div className="text-xs text-gray-600 mb-2 whitespace-nowrap">Delete?</div>
        
        {/* Minimal Actions */}
        <div className="flex gap-1">
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
          >
            No
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
          >
            Yes
          </button>
        </div>

        {/* Simple Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-white/95"></div>
        </div>
      </div>
    </div>
  )
}