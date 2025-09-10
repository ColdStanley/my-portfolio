import { Column } from '../types'
import InfoCard from './InfoCard'
import AIToolCard from './AIToolCard'

interface ColumnProps {
  column: Column
  onAddCard: (columnId: string) => void
  onInsertCard: (columnId: string, afterCardId?: string) => void
  onRunColumnWorkflow?: (columnId: string) => void
  isColumnExecuting?: boolean
}

export default function ColumnComponent({ 
  column, 
  onAddCard, 
  onInsertCard,
  onRunColumnWorkflow,
  isColumnExecuting = false
}: ColumnProps) {


  const handleRunAllCards = () => {
    if (onRunColumnWorkflow) {
      onRunColumnWorkflow(column.id)
    }
  }

  // Check if column has AI tool cards
  const hasAIToolCards = column.cards.some(card => card.type === 'aitool')
  return (
    <>
      <style jsx>{`
        .staggered-entry {
          opacity: 0;
          transform: translate3d(0, 20px, 0) scale(0.95);
          animation: staggered-fade-in 2400ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
          will-change: transform, opacity;
        }
        
        @keyframes staggered-fade-in {
          0% {
            opacity: 0;
            transform: translate3d(0, 20px, 0) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        
        .staggered-entry.animation-complete {
          animation: none;
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          will-change: auto;
        }
        
        .card-smooth-transition {
          transition: transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
          will-change: transform;
        }
        
        .card-smooth-transition:not(:hover) {
          will-change: auto;
        }
      `}</style>
      <div className="flex-shrink-0 w-[480px] h-full relative">
      {/* Up Arrow - 悬浮在列外上方 */}
      <button
        onClick={() => {
          const scrollContainer = document.querySelector(`[data-column-id="${column.id}"]`)
          if (scrollContainer) {
            const startTop = scrollContainer.scrollTop
            const targetTop = Math.max(0, startTop - 200)
            const startTime = performance.now()
            
            const animateScroll = (currentTime: number) => {
              const elapsed = currentTime - startTime
              const progress = Math.min(elapsed / 300, 1)
              const easing = 1 - Math.pow(1 - progress, 3) // easeOut cubic
              
              scrollContainer.scrollTop = startTop + (targetTop - startTop) * easing
              
              if (progress < 1) {
                requestAnimationFrame(animateScroll)
              }
            }
            
            requestAnimationFrame(animateScroll)
          }
        }}
        className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10 w-8 h-8 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200"
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
            const startTop = scrollContainer.scrollTop
            const maxTop = scrollContainer.scrollHeight - scrollContainer.clientHeight
            const targetTop = Math.min(maxTop, startTop + 200)
            const startTime = performance.now()
            
            const animateScroll = (currentTime: number) => {
              const elapsed = currentTime - startTime
              const progress = Math.min(elapsed / 300, 1)
              const easing = 1 - Math.pow(1 - progress, 3) // easeOut cubic
              
              scrollContainer.scrollTop = startTop + (targetTop - startTop) * easing
              
              if (progress < 1) {
                requestAnimationFrame(animateScroll)
              }
            }
            
            requestAnimationFrame(animateScroll)
          }
        }}
        className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 z-10 w-8 h-8 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Scrollable Content */}
      <div data-column-id={column.id} className="h-full overflow-y-auto scrollbar-hide pr-0 transform-gpu will-change-scroll">
        <div className="space-y-3 pb-0 px-2">
        {/* Render cards */}
        {column.cards.map((card, cardIndex) => (
          <div
            key={card.id}
            className={`relative card-smooth-transition staggered-entry ${
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
                autoOpenSettings={card.justCreated}
                onInsertCard={onInsertCard}
                onRunColumnWorkflow={cardIndex === 0 && hasAIToolCards ? handleRunAllCards : undefined}
                isColumnExecuting={isColumnExecuting}
              />
            ) : (
              <AIToolCard 
                cardId={card.id} 
                columnId={column.id}
                autoOpenSettings={card.justCreated}
                onInsertCard={onInsertCard}
              />
            )}
          </div>
        ))}
        
        {/* Add card button - follows cards */}
        <button
          onClick={() => onAddCard(column.id)}
          className="w-full h-16 border border-dashed border-gray-200 dark:border-neutral-700 rounded-xl flex items-center justify-center text-gray-300 dark:text-neutral-600 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition-all duration-200"
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