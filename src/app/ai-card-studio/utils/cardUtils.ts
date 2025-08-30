import { Column, ColumnCard } from '../types'

// Generate unique button name for AI Tool Cards
export const generateUniqueButtonName = (baseName: string, columns: Column[], excludeCardId?: string): string => {
  const existingNames = columns.flatMap(col => 
    col.cards
      .filter(card => card.type === 'aitool' && card.id !== excludeCardId)
      .map(card => card.buttonName)
      .filter(Boolean)
  )

  if (!existingNames.includes(baseName)) {
    return baseName
  }

  let counter = 2
  let uniqueName = `${baseName} (${counter})`
  
  while (existingNames.includes(uniqueName)) {
    counter++
    uniqueName = `${baseName} (${counter})`
  }
  
  return uniqueName
}

// Generate unique title for Info Cards
export const generateUniqueTitle = (baseTitle: string, columns: Column[], excludeCardId?: string): string => {
  const isTitleExists = (title: string): boolean => {
    return columns.some(col => 
      col.cards.some(card => 
        card.type === 'info' && 
        card.id !== excludeCardId && 
        card.title === title
      )
    )
  }

  if (!isTitleExists(baseTitle)) {
    return baseTitle
  }

  let counter = 2
  let uniqueTitle = `${baseTitle} (${counter})`
  
  while (isTitleExists(uniqueTitle)) {
    counter++
    uniqueTitle = `${baseTitle} (${counter})`
  }
  
  return uniqueTitle
}

// Check if button name exists (excluding current card)
export const isButtonNameExists = (name: string, columns: Column[], excludeCardId?: string): boolean => {
  return columns.some(col => 
    col.cards.some(card => 
      card.type === 'aitool' && 
      card.id !== excludeCardId && 
      card.buttonName === name
    )
  )
}

// Check if Info Card title exists (excluding current card)  
export const isTitleExists = (title: string, columns: Column[], excludeCardId?: string): boolean => {
  return columns.some(col => 
    col.cards.some(card => 
      card.type === 'info' && 
      card.id !== excludeCardId && 
      card.title === title
    )
  )
}

// Resolve references in prompt text
export const resolveReferences = (promptText: string, columns: Column[]): string => {
  let resolvedPrompt = promptText
  
  // Find all AI Card references in format [REF: ButtonName]
  const referenceMatches = promptText.match(/\[REF:\s*([^\]]+)\]/g)
  
  if (referenceMatches) {
    for (const match of referenceMatches) {
      // Extract button name from [REF: ButtonName]
      const buttonName = match.replace(/\[REF:\s*/, '').replace(/\]$/, '').trim()
      
      // Find the corresponding AI Tool Card
      const referencedCard = columns
        .flatMap(col => col.cards)
        .find(card => card.type === 'aitool' && card.buttonName === buttonName)
      
      if (referencedCard && referencedCard.generatedContent) {
        resolvedPrompt = resolvedPrompt.replace(match, referencedCard.generatedContent)
      }
    }
  }
  
  // Find all Info Card references in format [INFO: Title]
  const infoMatches = promptText.match(/\[INFO:\s*([^\]]+)\]/g)
  
  if (infoMatches) {
    for (const match of infoMatches) {
      // Extract title from [INFO: Title]
      const title = match.replace(/\[INFO:\s*/, '').replace(/\]$/, '').trim()
      
      // Find the corresponding Info Card
      const infoCard = columns
        .flatMap(col => col.cards)
        .find(card => card.type === 'info' && card.title === title)
      
      if (infoCard && infoCard.description) {
        resolvedPrompt = resolvedPrompt.replace(match, infoCard.description)
      }
    }
  }
  
  return resolvedPrompt
}

// Check references before deleting a card
export const checkReferences = (columnId: string, cardIndex: number, buttonName: string, columns: Column[]): string[] => {
  const references: string[] = []
  
  columns.forEach(col => {
    col.cards.forEach((card, index) => {
      if (card.type === 'aitool' && card.promptText) {
        const referencePattern = new RegExp(`\\[REF:\\s*${buttonName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g')
        if (referencePattern.test(card.promptText)) {
          const location = col.id === columnId ? `Card ${index + 1} in same column` : `Card ${index + 1} in another column`
          references.push(location)
        }
      }
    })
  })
  
  return references
}