/**
 * Strategy record interface - unified across all components
 */
export interface StrategyRecord {
  id: string
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  category: string
  plan?: string[]
  task?: string[]
  progress: number
  total_plans: number
  order?: number
  importance_percentage?: number
}

/**
 * Strategy form data interface
 */
export interface StrategyFormData {
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  category: string
  importance_percentage?: number
}

/**
 * Mobile Strategy Panel Props
 */
export interface MobileStrategyPanelProps {
  onStrategiesUpdate?: (strategies: StrategyRecord[]) => void
}

/**
 * Mobile Strategy Panel Ref
 */
export interface MobileStrategyPanelRef {
  openCreateForm: () => void
}

/**
 * Mobile Strategy Cards Props  
 */
export interface MobileStrategyCardsProps {
  strategies: StrategyRecord[]
  onStrategyClick?: (strategy: StrategyRecord) => void
  onStrategyEdit?: (strategy: StrategyRecord) => void
  onStrategyDelete?: (strategyId: string) => void
  onStrategyUpdate?: (strategyId: string, field: 'status', value: string) => void
  onStrategyRelations?: (strategy: StrategyRecord) => void
  statusOptions?: string[]
}

/**
 * Strategy Form Panel Props
 */
export interface StrategyFormPanelProps {
  isOpen: boolean
  onClose: () => void
  strategy?: StrategyRecord | null
  onSave: (strategy: StrategyFormData) => void
  statusOptions?: string[]
  categoryOptions?: string[]
  allStrategies?: StrategyRecord[] // For 100% validation
}