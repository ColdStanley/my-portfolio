/**
 * Task record interface - unified across all components
 */
export interface TaskRecord {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
  remind_before?: number
  plan?: string
  priority_quadrant: string
  note: string
  outlook_event_id?: string
  actual_start?: string
  actual_end?: string
  elapsed_time?: number
  // Additional fields found in components
  completion_photo?: string
  pomodoro_count?: number
}

/**
 * Task form data interface
 */
export interface TaskFormData {
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
  remind_before?: number
  plan?: string
  priority_quadrant: string
  note: string
}

/**
 * Plan option interface
 */
export interface PlanOption {
  id: string
  objective: string
  strategy?: string
  task?: string[]
  title?: string // For backward compatibility
}

/**
 * Strategy option interface
 */
export interface StrategyOption {
  id: string
  objective: string
}

/**
 * Task Form Panel Props
 */
export interface TaskFormPanelProps {
  isOpen: boolean
  onClose: () => void
  task?: TaskRecord | null
  onSave: (task: TaskFormData) => void
  statusOptions?: string[]
  priorityOptions?: string[]
  planOptions?: PlanOption[]
  strategyOptions?: StrategyOption[]
}

/**
 * Mobile Task Panel Props
 */
export interface MobileTaskPanelProps {
  onTasksUpdate?: (tasks: TaskRecord[]) => void
}

/**
 * Mobile Task Panel Ref
 */
export interface MobileTaskPanelRef {
  openCreateForm: () => void
}

/**
 * Mobile Task Cards Props
 */
export interface MobileTaskCardsProps {
  tasks: TaskRecord[]
  onTaskClick?: (task: TaskRecord) => void
  onTaskEdit?: (task: TaskRecord) => void
  onTaskDelete?: (taskId: string) => void
  onTaskUpdate?: (taskId: string, field: 'status' | 'priority_quadrant', value: string) => void
  onTaskRelations?: (task: TaskRecord) => void
  statusOptions?: string[]
  priorityOptions?: string[]
}

/**
 * Task List View Props
 */
export interface TaskListViewProps {
  tasks: TaskRecord[]
  onTaskSelect: (task: TaskRecord) => void
  onTaskUpdate: (taskId: string, updates: Partial<TaskRecord>) => void
  onTaskDelete: (taskId: string) => void
  statusOptions: string[]
  priorityOptions: string[]
  selectedDate: string
}

/**
 * Task Charts Props
 */
export interface TaskChartsProps {
  tasks: TaskRecord[]
  onTaskClick?: (task: TaskRecord) => void
}

/**
 * Task Calendar View Props
 */
export interface TaskCalendarViewProps {
  tasks: TaskRecord[]
  onTaskSelect: (task: TaskRecord) => void
  onDateSelect: (date: string) => void
  selectedDate: string
  currentMonth: Date
  onMonthChange: (date: Date) => void
}