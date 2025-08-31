import { Column } from '../types'
import { checkAICardReferences, generateDeleteConfirmMessage } from '../utils/deleteUtils'

/**
 * Custom hook for card deletion logic
 * Encapsulates all deletion-related logic including reference checking and animations
 */
export const useCardDeletion = (
  columns: Column[],
  updateColumns: (updater: (prev: Column[]) => Column[]) => void
) => {
  const deleteCard = (columnId: string, cardId: string, isTopCard: boolean) => {
    // Find the card to check for references if it's an AI Tool Card
    const column = columns.find(col => col.id === columnId)
    const cardToDelete = column?.cards.find(card => card.id === cardId)
    
    // Check for references if it's an AI Tool Card
    let references: string[] = []
    if (cardToDelete?.type === 'aitool' && cardToDelete.buttonName) {
      references = checkAICardReferences(cardToDelete.buttonName, columns, cardId)
    }
    
    // Generate confirmation message
    const confirmMessage = generateDeleteConfirmMessage(
      isTopCard, 
      cardToDelete?.type, 
      references
    )
    
    if (!confirm(confirmMessage)) {
      return
    }
    
    // Execute deletion with animation
    executeCardDeletion(columnId, cardId, isTopCard)
  }
  
  const executeCardDeletion = (columnId: string, cardId: string, isTopCard: boolean) => {
    if (isTopCard) {
      // Delete entire column with animation
      updateColumns(prev => prev.map(col => 
        col.id === columnId
          ? { ...col, cards: col.cards.map(card => ({ ...card, deleting: true })) }
          : col
      ))
      
      // Remove column after animation
      setTimeout(() => {
        updateColumns(prev => prev.filter(col => col.id !== columnId))
      }, 800)
    } else {
      // Delete individual card with animation
      updateColumns(prev => prev.map(col =>
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
        updateColumns(prev => prev.map(col =>
          col.id === columnId
            ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
            : col
        ))
      }, 800)
    }
  }

  return {
    deleteCard,
    executeCardDeletion
  }
}