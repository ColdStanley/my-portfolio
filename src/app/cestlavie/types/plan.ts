export interface PlanRecord {
  id: string
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  strategy?: string
  task?: string[]
  total_tasks: number
  completed_tasks: number
  display_order?: number
}

export interface PlanFormData {
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  strategy?: string
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
  priorityOptions: string[]
  strategyOptions: StrategyOption[]
}

export interface MobilePlanCardsProps {
  plans: PlanRecord[]
  onPlanClick?: (plan: PlanRecord) => void
  onPlanEdit?: (plan: PlanRecord) => void
  onPlanDelete?: (planId: string) => void
  onPlanUpdate?: (planId: string, field: 'status' | 'priority_quadrant', value: string) => void
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