/**
 * Format date range for display using local timezone
 */
export function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return 'No dates'
  
  try {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
    const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
    
    if (start && end) {
      return `${start} - ${end}`
    }
    
    return start || end
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Get default date in YYYY-MM-DD format
 */
export function getDefaultDate(): string {
  const now = new Date()
  return now.getFullYear() + '-' +
         String(now.getMonth() + 1).padStart(2, '0') + '-' +
         String(now.getDate()).padStart(2, '0')
}

/**
 * Fetch schema options from API
 */
export async function fetchSchemaOptions(): Promise<{
  statusOptions: string[]
  priorityOptions: string[]
}> {
  try {
    const response = await fetch('/api/tasks?action=schema')
    if (response.ok) {
      const result = await response.json()
      const schema = result.schema || {}
      
      return {
        statusOptions: schema.statusOptions?.length > 0 ? schema.statusOptions : 
          ['Not Started', 'In Progress', 'Completed', 'On Hold'],
        priorityOptions: schema.priorityOptions?.length > 0 ? schema.priorityOptions :
          ['Q1 - Urgent Important', 'Q2 - Important Not Urgent', 'Q3 - Urgent Not Important', 'Q4 - Neither']
      }
    }
  } catch (err) {
    console.warn('Failed to fetch schema options, using defaults:', err)
  }
  
  // Return defaults if fetch fails
  return {
    statusOptions: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
    priorityOptions: ['Q1 - Urgent Important', 'Q2 - Important Not Urgent', 'Q3 - Urgent Not Important', 'Q4 - Neither']
  }
}

/**
 * Default form data for new plans
 */
export function getDefaultPlanFormData(): {
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  parent_goal: string[]
} {
  const defaultDate = getDefaultDate()
  return {
    objective: '',
    description: '',
    start_date: defaultDate,
    due_date: defaultDate,
    status: '',
    parent_goal: []
  }
}

/**
 * Default empty form data (for reset)
 */
export function getEmptyPlanFormData(): {
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  parent_goal: string[]
} {
  return {
    objective: '',
    description: '',
    start_date: '',
    due_date: '',
    status: '',
    parent_goal: []
  }
}

/**
 * Open Notion page in new tab
 */
export function openNotionPage(id: string): void {
  const notionPageUrl = `https://www.notion.so/${id.replace(/-/g, '')}`
  window.open(notionPageUrl, '_blank')
}

/**
 * Generate Relations tooltip data for plans
 */
export function getPlanRelationsData(
  plan: { id?: string; strategy?: string[]; task?: string[] },
  strategies: any[],
  tasks: any[]
): {
  parentStrategies: Array<{ id: string; objective: string; status: string }>
  childTasks: Array<{ id: string; title: string; status: string; plan: string[] }>
} {
  const parentStrategies = plan.strategy 
    ? strategies.filter(strategy => plan.strategy!.includes(strategy.id)).map(strategy => ({
        id: strategy.id,
        objective: strategy.objective,
        status: strategy.status
      }))
    : []

  const childTasks = plan.task 
    ? tasks.filter(task => plan.task!.includes(task.id)).map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        plan: [plan.id || ''] // Maintain interface compatibility
      }))
    : []

  return { parentStrategies, childTasks }
}

/**
 * Create form panel close handler
 */
export function createFormCloseHandler(
  setFormPanelOpen: (open: boolean) => void,
  setEditingItem: (item: any) => void
) {
  return () => {
    setFormPanelOpen(false)
    setEditingItem(null)
  }
}

/**
 * Sort plans by display_order
 */
export function sortPlansByOrder<T extends { display_order?: number }>(plans: T[]): T[] {
  return plans.sort((a, b) => (a.display_order ?? 999999) - (b.display_order ?? 999999))
}