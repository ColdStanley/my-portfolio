'use client'

import { useState, useRef, createContext, useContext, useEffect } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'

// Card state management
interface CardInfo {
  id: string
  buttonName: string
  generatedContent: string
  order: number
}

interface CardContextType {
  allCards: CardInfo[]
  updateCard: (id: string, updates: Partial<CardInfo>) => void
  addCard: (card: CardInfo) => void
}

const CardContext = createContext<CardContextType | null>(null)

interface ColumnCard {
  id: string
  type: 'info' | 'aitool'
  title?: string
  description?: string
  buttonName?: string
  promptText?: string
  generatedContent?: string
  options?: string[]  // Optional array of option values
  aiModel?: 'deepseek' | 'openai'  // AI model selection for aitool cards
  deleting?: boolean
  justCreated?: boolean
}

interface Column {
  id: string
  cards: ColumnCard[]
}

const STORAGE_KEY = 'ai-card-studio-columns'

const getInitialColumns = (): Column[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        
        // Validate and fix duplicate IDs
        const allIds = new Set<string>()
        const fixedColumns = parsed.map((col: Column) => ({
          ...col,
          cards: col.cards.map((card: ColumnCard) => {
            if (allIds.has(card.id)) {
              // Generate new unique ID if duplicate found
              const timestamp = Date.now()
              const randomId = Math.random().toString(36).substr(2, 9)
              const newId = `${card.type}-${timestamp}-${randomId}`
              allIds.add(newId)
              return { ...card, id: newId }
            } else {
              allIds.add(card.id)
              return card
            }
          })
        }))
        
        return fixedColumns
      } catch (error) {
        console.error('Failed to parse saved columns:', error)
      }
    }
  }
  
  // Default columns if no saved data
  return [
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
          id: 'aitool-1-default', 
          type: 'aitool',
          buttonName: 'Generate Content',
          promptText: '',
          generatedContent: ''
        }
      ]
    },
    {
      id: 'col-2',
      cards: [
        {
          id: 'info-2',
          type: 'info',
          title: 'Sample Card',
          description: 'Example of a basic information card that provides context or guidance.'
        }
      ]
    },
    {
      id: 'col-3', 
      cards: [
        {
          id: 'info-3',
          type: 'info',
          title: 'Another Card',
          description: 'Cards can contain any type of static content, links, or educational material.'
        }
      ]
    }
  ]
}

export default function AICardStudio() {
  const [allCards, setAllCards] = useState<CardInfo[]>([])
  const [columns, setColumns] = useState<Column[]>(getInitialColumns)
  const [showCardTypeModal, setShowCardTypeModal] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)

  const updateCard = (id: string, updates: Partial<CardInfo>) => {
    setAllCards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ))
  }

  const addCard = (card: CardInfo) => {
    setAllCards(prev => {
      // Check if card with same ID already exists
      const existingCard = prev.find(existingCard => existingCard.id === card.id)
      if (existingCard) {
        // Update existing card instead of adding duplicate
        return prev.map(existingCard => 
          existingCard.id === card.id ? card : existingCard
        )
      }
      // Add new card if it doesn't exist
      return [...prev, card]
    })
  }

  // Save to localStorage whenever columns change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
    }
  }, [columns])

  // Check if button name exists (excluding current card)
  const isButtonNameExists = (name: string, excludeCardId?: string): boolean => {
    return columns.some(col => 
      col.cards.some(card => 
        card.type === 'aitool' && 
        card.id !== excludeCardId && 
        card.buttonName === name
      )
    )
  }

  // Generate unique button name
  const generateUniqueButtonName = (baseName: string = 'Generate Content'): string => {
    if (!isButtonNameExists(baseName)) {
      return baseName
    }
    
    let counter = 2
    let uniqueName = `${baseName} ${counter}`
    
    while (isButtonNameExists(uniqueName)) {
      counter++
      uniqueName = `${baseName} ${counter}`
    }
    
    return uniqueName
  }

  // Handle button name change with auto-suffix for duplicates
  const handleButtonNameChange = (cardId: string, newName: string, currentName: string): string => {
    if (!newName.trim()) return currentName
    
    // If name hasn't changed, return as-is
    if (newName === currentName) return newName
    
    // If name is unique, use it
    if (!isButtonNameExists(newName, cardId)) {
      return newName
    }
    
    // If duplicate, generate unique version
    return generateUniqueButtonName(newName)
  }

  // Check if Info Card title exists (excluding current card)
  const isTitleExists = (title: string, excludeCardId?: string): boolean => {
    return columns.some(col => 
      col.cards.some(card => 
        card.type === 'info' && 
        card.id !== excludeCardId && 
        card.title === title
      )
    )
  }

  // Generate unique title for Info Cards
  const generateUniqueTitle = (baseTitle: string): string => {
    let counter = 2
    let uniqueTitle = `${baseTitle} (${counter})`
    
    while (isTitleExists(uniqueTitle)) {
      counter++
      uniqueTitle = `${baseTitle} (${counter})`
    }
    
    return uniqueTitle
  }

  // Handle info card title change with uniqueness
  const handleTitleChange = (cardId: string, newTitle: string, currentTitle: string): string => {
    if (!newTitle.trim()) return currentTitle
    
    // If title hasn't changed, return as-is
    if (newTitle === currentTitle) return newTitle
    
    // If title is unique, use it
    if (!isTitleExists(newTitle, cardId)) {
      return newTitle
    }
    
    // If duplicate, generate unique version
    return generateUniqueTitle(newTitle)
  }

  // Helper function for escaping regex
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // Check references for AIToolCard deletion
  const checkReferences = (columnId: string, cardIndex: number, buttonName: string) => {
    const column = columns.find(col => col.id === columnId)
    if (!column) return []

    const laterCards = column.cards.slice(cardIndex + 1)
    const referencedCards: { cardName: string, referenceCount: number }[] = []
    
    // Use word boundary matching for precise matching
    const referencePattern = new RegExp(`\\bOutput of ${escapeRegExp(buttonName)}\\b`, 'gi')
    
    laterCards.forEach(card => {
      if (card.type === 'aitool' && card.promptText) {
        const matches = card.promptText.match(referencePattern)
        if (matches && matches.length > 0) {
          referencedCards.push({
            cardName: card.buttonName || 'Unnamed Card',
            referenceCount: matches.length
          })
        }
      }
    })
    
    return referencedCards
  }

  // Add new card to column
  const addCardToColumn = (columnId: string, cardType: 'info' | 'aitool') => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    
    const newCard: ColumnCard = cardType === 'info' 
      ? {
          id: `info-${timestamp}-${randomId}`,
          type: 'info',
          title: generateUniqueTitle('New Card'),
          description: 'Enter description...'
        }
      : {
          id: `aitool-${timestamp}-${randomId}`,
          type: 'aitool',
          buttonName: generateUniqueButtonName('Generate Content'),
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
          ? { ...col, cards: col.cards.map(card => ({ ...card, justCreated: undefined })) }
          : col
      ))
    }, 400)

    setShowCardTypeModal(false)
    setSelectedColumnId(null)
  }

  // Add new column with Info Card
  const addNewColumn = () => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    
    const newColumn: Column = {
      id: `col-${timestamp}`,
      cards: [{
        id: `info-${timestamp}-${randomId}`,
        type: 'info',
        title: generateUniqueTitle('New Card'),
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
      // Mark card for deletion and animate
      setColumns(prev => prev.map(col => 
        col.id === columnId
          ? { 
              ...col, 
              cards: col.cards.map(card => 
                card.id === cardId 
                  ? { ...card, deleting: true }
                  : card
              )
            }
          : col
      ))
      
      // Remove card after fade out, then trigger slide up animation
      setTimeout(() => {
        setColumns(prev => prev.map(col => 
          col.id === columnId 
            ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
            : col
        ))
      }, 600) // Wait for fade out to complete
    }
  }

  return (
    <CardContext.Provider value={{ allCards, updateCard, addCard }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 pb-60">
        {/* Dynamic Column Layout with Horizontal Scroll */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
          <div className="flex space-x-6 min-w-fit pb-4">
            {columns.map((column, columnIndex) => (
              <div key={column.id} className="w-80 flex-shrink-0 flex flex-col space-y-6">
              {column.cards.map((card, cardIndex) => (
                <div 
                  key={card.id}
                  className={`transition-all ease-out ${
                    card.deleting 
                      ? 'duration-600 opacity-0 scale-95 -translate-y-2' 
                      : card.justCreated
                      ? 'duration-400 opacity-100 scale-100 translate-y-0'
                      : 'duration-800 opacity-100 scale-100 translate-y-0'
                  }`}
                  style={{
                    transitionDelay: card.deleting ? '0ms' : card.justCreated ? '0ms' : `${cardIndex * 80}ms`,
                    transform: card.justCreated ? 'translateY(0)' : undefined
                  }}
                >
                  {card.type === 'info' ? (
                    <InfoCard
                      title={card.title!}
                      description={card.description!}
                      columnId={column.id}
                      cardId={card.id}
                      isTopCard={cardIndex === 0}
                      onDelete={deleteCard}
                      autoOpenSettings={card.justCreated}
                      onTitleChange={handleTitleChange}
                      updateColumns={setColumns}
                    />
                  ) : (
                    <AIToolCard 
                      cardId={card.id} 
                      order={cardIndex}
                      columnId={column.id}
                      buttonName={card.buttonName || 'Generate Content'}
                      promptText={card.promptText || ''}
                      options={card.options}
                      aiModel={card.aiModel || 'deepseek'}
                      autoOpenSettings={card.justCreated}
                      onButtonNameChange={handleButtonNameChange}
                      updateColumns={setColumns}
                      currentColumn={column}
                      onDelete={(cardId) => {
                        const references = checkReferences(column.id, cardIndex, card.buttonName || 'Generate Content')
                        let confirmMessage = "Are you sure you want to delete this card?"
                        
                        if (references.length > 0) {
                          confirmMessage = `This card is referenced by ${references.length} other cards. Continue?`
                        }
                        
                        if (confirm(confirmMessage)) {
                          // Mark card for deletion and animate
                          setColumns(prev => prev.map(col => 
                            col.id === column.id
                              ? { 
                                  ...col, 
                                  cards: col.cards.map(c => 
                                    c.id === cardId 
                                      ? { ...c, deleting: true }
                                      : c
                                  )
                                }
                              : col
                          ))
                          
                          // Remove card after animation
                          setTimeout(() => {
                            setColumns(prev => prev.map(col => 
                              col.id === column.id 
                                ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
                                : col
                            ))
                          }, 600)
                        }
                      }}
                    />
                  )}
                </div>
              ))}
              
              {/* Add Card Button */}
              <button
                onClick={() => {
                  setSelectedColumnId(column.id)
                  setShowCardTypeModal(true)
                }}
                className="bg-white/70 backdrop-blur-sm hover:bg-white/90 text-purple-600 rounded-xl border border-purple-200 transition-all duration-200 p-4 text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Card
              </button>
            </div>
          ))}
          
          {/* Add New Column Button */}
          <div className="w-80 flex-shrink-0">
            <button
              onClick={addNewColumn}
              className="bg-white/70 backdrop-blur-sm hover:bg-white/90 text-purple-600 rounded-xl border border-purple-200 transition-all duration-200 p-6 text-sm font-medium flex items-center gap-2 h-fit w-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Info Card
            </button>
          </div>
        </div>
        </div>

        {/* Card Type Selection Modal */}
        {showCardTypeModal && typeof document !== 'undefined' && createPortal(
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => {
                setShowCardTypeModal(false)
                setSelectedColumnId(null)
              }}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-sm w-full mx-4 pointer-events-auto transform transition-all duration-300 ease-out">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-800">Add New Card</h3>
                  <button
                    onClick={() => {
                      setShowCardTypeModal(false)
                      setSelectedColumnId(null)
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-6">Select card type:</p>
                  
                  {/* Info Card Option */}
                  <button
                    onClick={() => selectedColumnId && addCardToColumn(selectedColumnId, 'info')}
                    className="w-full p-4 text-left border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 rounded-lg transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full border-2 border-gray-300 group-hover:border-purple-500 mt-1"></div>
                      <div>
                        <h4 className="font-medium text-gray-800 group-hover:text-purple-700">Info Card</h4>
                        <p className="text-sm text-gray-500 mt-1">Static information display</p>
                      </div>
                    </div>
                  </button>
                  
                  {/* AI Tool Card Option */}
                  <button
                    onClick={() => selectedColumnId && addCardToColumn(selectedColumnId, 'aitool')}
                    className="w-full p-4 text-left border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 rounded-lg transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full border-2 border-gray-300 group-hover:border-purple-500 mt-1"></div>
                      <div>
                        <h4 className="font-medium text-gray-800 group-hover:text-purple-700">AI Tool Card</h4>
                        <p className="text-sm text-gray-500 mt-1">AI-powered content generation</p>
                      </div>
                    </div>
                  </button>
                </div>
                
                {/* Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowCardTypeModal(false)
                      setSelectedColumnId(null)
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}

      </div>
    </CardContext.Provider>
  )
}

// Info Card Component (Type 1: No AI calls)
function InfoCard({ 
  title: initialTitle, 
  description: initialDescription,
  columnId,
  cardId,
  isTopCard,
  onDelete,
  autoOpenSettings = false,
  onTitleChange,
  updateColumns
}: { 
  title: string, 
  description: string,
  columnId: string,
  cardId: string,
  isTopCard: boolean,
  onDelete: (columnId: string, cardId: string, isTopCard: boolean) => void,
  autoOpenSettings?: boolean,
  onTitleChange: (cardId: string, newTitle: string, currentTitle: string) => string,
  updateColumns: (updater: (prev: Column[]) => Column[]) => void
}) {
  const [showSettingsTooltip, setShowSettingsTooltip] = useState(false)
  const [settingsTooltipVisible, setSettingsTooltipVisible] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)

  const handleSettingsClick = () => {
    setShowSettingsTooltip(true)
    setTimeout(() => setSettingsTooltipVisible(true), 10)
  }

  const handleCloseSettingsTooltip = () => {
    setSettingsTooltipVisible(false)
    setTimeout(() => setShowSettingsTooltip(false), 250)
  }

  const handleDelete = () => {
    const confirmMessage = isTopCard 
      ? "Deleting this card will remove the entire column. Are you sure?"
      : "Are you sure you want to delete this card?"
    
    if (confirm(confirmMessage)) {
      onDelete(columnId, cardId, isTopCard)
      handleCloseSettingsTooltip()
    }
  }

  // Auto-open settings for newly created cards
  useEffect(() => {
    if (autoOpenSettings) {
      setTimeout(() => {
        setShowSettingsTooltip(true)
        setTimeout(() => setSettingsTooltipVisible(true), 10)
      }, 100) // Small delay to ensure card is rendered
    }
  }, [autoOpenSettings])

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 relative">
      
      {/* Settings Button - Top Right */}
      <button
        onClick={handleSettingsClick}
        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-200 z-10 cursor-pointer"
        title="Card Settings"
        style={{ pointerEvents: 'auto' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <h2 className="text-lg font-medium text-purple-700 mb-4">{title}</h2>
      <div className="text-gray-600 text-sm">
        {description}
      </div>

      {/* Card Settings Modal - Screen Centered via Portal */}
      {showSettingsTooltip && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={handleCloseSettingsTooltip}
          />
          
          {/* Centered Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className={`bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md w-full mx-4 pointer-events-auto transform transition-all duration-300 ease-out ${
              settingsTooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Info Card Settings</h3>
                <button
                  onClick={handleCloseSettingsTooltip}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div>
                {/* Card Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name:</label>
                  <input
                    type="text"
                    value={title}
                    onBlur={(e) => {
                      const newTitle = e.target.value
                      const uniqueTitle = onTitleChange(cardId, newTitle, title)
                      
                      if (uniqueTitle !== newTitle) {
                        setTitle(uniqueTitle)
                      }
                      
                      // Update columns state with unique title
                      updateColumns(prev => prev.map(col => 
                        col.id === columnId
                          ? {
                              ...col,
                              cards: col.cards.map(card =>
                                card.id === cardId
                                  ? { ...card, title: uniqueTitle }
                                  : card
                              )
                            }
                          : col
                      ))
                    }}
                    onChange={(e) => {
                      setTitle(e.target.value)
                    }}
                    placeholder="Enter card name..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description:</label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      // Update columns state immediately for persistence
                      updateColumns(prev => prev.map(col => 
                        col.id === columnId
                          ? {
                              ...col,
                              cards: col.cards.map(card =>
                                card.id === cardId
                                  ? { ...card, description: e.target.value }
                                  : card
                              )
                            }
                          : col
                      ))
                    }}
                    placeholder="Enter description..."
                    className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                
                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      onClick={handleDelete}
                      className="w-16 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md font-medium transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

    </div>
  )
}

// AI Tool Card Component (Type 2: With AI calls)
function AIToolCard({ 
  cardId, 
  order,
  columnId,
  buttonName: initialButtonName,
  promptText: initialPromptText,
  options: initialOptions,
  aiModel: initialAiModel = 'deepseek',
  onDelete,
  autoOpenSettings = false,
  onButtonNameChange,
  updateColumns,
  currentColumn
}: { 
  cardId: string, 
  order: number,
  columnId: string,
  buttonName: string,
  promptText: string,
  options?: string[],
  aiModel?: 'deepseek' | 'openai',
  onDelete: (cardId: string) => void,
  autoOpenSettings?: boolean,
  onButtonNameChange: (cardId: string, newName: string, currentName: string) => string,
  updateColumns: (updater: (prev: Column[]) => Column[]) => void,
  currentColumn: Column
}) {
  const cardContext = useContext(CardContext)
  const [showPromptTooltip, setShowPromptTooltip] = useState(false)
  const [promptTooltipVisible, setPromptTooltipVisible] = useState(false)
  const [showOptionsTooltip, setShowOptionsTooltip] = useState(false)
  const generateButtonRef = useRef<HTMLButtonElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [buttonName, setButtonName] = useState(initialButtonName)
  const [promptText, setPromptText] = useState(initialPromptText)
  const [aiModel, setAiModel] = useState<'deepseek' | 'openai'>(initialAiModel)
  const [options, setOptions] = useState<string[]>(() => {
    // Ensure options is never undefined
    return Array.isArray(initialOptions) ? initialOptions : []
  })
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize card in context (only once)
  useEffect(() => {
    if (cardContext) {
      cardContext.addCard({
        id: cardId,
        buttonName,
        generatedContent,
        order
      })
    }
  }, [cardId]) // 只依赖cardId，避免无限循环

  // Update card when content changes
  useEffect(() => {
    if (cardContext) {
      cardContext.updateCard(cardId, { 
        buttonName, 
        generatedContent 
      })
    }
  }, [buttonName, generatedContent]) // 移除cardContext依赖

  // Auto-open settings for newly created cards
  useEffect(() => {
    if (autoOpenSettings) {
      setTimeout(() => {
        setShowPromptTooltip(true)
        setTimeout(() => setPromptTooltipVisible(true), 10)
      }, 100) // Small delay to ensure card is rendered
    }
  }, [autoOpenSettings])

  // Get previous AIToolCards from current column for reference dropdown
  const currentCardIndex = currentColumn.cards.findIndex(card => card.id === cardId)
  const previousCards = currentColumn.cards
    .slice(0, currentCardIndex)  // Get cards before current card
    .filter(card => card.type === 'aitool')  // Only AIToolCards can be referenced
    .map(card => ({
      id: card.id,
      buttonName: card.buttonName || 'Unnamed Card',
      order: currentCardIndex  // Not used anymore, but keeping for compatibility
    }))

  // Render prompt text with highlighted references and option placeholders

  // Handle textarea input changes
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setPromptText(newText)
    
    // Update columns state for persistence
    updateColumns(prev => prev.map(col => 
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId
                ? { ...card, promptText: newText }
                : card
            )
          }
        : col
    ))
  }

  // Insert reference at cursor position
  const insertReference = (selectedButtonName: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const cursorPosition = textarea.selectionStart
      const textBefore = promptText.substring(0, cursorPosition)
      const textAfter = promptText.substring(textarea.selectionEnd)
      const referenceText = `Output of ${selectedButtonName}`
      
      const newText = textBefore + referenceText + textAfter
      setPromptText(newText)
      
      // Update columns state
      updateColumns(prev => prev.map(col => 
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map(card =>
                card.id === cardId
                  ? { ...card, promptText: newText }
                  : card
              )
            }
          : col
      ))
      
      // Set cursor position after inserted text
      setTimeout(() => {
        const newCursorPosition = cursorPosition + referenceText.length
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
        textarea.focus()
      }, 0)
    }
  }

  // Resolve references in prompt text
  const resolveReferences = (prompt: string): string => {
    let resolvedPrompt = prompt
    
    // Match all "Output of ButtonName" references
    // Pattern matches button names with spaces until Chinese characters, punctuation, or end
    const referencePattern = /Output of ([A-Za-z0-9\s]+?)(?=[\u4e00-\u9fff]|[.,!?]|$)/g
    const matches = [...prompt.matchAll(referencePattern)]
    
    for (const match of matches) {
      const buttonName = match[1].trim()
      
      // Find referenced card in current column before current card
      const referencedCard = currentColumn.cards
        .slice(0, currentCardIndex)
        .find(card => card.type === 'aitool' && card.buttonName === buttonName)
      
      if (referencedCard && referencedCard.generatedContent) {
        resolvedPrompt = resolvedPrompt.replace(
          match[0], 
          referencedCard.generatedContent
        )
      } else {
        resolvedPrompt = resolvedPrompt.replace(
          match[0], 
          `[Reference "${buttonName}" not found or empty]`
        )
      }
    }
    
    return resolvedPrompt
  }

  const handleGenerateClick = async (selectedOption?: string) => {
    if (!promptText.trim()) return
    
    // If has options but no option selected, show tooltip
    if (options.length > 0 && !selectedOption) {
      setShowOptionsTooltip(true)
      return
    }
    
    setIsGenerating(true)
    setGeneratedContent('')
    
    try {
      // Resolve references and options in prompt
      let resolvedPrompt = resolveReferences(promptText)
      
      // Replace option placeholder with selected value
      if (selectedOption && options.length > 0) {
        resolvedPrompt = resolvedPrompt.replace(/\{\{option\}\}/g, selectedOption)
      }
      
      // Call AI API with streaming
      const response = await fetch('/api/ai-agent/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: resolvedPrompt,
          model: aiModel,
          stream: true
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body reader')
      }

      const decoder = new TextDecoder()
      let fullResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              if (content) {
                fullResponse += content
                setGeneratedContent(fullResponse)
                
                // Update columns state immediately for real-time references
                updateColumns(prev => prev.map(col => 
                  col.id === columnId
                    ? {
                        ...col,
                        cards: col.cards.map(card =>
                          card.id === cardId
                            ? { ...card, generatedContent: fullResponse }
                            : card
                        )
                      }
                    : col
                ))
              }
            } catch (parseError) {
              console.error('Parse error:', parseError)
            }
          }
        }
      }

      setIsGenerating(false)
      
    } catch (error) {
      console.error('AI Generation Error:', error)
      setIsGenerating(false)
      
      let errorMessage = 'Generation failed. Please try again.'
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment.'
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid prompt. Please check your input.'
        }
      }
      
      const finalError = `❌ ${errorMessage}`
      setGeneratedContent(finalError)
      
      // Update columns state with error
      updateColumns(prev => prev.map(col => 
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map(card =>
                card.id === cardId
                  ? { ...card, generatedContent: finalError }
                  : card
              )
            }
          : col
      ))
    }
  }

  const handlePromptClick = () => {
    setShowPromptTooltip(true)
    setTimeout(() => setPromptTooltipVisible(true), 10)
  }

  const handleClosePromptTooltip = () => {
    setPromptTooltipVisible(false)
    setTimeout(() => setShowPromptTooltip(false), 250)
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 relative">
      
      {/* Prompt Management Button - Top Right */}
      <button
        onClick={handlePromptClick}
        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-200 z-10 cursor-pointer"
        title="Manage Prompts"
        style={{ pointerEvents: 'auto' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      
      {/* Generate Button */}
      <div className="relative">
        <button
          ref={generateButtonRef}
          onClick={() => handleGenerateClick()}
          disabled={isGenerating || !promptText.trim()}
          className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-1.5 ${
            isGenerating || !promptText.trim()
              ? 'bg-purple-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white`}
        >
          {isGenerating ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            buttonName
          )}
        </button>

      </div>

      {/* Content Display Area */}
      <div className="mt-6">
        <div className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg min-h-16 relative">
          {isGenerating && !generatedContent && (
            <div className="flex items-center gap-2 text-purple-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs">AI is thinking...</span>
            </div>
          )}
          
          {generatedContent ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-lg font-bold text-gray-800 mb-3 mt-4 first:mt-0" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-base font-bold text-gray-800 mb-2 mt-3 first:mt-0" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-sm font-bold text-gray-800 mb-2 mt-3 first:mt-0" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="mb-3 ml-4 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="mb-3 ml-4 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="list-disc marker:text-purple-500" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-gray-800" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline ? 
                      <code className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs font-mono" {...props} /> :
                      <code className="block bg-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-300 pl-4 italic text-gray-600 my-3" {...props} />,
                  hr: ({node, ...props}) => <hr className="border-gray-300 my-4" {...props} />
                }}
              >
                {generatedContent}
              </ReactMarkdown>
            </div>
          ) : (
            !isGenerating && <span className="text-gray-500">Click generate to create content</span>
          )}
          
          {isGenerating && generatedContent && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Management Tooltip - Screen Centered via Portal */}
      {showPromptTooltip && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={handleClosePromptTooltip}
          />
          
          {/* Centered Tooltip */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className={`bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md w-full mx-4 pointer-events-auto transform transition-all duration-300 ease-out ${
              promptTooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">AI Tool Card Settings</h3>
                <button
                  onClick={handleClosePromptTooltip}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div>
                {/* Card Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name:</label>
                  <input
                    type="text"
                    value={buttonName}
                    onChange={(e) => {
                      const uniqueName = onButtonNameChange(cardId, e.target.value, buttonName)
                      setButtonName(uniqueName)
                      
                      // Update columns state immediately
                      updateColumns(prev => prev.map(col => 
                        col.id === columnId
                          ? {
                              ...col,
                              cards: col.cards.map(card =>
                                card.id === cardId
                                  ? { ...card, buttonName: uniqueName }
                                  : card
                              )
                            }
                          : col
                      ))
                    }}
                    placeholder="Enter card name..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>


                {/* Prompt */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Prompt:</label>
                    <select
                      value={aiModel}
                      onChange={(e) => {
                        const newModel = e.target.value as 'deepseek' | 'openai'
                        setAiModel(newModel)
                        
                        // Update columns state with new model selection
                        updateColumns(prev => prev.map(col => 
                          col.id === columnId
                            ? {
                                ...col,
                                cards: col.cards.map(card =>
                                  card.id === cardId
                                    ? { ...card, aiModel: newModel }
                                    : card
                                )
                              }
                            : col
                        ))
                      }}
                      className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value="deepseek">DeepSeek</option>
                      <option value="openai">OpenAI</option>
                    </select>
                  </div>
                  <div className="relative">
                    {/* Hidden textarea for compatibility */}
                    <textarea
                      ref={textareaRef}
                      value={promptText}
                      onChange={() => {}}
                      className="sr-only"
                      tabIndex={-1}
                    />
                    
                    {/* Plain textarea for editing */}
                    <textarea
                      ref={textareaRef}
                      value={promptText}
                      onChange={handlePromptChange}
                      placeholder="Enter your AI prompt here..."
                      className="w-full min-h-32 p-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      style={{
                        minHeight: '128px',
                        maxHeight: '256px',
                        lineHeight: '1.5'
                      }}
                    />
                  </div>
                </div>
                
                {/* Options Management */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options (optional):</label>
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...options]
                            newOptions[index] = e.target.value
                            setOptions(newOptions)
                            // Update columns state immediately
                            updateColumns(prev => prev.map(col => 
                              col.id === columnId
                                ? {
                                    ...col,
                                    cards: col.cards.map(card =>
                                      card.id === cardId
                                        ? { ...card, options: newOptions }
                                        : card
                                    )
                                  }
                                : col
                            ))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter option value"
                        />
                        <button
                          onClick={() => {
                            const newOptions = options.filter((_, i) => i !== index)
                            setOptions(newOptions)
                            // Update columns state and handle placeholder removal
                            updateColumns(prev => prev.map(col => 
                              col.id === columnId
                                ? {
                                    ...col,
                                    cards: col.cards.map(card =>
                                      card.id === cardId
                                        ? { 
                                            ...card, 
                                            options: newOptions,
                                            // Remove placeholder if no options left
                                            promptText: newOptions.length === 0 
                                              ? card.promptText?.replace(/\{\{option\}\}/g, '')
                                              : card.promptText
                                          }
                                        : card
                                    )
                                  }
                                : col
                            ))
                            // Also update local promptText state
                            if (newOptions.length === 0) {
                              setPromptText(prev => prev.replace(/\{\{option\}\}/g, ''))
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-150"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6m0 12L6 6" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    {/* Add Option Button */}
                    <button
                      onClick={() => {
                        const newOptions = [...options, '']
                        setOptions(newOptions)
                        
                        // Auto-insert placeholder if first option and not present
                        if (options.length === 0 && !promptText.includes('{{option}}')) {
                          const newPromptText = promptText + (promptText ? ' ' : '') + '{{option}}'
                          setPromptText(newPromptText)
                          
                          // Update columns state
                          updateColumns(prev => prev.map(col => 
                            col.id === columnId
                              ? {
                                  ...col,
                                  cards: col.cards.map(card =>
                                    card.id === cardId
                                      ? { ...card, options: newOptions, promptText: newPromptText }
                                      : card
                                  )
                                }
                              : col
                          ))
                          
                          // No need to re-render highlights in textarea mode
                        } else {
                          // Just update options
                          updateColumns(prev => prev.map(col => 
                            col.id === columnId
                              ? {
                                  ...col,
                                  cards: col.cards.map(card =>
                                    card.id === cardId
                                      ? { ...card, options: newOptions }
                                      : card
                                  )
                                }
                              : col
                          ))
                        }
                      }}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 hover:border-purple-300 text-gray-500 hover:text-purple-600 rounded-lg transition-all duration-150 text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Option
                    </button>
                  </div>
                  
                  {/* Help text */}
                  {options.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Use <code className="bg-gray-100 px-1 rounded">{'{{option}}'}</code> in your prompt as a placeholder
                    </div>
                  )}
                </div>

                {/* Bottom controls */}
                <div className="flex items-center justify-between">
                  {/* Left: Reference dropdown */}
                  <div className="flex items-center gap-2">
                    {previousCards.length > 0 && (
                      <select 
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-40"
                        onChange={(e) => {
                          if (e.target.value) {
                            insertReference(e.target.value)
                            e.target.value = '' // Reset selection
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Insert Reference</option>
                        {previousCards.map(card => (
                          <option key={card.id} value={card.buttonName}>
                            {card.buttonName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Right: Save button */}
                  <button 
                    onClick={handleClosePromptTooltip}
                    className="w-16 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md font-medium transition-all duration-200"
                  >
                    Save
                  </button>
                </div>
                
                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        onDelete(cardId)
                        handleClosePromptTooltip()
                      }}
                      className="w-16 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md font-medium transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Options Selection Tooltip - Portal */}
      {showOptionsTooltip && options.length > 0 && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowOptionsTooltip(false)}
          />
          
          {/* Tooltip positioned below Generate button */}
          <div 
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 transform transition-all duration-200 ease-out opacity-100 scale-100"
            style={{
              top: generateButtonRef.current ? generateButtonRef.current.getBoundingClientRect().bottom + 8 : '50%',
              left: generateButtonRef.current ? generateButtonRef.current.getBoundingClientRect().left : '50%',
              transform: generateButtonRef.current ? 'none' : 'translate(-50%, -50%)'
            }}
          >
            {/* Arrow pointing up to button */}
            <div className="absolute -top-1 left-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
            
            {/* Content */}
            <div className="flex flex-col gap-2 min-w-32">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setShowOptionsTooltip(false)
                    handleGenerateClick(option)
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}

    </div>
  )
}