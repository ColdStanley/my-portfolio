'use client'

import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { TaskErrorBoundary, TaskLoadingSpinner, TaskErrorDisplay, ToastNotification } from '../Life/ErrorBoundary'
import MobilePlanCards from './MobilePlanCards'
import PlanFormPanel from '../Life/PlanFormPanel'
import RelationsTooltip from '../Life/RelationsTooltip'

interface PlanRecord {
  id: string
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  total_tasks: number
  completed_tasks: number
  display_order?: number
  parent_goal?: string[]
}

interface MobilePlanPanelProps {
  onPlansUpdate?: (plans: PlanRecord[]) => void
}

interface MobilePlanPanelRef {
  openCreateForm: () => void
}

const MobilePlanPanel = forwardRef<MobilePlanPanelRef, MobilePlanPanelProps>(({ onPlansUpdate }, ref) => {
  const [plans, setPlans] = useState<PlanRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)
  const [formPanelOpen, setFormPanelOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanRecord | null>(null)
  const [statusOptions, setStatusOptions] = useState<string[]>(['Not Started', 'In Progress', 'Completed', 'On Hold'])
  const [priorityOptions, setPriorityOptions] = useState<string[]>(['Q1 - Urgent Important', 'Q2 - Important Not Urgent', 'Q3 - Urgent Not Important', 'Q4 - Neither'])
  const [relationsTooltip, setRelationsTooltip] = useState<{
    isOpen: boolean
    plan: PlanRecord | null
  }>({ isOpen: false, plan: null })
  const [strategies, setStrategies] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])

  // Expose openCreateForm method to parent component
  useImperativeHandle(ref, () => ({
    openCreateForm: () => {
      setEditingPlan(null)
      setFormPanelOpen(true)
    }
  }), [])
  
  // Data fetching - unified with web version and mobile Task/Strategy pattern
  useEffect(() => {
    fetchPlans()
    fetchStrategies()
    fetchTasks()
    fetchSchemaOptions()
  }, [onPlansUpdate])

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

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/plan')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      const plansArray = result.data || []
      setPlans(plansArray)
      
      if (onPlansUpdate) {
        onPlansUpdate(plansArray)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
      setError(error instanceof Error ? error.message : 'Failed to load plans')
      setPlans([])
      
      if (onPlansUpdate) {
        onPlansUpdate([])
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStrategies = async () => {
    try {
      const response = await fetch('/api/strategy')
      if (response.ok) {
        const result = await response.json()
        setStrategies(result.data || [])
      }
    } catch (err) {
      console.warn('Failed to fetch strategies:', err)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const result = await response.json()
        setTasks(result.data || [])
      }
    } catch (err) {
      console.warn('Failed to fetch tasks:', err)
    }
  }

  const handleDeletePlan = useCallback(async (planId: string) => {
    try {
      const response = await fetch(`/api/plan?id=${planId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const updatedPlans = plans.filter(p => p.id !== planId)
        setPlans(updatedPlans)
        setToast({ message: 'Plan deleted successfully', type: 'success' })
        
        if (onPlansUpdate) {
          onPlansUpdate(updatedPlans)
        }
      } else {
        throw new Error('Failed to delete plan')
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      setToast({ message: 'Failed to delete plan', type: 'error' })
    }
  }, [plans, onPlansUpdate])

  const handleRefresh = useCallback(() => {
    fetchPlans()
  }, [])

  const handlePlanUpdate = useCallback(async (planId: string, field: 'status' | 'priority_quadrant', value: string) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    const updatedPlan = { ...plan, [field]: value }
    
    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlan)
      })
      
      if (response.ok) {
        setPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p))
        setToast({ message: `Plan ${field} updated successfully`, type: 'success' })
      } else {
        throw new Error(`Failed to update plan ${field}`)
      }
    } catch (error) {
      console.error(`Failed to update plan ${field}:`, error)
      setToast({ message: `Failed to update plan ${field}`, type: 'error' })
      throw error // Re-throw for error handling in component
    }
  }, [plans])

  const handleSavePlan = useCallback(async (planData: any) => {
    try {
      const isEditing = !!editingPlan
      
      if (isEditing) {
        planData.id = editingPlan!.id
      }
      
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} plan`)
      }
      
      setFormPanelOpen(false)
      setEditingPlan(null)
      fetchPlans() // Refresh data
      setToast({ 
        message: `Plan ${isEditing ? 'updated' : 'created'} successfully`, 
        type: 'success' 
      })
    } catch (error) {
      console.error('Error saving plan:', error)
      setToast({ message: 'Failed to save plan', type: 'error' })
    }
  }, [editingPlan])

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
        {/* Plan Cards */}
        <div className="mx-4">
          <MobilePlanCards
            plans={plans}
            onPlanClick={(plan) => {
              const notionPageUrl = `https://www.notion.so/${plan.id.replace(/-/g, '')}`
              window.open(notionPageUrl, '_blank')
            }}
            onPlanEdit={(plan) => {
              setEditingPlan(plan)
              setFormPanelOpen(true)
            }}
            onPlanDelete={handleDeletePlan}
            onPlanUpdate={handlePlanUpdate}
            onPlanRelations={(plan) => {
              setRelationsTooltip({ isOpen: true, plan })
            }}
            statusOptions={statusOptions}
            priorityOptions={priorityOptions}
          />
        </div>

        {/* Plan Form Panel */}
        <PlanFormPanel
          isOpen={formPanelOpen}
          onClose={() => {
            setFormPanelOpen(false)
            setEditingPlan(null)
          }}
          plan={editingPlan}
          onSave={handleSavePlan}
          statusOptions={['Not Started', 'In Progress', 'Completed', 'On Hold']}
          priorityOptions={['Q1 - Urgent Important', 'Q2 - Important Not Urgent', 'Q3 - Urgent Not Important', 'Q4 - Neither']}
          strategyOptions={strategies.map(strategy => ({
            id: strategy.id,
            objective: strategy.objective
          }))}
        />

        {/* Relations Tooltip */}
        {relationsTooltip.plan && (
          <RelationsTooltip
            type="plan"
            isOpen={relationsTooltip.isOpen}
            onClose={() => setRelationsTooltip({ isOpen: false, plan: null })}
            parentStrategyForPlan={(() => {
              const plan = relationsTooltip.plan
              // Filter strategies that this plan belongs to
              return strategies.filter(strategy => 
                plan.parent_goal && plan.parent_goal.includes(strategy.id)
              ).map(strategy => ({
                id: strategy.id,
                objective: strategy.objective,
                status: strategy.status
              }))
            })()}
            childTasks={(() => {
              const plan = relationsTooltip.plan
              // Filter tasks that belong to this plan
              return tasks.filter(task => 
                task.plan && task.plan.includes(plan.id)
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

MobilePlanPanel.displayName = 'MobilePlanPanel'

export default MobilePlanPanel
