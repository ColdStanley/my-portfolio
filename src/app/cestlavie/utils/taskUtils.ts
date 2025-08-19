/**
 * Get default date-time in ISO format
 */
export function getDefaultDateTime(): string {
  const now = new Date()
  // Round to next 15 minute interval
  const minutes = Math.ceil(now.getMinutes() / 15) * 15
  now.setMinutes(minutes, 0, 0)
  
  return now.toISOString().slice(0, 16) // Return YYYY-MM-DDTHH:mm format
}

/**
 * Format date-time for display
 */
export function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return ''
  
  try {
    const date = new Date(dateTimeString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric', 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format date-time with weekday
 */
export function formatDateTimeWithWeekday(dateTimeString: string): string {
  if (!dateTimeString) return ''
  
  try {
    const date = new Date(dateTimeString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format date with weekday (no time)
 */
export function formatDateWithWeekday(dateTimeString: string): string {
  if (!dateTimeString) return ''
  
  try {
    const date = new Date(dateTimeString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format date and time for mobile display
 */
export function formatDateAndTime(startDate: string, endDate?: string): string {
  if (!startDate) return 'No date'
  
  try {
    const start = new Date(startDate)
    const startStr = start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    if (!endDate) return startStr
    
    const end = new Date(endDate)
    const endStr = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit', 
      hour12: true
    })
    
    // Same day - show date once
    if (start.toDateString() === end.toDateString()) {
      return `${startStr} - ${endStr}`
    }
    
    // Different days - show full dates
    const fullEndStr = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true  
    })
    
    return `${startStr} - ${fullEndStr}`
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Default form data for new tasks
 */
export function getDefaultTaskFormData(): {
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
  remind_before?: number
  plan?: string[]
  strategy?: string[]
  priority_quadrant: string
  note: string
} {
  const defaultStart = getDefaultDateTime()
  const endDate = new Date(defaultStart)
  endDate.setHours(endDate.getHours() + 1) // Default 1 hour duration
  
  return {
    title: '',
    status: '',
    start_date: defaultStart,
    end_date: endDate.toISOString().slice(0, 16),
    all_day: false,
    remind_before: 15,
    plan: [],
    strategy: [],
    priority_quadrant: '',
    note: ''
  }
}

/**
 * Generate Relations tooltip data for tasks
 */
export function getTaskRelationsData(
  task: { id?: string; plan?: string[]; strategy?: string[] },
  plans: any[],
  strategies: any[]
): {
  parentPlans: Array<{ id: string; objective: string; status: string; total_tasks: number; completed_tasks: number }>
  parentStrategies: Array<{ id: string; objective: string; status: string }>
} {
  const parentPlans = task.plan 
    ? plans.filter(plan => task.plan!.includes(plan.id)).map(plan => ({
        id: plan.id,
        objective: plan.objective,
        status: plan.status,
        total_tasks: plan.total_tasks || 0,
        completed_tasks: plan.completed_tasks || 0
      }))
    : []

  const parentStrategies = task.strategy 
    ? strategies.filter(strategy => task.strategy!.includes(strategy.id)).map(strategy => ({
        id: strategy.id,
        objective: strategy.objective,
        status: strategy.status
      }))
    : []

  return { parentPlans, parentStrategies }
}

/**
 * Sort tasks by date and time
 */
export function sortTasksByDateTime<T extends { start_date?: string; end_date?: string }>(tasks: T[]): T[] {
  return tasks.sort((a, b) => {
    const dateA = new Date(a.start_date || a.end_date || '9999-12-31').getTime()
    const dateB = new Date(b.start_date || b.end_date || '9999-12-31').getTime()
    return dateA - dateB
  })
}

/**
 * Filter tasks by date
 */
export function filterTasksByDate<T extends { start_date?: string; end_date?: string }>(
  tasks: T[], 
  selectedDate: string
): T[] {
  const targetDate = new Date(selectedDate).toDateString()
  
  return tasks.filter(task => {
    const taskStartDate = task.start_date ? new Date(task.start_date).toDateString() : null
    const taskEndDate = task.end_date ? new Date(task.end_date).toDateString() : null
    
    return taskStartDate === targetDate || taskEndDate === targetDate
  })
}

/**
 * Calculate elapsed time between two dates
 */
export function calculateElapsedTime(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  
  try {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    return Math.max(0, Math.round((end - start) / (1000 * 60))) // Return minutes
  } catch (error) {
    return 0
  }
}

/**
 * Format elapsed time in minutes to readable string
 */
export function formatElapsedTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}