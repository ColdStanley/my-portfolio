import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useWorkspaceStore } from '../store/workspaceStore'
import Modal from './ui/Modal'
import SettingsModal from './ui/SettingsModal'

interface InfoCardProps {
  columnId: string
  cardId: string
  isTopCard: boolean
  onDelete: (cardId: string) => void
  autoOpenSettings?: boolean
  onTitleChange: (cardId: string, newTitle: string) => void
  onTitleBlur: (cardId: string) => void
  onDescriptionChange: (cardId: string, newDescription: string) => void
}

export default function InfoCard({ 
  columnId,
  cardId,
  isTopCard,
  onDelete,
  autoOpenSettings = false,
  onTitleChange,
  onTitleBlur,
  onDescriptionChange
}: InfoCardProps) {
  const { columns, actions } = useWorkspaceStore()
  const { saveWorkspace } = actions
  
  // Get current card data from Zustand store
  const currentCard = columns
    .find(col => col.id === columnId)
    ?.cards.find(card => card.id === cardId)
  
  const title = currentCard?.title || ''
  const description = currentCard?.description || ''
  const [showSettingsTooltip, setShowSettingsTooltip] = useState(false)
  const [settingsTooltipVisible, setSettingsTooltipVisible] = useState(false)
  
  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Save function
  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      await saveWorkspace()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000) // Hide success message after 2s
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSettingsClick = () => {
    setShowSettingsTooltip(true)
    setTimeout(() => setSettingsTooltipVisible(true), 10)
  }

  const handleCloseSettingsTooltip = () => {
    setSettingsTooltipVisible(false)
    setTimeout(() => setShowSettingsTooltip(false), 250)
  }

  const handleDelete = () => {
    onDelete(cardId)
    handleCloseSettingsTooltip()
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
      <Modal isOpen={showSettingsTooltip} onClose={handleCloseSettingsTooltip} className="w-full max-w-4xl mx-4">
        <SettingsModal
          isVisible={settingsTooltipVisible}
          title="Info Card Settings"
          onClose={handleCloseSettingsTooltip}
          onDelete={handleDelete}
          onSave={handleSave}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
        >
          {/* Card Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Name:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(cardId, e.target.value)}
              onBlur={() => onTitleBlur(cardId)}
              placeholder="Enter card name..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description:</label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(cardId, e.target.value)}
              placeholder="Enter description..."
              className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
        </SettingsModal>
      </Modal>
    </div>
  )
}