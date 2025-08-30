import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Column } from '../types'
import Modal from './ui/Modal'
import SettingsModal from './ui/SettingsModal'

interface InfoCardProps {
  title: string
  description: string
  columnId: string
  cardId: string
  isTopCard: boolean
  onDelete: (columnId: string, cardId: string, isTopCard: boolean) => void
  autoOpenSettings?: boolean
  onTitleChange: (cardId: string, newTitle: string, currentTitle: string) => string
  updateColumns: (updater: (prev: Column[]) => Column[]) => void
}

export default function InfoCard({ 
  title: initialTitle, 
  description: initialDescription,
  columnId,
  cardId,
  isTopCard,
  onDelete,
  autoOpenSettings = false,
  onTitleChange,
  updateColumns
}: InfoCardProps) {
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
      <Modal isOpen={showSettingsTooltip} onClose={handleCloseSettingsTooltip}>
        <SettingsModal
          isVisible={settingsTooltipVisible}
          title="Info Card Settings"
          onClose={handleCloseSettingsTooltip}
          onDelete={handleDelete}
        >
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
        </SettingsModal>
      </Modal>
    </div>
  )
}