'use client'

import { useState, useEffect } from 'react'
import PromptManagerButton from './PromptManagerButton'
import PromptManagerModal from './PromptManagerModal'
import { PromptManagerProps, PromptData } from './types'

export default function PromptManager({
  prompts,
  onPromptsChange,
  position = 'bottom-right',
  storageKey = 'prompt-manager-data',
  buttonIcon = '</>',
  showInProduction = false,
  className = ''
}: PromptManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localPrompts, setLocalPrompts] = useState<PromptData>(prompts)
  
  // Hide in production unless explicitly enabled
  const isProduction = process.env.NODE_ENV === 'production'
  if (isProduction && !showInProduction) {
    return null
  }
  
  // Load prompts from localStorage on mount
  useEffect(() => {
    const savedPrompts = localStorage.getItem(storageKey)
    if (savedPrompts) {
      try {
        const parsed = JSON.parse(savedPrompts)
        setLocalPrompts(parsed)
        onPromptsChange?.(parsed)
      } catch (error) {
        console.error('Failed to parse saved prompts:', error)
      }
    }
  }, [storageKey, onPromptsChange])
  
  // Update local prompts when props change
  useEffect(() => {
    setLocalPrompts(prompts)
  }, [prompts])
  
  const handlePromptsChange = (newPrompts: PromptData) => {
    setLocalPrompts(newPrompts)
    onPromptsChange?.(newPrompts)
  }
  
  return (
    <>
      <PromptManagerButton
        onClick={() => setIsOpen(true)}
        position={position}
        icon={buttonIcon}
        className={className}
      />
      
      <PromptManagerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        prompts={localPrompts}
        onPromptsChange={handlePromptsChange}
        storageKey={storageKey}
      />
    </>
  )
}

// Export types for easier usage
export type { PromptManagerProps, PromptData, PromptConfig } from './types'

// Default export
export { default as PromptManagerButton } from './PromptManagerButton'
export { default as PromptManagerModal } from './PromptManagerModal'