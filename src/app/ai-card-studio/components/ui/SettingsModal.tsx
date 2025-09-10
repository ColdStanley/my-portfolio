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
  headerActions?: ReactNode // New prop for additional header buttons
}

export default function SettingsModal({ 
  isVisible, 
  title, 
  onClose, 
  onDelete,
  onSave,
  isSaving = false,
  saveSuccess = false,
  children,
  headerActions
}: SettingsModalProps) {
  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-700 p-6 w-full transform transition-all duration-300 ease-out ${
      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-medium text-gray-800 dark:text-neutral-200">{title}</div>
        <div className="flex items-center gap-2">
          {headerActions && <div>{headerActions}</div>}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="mb-6">
        {children}
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center">
        {/* Delete button - Left side */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Delete
          </button>
        )}
        
        {/* Save button and status - Right side */}
        {onSave && (
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved! Don't forget to save your workspace
              </div>
            )}
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}