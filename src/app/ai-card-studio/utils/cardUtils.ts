import { Column, ColumnCard, Canvas } from '../types'

// Generate unique button name for AI Tool Cards (searches across all canvases)
export const generateUniqueButtonName = (baseName: string, canvases: Canvas[], excludeCardId?: string): string => {
  const existingNames = canvases.flatMap(canvas => 
    canvas.columns.flatMap(col => 
      col.cards
        .filter(card => card.type === 'aitool' && card.id !== excludeCardId)
        .map(card => card.buttonName)
        .filter(Boolean)
    )
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

// Generate unique title for Info Cards (searches across all canvases)
export const generateUniqueTitle = (baseTitle: string, canvases: Canvas[], excludeCardId?: string): string => {
  const isTitleExists = (title: string): boolean => {
    return canvases.some(canvas =>
      canvas.columns.some(col => 
        col.cards.some(card => 
          card.type === 'info' && 
          card.id !== excludeCardId && 
          card.title === title
        )
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

// Check if button name exists (excluding current card) (searches across all canvases)
export const isButtonNameExists = (name: string, canvases: Canvas[], excludeCardId?: string): boolean => {
  return canvases.some(canvas =>
    canvas.columns.some(col => 
      col.cards.some(card => 
        card.type === 'aitool' && 
        card.id !== excludeCardId && 
        card.buttonName === name
      )
    )
  )
}

// Check if Info Card title exists (excluding current card) (searches across all canvases)
export const isTitleExists = (title: string, canvases: Canvas[], excludeCardId?: string): boolean => {
  return canvases.some(canvas =>
    canvas.columns.some(col => 
      col.cards.some(card => 
        card.type === 'info' && 
        card.id !== excludeCardId && 
        card.title === title
      )
    )
  )
}

// Resolve references in prompt text (searches within current column only)
export const resolveReferences = (promptText: string, canvases: Canvas[], columnId: string): string => {
  let resolvedPrompt = promptText
  
  // Find the current column
  const currentColumn = canvases
    .flatMap(canvas => canvas.columns)
    .find(col => col.id === columnId)
  
  if (!currentColumn) {
    return resolvedPrompt
  }
  
  // Find all AI Card references in format [REF: ButtonName]
  const referenceMatches = promptText.match(/\[REF:\s*([^\]]+)\]/g)
  
  if (referenceMatches) {
    for (const match of referenceMatches) {
      // Extract button name from [REF: ButtonName]
      const buttonName = match.replace(/\[REF:\s*/, '').replace(/\]$/, '').trim()
      
      // Find the corresponding AI Tool Card within current column only
      const referencedCard = currentColumn.cards.find(card => 
        card.type === 'aitool' && card.buttonName === buttonName
      )
      
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
      
      // Find the corresponding Info Card within current column only
      const infoCard = currentColumn.cards.find(card => 
        card.type === 'info' && card.title === title
      )
      
      if (infoCard && infoCard.description) {
        resolvedPrompt = resolvedPrompt.replace(match, infoCard.description)
      }
    }
  }
  
  return resolvedPrompt
}

// Check references before deleting a card (searches across all canvases)
export const checkReferences = (cardId: string, buttonName: string, canvases: Canvas[]): string[] => {
  const references: string[] = []
  
  canvases.forEach(canvas => {
    canvas.columns.forEach(col => {
      col.cards.forEach((card, index) => {
        if (card.type === 'aitool' && card.promptText && card.id !== cardId) {
          const referencePattern = new RegExp(`\\[REF:\\s*${buttonName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g')
          if (referencePattern.test(card.promptText)) {
            const location = `"${buttonName}" referenced in "${canvas.name}" > Card ${index + 1}`
            references.push(location)
          }
        }
      })
    })
  })
  
  return references
}

// Generate unique canvas name (searches across all canvases)
export const generateUniqueCanvasName = (baseName: string, canvases: Canvas[], excludeCanvasId?: string): string => {
  const existingNames = canvases
    .filter(canvas => canvas.id !== excludeCanvasId)
    .map(canvas => canvas.name)

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

// Check if canvas name exists (excluding current canvas)
export const isCanvasNameExists = (name: string, canvases: Canvas[], excludeCanvasId?: string): boolean => {
  return canvases.some(canvas => 
    canvas.id !== excludeCanvasId && canvas.name === name
  )
}