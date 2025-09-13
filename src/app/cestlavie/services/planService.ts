import { PlanRecord, PlanFormData } from '../types/plan'

/**
 * Fetch all plans from API
 */
export async function fetchPlans(): Promise<PlanRecord[]> {
  const response = await fetch('/api/plan')
  
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
 * Fetch all strategies from API  
 */
export async function fetchStrategies(): Promise<any[]> {
  try {
    const response = await fetch('/api/strategy')
    if (response.ok) {
      const result = await response.json()
      return result.data || []
    }
  } catch (err) {
    console.warn('Failed to fetch strategies:', err)
  }
  return []
}

/**
 * Fetch all tasks from API
 */
export async function fetchTasks(): Promise<any[]> {
  try {
    const response = await fetch('/api/tasks')
    if (response.ok) {
      const result = await response.json()
      return result.data || []
    }
  } catch (err) {
    console.warn('Failed to fetch tasks:', err)
  }
  return []
}

/**
 * Delete a plan by ID
 */
export async function deletePlan(planId: string): Promise<void> {
  const response = await fetch(`/api/plan?id=${planId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Failed to delete plan')
  }
}

/**
 * Save (create or update) a plan
 */
export async function savePlan(planData: PlanFormData, planId?: string): Promise<void> {
  const payload = planId ? { ...planData, id: planId } : planData
  
  const response = await fetch('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  
  if (!response.ok) {
    throw new Error(`Failed to ${planId ? 'update' : 'create'} plan`)
  }
}

/**
 * Update a plan field
 */
export async function updatePlanField(
  plan: PlanRecord, 
  field: 'status', 
  value: string
): Promise<void> {
  const updatedPlan = { ...plan, [field]: value }
  
  const response = await fetch('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedPlan)
  })
  
  if (!response.ok) {
    throw new Error(`Failed to update plan ${field}`)
  }
}

/**
 * Fetch all plan-related data in parallel
 */
export async function fetchAllPlanData(): Promise<{
  plans: PlanRecord[]
  strategies: any[]
  tasks: any[]
}> {
  const [plans, strategies, tasks] = await Promise.all([
    fetchPlans(),
    fetchStrategies(),
    fetchTasks()
  ])
  
  return { plans, strategies, tasks }
}