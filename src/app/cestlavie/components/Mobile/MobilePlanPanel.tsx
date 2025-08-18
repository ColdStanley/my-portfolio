'use client'

import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { TaskErrorBoundary, TaskLoadingSpinner, TaskErrorDisplay, ToastNotification } from '../Life/ErrorBoundary'
import MobilePlanCards from './MobilePlanCards'
import PlanFormPanel from '../Life/PlanFormPanel'
import RelationsTooltip from '../Life/RelationsTooltip'
import { PlanRecord, MobilePlanPanelProps, MobilePlanPanelRef } from '../../types/plan'
import { fetchSchemaOptions, openNotionPage, createFormCloseHandler, getPlanRelationsData } from '../../utils/planUtils'
import { fetchAllPlanData, deletePlan, savePlan, updatePlanField } from '../../services/planService'


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
    loadInitialData()
  }, [onPlansUpdate])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [planData, schemaOptions] = await Promise.all([
        fetchAllPlanData(),
        fetchSchemaOptions()
      ])
      
      setPlans(planData.plans)
      setStrategies(planData.strategies)
      setTasks(planData.tasks)
      setStatusOptions(schemaOptions.statusOptions)
      setPriorityOptions(schemaOptions.priorityOptions)
      
      if (onPlansUpdate) {
        onPlansUpdate(planData.plans)
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
      setPlans([])
      
      if (onPlansUpdate) {
        onPlansUpdate([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlan = useCallback(async (planId: string) => {
    try {
      await deletePlan(planId)
      const updatedPlans = plans.filter(p => p.id !== planId)
      setPlans(updatedPlans)
      setToast({ message: 'Plan deleted successfully', type: 'success' })
      
      if (onPlansUpdate) {
        onPlansUpdate(updatedPlans)
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      setToast({ message: 'Failed to delete plan', type: 'error' })
    }
  }, [plans, onPlansUpdate])

  const handleRefresh = useCallback(() => {
    loadInitialData()
  }, [])

  const handlePlanUpdate = useCallback(async (planId: string, field: 'status' | 'priority_quadrant', value: string) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    try {
      await updatePlanField(plan, field, value)
      const updatedPlan = { ...plan, [field]: value }
      setPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p))
      setToast({ message: `Plan ${field} updated successfully`, type: 'success' })
    } catch (error) {
      console.error(`Failed to update plan ${field}:`, error)
      setToast({ message: `Failed to update plan ${field}`, type: 'error' })
    }
  }, [plans])

  const handleSavePlan = useCallback(async (planData: any) => {
    try {
      const isEditing = !!editingPlan
      
      if (isEditing) {
        planData.id = editingPlan!.id
      }
      
      await savePlan(planData, isEditing ? editingPlan!.id : undefined)
      
      setFormPanelOpen(false)
      setEditingPlan(null)
      loadInitialData() // Refresh data
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
            onPlanClick={(plan) => openNotionPage(plan.id)}
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
          onClose={createFormCloseHandler(setFormPanelOpen, setEditingPlan)}
          plan={editingPlan}
          onSave={handleSavePlan}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
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
            {...(() => {
              const { parentStrategies, childTasks } = getPlanRelationsData(relationsTooltip.plan, strategies, tasks)
              return {
                parentStrategyForPlan: parentStrategies,
                childTasks: childTasks
              }
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
