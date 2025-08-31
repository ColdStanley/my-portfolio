import { ReactNode } from 'react'

interface SettingsModalProps {
  isVisible: boolean
  title: string | ReactNode
  onClose: () => void
  onDelete?: () => void
  onSave?: () => void
  isSaving?: boolean
  saveSuccess?: boolean
  children: ReactNode
}

export default function SettingsModal({ 
  isVisible, 
  title, 
  onClose, 
  onDelete,
  onSave,
  isSaving = false,
  saveSuccess = false,
  children 
}: SettingsModalProps) {
  return (
    <div className={`bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-full transform transition-all duration-300 ease-out ${
      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-medium text-gray-800">{title}</div>
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
      <div className="flex justify-between items-center">
        {/* Save button and status */}
        {onSave && (
          <div className="flex items-center gap-3">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
            {saveSuccess && (
              <div className="flex items-center gap-1 text-purple-600 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </div>
            )}
          </div>
        )}
        
        {/* Delete button */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Delete Card
          </button>
        )}
      </div>
    </div>
  )
}