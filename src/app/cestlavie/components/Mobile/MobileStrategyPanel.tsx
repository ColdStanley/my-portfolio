'use client'

import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { TaskErrorBoundary, TaskLoadingSpinner, TaskErrorDisplay, ToastNotification } from '../Life/ErrorBoundary'
import MobileStrategyCards from './MobileStrategyCards'
import StrategyFormPanel from '../Life/StrategyFormPanel'
import RelationsTooltip from '../Life/RelationsTooltip'
import { StrategyRecord, MobileStrategyPanelProps, MobileStrategyPanelRef } from '../../types/strategy'
import { fetchSchemaOptions, openNotionPage, createFormCloseHandler } from '../../utils/planUtils'
import { getStrategyRelationsData } from '../../utils/strategyUtils'
import { fetchAllStrategyData, deleteStrategy, saveStrategy, updateStrategyField } from '../../services/strategyService'
import { STRATEGY_CATEGORY_OPTIONS } from '../../constants/strategyOptions'

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
  
  // Data fetching - unified with desktop version
  useEffect(() => {
    loadInitialData()
  }, [onStrategiesUpdate])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [strategyData, schemaOptions] = await Promise.all([
        fetchAllStrategyData(),
        fetchSchemaOptions()
      ])
      
      setStrategies(strategyData.strategies)
      setPlans(strategyData.plans)
      setTasks(strategyData.tasks)
      setStatusOptions(schemaOptions.statusOptions)
      setPriorityOptions(schemaOptions.priorityOptions)
      
      if (onStrategiesUpdate) {
        onStrategiesUpdate(strategyData.strategies)
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
      setStrategies([])
      
      if (onStrategiesUpdate) {
        onStrategiesUpdate([])
      }
    } finally {
      setLoading(false)
    }
  }


  const handleDeleteStrategy = useCallback(async (strategyId: string) => {
    try {
      await deleteStrategy(strategyId)
      const updatedStrategies = strategies.filter(s => s.id !== strategyId)
      setStrategies(updatedStrategies)
      setToast({ message: 'Strategy deleted successfully', type: 'success' })
      
      if (onStrategiesUpdate) {
        onStrategiesUpdate(updatedStrategies)
      }
    } catch (error) {
      console.error('Error deleting strategy:', error)
      setToast({ message: 'Failed to delete strategy', type: 'error' })
    }
  }, [strategies, onStrategiesUpdate])

  const handleRefresh = useCallback(() => {
    loadInitialData()
  }, [])

  const handleStrategyUpdate = useCallback(async (strategyId: string, field: 'status' | 'priority_quadrant', value: string) => {
    const strategy = strategies.find(s => s.id === strategyId)
    if (!strategy) return

    try {
      await updateStrategyField(strategy, field, value)
      const updatedStrategy = { ...strategy, [field]: value }
      
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
            onStrategyClick={(strategy) => openNotionPage(strategy.id)}
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
          onClose={createFormCloseHandler(setFormPanelOpen, setEditingStrategy)}
          strategy={editingStrategy}
          onSave={async (strategyData) => {
            try {
              const isEditing = !!editingStrategy
              
              await saveStrategy(strategyData, isEditing ? editingStrategy!.id : undefined)
              
              setFormPanelOpen(false)
              setEditingStrategy(null)
              loadInitialData() // Refresh data
              setToast({ 
                message: `Strategy ${isEditing ? 'updated' : 'created'} successfully`, 
                type: 'success' 
              })
            } catch (error) {
              console.error('Error saving strategy:', error)
              setToast({ message: 'Failed to save strategy', type: 'error' })
            }
          }}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          categoryOptions={STRATEGY_CATEGORY_OPTIONS}
        />

        {/* Relations Tooltip */}
        {relationsTooltip.strategy && (
          <RelationsTooltip
            type="strategy"
            isOpen={relationsTooltip.isOpen}
            onClose={() => setRelationsTooltip({ isOpen: false, strategy: null })}
            {...(() => {
              const { childPlans, allChildTasks } = getStrategyRelationsData(relationsTooltip.strategy, plans, tasks)
              return { childPlans, allChildTasks }
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
