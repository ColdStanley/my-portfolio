import { TaskRecord } from '../types/task'

/**
 * Fetch all tasks
 */
export async function fetchTasks(): Promise<TaskRecord[]> {
  const response = await fetch('/api/tasks')
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const result = await response.json()
  
  if (result.error) {
    throw new Error(result.error)
  }
  
  return result.data || []
}

/**
 * Fetch schema options (status, priority)
 */
export async function fetchTaskSchemaOptions(): Promise<{
  statusOptions: string[]
  priorityOptions: string[]
}> {
  console.log('fetchTaskSchemaOptions: Starting schema fetch...')
  
  try {
    const response = await fetch('/api/tasks?action=schema')
    console.log('fetchTaskSchemaOptions: Response status:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('fetchTaskSchemaOptions: API response:', result)
      
      const schema = result.schema || {}
      const finalOptions = {
        statusOptions: schema.statusOptions?.length > 0 ? schema.statusOptions : 
          ['Not Started', 'In Progress', 'Completed', 'On Hold'],
        priorityOptions: schema.priorityOptions?.length > 0 ? schema.priorityOptions :
          ['Important & Urgent', 'Important & Not Urgent', 'Not Important & Urgent', 'Not Important & Not Urgent']
      }
      
      console.log('fetchTaskSchemaOptions: Final options:', finalOptions)
      return finalOptions
    } else {
      const errorText = await response.text()
      console.warn('fetchTaskSchemaOptions: API error response:', response.status, errorText)
    }
  } catch (err) {
    console.warn('fetchTaskSchemaOptions: Fetch failed, using defaults:', err)
  }
  
  // Return defaults if fetch fails
  const defaults = {
    statusOptions: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
    priorityOptions: ['Important & Urgent', 'Important & Not Urgent', 'Not Important & Urgent', 'Not Important & Not Urgent']
  }
  console.log('fetchTaskSchemaOptions: Using defaults:', defaults)
  return defaults
}

/**
 * Save task (create or update)
 */
export async function saveTask(taskData: any, taskId?: string): Promise<void> {
  if (taskId) {
    taskData.id = taskId
  }
  
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  })
  
  if (!response.ok) {
    throw new Error(`Failed to ${taskId ? 'update' : 'create'} task`)
  }
}

/**
 * Delete task
 */
export async function deleteTask(taskId: string): Promise<void> {
  const response = await fetch(`/api/tasks?id=${taskId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Failed to delete task')
  }
}

/**
 * Update specific task field
 */
export async function updateTaskField(
  task: TaskRecord, 
  field: keyof TaskRecord, 
  value: any
): Promise<void> {
  const updatedTask = { ...task, [field]: value }
  
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTask)
  })
  
  if (!response.ok) {
    throw new Error(`Failed to update task ${String(field)}`)
  }
}

/**
 * Start task timer (update actual_start)
 */
export async function startTaskTimer(taskId: string): Promise<void> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: taskId,
      action: 'start_timer'
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to start task timer')
  }
}

/**
 * Stop task timer (update actual_end and elapsed_time)
 */
export async function stopTaskTimer(taskId: string): Promise<void> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: taskId,
      action: 'stop_timer'
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to stop task timer')
  }
}

/**
 * Complete task with optional photo
 */
export async function completeTask(taskId: string, completionPhoto?: string): Promise<void> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: taskId,
      status: 'Completed',
      completion_photo: completionPhoto,
      actual_end: new Date().toISOString()
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to complete task')
  }
}

/**
 * Fetch all task-related data concurrently
 */
export async function fetchAllTaskData(): Promise<{
  tasks: TaskRecord[]
  plans: any[]
  strategies: any[]
  schemaOptions: {
    statusOptions: string[]
    priorityOptions: string[]
  }
}> {
  // Import plan and strategy service functions
  const { fetchPlans } = await import('./planService')
  const { fetchStrategies } = await import('./strategyService')
  
  const [tasks, plans, strategies, schemaOptions] = await Promise.all([
    fetchTasks(),
    fetchPlans(),
    fetchStrategies(), 
    fetchTaskSchemaOptions()
  ])
  
  return { tasks, plans, strategies, schemaOptions }
}


/**
 * Manually sync task to Outlook
 */
export async function syncTaskToOutlook(taskId: string): Promise<void> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'sync',
      id: taskId
    })
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to sync task to Outlook')
  }
  
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || 'Sync failed')
  }
}