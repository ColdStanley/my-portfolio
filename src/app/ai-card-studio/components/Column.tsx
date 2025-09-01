import { Column, ColumnCard } from '../types'
import { useWorkspaceStore } from '../store/workspaceStore'
import InfoCard from './InfoCard'
import AIToolCard from './AIToolCard'
import { generateUniqueButtonName, generateUniqueTitle, isButtonNameExists, isTitleExists } from '../utils/cardUtils'

interface ColumnProps {
  column: Column
  onAddCard: (columnId: string) => void
  onDeleteCard: (columnId: string, cardId: string, isTopCard: boolean) => void
  onInsertCard: (columnId: string, afterCardId?: string) => void
}

export default function ColumnComponent({ 
  column, 
  onAddCard, 
  onDeleteCard,
  onInsertCard
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
    <>
      <style jsx>{`
        .staggered-entry {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          animation: staggered-fade-in 2400ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
        }
        
        @keyframes staggered-fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .staggered-entry.animation-complete {
          animation: none;
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      `}</style>
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
        <div className="space-y-3 pb-0 px-2">
        {/* Render cards */}
        {column.cards.map((card, cardIndex) => (
          <div
            key={card.id}
            className={`relative transform transition-all duration-[2400ms] staggered-entry ${
              card.deleting
                ? 'translate-y-4 translate-x-2 opacity-0 scale-95 ease-in'
                : card.justCreated
                ? 'animation-complete translate-y-0 opacity-100 scale-100'
                : ''
            } ${
              cardIndex === 0 && card.type === 'info' ? 'sticky top-0 z-20' : ''
            }`}
            style={{
              transitionDelay: card.deleting ? '0ms' : card.justCreated ? '100ms' : `${cardIndex * 360 + 600}ms`,
              transform: card.justCreated ? 'translateY(40px)' : undefined,
              transitionTimingFunction: card.justCreated ? 'cubic-bezier(0.68, -0.55, 0.27, 1.55)' : card.deleting ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'cubic-bezier(0.4, 0.0, 0.2, 1)',
              animationFillMode: 'both'
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
                onInsertCard={onInsertCard}
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
                onInsertCard={onInsertCard}
              />
            )}
          </div>
        ))}
        
        {/* Add card button - follows cards */}
        <button
          onClick={() => onAddCard(column.id)}
          className="w-full h-16 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/30 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        </div>
      </div>
      </div>
    </>
  )
}