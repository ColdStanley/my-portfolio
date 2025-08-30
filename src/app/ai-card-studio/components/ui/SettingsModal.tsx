import { ReactNode } from 'react'

interface SettingsModalProps {
  isVisible: boolean
  title: string
  onClose: () => void
  onDelete?: () => void
  children: ReactNode
}

export default function SettingsModal({ 
  isVisible, 
  title, 
  onClose, 
  onDelete, 
  children 
}: SettingsModalProps) {
  return (
    <div className={`bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-full transform transition-all duration-300 ease-out ${
      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="mb-6">
        {children}
      </div>
      
      {/* Footer */}
      {onDelete && (
        <div className="flex justify-end">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Delete Card
          </button>
        </div>
      )}
    </div>
  )
}