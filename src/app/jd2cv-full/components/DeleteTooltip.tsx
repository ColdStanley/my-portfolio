import { useRef, useEffect, useState } from 'react'

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
  const [isAnimating, setIsAnimating] = useState(false)

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
      setTimeout(() => setIsAnimating(true), 10) // 微延迟触发动画
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  // Position calculation - 左侧很近的位置
  const getTooltipPosition = () => {
    if (!triggerElement) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }

    const rect = triggerElement.getBoundingClientRect()
    return {
      top: `${rect.top + rect.height / 2}px`,
      left: `${rect.left - 8}px`, // 按钮左侧很近，只偏移8px
      transform: 'translate(-100%, -50%)'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div 
        ref={tooltipRef}
        style={getTooltipPosition()}
        className={`absolute bg-white/95 backdrop-blur-md rounded-lg shadow-xl p-3 pointer-events-auto transition-all duration-200 ease-out ${
          isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        {/* 简洁文案 */}
        <div className="text-xs text-gray-600 mb-2 whitespace-nowrap">Delete?</div>
        
        {/* 简洁按钮 */}
        <div className="flex gap-1">
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-all duration-150 hover:scale-105"
          >
            No
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="px-2 py-1 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded transition-all duration-150 hover:scale-105 shadow-md"
          >
            Yes
          </button>
        </div>

        {/* 箭头指向右侧（按钮方向） */}
        <div className="absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2">
          <div className="w-0 h-0 border-l-3 border-r-0 border-t-3 border-b-3 border-transparent border-l-white/95"></div>
        </div>
      </div>
    </div>
  )
}