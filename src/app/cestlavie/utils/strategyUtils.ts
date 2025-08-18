/**
 * Get default date in YYYY-MM-DD format (reuse from planUtils)
 */
export function getDefaultDate(): string {
  const now = new Date()
  return now.getFullYear() + '-' +
         String(now.getMonth() + 1).padStart(2, '0') + '-' +
         String(now.getDate()).padStart(2, '0')
}

/**
 * Default form data for new strategies
 */
export function getDefaultStrategyFormData(): {
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  category: string
} {
  const defaultDate = getDefaultDate()
  return {
    objective: '',
    description: '',
    start_date: defaultDate,
    due_date: defaultDate,
    status: '',
    priority_quadrant: '',
    category: ''
  }
}

/**
 * Generate Relations tooltip data for strategies
 */
export function getStrategyRelationsData(
  strategy: { id?: string; plan?: string[]; task?: string[] },
  plans: any[],
  tasks: any[]
): {
  childPlans: Array<{ id: string; objective: string; status: string; total_tasks: number; completed_tasks: number }>
  allChildTasks: Array<{ id: string; title: string; status: string; plan: string[] }>
} {
  const childPlans = strategy.plan 
    ? plans.filter(plan => strategy.plan!.includes(plan.id)).map(plan => ({
        id: plan.id,
        objective: plan.objective,
        status: plan.status,
        total_tasks: plan.total_tasks || 0,
        completed_tasks: plan.completed_tasks || 0
      }))
    : []

  const allChildTasks = strategy.task 
    ? tasks.filter(task => strategy.task!.includes(task.id)).map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        plan: [] // Direct strategy tasks
      }))
    : []

  return { childPlans, allChildTasks }
}

/**
 * Sort strategies by order
 */
export function sortStrategiesByOrder<T extends { order?: number }>(strategies: T[]): T[] {
  return strategies.sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999))
}