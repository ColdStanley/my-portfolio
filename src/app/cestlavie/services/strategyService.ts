import { StrategyRecord } from '../types/strategy'

/**
 * Fetch all strategies
 */
export async function fetchStrategies(): Promise<StrategyRecord[]> {
  const response = await fetch('/api/strategy')
  
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
 * Save strategy (create or update)
 */
export async function saveStrategy(strategyData: any, strategyId?: string): Promise<void> {
  if (strategyId) {
    strategyData.id = strategyId
  }
  
  const response = await fetch('/api/strategy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(strategyData)
  })
  
  if (!response.ok) {
    throw new Error(`Failed to ${strategyId ? 'update' : 'create'} strategy`)
  }
}

/**
 * Delete strategy
 */
export async function deleteStrategy(strategyId: string): Promise<void> {
  const response = await fetch(`/api/strategy?id=${strategyId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Failed to delete strategy')
  }
}

/**
 * Update specific strategy field
 */
export async function updateStrategyField(
  strategy: StrategyRecord, 
  field: 'status', 
  value: string
): Promise<void> {
  const updatedStrategy = { ...strategy, [field]: value }
  
  const response = await fetch('/api/strategy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedStrategy)
  })
  
  if (!response.ok) {
    throw new Error(`Failed to update strategy ${field}`)
  }
}

/**
 * Fetch all strategy-related data concurrently
 */
export async function fetchAllStrategyData(): Promise<{
  strategies: StrategyRecord[]
  plans: any[]
  tasks: any[]
}> {
  // Import plan service functions to maintain separation
  const { fetchPlans, fetchTasks } = await import('./planService')
  
  const [strategies, plans, tasks] = await Promise.all([
    fetchStrategies(),
    fetchPlans(),
    fetchTasks()
  ])
  
  return { strategies, plans, tasks }
}