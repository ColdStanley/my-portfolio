'use client'

import { StrategyRecord } from '../../types/strategy'
import { updateStrategyField } from '../../services/strategyService'
import { formatDateRange, openNotionPage } from '../../utils/planUtils'
import { sortStrategiesByOrder } from '../../utils/strategyUtils'

interface StrategyContentProps {
  strategies: StrategyRecord[]
  loading?: boolean
  error?: string | null
  onAddStrategy?: () => void
  onStrategyUpdate?: (strategyId: string, field: 'status' | 'priority_quadrant', value: string) => void
  onStrategyEdit?: (strategy: StrategyRecord) => void
  onStrategyDelete?: (strategyId: string) => void
  onStrategyDrillDown?: (strategyId: string) => void
  onAddPlanFromStrategy?: (strategyId: string) => void
  enableDrillDown?: boolean
  statusOptions?: string[]
  priorityOptions?: string[]
  categoryOptions?: string[]
}

export default function StrategyContent({ 
  strategies, 
  loading = false, 
  error = null, 
  onAddStrategy,
  onStrategyUpdate,
  onStrategyEdit,
  onStrategyDelete,
  onStrategyDrillDown,
  onAddPlanFromStrategy,
  enableDrillDown = true,
  statusOptions = [],
  priorityOptions = [],
  categoryOptions = []
}: StrategyContentProps) {

  const handleStrategyUpdate = async (strategyId: string, field: 'status' | 'priority_quadrant', value: string) => {
    if (onStrategyUpdate) {
      onStrategyUpdate(strategyId, field, value)
    } else {
      // Fallback to direct update if no callback provided
      const strategy = strategies.find(s => s.id === strategyId)
      if (!strategy) return

      try {
        await updateStrategyField(strategy, field, value)
      } catch (error) {
        console.error(`Failed to update strategy ${field}:`, error)
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mb-2"></div>
        <p className="text-xs text-purple-600">Loading strategies...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <div className="text-red-500 text-sm mb-2">Error loading strategies</div>
        <p className="text-xs text-purple-600">{error}</p>
      </div>
    )
  }

  return (
    <>
      {strategies.length === 0 ? (
        <div className="text-center py-6 text-purple-900">
          <div className="text-lg mb-2">🎯</div>
          <p className="text-sm mb-3">No strategies yet</p>
          {onAddStrategy && (
            <button 
              onClick={onAddStrategy}
              className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
            >
              Create First Strategy
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortStrategiesByOrder(strategies).sort((a, b) => {
            // Sort by status: completed strategies last
            const aCompleted = a.status === 'Completed'
            const bCompleted = b.status === 'Completed'
            
            if (aCompleted && !bCompleted) return 1
            if (!aCompleted && bCompleted) return -1
            
            return 0
          }).map((strategy) => {
            const isCompleted = strategy.status === 'Completed'
            
            return (
            <div key={strategy.id} className={`relative p-3 bg-purple-600/20 rounded-lg shadow-lg hover:bg-purple-600/25 transition-colors ${
              isCompleted ? 'border-l-4 border-purple-600' : ''
            }`}>
              {/* Completion Check Icon - Right Top Corner */}
              {isCompleted && (
                <div className="absolute top-2 right-2 text-purple-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {/* Drill Down Button - Right Top Corner - Desktop Only */}
              {onStrategyDrillDown && enableDrillDown && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStrategyDrillDown(strategy.id)
                  }}
                  className={`absolute top-2 p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-600/10 rounded transition-colors z-10 ${
                    isCompleted ? 'right-8' : 'right-2'
                  }`}
                  title="View Plans"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Time */}
              <div className="text-xs text-purple-600 font-medium mb-1 pr-8">
                {formatDateRange(strategy.start_date, strategy.due_date)}
              </div>
              
              {/* Title */}
              <h4 
                className="text-sm font-semibold text-purple-900 cursor-pointer hover:text-purple-800 transition-colors line-clamp-2 mb-2 pr-8"
                onClick={() => openNotionPage(strategy.id)}
                title="Click to open in Notion"
              >
                {strategy.objective || 'Untitled Strategy'}
              </h4>
              
              {/* Status & Priority */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={strategy.status || ''}
                    onChange={(e) => handleStrategyUpdate(strategy.id, 'status', e.target.value)}
                    className="px-2 py-0.5 bg-purple-600/10 text-purple-900 rounded border-0 text-xs cursor-pointer hover:bg-purple-600/15 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">No Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  
                  <select
                    value={strategy.priority_quadrant || ''}
                    onChange={(e) => handleStrategyUpdate(strategy.id, 'priority_quadrant', e.target.value)}
                    className="px-2 py-0.5 bg-purple-600/10 text-purple-900 rounded border-0 text-xs cursor-pointer hover:bg-purple-600/15 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">No Priority</option>
                    {priorityOptions.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {onAddPlanFromStrategy && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddPlanFromStrategy(strategy.id)
                      }}
                      className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-600/10 rounded transition-colors"
                      title="Add Plan to this Strategy"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  )}
                  {onStrategyEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onStrategyEdit(strategy)
                      }}
                      className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-600/10 rounded transition-colors"
                      title="Edit"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  {onStrategyDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onStrategyDelete(strategy.id)
                      }}
                      className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-600/10 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </>
  )
}