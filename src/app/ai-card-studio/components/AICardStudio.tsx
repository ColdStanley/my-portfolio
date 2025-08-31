'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Column, ColumnCard, CardInfo, CardContextType } from '../types'
import { generateUniqueButtonName, generateUniqueTitle, isButtonNameExists, isTitleExists } from '../utils/cardUtils'
import { CardContext } from './CardContext'
import ColumnComponent from './Column'

export default function AICardStudio() {
  // 简化状态管理 - 只保留必要的卡片和列状态
  const [columns, setColumns] = useState<Column[]>(() => [
    // 默认示例列
    {
      id: 'col-1',
      cards: [
        {
          id: 'info-1',
          type: 'info',
          title: 'Info Card',
          description: 'Display static information, instructions, or reference content without AI processing.'
        },
        {
          id: 'aitool-1', 
          type: 'aitool',
          buttonName: 'Start',
          promptText: '',
          generatedContent: '',
          aiModel: 'deepseek'
        }
      ]
    },
    {
      id: 'col-2',
      cards: [
        {
          id: 'info-2',
          type: 'info',
          title: 'Usage Tips',
          description: 'Use [REF: Start] to reference other AI tool outputs in your prompts. Use {{option}} for user-selectable options.'
        },
        {
          id: 'aitool-2',
          type: 'aitool',
          buttonName: 'Analyze Data',
          promptText: 'Analyze the following data: {{option}}',
          generatedContent: '',
          options: ['Sales Report', 'User Feedback', 'Performance Metrics'],
          aiModel: 'deepseek'
        }
      ]
    }
  ])
  
  const [allCards, setAllCards] = useState<CardInfo[]>([])
  const [showCardTypeModal, setShowCardTypeModal] = useState(false)
  const [cardTypeModalVisible, setCardTypeModalVisible] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string>('')

  // Card context functions
  const updateCard = (id: string, updates: Partial<CardInfo>) => {
    setAllCards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ))
  }

  const addCard = (card: CardInfo) => {
    setAllCards(prev => {
      const exists = prev.find(c => c.id === card.id)
      if (exists) {
        return prev.map(c => c.id === card.id ? card : c)
      } else {
        return [...prev, card]
      }
    })
  }

  const getCard = (id: string) => {
    return allCards.find(card => card.id === id)
  }

  const cardContextValue: CardContextType = {
    cards: allCards,
    addCard,
    updateCard,
    getCard
  }

  // Handle button name change with auto-suffix for duplicates
  const handleButtonNameChange = (cardId: string, newName: string, currentName: string): string => {
    if (!newName.trim()) return currentName
    
    // If name hasn't changed, return as-is
    if (newName === currentName) return newName
    
    // If name is unique, use it
    if (!isButtonNameExists(newName, columns, cardId)) {
      return newName
    }
    
    // If duplicate, generate unique version
    return generateUniqueButtonName(newName, columns)
  }

  // Handle info card title change with uniqueness
  const handleTitleChange = (cardId: string, newTitle: string, currentTitle: string): string => {
    if (!newTitle.trim()) return currentTitle
    
    // If title hasn't changed, return as-is
    if (newTitle === currentTitle) return newTitle
    
    // If title is unique, use it
    if (!isTitleExists(newTitle, columns, cardId)) {
      return newTitle
    }
    
    // If duplicate, generate unique version
    return generateUniqueTitle(newTitle, columns)
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

    setColumns(prev => [...prev, newColumn])

    // Remove justCreated flag after animation
    setTimeout(() => {
      setColumns(prev => prev.map(col =>
        col.id === newColumn.id
          ? { ...col, cards: col.cards.map(card => ({ ...card, justCreated: undefined })) }
          : col
      ))
    }, 400)
  }

  const addCardToColumn = (columnId: string, cardType: 'info' | 'aitool') => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)

    const newCard: ColumnCard = cardType === 'info' 
      ? {
          id: `info-${timestamp}-${randomId}`,
          type: 'info',
          title: generateUniqueTitle('New Card', columns),
          description: 'Enter description...'
        }
      : {
          id: `aitool-${timestamp}-${randomId}`,
          type: 'aitool',
          buttonName: generateUniqueButtonName('Start', columns),
          promptText: '',
          generatedContent: '',
          aiModel: 'deepseek'  // Default to DeepSeek
        }

    setColumns(prev => prev.map(col =>
      col.id === columnId
        ? { ...col, cards: [...col.cards, { ...newCard, justCreated: true }] }
        : col
    ))

    // Remove justCreated flag after animation
    setTimeout(() => {
      setColumns(prev => prev.map(col =>
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

  const deleteCard = (columnId: string, cardId: string, isTopCard: boolean) => {
    if (isTopCard) {
      // Delete entire column with animation
      setColumns(prev => prev.map(col => 
        col.id === columnId
          ? { ...col, cards: col.cards.map(card => ({ ...card, deleting: true })) }
          : col
      ))
      
      // Remove column after animation
      setTimeout(() => {
        setColumns(prev => prev.filter(col => col.id !== columnId))
      }, 800)
    } else {
      // Delete individual card with animation
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map(card =>
                card.id === cardId ? { ...card, deleting: true } : card
              )
            }
          : col
      ))

      // Remove card after animation
      setTimeout(() => {
        setColumns(prev => prev.map(col =>
          col.id === columnId
            ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
            : col
        ))
      }, 800)
    }
  }

  const handleAddCard = (columnId: string) => {
    setSelectedColumnId(columnId)
    setShowCardTypeModal(true)
    setTimeout(() => setCardTypeModalVisible(true), 10)
  }

  const handleCloseCardTypeModal = () => {
    setCardTypeModalVisible(false)
    setTimeout(() => setShowCardTypeModal(false), 250)
  }

  return (
    <CardContext.Provider value={cardContextValue}>
      {/* Full screen layout - no L-shaped offset */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 pb-0">
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
            <div className="horizontal-scroll-container flex gap-6 items-start overflow-x-auto scrollbar-hide pb-0 h-[calc(100vh-200px)] px-12">
              {/* Render all columns */}
              {columns.map((column) => (
                <ColumnComponent
                  key={column.id}
                  column={column}
                  onAddCard={handleAddCard}
                  onDeleteCard={deleteCard}
                  onButtonNameChange={handleButtonNameChange}
                  onTitleChange={handleTitleChange}
                  updateColumns={setColumns}
                  allColumns={columns}
                />
              ))}
              
              {/* Add new column button */}
              <button
                onClick={addNewColumn}
                className="flex-shrink-0 w-[480px] h-32 border-2 border-dashed border-purple-300 rounded-xl flex items-center justify-center text-purple-600 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50/50 transition-all duration-200 font-medium"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Column
              </button>
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
                  onClick={() => addCardToColumn(selectedColumnId, 'info')}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200"
                >
                  <h4 className="font-medium text-gray-800">Info Card</h4>
                  <p className="text-sm text-gray-600 mt-1">Static information, instructions, or reference content</p>
                </button>
                
                <button
                  onClick={() => addCardToColumn(selectedColumnId, 'aitool')}
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

    </CardContext.Provider>
  )
}