'use client'

import { useState, useEffect, useRef } from 'react'

interface DeleteConfirmTooltipProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  taskTitle: string
  triggerElement: HTMLElement | null
}

export default function DeleteConfirmTooltip({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  triggerElement
}: DeleteConfirmTooltipProps) {
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
    
    // Use default tooltip dimensions if not yet rendered
    const tooltipWidth = tooltipRef.current?.getBoundingClientRect().width || 256 // w-64 = 256px
    const tooltipHeight = tooltipRef.current?.getBoundingClientRect().height || 120 // estimated height
    
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
    onConfirm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={tooltipRef}
      className="bg-white border-2 border-purple-200 rounded-lg shadow-lg p-3 w-64"
      style={getTooltipPosition()}
    >
      <div className="text-sm">
        <div className="font-semibold text-purple-900 mb-2">
          Delete Task
        </div>
        
        <div className="text-gray-700 mb-3">
          Are you sure you want to permanently delete "{taskTitle}"? This action cannot be undone.
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md 
                     hover:bg-purple-700 transition-colors font-medium"
          >
            Delete Task
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
    </div>
  )
}