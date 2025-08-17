'use client'

import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { TaskErrorBoundary, TaskLoadingSpinner, TaskErrorDisplay, ToastNotification } from '../Life/ErrorBoundary'
import MobileStrategyCards from './MobileStrategyCards'
import StrategyFormPanel from '../Life/StrategyFormPanel'

interface StrategyRecord {
  id: string
  objective: string
  status: string
  priority: string
  description: string
  created_time: string
  last_edited_time: string
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
        
        const response = await fetch('/api/strategy')
        
        if (response.ok) {
          const strategyData = await response.json()
          const strategiesArray = strategyData.data || []
          setStrategies(strategiesArray)
          
          if (onStrategiesUpdate) {
            onStrategiesUpdate(strategiesArray)
          }
        } else {
          throw new Error('Failed to fetch strategies')
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
