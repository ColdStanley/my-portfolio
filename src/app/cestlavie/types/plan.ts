export interface PlanRecord {
  id: string
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  strategy?: string
  task?: string[]
  total_tasks: number
  completed_tasks: number
  display_order?: number
  importance_percentage?: number
}

export interface PlanFormData {
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  strategy?: string
  importance_percentage?: number
}

export interface StrategyOption {
  id: string
  objective: string
}

export interface PlanFormPanelProps {
  isOpen: boolean
  onClose: () => void
  plan?: PlanRecord | null
  onSave: (plan: PlanFormData) => void
  statusOptions: string[]
  strategyOptions: StrategyOption[]
  allPlans?: PlanRecord[] // For 100% validation within Strategy scope
}

export interface MobilePlanCardsProps {
  plans: PlanRecord[]
  onPlanClick?: (plan: PlanRecord) => void
  onPlanEdit?: (plan: PlanRecord) => void
  onPlanDelete?: (planId: string) => void
  onPlanUpdate?: (planId: string, field: 'status', value: string) => void
  onPlanRelations?: (plan: PlanRecord) => void
  statusOptions?: string[]
  priorityOptions?: string[]
}

export interface MobilePlanPanelProps {
  onPlansUpdate?: (plans: PlanRecord[]) => void
}

export interface MobilePlanPanelRef {
  openCreateForm: () => void
}