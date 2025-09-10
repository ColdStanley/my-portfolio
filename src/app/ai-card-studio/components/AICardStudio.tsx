'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Column, ColumnCard } from '../types'
import { generateUniqueButtonName, generateUniqueTitle } from '../utils/cardUtils'
import ColumnComponent from './Column'
import CanvasSettingsModal from './CanvasSettingsModal'
import DeveloperPanel from './DeveloperPanel'
import { useWorkspaceStore } from '../store/workspaceStore'
import { useAdminAuth } from '../hooks/useAdminAuth'

export default function AICardStudio() {
  const { canvases, activeCanvasId, isLoading, saveError, columnExecutionStatus, hasUnsavedChanges, actions } = useWorkspaceStore()
  const { updateColumns, updateCanvases, clearSaveError, saveWorkspace, runColumnWorkflow, addCanvas, setActiveCanvas, setHasUnsavedChanges } = actions
  const { isAdmin } = useAdminAuth()
  const router = useRouter()
  
  // Get active canvas and its columns - auto-set if no active canvas
  useEffect(() => {
    if (canvases.length > 0 && !activeCanvasId) {
      setActiveCanvas(canvases[0].id)
    }
  }, [canvases, activeCanvasId, setActiveCanvas])
  
  const activeCanvas = canvases.find(canvas => canvas.id === activeCanvasId)
  const columns = activeCanvas?.columns || []
  
  // Show loading until data is properly loaded
  const isDataLoaded = canvases.length > 0 && activeCanvasId && activeCanvas
  
  const [showCardTypeModal, setShowCardTypeModal] = useState(false)
  const [cardTypeModalVisible, setCardTypeModalVisible] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string>('')
  const [insertAfterCardId, setInsertAfterCardId] = useState<string>('')
  
  // Canvas dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  // Settings modal state  
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [settingsCanvasId, setSettingsCanvasId] = useState('')
  
  // Global save state
  const [isSaving, setIsSaving] = useState(false)
  // hasUnsavedChanges现在来自store
  
  // Import functionality
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Developer Panel State - God Mode Access
  const [developerPanelOpen, setDeveloperPanelOpen] = useState(false)

  // 🔧 All hooks must be called before any conditional returns
  
  const addNewColumn = () => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    
    const newColumn: Column = {
      id: `col-${timestamp}-${randomId}`,
      cards: [{
        id: `info-${timestamp}-${randomId}`,
        type: 'info',
        title: generateUniqueTitle('New Card', canvases),
        description: 'Enter description...',
        justCreated: true
      }]
    }

    updateColumns(prev => [...prev, newColumn])
    
    // Mark as having unsaved changes
    setHasUnsavedChanges(true)

    // Remove justCreated flag after animation
    setTimeout(() => {
      updateColumns(prev => prev.map(col =>
        col.id === newColumn.id
          ? { ...col, cards: col.cards.map(card => ({ ...card, justCreated: undefined })) }
          : col
      ))
    }, 400)
  }

  const addCardToColumn = (columnId: string, cardType: 'info' | 'aitool', afterCardId?: string) => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)

    const newCard: ColumnCard = cardType === 'info' 
      ? {
          id: `info-${timestamp}-${randomId}`,
          type: 'info',
          title: generateUniqueTitle('New Card', canvases),
          description: ''
        }
      : {
          id: `aitool-${timestamp}-${randomId}`,
          type: 'aitool',
          buttonName: generateUniqueButtonName('Start', canvases),
          promptText: '',
          generatedContent: '',
          aiModel: 'deepseek'  // Default to DeepSeek
        }

    updateColumns(prev => prev.map(col =>
      col.id === columnId
        ? { 
            ...col, 
            cards: afterCardId 
              ? (() => {
                  const insertIndex = col.cards.findIndex(card => card.id === afterCardId) + 1
                  const newCards = [...col.cards]
                  newCards.splice(insertIndex, 0, { ...newCard, justCreated: true })
                  return newCards
                })()
              : [...col.cards, { ...newCard, justCreated: true }]
          }
        : col
    ))
    
    // Mark as having unsaved changes
    setHasUnsavedChanges(true)

    // Remove justCreated flag after animation
    setTimeout(() => {
      updateColumns(prev => prev.map(col =>
        col.id === columnId
          ? { 
              ...col, 
              cards: col.cards.map(card => 
                card.id === newCard.id 
                  ? { ...card, justCreated: undefined } 
                  : card
              ) 
            }
          : col
      ))
    }, 400)

    // Close modal
    handleCloseCardTypeModal()
  }

  const handleAddCard = (columnId: string, afterCardId?: string) => {
    setSelectedColumnId(columnId)
    setInsertAfterCardId(afterCardId || '')
    setShowCardTypeModal(true)
    setTimeout(() => setCardTypeModalVisible(true), 10)
  }

  const handleCloseCardTypeModal = () => {
    setCardTypeModalVisible(false)
    setTimeout(() => setShowCardTypeModal(false), 250)
  }

  // Import column functions
  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedData = JSON.parse(text)

      const timestamp = Date.now()
      
      let importedColumns: Column[] = []
      
      // Handle both old format (single Column) and array of Columns
      if (Array.isArray(importedData)) {
        // Array of columns
        importedColumns = importedData as Column[]
      } else if (importedData.cards) {
        // Single column
        importedColumns = [importedData as Column]
      } else {
        throw new Error('Invalid import format')
      }
      
      // Process columns to ensure unique IDs and names
      const processedColumns = importedColumns.map((column, colIndex) => {
        const colTimestamp = timestamp + colIndex * 1000
        const colRandomId = Math.random().toString(36).substr(2, 9)
        
        return {
          ...column,
          id: `col-${colTimestamp}-${colRandomId}`,
          cards: column.cards.map((card, cardIndex) => {
            const cardTimestamp = colTimestamp + cardIndex
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
      })
      
      // Add imported columns to the current active canvas
      updateCanvases(prev => prev.map(canvas => 
        canvas.id === activeCanvasId 
          ? { ...canvas, columns: [...canvas.columns, ...processedColumns] }
          : canvas
      ))

      // Auto-save after import
      await saveWorkspace()
      
      // 🔧 导入成功后同步缓存，确保刷新后能看到导入的内容
      actions.syncToCache()

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('Import error:', error)
      // Could add user feedback here
    }
  }

  // Canvas dropdown functions
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const handleCanvasSwitch = (canvasId: string) => {
    setActiveCanvas(canvasId)
    setDropdownOpen(false)
  }

  const handleManageCanvases = () => {
    setSettingsCanvasId(activeCanvasId || '')
    setSettingsModalOpen(true)
    setDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (dropdownOpen && !target.closest('[data-dropdown-container]')) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [dropdownOpen])

  // Settings modal functions
  const handleSettingsClose = () => {
    setSettingsModalOpen(false)
    setSettingsCanvasId('')
  }

  // Global save functions
  const handleGlobalSave = async () => {
    console.log('🔄 Global Save button clicked!', { hasUnsavedChanges, isSaving })
    setIsSaving(true)
    try {
      console.log('📤 Calling saveWorkspace...')
      await saveWorkspace()
      console.log('✅ saveWorkspace completed successfully')
      setHasUnsavedChanges(false) // 重置store中的状态
    } catch (error) {
      console.error('❌ Save failed:', error)
    } finally {
      setIsSaving(false)
      console.log('🏁 Global Save process finished')
    }
  }

  // 🔧 移除自动触发的hasUnsavedChanges
  // 现在只有用户点击卡片Save按钮时才设置hasUnsavedChanges=true

  // Developer Panel Keyboard Shortcut - God Mode Access
  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+D combination
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault()
        
        // Only allow if user has admin privileges
        if (isAdmin) {
          console.log('[DEVELOPER_PANEL] God Mode activated via keyboard shortcut')
          setDeveloperPanelOpen(prev => !prev)
        } else {
          console.warn('[DEVELOPER_PANEL] Access denied - insufficient privileges')
        }
      }
    }

    document.addEventListener('keydown', handleKeyboardShortcut)
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut)
    }
  }, [isAdmin])

  // Route change protection - prevent navigation with unsaved changes
  useEffect(() => {
    const handlePopstate = (event: PopStateEvent) => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm('您有未保存的更改，确定要离开吗？')
        if (!confirmed) {
          // Push current state back to prevent navigation
          window.history.pushState(null, '', window.location.href)
          event.preventDefault()
        }
      }
    }

    window.addEventListener('popstate', handlePopstate)
    return () => {
      window.removeEventListener('popstate', handlePopstate)
    }
  }, [hasUnsavedChanges])

  // 🔧 Use conditional rendering instead of conditional returns to maintain hook order
  if (isLoading || !isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span className="text-sm font-medium">Loading workspace...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <style>{`
        @keyframes gradient-flow {
          0% {
            background-position: 0% 50%;
            background-size: 200% 200%;
          }
          25% {
            background-position: 100% 25%;
            background-size: 220% 180%;
          }
          50% {
            background-position: 50% 100%;
            background-size: 180% 220%;
          }
          75% {
            background-position: 25% 0%;
            background-size: 240% 160%;
          }
          100% {
            background-position: 0% 50%;
            background-size: 200% 200%;
          }
        }
        
        @keyframes pulse-urgent {
          0% {
            transform: scale(1);
            box-shadow: 0 4px 14px -2px rgba(147, 51, 234, 0.4), 0 0 20px rgba(147, 51, 234, 0.2);
          }
          25% {
            transform: scale(1.02);
            box-shadow: 0 6px 20px -2px rgba(147, 51, 234, 0.5), 0 0 30px rgba(147, 51, 234, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 8px 25px -2px rgba(147, 51, 234, 0.6), 0 0 40px rgba(147, 51, 234, 0.4);
          }
          75% {
            transform: scale(1.02);
            box-shadow: 0 6px 20px -2px rgba(147, 51, 234, 0.5), 0 0 30px rgba(147, 51, 234, 0.3);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 4px 14px -2px rgba(147, 51, 234, 0.4), 0 0 20px rgba(147, 51, 234, 0.2);
          }
        }
        
        .animate-gradient-flow {
          animation: gradient-flow 12s ease-in-out infinite;
        }
        
        .animate-pulse-urgent {
          animation: pulse-urgent 2s ease-in-out infinite;
        }
      `}</style>
      
      {/* Save Error Notification */}
      {saveError && (
        <div className="fixed top-20 right-4 z-50 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm dark:text-red-300">{saveError}</span>
          <button 
            onClick={clearSaveError}
            className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Full screen layout - optimized spacing */}
      <div className="min-h-screen bg-white dark:bg-neutral-900 pt-16 px-6 pb-0">
        <div className="max-w-full mx-auto">
          {/* Header Navigation Bar */}
          <div className="flex items-center justify-between mb-6">
            {/* Left side - Title */}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AI Card Studio
            </h1>
            
            {/* Right side - All controls */}
            <div className="flex items-center gap-4">
              {/* Marketplace Button */}
              <a
                href="/ai-card-studio/marketplace"
                className="px-4 py-2 bg-white dark:bg-neutral-800 dark:bg-neutral-800 border border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 dark:hover:bg-purple-900/20 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Marketplace
              </a>
              
              {/* Save Status Indicator */}
              <div className="text-sm text-gray-500 dark:text-neutral-400">
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span className="text-purple-600 dark:text-purple-400 dark:text-purple-400">Saving...</span>
                  </div>
                ) : hasUnsavedChanges ? (
                  <span className="text-purple-600 dark:text-purple-400 dark:text-purple-400">Unsaved changes</span>
                ) : (
                  <span className="text-purple-600 dark:text-purple-400 dark:text-purple-400">All saved</span>
                )}
              </div>
              
              {/* Global Save Button */}
              <button
                onClick={handleGlobalSave}
                disabled={isSaving || !hasUnsavedChanges}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 relative ${
                  hasUnsavedChanges && !isSaving
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl animate-pulse-urgent'
                    : 'bg-gray-100 dark:bg-neutral-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
                }`}
                style={{
                  ...(hasUnsavedChanges && !isSaving && {
                    boxShadow: '0 4px 14px -2px rgba(147, 51, 234, 0.4), 0 0 20px rgba(147, 51, 234, 0.2)',
                    animation: 'pulse-urgent 2s ease-in-out infinite'
                  })
                }}
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Saving
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Save
                  </>
                )}
              </button>
              
              {/* Canvas Dropdown Selector */}
              <div className="relative" data-dropdown-container>
                {/* Dropdown Trigger */}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 dark:bg-neutral-800 border border-purple-200 dark:border-purple-700 rounded-lg text-purple-600 dark:text-purple-400 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 dark:hover:bg-purple-900/20 transition-all duration-200 min-w-[200px] justify-between"
                >
                  <span>{activeCanvas?.name || (canvases.length > 0 ? canvases[0].name : 'Loading...')}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-gray-200 dark:border-neutral-700 p-2 min-w-[200px]">
                    {/* Arrow pointing to button */}
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-white dark:bg-neutral-800 border-l border-t border-gray-200 dark:border-neutral-700 transform rotate-45"></div>
                    
                    {/* Canvas List */}
                    {canvases.map((canvas) => (
                      <button
                        key={canvas.id}
                        onClick={() => handleCanvasSwitch(canvas.id)}
                        className={`w-full px-3 py-2 text-sm rounded-md transition-all duration-150 text-left ${
                          canvas.id === activeCanvasId 
                            ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/50' 
                            : 'text-gray-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/50'
                        }`}
                      >
                        {canvas.name}
                      </button>
                    ))}
                    
                    {/* Separator */}
                    <hr className="my-2 border-gray-200 dark:border-neutral-700" />
                    
                    {/* Management Options */}
                    <button
                      onClick={handleManageCanvases}
                      className="w-full px-3 py-2 text-sm text-left text-gray-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/50 rounded-md transition-all duration-150 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Manage Canvases
                    </button>
                  </div>
                )}
              </div>
              
              {/* Add Canvas Button */}
              <button
                onClick={addCanvas}
                className="w-10 h-10 bg-white dark:bg-neutral-800 border border-purple-200 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg flex items-center justify-center transition-all duration-200"
                title="Add new canvas"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => {
                const container = document.querySelector('.horizontal-scroll-container')
                if (container) {
                  const startLeft = container.scrollLeft
                  const targetLeft = Math.max(0, startLeft - 480)
                  const startTime = performance.now()
                  
                  const animateScroll = (currentTime: number) => {
                    const elapsed = currentTime - startTime
                    const progress = Math.min(elapsed / 400, 1)
                    const easing = 1 - Math.pow(1 - progress, 3) // easeOut cubic
                    
                    container.scrollLeft = startLeft + (targetLeft - startLeft) * easing
                    
                    if (progress < 1) {
                      requestAnimationFrame(animateScroll)
                    }
                  }
                  
                  requestAnimationFrame(animateScroll)
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white dark:bg-neutral-800/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => {
                const container = document.querySelector('.horizontal-scroll-container')
                if (container) {
                  const startLeft = container.scrollLeft
                  const maxLeft = container.scrollWidth - container.clientWidth
                  const targetLeft = Math.min(maxLeft, startLeft + 480)
                  const startTime = performance.now()
                  
                  const animateScroll = (currentTime: number) => {
                    const elapsed = currentTime - startTime
                    const progress = Math.min(elapsed / 400, 1)
                    const easing = 1 - Math.pow(1 - progress, 3) // easeOut cubic
                    
                    container.scrollLeft = startLeft + (targetLeft - startLeft) * easing
                    
                    if (progress < 1) {
                      requestAnimationFrame(animateScroll)
                    }
                  }
                  
                  requestAnimationFrame(animateScroll)
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white dark:bg-neutral-800/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Content */}
            <div className="horizontal-scroll-container flex gap-3 items-start overflow-x-auto scrollbar-hide pb-0 h-[calc(100vh-125px)] px-12 transform-gpu will-change-scroll">
              {/* Render all columns */}
              {columns.map((column) => (
                <ColumnComponent
                  key={column.id}
                  column={column}
                  onAddCard={handleAddCard}
                  onInsertCard={handleAddCard}
                  onRunColumnWorkflow={runColumnWorkflow}
                  isColumnExecuting={columnExecutionStatus[column.id] || false}
                />
              ))}
              
              {/* Add new column button */}
              <button
                onClick={addNewColumn}
                className="flex-shrink-0 w-[230px] h-32 border border-dashed border-gray-200 dark:border-neutral-700 rounded-xl flex items-center justify-center text-gray-300 hover:border-purple-400 hover:text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20/30 transition-all duration-200"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm">Add Column</span>
                </div>
              </button>

              {/* Import column button */}
              <button
                onClick={handleImportClick}
                className="flex-shrink-0 w-[230px] h-32 border border-dashed border-gray-200 dark:border-neutral-700 rounded-xl flex items-center justify-center text-gray-300 hover:border-purple-400 hover:text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20/30 transition-all duration-200"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span className="text-sm">Import Column</span>
                </div>
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Type Selection Modal */}
      {showCardTypeModal && typeof document !== 'undefined' && createPortal(
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={handleCloseCardTypeModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-700 p-6 max-w-md w-full mx-4 pointer-events-auto transform transition-all duration-300 ease-out ${
              cardTypeModalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-neutral-200">Choose Card Type</h3>
                <button
                  onClick={handleCloseCardTypeModal}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => addCardToColumn(selectedColumnId, 'info', insertAfterCardId)}
                  className="w-full p-4 text-left border border-gray-200 dark:border-neutral-700 rounded-lg hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20/50 transition-all duration-200"
                >
                  <h4 className="font-medium text-gray-800 dark:text-neutral-200">Info Card</h4>
                  <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">Static information, instructions, or reference content</p>
                </button>
                
                <button
                  onClick={() => addCardToColumn(selectedColumnId, 'aitool', insertAfterCardId)}
                  className="w-full p-4 text-left border border-gray-200 dark:border-neutral-700 rounded-lg hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20/50 transition-all duration-200"
                >
                  <h4 className="font-medium text-gray-800 dark:text-neutral-200">AI Tool Card</h4>
                  <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">Interactive AI-powered content generation</p>
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Canvas Settings Modal */}
      <CanvasSettingsModal 
        isOpen={settingsModalOpen}
        onClose={handleSettingsClose}
        canvasId={settingsCanvasId}
      />

      {/* Developer Panel - God Mode Access */}
      {isAdmin && (
        <DeveloperPanel
          isVisible={developerPanelOpen}
          onClose={() => setDeveloperPanelOpen(false)}
        />
      )}
    </div>
  )
}