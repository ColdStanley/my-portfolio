import { Column } from '../types'

/**
 * Check if an AI Tool Card is referenced by other cards
 * @param buttonName - The button name to check for references
 * @param columns - All columns to search in
 * @param excludeCardId - Card ID to exclude from the search
 * @returns Array of reference descriptions
 */
export const checkAICardReferences = (
  buttonName: string, 
  columns: Column[], 
  excludeCardId: string
): string[] => {
  const references: string[] = []
  
  columns.forEach(col => {
    col.cards.forEach((card, index) => {
      if (card.type === 'aitool' && card.promptText && card.id !== excludeCardId) {
        const referencePattern = new RegExp(`\\[REF:\\s*${buttonName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g')
        if (referencePattern.test(card.promptText)) {
          const location = `Card ${index + 1} in column`
          references.push(location)
        }
      }
    })
  })
  
  return references
}

/**
 * Generate confirmation message for card deletion
 * @param cardType - Type of the card being deleted
 * @param references - Array of reference descriptions (for AI cards)
 * @returns Confirmation message string
 */
export const generateDeleteConfirmMessage = (
  cardType?: 'info' | 'aitool',
  references: string[] = []
): string => {
  if (cardType === 'aitool' && references.length > 0) {
    return `This card is referenced by:\n${references.join('\n')}\n\nDeleting it will break these references. Are you sure?`
  }
  
  return "Are you sure you want to delete this card?"
}