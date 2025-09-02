'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Column, ColumnCard } from '../types'
import { generateUniqueButtonName, generateUniqueTitle } from '../utils/cardUtils'
import { useCardDeletion } from '../hooks/useCardDeletion'
import ColumnComponent from './Column'
import { useWorkspaceStore } from '../store/workspaceStore'

export default function AICardStudio() {
  const { columns, isLoading, saveError, columnExecutionStatus, actions } = useWorkspaceStore()
  const { updateColumns, clearSaveError, saveWorkspace, runColumnWorkflow } = actions
  const { deleteCard } = useCardDeletion(columns, updateColumns)
  
  const [showCardTypeModal, setShowCardTypeModal] = useState(false)
  const [cardTypeModalVisible, setCardTypeModalVisible] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string>('')
  const [insertAfterCardId, setInsertAfterCardId] = useState<string>('')
  
  // Import functionality
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Show loading while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="flex items-center gap-3 text-purple-600">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span className="text-sm font-medium">Loading workspace...</span>
        </div>
      </div>
    )
  }

  const addNewColumn = () => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    
    const newColumn: Column = {
      id: `col-${timestamp}-${randomId}`,
      cards: [{
        id: `info-${timestamp}-${randomId}`,
        type: 'info',
        title: generateUniqueTitle('New Card', columns),
        description: 'Enter description...',
        justCreated: true
      }]
    }

    updateColumns(prev => [...prev, newColumn])

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
          title: generateUniqueTitle('New Card', columns),
          description: ''
        }
      : {
          id: `aitool-${timestamp}-${randomId}`,
          type: 'aitool',
          buttonName: generateUniqueButtonName('Start', columns),
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
      const importedColumn = JSON.parse(text) as Column

      // Generate new unique IDs for the column and all cards
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substr(2, 9)
      
      const newColumn: Column = {
        ...importedColumn,
        id: `col-${timestamp}-${randomId}`,
        cards: importedColumn.cards.map((card, index) => {
          const cardTimestamp = timestamp + index
          const cardRandomId = Math.random().toString(36).substr(2, 9)
          
          if (card.type === 'info') {
            return {
              ...card,
              id: `info-${cardTimestamp}-${cardRandomId}`,
              title: generateUniqueTitle(card.title || 'Imported Card', columns)
            }
          } else {
            return {
              ...card,
              id: `aitool-${cardTimestamp}-${cardRandomId}`,
              buttonName: generateUniqueButtonName(card.buttonName || 'Imported Tool', columns)
            }
          }
        })
      }

      // Add the new column
      updateColumns(prev => [...prev, newColumn])

      // Auto-save after import
      await saveWorkspace()

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('Import error:', error)
      // Could add user feedback here
    }
  }

  return (
    <>
      <style jsx global>{`
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
        
        .animate-gradient-flow {
          animation: gradient-flow 12s ease-in-out infinite;
        }
      `}</style>
      <div>
      {/* Save Error Notification */}
      {saveError && (
        <div className="fixed top-20 right-4 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{saveError}</span>
          <button 
            onClick={clearSaveError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Full screen layout - no L-shaped offset */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 pb-0 animate-gradient-flow">
        <div className="max-w-full mx-auto">
          {/* 简化的标题 */}
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AI Card Studio
            </h1>
          </div>
          
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => {
                const container = document.querySelector('.horizontal-scroll-container')
                if (container) {
                  container.scrollBy({ left: -480, behavior: 'smooth' })
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
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
                  container.scrollBy({ left: 480, behavior: 'smooth' })
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Content */}
            <div className="horizontal-scroll-container flex gap-3 items-start overflow-x-auto scrollbar-hide pb-0 h-[calc(100vh-125px)] px-12">
              {/* Render all columns */}
              {columns.map((column) => (
                <ColumnComponent
                  key={column.id}
                  column={column}
                  onAddCard={handleAddCard}
                  onDeleteCard={deleteCard}
                  onInsertCard={handleAddCard}
                  onRunColumnWorkflow={runColumnWorkflow}
                  isColumnExecuting={columnExecutionStatus[column.id] || false}
                />
              ))}
              
              {/* Add new column button */}
              <button
                onClick={addNewColumn}
                className="flex-shrink-0 w-[230px] h-32 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/30 transition-all duration-200"
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
                className="flex-shrink-0 w-[230px] h-32 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/30 transition-all duration-200"
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
            <div className={`bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md w-full mx-4 pointer-events-auto transform transition-all duration-300 ease-out ${
              cardTypeModalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Choose Card Type</h3>
                <button
                  onClick={handleCloseCardTypeModal}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => addCardToColumn(selectedColumnId, 'info', insertAfterCardId)}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200"
                >
                  <h4 className="font-medium text-gray-800">Info Card</h4>
                  <p className="text-sm text-gray-600 mt-1">Static information, instructions, or reference content</p>
                </button>
                
                <button
                  onClick={() => addCardToColumn(selectedColumnId, 'aitool', insertAfterCardId)}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200"
                >
                  <h4 className="font-medium text-gray-800">AI Tool Card</h4>
                  <p className="text-sm text-gray-600 mt-1">Interactive AI-powered content generation</p>
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

    </div>
    </>
  )
}