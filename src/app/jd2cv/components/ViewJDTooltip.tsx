import { useRef, useEffect } from 'react'

interface ViewJDTooltipProps {
  isOpen: boolean
  onClose: () => void
  title: string
  company: string
  fullJobDescription: string
}

export default function ViewJDTooltip({
  isOpen,
  onClose,
  title,
  company,
  fullJobDescription
}: ViewJDTooltipProps) {
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
      // Prevent body scroll when tooltip is open
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div 
        ref={tooltipRef}
        className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
        style={{ width: '800px' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1 mr-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
            <p className="text-sm text-gray-600">{company}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
            aria-label="Close job description"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 p-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md h-full">
            <div className="h-full overflow-y-auto p-4">
              {fullJobDescription ? (
                <pre className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 font-sans">
                  {fullJobDescription}
                </pre>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm0 6h6v2H7v-2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-500 text-sm">No job description available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-32 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}