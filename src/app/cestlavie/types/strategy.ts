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
  priority_quadrant: string
  category: string
  plan?: string[]
  task?: string[]
  progress: number
  total_plans: number
  order?: number
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
  priority_quadrant: string
  category: string
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
  onStrategyUpdate?: (strategyId: string, field: 'status' | 'priority_quadrant', value: string) => void
  onStrategyRelations?: (strategy: StrategyRecord) => void
  statusOptions?: string[]
  priorityOptions?: string[]
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
  priorityOptions?: string[]
  categoryOptions?: string[]
}