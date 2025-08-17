'use client'

import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { TaskErrorBoundary, TaskLoadingSpinner, TaskErrorDisplay, ToastNotification } from '../Life/ErrorBoundary'
import MobileStrategyCards from './MobileStrategyCards'

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

  // Expose openCreateForm method to parent component
  useImperativeHandle(ref, () => ({
    openCreateForm: () => {
      // For now, redirect to Notion to create new strategy
      window.open('https://www.notion.so', '_blank')
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
              // Open strategy in Notion
              const notionPageUrl = `https://www.notion.so/${strategy.id.replace(/-/g, '')}`
              window.open(notionPageUrl, '_blank')
            }}
            onStrategyDelete={handleDeleteStrategy}
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

MobileStrategyPanel.displayName = 'MobileStrategyPanel'

export default MobileStrategyPanel
