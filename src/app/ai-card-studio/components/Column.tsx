import { Column, ColumnCard } from '../types'
import InfoCard from './InfoCard'
import AIToolCard from './AIToolCard'

interface ColumnProps {
  column: Column
  onAddCard: (columnId: string) => void
  onDeleteCard: (columnId: string, cardId: string, isTopCard: boolean) => void
  onButtonNameChange: (cardId: string, newName: string, currentName: string) => string
  onTitleChange: (cardId: string, newTitle: string, currentTitle: string) => string
  updateColumns: (updater: (prev: Column[]) => Column[]) => void
  allColumns: Column[]
}

export default function ColumnComponent({ 
  column, 
  onAddCard, 
  onDeleteCard, 
  onButtonNameChange,
  onTitleChange,
  updateColumns,
  allColumns
}: ColumnProps) {
  return (
    <div className="flex-shrink-0 w-80 space-y-4">
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
              title={card.title!}
              description={card.description!}
              columnId={column.id}
              cardId={card.id}
              isTopCard={cardIndex === 0}
              onDelete={onDeleteCard}
              autoOpenSettings={card.justCreated}
              onTitleChange={onTitleChange}
              updateColumns={updateColumns}
            />
          ) : (
            <AIToolCard 
              cardId={card.id} 
              order={cardIndex}
              columnId={column.id}
              buttonName={card.buttonName || 'Generate Content'}
              promptText={card.promptText || ''}
              options={card.options || []}
              aiModel={card.aiModel || 'deepseek'}
              autoOpenSettings={card.justCreated}
              onButtonNameChange={onButtonNameChange}
              updateColumns={updateColumns}
              currentColumn={column}
              allColumns={allColumns}
              onDelete={(cardId) => {
                // Check references logic would go here
                const confirmMessage = "Are you sure you want to delete this card?"
                if (confirm(confirmMessage)) {
                  onDeleteCard(column.id, cardId, false)
                }
              }}
            />
          )}
        </div>
      ))}
      
      {/* Add card button */}
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
  )
}