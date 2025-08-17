'use client'

import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { TaskErrorBoundary, TaskLoadingSpinner, TaskErrorDisplay, ToastNotification } from '../Life/ErrorBoundary'
import MobileStrategyCards from './MobileStrategyCards'
import StrategyFormPanel from '../Life/StrategyFormPanel'
import RelationsTooltip from '../Life/RelationsTooltip'

interface StrategyRecord {
  id: string
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  category: string
  progress: number
  total_plans: number
  order?: number
}

interface MobileStrategyPanelProps {
  onStrategiesUpdate?: (strategies: StrategyRecord[]) => void
}

interface MobileStrategyPanelRef {
  openCreateForm: () => void
}

const MobileStrategyPanel = forwardRef<MobileStrategyPanelRef, MobileStrategyPanelProps>(({ onStrategiesUpdate }, ref) => {
  const [strategies, setStrategies] = useState<StrategyRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)
  const [formPanelOpen, setFormPanelOpen] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<StrategyRecord | null>(null)
  const [statusOptions, setStatusOptions] = useState<string[]>(['Not Started', 'In Progress', 'Completed', 'On Hold'])
  const [priorityOptions, setPriorityOptions] = useState<string[]>(['Q1 - Urgent Important', 'Q2 - Important Not Urgent', 'Q3 - Urgent Not Important', 'Q4 - Neither'])
  const [relationsTooltip, setRelationsTooltip] = useState<{
    isOpen: boolean
    strategy: StrategyRecord | null
  }>({ isOpen: false, strategy: null })
  const [plans, setPlans] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])

  // Expose openCreateForm method to parent component
  useImperativeHandle(ref, () => ({
    openCreateForm: () => {
      setEditingStrategy(null)
      setFormPanelOpen(true)
    }
  }), [])
  
  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch schema options first
        await fetchSchemaOptions()
        
        const [strategyResponse, planResponse, taskResponse] = await Promise.all([
          fetch('/api/strategy'),
          fetch('/api/plan'),
          fetch('/api/tasks')
        ])
        
        if (!strategyResponse.ok) {
          throw new Error('Failed to fetch strategies')
        }
        
        const strategyData = await strategyResponse.json()
        const strategiesArray = strategyData.data || []
        setStrategies(strategiesArray)
        
        if (onStrategiesUpdate) {
          onStrategiesUpdate(strategiesArray)
        }
        
        if (planResponse.ok) {
          const planData = await planResponse.json()
          setPlans(planData.data || [])
        }
        
        if (taskResponse.ok) {
          const taskData = await taskResponse.json()
          setTasks(taskData.data || [])
        }
        
      } catch (error) {
        console.error('Error fetching strategies:', error)
        setError(error instanceof Error ? error.message : 'Failed to load strategies')
        setStrategies([])
        
        if (onStrategiesUpdate) {
          onStrategiesUpdate([])
        }
        
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [onStrategiesUpdate])

  const fetchSchemaOptions = async () => {
    try {
      const response = await fetch('/api/tasks?action=schema')
      if (response.ok) {
        const result = await response.json()
        const schema = result.schema || {}
        
        if (schema.statusOptions && schema.statusOptions.length > 0) {
          setStatusOptions(schema.statusOptions)
        }
        if (schema.priorityOptions && schema.priorityOptions.length > 0) {
          setPriorityOptions(schema.priorityOptions)
        }
      }
    } catch (err) {
      console.warn('Failed to fetch schema options, using defaults:', err)
    }
  }

  const handleDeleteStrategy = useCallback(async (strategyId: string) => {
    try {
      const response = await fetch(`/api/strategy?id=${strategyId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const updatedStrategies = strategies.filter(s => s.id !== strategyId)
        setStrategies(updatedStrategies)
        setToast({ message: 'Strategy deleted successfully', type: 'success' })
        
        if (onStrategiesUpdate) {
          onStrategiesUpdate(updatedStrategies)
        }
      } else {
        throw new Error('Failed to delete strategy')
      }
    } catch (error) {
      console.error('Error deleting strategy:', error)
      setToast({ message: 'Failed to delete strategy', type: 'error' })
    }
  }, [strategies, onStrategiesUpdate])

  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  const handleStrategyUpdate = useCallback(async (strategyId: string, field: 'status' | 'priority_quadrant', value: string) => {
    const strategy = strategies.find(s => s.id === strategyId)
    if (!strategy) return

    const updatedStrategy = { ...strategy, [field]: value }
    
    try {
      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStrategy)
      })
      
      if (response.ok) {
        setStrategies(prev => prev.map(s => s.id === strategyId ? updatedStrategy : s))
        setToast({ message: `Strategy ${field} updated successfully`, type: 'success' })
      } else {
        throw new Error(`Failed to update strategy ${field}`)
      }
    } catch (error) {
      console.error(`Failed to update strategy ${field}:`, error)
      setToast({ message: `Failed to update strategy ${field}`, type: 'error' })
      throw error // Re-throw for error handling in component
    }
  }, [strategies])

  // Loading state
  if (loading) {
    return (
      <TaskErrorBoundary>
        <TaskLoadingSpinner />
      </TaskErrorBoundary>
    )
  }

  // Error state
  if (error) {
    return (
      <TaskErrorBoundary>
        <TaskErrorDisplay error={error} onRetry={handleRefresh} />
      </TaskErrorBoundary>
    )
  }

  return (
    <TaskErrorBoundary>
      <div className="w-full space-y-4 pb-32">
        {/* Strategy Cards */}
        <div className="mx-4">
          <MobileStrategyCards
            strategies={strategies}
            onStrategyClick={(strategy) => {
              const notionPageUrl = `https://www.notion.so/${strategy.id.replace(/-/g, '')}`
              window.open(notionPageUrl, '_blank')
            }}
            onStrategyEdit={(strategy) => {
              setEditingStrategy(strategy)
              setFormPanelOpen(true)
            }}
            onStrategyDelete={handleDeleteStrategy}
            onStrategyUpdate={handleStrategyUpdate}
            onStrategyRelations={(strategy) => {
              setRelationsTooltip({ isOpen: true, strategy })
            }}
            statusOptions={statusOptions}
            priorityOptions={priorityOptions}
          />
        </div>

        {/* Strategy Form Panel */}
        <StrategyFormPanel
          isOpen={formPanelOpen}
          onClose={() => setFormPanelOpen(false)}
          strategy={editingStrategy}
          onSave={async (strategyData) => {
            try {
              const isEditing = !!editingStrategy
              
              if (isEditing) {
                strategyData.id = editingStrategy!.id
              }
              
              const response = await fetch('/api/strategy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(strategyData)
              })
              
              if (!response.ok) {
                throw new Error(`Failed to ${isEditing ? 'update' : 'create'} strategy`)
              }
              
              const result = await response.json()
              
              if (isEditing) {
                const updatedStrategies = strategies.map(s => s.id === editingStrategy!.id ? { ...editingStrategy, ...strategyData } : s)
                setStrategies(updatedStrategies)
                setToast({ message: 'Strategy updated successfully', type: 'success' })
                
                if (onStrategiesUpdate) {
                  onStrategiesUpdate(updatedStrategies)
                }
              } else {
                const newStrategy = { ...strategyData, id: result.id || `temp-${Date.now()}` }
                const updatedStrategies = [...strategies, newStrategy]
                setStrategies(updatedStrategies)
                setToast({ message: 'Strategy created successfully', type: 'success' })
                
                if (onStrategiesUpdate) {
                  onStrategiesUpdate(updatedStrategies)
                }
              }
              
              setFormPanelOpen(false)
              setEditingStrategy(null)
            } catch (error) {
              console.error('Error saving strategy:', error)
              setToast({ message: 'Failed to save strategy', type: 'error' })
            }
          }}
          statusOptions={['Not Started', 'In Progress', 'Completed', 'On Hold']}
          priorityOptions={['Q1 - Urgent Important', 'Q2 - Important Not Urgent', 'Q3 - Urgent Not Important', 'Q4 - Neither']}
          categoryOptions={['Career', 'Health', 'Finance', 'Personal', 'Learning', 'Relationships']}
        />

        {/* Relations Tooltip */}
        {relationsTooltip.strategy && (
          <RelationsTooltip
            type="strategy"
            isOpen={relationsTooltip.isOpen}
            onClose={() => setRelationsTooltip({ isOpen: false, strategy: null })}
            childPlans={(() => {
              const strategy = relationsTooltip.strategy
              // Filter plans that belong to this strategy
              return plans.filter(plan => 
                plan.parent_goal && plan.parent_goal.includes(strategy.id)
              ).map(plan => ({
                id: plan.id,
                objective: plan.objective,
                status: plan.status,
                total_tasks: plan.total_tasks || 0,
                completed_tasks: plan.completed_tasks || 0
              }))
            })()}
            allChildTasks={(() => {
              const strategy = relationsTooltip.strategy
              // Get all tasks that belong to plans under this strategy
              const strategyPlanIds = plans
                .filter(plan => plan.parent_goal && plan.parent_goal.includes(strategy.id))
                .map(plan => plan.id)
              
              return tasks.filter(task => 
                task.plan && task.plan.some((planId: string) => strategyPlanIds.includes(planId))
              ).map(task => ({
                id: task.id,
                title: task.title,
                status: task.status,
                plan: task.plan
              }))
            })()}
          />
        )}

        {/* Toast Notification */}
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </TaskErrorBoundary>
  )
})

MobileStrategyPanel.displayName = 'MobileStrategyPanel'

export default MobileStrategyPanel
