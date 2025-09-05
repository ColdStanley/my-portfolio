'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MarketplaceItem, Column } from '../../types'
import { generateUniqueButtonName, generateUniqueTitle } from '../../utils/cardUtils'
import { useWorkspaceStore } from '../../store/workspaceStore'

interface PreviewModalProps {
  itemId: string | null
  onClose: () => void
}

export default function PreviewModal({ itemId, onClose }: PreviewModalProps) {
  const [item, setItem] = useState<MarketplaceItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  
  const modalRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { canvases, activeCanvasId, actions } = useWorkspaceStore()
  const { updateCanvases, saveWorkspace } = actions

  // Fetch item details when itemId changes
  useEffect(() => {
    if (itemId) {
      fetchItemDetails()
    } else {
      setItem(null)
      setError('')
    }
  }, [itemId])

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (itemId) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [itemId, onClose])

  const fetchItemDetails = async () => {
    if (!itemId) return

    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/marketplace/${itemId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch item details')
      }

      const data = await response.json()
      setItem(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!item || !item.data) {
      console.log('Import failed: No item or item data')
      return
    }

    // Check if workspace is loaded
    if (canvases.length === 0 || !activeCanvasId) {
      console.error('Workspace not loaded - canvases:', canvases.length, 'activeCanvasId:', activeCanvasId)
      setError('Workspace not loaded. Please return to AI Card Studio first, then try importing again.')
      return
    }

    try {
      setImporting(true)
      console.log('Starting import process for item:', item.id)
      console.log('Current canvases before import:', canvases.length)
      console.log('Active canvas ID:', activeCanvasId)
      
      // Generate new IDs for the column and all cards to avoid conflicts
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substr(2, 9)
      
      const importedColumn: Column = {
        id: `col-${timestamp}-${randomId}`,
        cards: item.data.cards.map((card, cardIndex) => {
          const cardTimestamp = timestamp + cardIndex
          const cardRandomId = Math.random().toString(36).substr(2, 9)
          
          if (card.type === 'info') {
            return {
              ...card,
              id: `info-${cardTimestamp}-${cardRandomId}`,
              title: generateUniqueTitle(card.title || 'Imported Card', canvases)
            }
          } else {
            return {
              ...card,
              id: `aitool-${cardTimestamp}-${cardRandomId}`,
              buttonName: generateUniqueButtonName(card.buttonName || 'Imported Tool', canvases)
            }
          }
        })
      }

      console.log('Generated imported column:', importedColumn)

      // Add metadata to mark this as imported from marketplace
      const importedColumnWithMetadata = {
        ...importedColumn,
        metadata: {
          source: 'marketplace',
          originalId: item.id,
          importedAt: new Date().toISOString(),
          originalName: item.name
        }
      }

      console.log('Adding column to active canvas:', activeCanvasId)
      
      // Add to the current active canvas
      updateCanvases(prev => {
        console.log('UpdateCanvases called with prev:', prev.length, 'canvases')
        const updated = prev.map(canvas => {
          if (canvas.id === activeCanvasId) {
            console.log('Found active canvas, adding column. Current columns:', canvas.columns.length)
            return { ...canvas, columns: [...canvas.columns, importedColumnWithMetadata] }
          }
          return canvas
        })
        console.log('UpdateCanvases returning:', updated.length, 'canvases')
        return updated
      })

      // Increment download count
      console.log('Incrementing download count for item:', itemId)
      await fetch(`/api/marketplace/${itemId}`, {
        method: 'PUT'
      })

      // Auto-save after import
      console.log('Saving workspace after import')
      await saveWorkspace()

      // Close modal and redirect back to studio
      console.log('Import completed, redirecting to studio')
      onClose()
      router.push('/ai-card-studio')

    } catch (error: any) {
      setError(error.message || 'Failed to import column')
    } finally {
      setImporting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!itemId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center gap-3 text-purple-600">
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span className="font-medium">Loading preview...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-red-600">Error</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        ) : item ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-800 truncate">{item.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  by {item.author_name} • {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-3 ml-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">{item.downloads}</div>
                  <div className="text-xs text-gray-500">downloads</div>
                </div>
                
                <button
                  onClick={onClose}
                  disabled={importing}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col h-[calc(90vh-200px)]">
              {/* Description and Tags */}
              <div className="p-6 border-b border-gray-200">
                <p className="text-gray-600 mb-4">{item.description}</p>
                
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Column Preview */}
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Column Preview</h3>
                
                {item.data?.cards && item.data.cards.length > 0 ? (
                  <div className="space-y-4">
                    {item.data.cards.map((card, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800">
                            {card.type === 'info' ? card.title : card.buttonName}
                          </h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            card.type === 'info' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {card.type === 'info' ? 'Info Card' : 'AI Tool Card'}
                          </span>
                        </div>
                        
                        {card.type === 'info' && card.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{card.description}</p>
                        )}
                        
                        {card.type === 'aitool' && card.promptText && (
                          <p className="text-sm text-gray-600 line-clamp-2">{card.promptText}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No cards to preview</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={onClose}
                disabled={importing}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-all duration-150 flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Import to Studio
                  </>
                )}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}