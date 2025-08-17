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
  
  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [planResponse, strategyResponse, taskResponse] = await Promise.all([
          fetch('/api/plan'),
          fetch('/api/strategy'),
          fetch('/api/tasks')
        ])
        
        if (!planResponse.ok) {
          throw new Error('Failed to fetch plans')
        }
        
        const planData = await planResponse.json()
        const plansArray = planData.data || []
        setPlans(plansArray)
        
        if (onPlansUpdate) {
          onPlansUpdate(plansArray)
        }
        
        if (strategyResponse.ok) {
          const strategyData = await strategyResponse.json()
          setStrategies(strategyData.data || [])
        }
        
        if (taskResponse.ok) {
          const taskData = await taskResponse.json()
          setTasks(taskData.data || [])
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load plans')
        setPlans([])
        
        if (onPlansUpdate) {
          onPlansUpdate([])
        }
        
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [onPlansUpdate])

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
    window.location.reload()
  }, [])

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
            onPlanRelations={(plan) => {
              setRelationsTooltip({ isOpen: true, plan })
            }}
          />
        </div>

        {/* Plan Form Panel */}
        <PlanFormPanel
          isOpen={formPanelOpen}
          onClose={() => setFormPanelOpen(false)}
          editingPlan={editingPlan}
          strategies={strategies}
          onPlanCreated={(plan) => {
            const updatedPlans = [...plans, plan]
            setPlans(updatedPlans)
            setFormPanelOpen(false)
            setToast({ message: 'Plan created successfully', type: 'success' })
            
            if (onPlansUpdate) {
              onPlansUpdate(updatedPlans)
            }
          }}
          onPlanUpdated={(plan) => {
            const updatedPlans = plans.map(p => p.id === plan.id ? plan : p)
            setPlans(updatedPlans)
            setFormPanelOpen(false)
            setToast({ message: 'Plan updated successfully', type: 'success' })
            
            if (onPlansUpdate) {
              onPlansUpdate(updatedPlans)
            }
          }}
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
