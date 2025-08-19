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
        <p className="text-xs text-gray-500">Loading strategies...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <div className="text-red-500 text-sm mb-2">Error loading strategies</div>
        <p className="text-xs text-gray-500">{error}</p>
      </div>
    )
  }

  return (
    <>
      {strategies.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <div className="text-lg mb-2">🎯</div>
          <p className="text-sm mb-3">No strategies yet</p>
          {onAddStrategy && (
            <button 
              onClick={onAddStrategy}
              className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
            >
              Create First Strategy
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortStrategiesByOrder(strategies).map((strategy) => (
            <div key={strategy.id} className="relative p-3 bg-white/50 rounded-lg border border-purple-100 hover:bg-white/70 transition-colors">
              {/* Drill Down Button - Right Top Corner */}
              {onStrategyDrillDown && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStrategyDrillDown(strategy.id)
                  }}
                  className="absolute top-2 right-2 p-1 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors z-10"
                  title="View Plans"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Time */}
              <div className="text-xs text-purple-500 font-medium mb-1 pr-8">
                {formatDateRange(strategy.start_date, strategy.due_date)}
              </div>
              
              {/* Title */}
              <h4 
                className="text-sm font-semibold text-purple-900 cursor-pointer hover:text-purple-700 transition-colors line-clamp-2 mb-2 pr-8"
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
                    className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded border-0 text-xs cursor-pointer hover:bg-purple-100 transition-colors"
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
                    className="px-2 py-0.5 bg-gray-50 text-gray-700 rounded border-0 text-xs cursor-pointer hover:bg-gray-100 transition-colors"
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
                  {onStrategyEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onStrategyEdit(strategy)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
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
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
          ))}
        </div>
      )}
    </>
  )
}