'use client'

import { useState, useEffect, useRef } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'

interface CanvasSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  canvasId: string
}

export default function CanvasSettingsModal({ isOpen, onClose, canvasId }: CanvasSettingsModalProps) {
  const { canvases, actions } = useWorkspaceStore()
  const { renameCanvas, deleteCanvas } = actions
  
  const canvas = canvases.find(c => c.id === canvasId)
  const [name, setName] = useState(canvas?.name || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const nameInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  
  // Update name when canvas changes
  useEffect(() => {
    if (canvas) {
      setName(canvas.name)
    }
  }, [canvas])
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus()
        nameInputRef.current?.select()
      }, 100)
    }
  }, [isOpen])
  
  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])
  
  const handleSave = () => {
    if (canvasId && name.trim()) {
      renameCanvas(canvasId, name.trim())
    }
    onClose()
  }
  
  const handleDelete = () => {
    if (canvasId) {
      deleteCanvas(canvasId)
    }
    onClose()
  }
  
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }
  
  if (!isOpen || !canvas) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 dark:border-neutral-700/50 p-6 w-96 max-w-sm mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 lakers:from-lakers-300 lakers:to-lakers-400 anno:from-anno-300 anno:to-anno-400 cyberpunk:from-cyberpunk-300 cyberpunk:to-cyberpunk-400 bg-clip-text text-transparent">
            Manage Canvases
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="canvas-name" className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Canvas Name
            </label>
            <input
              ref={nameInputRef}
              id="canvas-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter canvas name..."
            />
          </div>
          
          {/* Canvas Info */}
          <div className="text-sm text-gray-500 dark:text-neutral-400 bg-gray-50 dark:bg-neutral-900/50 rounded-lg p-3 mb-4">
            <div className="flex justify-between">
              <span>Columns:</span>
              <span>{canvas.columns.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Cards:</span>
              <span>{canvas.columns.reduce((total, col) => total + col.cards.length, 0)}</span>
            </div>
          </div>
          
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {canvases.length > 1 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-150"
                >
                  Delete Canvas
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 lakers:bg-lakers-300 lakers:hover:bg-lakers-400 anno:bg-anno-600 anno:hover:bg-anno-700 cyberpunk:bg-cyberpunk-600 cyberpunk:hover:bg-cyberpunk-700 text-white rounded-lg transition-all duration-150"
              >
                Save
              </button>
            </div>
          </div>
        </div>
        
        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="text-center p-4">
              <div className="mb-3">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h4 className="font-semibold text-gray-900 dark:text-neutral-100 mb-1">Delete Canvas?</h4>
                <p className="text-sm text-gray-500 dark:text-neutral-400">This action cannot be undone.</p>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-md transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 lakers:bg-lakers-300 lakers:hover:bg-lakers-400 anno:bg-anno-600 anno:hover:bg-anno-700 cyberpunk:bg-cyberpunk-600 cyberpunk:hover:bg-cyberpunk-700 text-white rounded-md transition-all duration-150"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}