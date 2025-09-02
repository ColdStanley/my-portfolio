import { useWorkspaceStore } from '../store/workspaceStore'
import { checkReferences } from '../utils/cardUtils'
import { generateDeleteConfirmMessage } from '../utils/deleteUtils'

/**
 * Custom hook for card deletion logic
 * Encapsulates all deletion-related logic including reference checking and animations
 */
export const useCardDeletion = () => {
  const { canvases, activeCanvasId, actions } = useWorkspaceStore()
  const { updateCanvases } = actions
  
  // Get active canvas columns
  const columns = canvases.find(canvas => canvas.id === activeCanvasId)?.columns || []
  const deleteCard = (columnId: string, cardId: string, isTopCard: boolean) => {
    // Find the card to check for references if it's an AI Tool Card
    const column = columns.find(col => col.id === columnId)
    const cardToDelete = column?.cards.find(card => card.id === cardId)
    
    // Check for references if it's an AI Tool Card
    let references: string[] = []
    if (cardToDelete?.type === 'aitool' && cardToDelete.buttonName) {
      references = checkReferences(cardId, cardToDelete.buttonName, canvases)
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
      updateCanvases(prev => prev.map(canvas => 
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              columns: canvas.columns.map(col => 
                col.id === columnId
                  ? { ...col, cards: col.cards.map(card => ({ ...card, deleting: true })) }
                  : col
              )
            }
          : canvas
      ))
      
      // Remove column after animation
      setTimeout(() => {
        updateCanvases(prev => prev.map(canvas =>
          canvas.id === activeCanvasId
            ? { ...canvas, columns: canvas.columns.filter(col => col.id !== columnId) }
            : canvas
        ))
      }, 800)
    } else {
      // Delete individual card with animation
      updateCanvases(prev => prev.map(canvas =>
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              columns: canvas.columns.map(col =>
                col.id === columnId
                  ? {
                      ...col,
                      cards: col.cards.map(card =>
                        card.id === cardId ? { ...card, deleting: true } : card
                      )
                    }
                  : col
              )
            }
          : canvas
      ))

      // Remove card after animation
      setTimeout(() => {
        updateCanvases(prev => prev.map(canvas =>
          canvas.id === activeCanvasId
            ? {
                ...canvas,
                columns: canvas.columns.map(col =>
                  col.id === columnId
                    ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
                    : col
                )
              }
            : canvas
        ))
      }, 800)
    }
  }

  return {
    deleteCard,
    executeCardDeletion
  }
}