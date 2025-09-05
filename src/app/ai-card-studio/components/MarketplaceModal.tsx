'use client'

import { useState, useRef, useEffect } from 'react'
import Modal from './ui/Modal'

interface MarketplaceModalProps {
  isOpen: boolean
  onClose: () => void
  columnData: any
  onUpload: (data: { name: string; description: string; tags: string[]; columnData: any }) => Promise<void>
}

export default function MarketplaceModal({ isOpen, onClose, columnData, onUpload }: MarketplaceModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  
  const nameInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setDescription('')
      setTags('')
      setError('')
      setTimeout(() => {
        nameInputRef.current?.focus()
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
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }
  
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a column name')
      return
    }
    
    if (!description.trim()) {
      setError('Please enter a description')
      return
    }
    
    setIsUploading(true)
    setError('')
    
    try {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      await onUpload({
        name: name.trim(),
        description: description.trim(),
        tags: tagArray,
        columnData
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to upload to marketplace')
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg mx-4">
      <div
        ref={modalRef}
        className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Share to Marketplace
          </h3>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {/* Column Name */}
          <div>
            <label htmlFor="column-name" className="block text-sm font-medium text-gray-700 mb-2">
              Column Name *
            </label>
            <input
              ref={nameInputRef}
              id="column-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="Enter a descriptive name..."
              maxLength={100}
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="column-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="column-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 resize-none"
              placeholder="Describe what this column does and how it can be used..."
              maxLength={2000}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {description.length}/2000
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <label htmlFor="column-tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              id="column-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="e.g. productivity, writing, analysis (comma separated)"
            />
            <div className="text-xs text-gray-500 mt-1">
              Separate multiple tags with commas
            </div>
          </div>
          
          {/* Column Preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Column Preview</h4>
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Cards:</span>
                <span>{columnData?.cards?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>AI Tool Cards:</span>
                <span>{columnData?.cards?.filter((card: any) => card.type === 'aitool').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Info Cards:</span>
                <span>{columnData?.cards?.filter((card: any) => card.type === 'info').length || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading || !name.trim() || !description.trim()}
              className="px-6 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-all duration-150 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Share to Marketplace
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}