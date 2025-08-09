'use client'

import { useState, useRef, useEffect } from 'react'
import { useCVBuilderStore, CVModule as CVModuleType } from '../store/cvBuilderStore'
import { useDraggable } from '@dnd-kit/core'

interface CVModuleProps {
  module: CVModuleType
}

export default function CVModule({ module }: CVModuleProps) {
  const {
    updateModuleTitle,
    addItem,
    updateItem,
    deleteItem,
    resizeModule,
    deleteModule,
    selectModule,
    selectedModuleId,
    draggedModuleId
  } = useCVBuilderStore()
  
  const [isResizing, setIsResizing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const moduleRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)
  
  const isSelected = selectedModuleId === module.id
  const isDragging = draggedModuleId === module.id
  
  // DnD Kit draggable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingFromKit
  } = useDraggable({
    id: module.id,
  })
  
  // Auto-focus title input for new modules
  useEffect(() => {
    if (module.title === '' && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [module.title])
  
  // Resize functionality
  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.stopPropagation()
    e.preventDefault()
  }
  
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !moduleRef.current) return
    
    const containerWidth = window.innerWidth
    const rect = moduleRef.current.getBoundingClientRect()
    const newWidth = ((e.clientX - rect.left) / containerWidth) * 100
    
    resizeModule(module.id, Math.max(20, Math.min(80, newWidth)))
  }
  
  const handleResizeEnd = () => {
    setIsResizing(false)
  }
  
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [isResizing])
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateModuleTitle(module.id, e.target.value)
  }
  
  const handleItemChange = (index: number, value: string) => {
    updateItem(module.id, index, value)
  }
  
  const handleItemKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem(module.id, index + 1)
      
      // Focus next input after a brief delay
      setTimeout(() => {
        const nextInput = moduleRef.current?.querySelector(`[data-item-index="${index + 1}"]`) as HTMLInputElement
        if (nextInput) {
          nextInput.focus()
        }
      }, 100)
    } else if (e.key === 'Backspace' && module.items[index] === '' && module.items.length > 1) {
      e.preventDefault()
      deleteItem(module.id, index)
      
      // Focus previous input
      setTimeout(() => {
        const prevInput = moduleRef.current?.querySelector(`[data-item-index="${index - 1}"]`) as HTMLInputElement
        if (prevInput) {
          prevInput.focus()
        }
      }, 100)
    }
  }
  
  const handleDeleteModule = () => {
    if (showDeleteConfirm) {
      deleteModule(module.id)
      setShowDeleteConfirm(false)
    } else {
      setShowDeleteConfirm(true)
    }
  }
  
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }
  
  // Close delete confirmation when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDeleteConfirm) {
        setShowDeleteConfirm(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showDeleteConfirm])
  
  const style = {
    left: `${module.position.x}px`,
    top: `${module.position.y}px`,
    width: `${module.width}%`,
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDraggingFromKit ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      className={`absolute bg-gray-50 rounded-lg shadow-sm border transition-all duration-200 ${
        isSelected ? 'border-purple-300 shadow-lg' : 'border-gray-200'
      } ${isDragging ? 'shadow-xl scale-[1.02] z-50' : 'z-10'}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => selectModule(module.id)}
    >
      {/* Module Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            ref={moduleRef}
            {...attributes}
            {...listeners}
            className={`flex-shrink-0 p-1 rounded cursor-grab active:cursor-grabbing transition-colors ${
              isHovered ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-400'
            }`}
            title="Drag to move module"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="4" cy="4" r="1.5" />
              <circle cx="4" cy="10" r="1.5" />
              <circle cx="4" cy="16" r="1.5" />
              <circle cx="10" cy="4" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="16" r="1.5" />
            </svg>
          </button>
          
          {/* Title Input */}
          <input
            ref={titleInputRef}
            type="text"
            value={module.title}
            onChange={handleTitleChange}
            placeholder="Module Title..."
            className="text-lg font-semibold text-gray-800 bg-transparent border-none outline-none flex-1 placeholder-gray-400"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Action buttons - show on hover */}
          {isHovered && (
            <div className="flex items-center gap-1 ml-2">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={handleDeleteModule}
                    className="p-1 text-red-600 hover:bg-red-50 rounded text-xs font-medium"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="p-1 text-gray-500 hover:bg-gray-100 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteModule()
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded opacity-70 hover:opacity-100"
                  title="Delete Module"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM6 5v6h8V5H6z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Module Items */}
      <div className="px-4 pb-4">
        <div className="space-y-2">
          {module.items.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                onKeyDown={(e) => handleItemKeyDown(e, index)}
                placeholder="Enter content..."
                className="item-input flex-1 text-sm text-gray-700 bg-transparent border-none outline-none placeholder-gray-400"
                data-item-index={index}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Resize Handle */}
      {isHovered && (
        <div
          ref={resizeHandleRef}
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-50 hover:opacity-100"
          onMouseDown={handleResizeStart}
        >
          <div className="w-full h-full bg-purple-400 rounded-r-lg"></div>
        </div>
      )}
      
    </div>
  )
}