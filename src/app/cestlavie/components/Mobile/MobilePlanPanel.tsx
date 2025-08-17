'use client'

import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { TaskErrorBoundary, TaskLoadingSpinner, TaskErrorDisplay, ToastNotification } from '../Life/ErrorBoundary'
import MobilePlanCards from './MobilePlanCards'

interface PlanRecord {
  id: string
  title: string
  status: string
  priority: string
  notes: string
  parent_goal?: string[]
  created_time: string
  last_edited_time: string
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

  // Expose openCreateForm method to parent component
  useImperativeHandle(ref, () => ({
    openCreateForm: () => {
      // For now, redirect to Notion to create new plan
      window.open('https://www.notion.so', '_blank')
    }
  }), [])
  
  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/plan')
        
        if (response.ok) {
          const planData = await response.json()
          const plansArray = planData.data || []
          setPlans(plansArray)
          
          if (onPlansUpdate) {
            onPlansUpdate(plansArray)
          }
        } else {
          throw new Error('Failed to fetch plans')
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
              // Open plan in Notion
              const notionPageUrl = `https://www.notion.so/${plan.id.replace(/-/g, '')}`
              window.open(notionPageUrl, '_blank')
            }}
            onPlanDelete={handleDeletePlan}
          />
        </div>

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
