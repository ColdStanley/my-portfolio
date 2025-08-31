import { Column, ColumnCard } from '../types'
import { useWorkspaceStore } from '../store/workspaceStore'
import InfoCard from './InfoCard'
import AIToolCard from './AIToolCard'
import { generateUniqueButtonName, generateUniqueTitle, isButtonNameExists, isTitleExists } from '../utils/cardUtils'

interface ColumnProps {
  column: Column
  onAddCard: (columnId: string) => void
  onDeleteCard: (columnId: string, cardId: string, isTopCard: boolean) => void
}

export default function ColumnComponent({ 
  column, 
  onAddCard, 
  onDeleteCard
}: ColumnProps) {
  const { columns, actions } = useWorkspaceStore()
  const { updateColumns } = actions

  // Event handlers - all logic contained within this component
  const handleTitleChange = (cardId: string, newTitle: string) => {
    updateColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(card =>
        card.id === cardId
          ? { ...card, title: newTitle }
          : card
      )
    })))
  }
  
  const handleTitleBlur = (cardId: string) => {
    const currentCard = columns.find(col => 
      col.cards.find(card => card.id === cardId)
    )?.cards.find(card => card.id === cardId)
    
    if (!currentCard?.title) return
    
    const trimmedTitle = currentCard.title.trim()
    if (!trimmedTitle) return
    
    if (isTitleExists(trimmedTitle, columns, cardId)) {
      const uniqueTitle = generateUniqueTitle(trimmedTitle, columns, cardId)
      updateColumns(prev => prev.map(col => ({
        ...col,
        cards: col.cards.map(card =>
          card.id === cardId
            ? { ...card, title: uniqueTitle }
            : card
        )
      })))
    }
  }

  const handleDescriptionChange = (cardId: string, newDescription: string) => {
    updateColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(card =>
        card.id === cardId
          ? { ...card, description: newDescription }
          : card
      )
    })))
  }

  const handleButtonNameChange = (cardId: string, newName: string) => {
    updateColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(card =>
        card.id === cardId
          ? { ...card, buttonName: newName }
          : card
      )
    })))
  }
  
  const handleButtonNameBlur = (cardId: string) => {
    const currentCard = columns.find(col => 
      col.cards.find(card => card.id === cardId)
    )?.cards.find(card => card.id === cardId)
    
    if (!currentCard?.buttonName) return
    
    const trimmedName = currentCard.buttonName.trim()
    if (!trimmedName) return
    
    if (isButtonNameExists(trimmedName, columns, cardId)) {
      const uniqueName = generateUniqueButtonName(trimmedName, columns, cardId)
      updateColumns(prev => prev.map(col => ({
        ...col,
        cards: col.cards.map(card =>
          card.id === cardId
            ? { ...card, buttonName: uniqueName }
            : card
        )
      })))
    }
  }

  const handlePromptChange = (cardId: string, newPrompt: string) => {
    updateColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(card =>
        card.id === cardId
          ? { ...card, promptText: newPrompt }
          : card
      )
    })))
  }

  const handleOptionsChange = (cardId: string, newOptions: string[]) => {
    updateColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(card =>
        card.id === cardId
          ? { ...card, options: newOptions }
          : card
      )
    })))
  }

  const handleAiModelChange = (cardId: string, newModel: 'deepseek' | 'openai') => {
    updateColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(card =>
        card.id === cardId
          ? { ...card, aiModel: newModel }
          : card
      )
    })))
  }

  const handleGeneratedContentChange = (cardId: string, newContent: string) => {
    updateColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(card =>
        card.id === cardId
          ? { ...card, generatedContent: newContent }
          : card
      )
    })))
  }

  const handleGeneratingStateChange = (cardId: string, isGenerating: boolean) => {
    updateColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(card =>
        card.id === cardId
          ? { ...card, isGenerating }
          : card
      )
    })))
  }
  return (
    <div className="flex-shrink-0 w-[480px] h-full relative">
      {/* Up Arrow - 悬浮在列外上方 */}
      <button
        onClick={() => {
          const scrollContainer = document.querySelector(`[data-column-id="${column.id}"]`)
          if (scrollContainer) {
            scrollContainer.scrollBy({ top: -200, behavior: 'smooth' })
          }
        }}
        className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Down Arrow - 悬浮在列外下方 */}
      <button
        onClick={() => {
          const scrollContainer = document.querySelector(`[data-column-id="${column.id}"]`)
          if (scrollContainer) {
            scrollContainer.scrollBy({ top: 200, behavior: 'smooth' })
          }
        }}
        className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Scrollable Content */}
      <div data-column-id={column.id} className="h-full overflow-y-auto scrollbar-hide pr-0">
        <div className="space-y-4 pb-0 pt-12 px-2">
        {/* Render cards */}
        {column.cards.map((card, cardIndex) => (
          <div
            key={card.id}
            className={`transform transition-all duration-800 ease-out ${
              card.deleting
                ? 'translate-y-4 opacity-0 scale-95'
                : card.justCreated
                ? 'translate-y-0 opacity-100 scale-100'
                : 'translate-y-0 opacity-100 scale-100'
            }`}
            style={{
              transitionDelay: card.deleting ? '0ms' : card.justCreated ? '0ms' : `${cardIndex * 80}ms`,
              transform: card.justCreated ? 'translateY(0)' : undefined
            }}
          >
            {card.type === 'info' ? (
              <InfoCard
                columnId={column.id}
                cardId={card.id}
                isTopCard={cardIndex === 0}
                onDelete={(cardId) => onDeleteCard(column.id, cardId, cardIndex === 0)}
                autoOpenSettings={card.justCreated}
                onTitleChange={handleTitleChange}
                onTitleBlur={handleTitleBlur}
                onDescriptionChange={handleDescriptionChange}
              />
            ) : (
              <AIToolCard 
                cardId={card.id} 
                order={cardIndex}
                columnId={column.id}
                autoOpenSettings={card.justCreated}
                onDelete={(cardId) => onDeleteCard(column.id, cardId, false)}
                onButtonNameChange={handleButtonNameChange}
                onButtonNameBlur={handleButtonNameBlur}
                onPromptChange={handlePromptChange}
                onOptionsChange={handleOptionsChange}
                onAiModelChange={handleAiModelChange}
                onGeneratedContentChange={handleGeneratedContentChange}
                onGeneratingStateChange={handleGeneratingStateChange}
              />
            )}
          </div>
        ))}
        
        {/* Add card button - follows cards */}
        <button
          onClick={() => onAddCard(column.id)}
          className="w-full h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/30 transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Card
        </button>
        </div>
      </div>
    </div>
  )
}