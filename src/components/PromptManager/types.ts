export interface PromptConfig {
  name: string
  location: string
  model: 'gpt-4' | 'deepseek'
  count?: number
  prompt: string
}

export interface PromptData {
  [key: string]: PromptConfig
}

export interface PromptManagerProps {
  prompts: PromptData
  onPromptsChange?: (prompts: PromptData) => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  storageKey?: string
  buttonIcon?: string
  showInProduction?: boolean
  className?: string
}

export interface PromptManagerButtonProps {
  onClick: () => void
  position: PromptManagerProps['position']
  icon: string
  className?: string
}

export interface PromptManagerModalProps {
  isOpen: boolean
  onClose: () => void
  prompts: PromptData
  onPromptsChange: (prompts: PromptData) => void
  storageKey: string
}

// Fixed purple theme - no theme configuration needed
export const PURPLE_THEME = {
  primary: 'bg-purple-600',
  primaryHover: 'hover:bg-purple-700',
  primaryLight: 'bg-purple-100',
  primaryText: 'text-purple-700',
  accent: 'focus:ring-purple-500',
  accentHover: 'hover:bg-purple-100'
}