'use client'

import { useEffect } from 'react'

interface BottomSheetOption {
  value: string
  label: string
}

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (value: string) => void
  options: BottomSheetOption[]
  currentValue: string
  title: string
  loading?: boolean
}

export default function BottomSheet({
  isOpen,
  onClose,
  onSelect,
  options,
  currentValue,
  title,
  loading = false
}: BottomSheetProps) {
  
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSelect = (value: string) => {
    if (!loading) {
      onSelect(value)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30 transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="relative w-full bg-white rounded-t-xl shadow-xl transform transition-transform duration-300 ease-out animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-4 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 text-center">{title}</h3>
        </div>
        
        {/* Options */}
        <div className="max-h-80 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={loading}
              className={`w-full px-4 py-4 text-left text-base transition-colors border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                currentValue === option.value
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {currentValue === option.value && (
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {loading && currentValue === option.value && (
                  <div className="w-5 h-5">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {/* Cancel Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-3 text-base font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}