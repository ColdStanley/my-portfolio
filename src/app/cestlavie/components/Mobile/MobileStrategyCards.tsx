'use client'

import { useMemo, useCallback, useState, useRef } from 'react'

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

interface MobileStrategyCardsProps {
  strategies: StrategyRecord[]
  onStrategyClick?: (strategy: StrategyRecord) => void
  onStrategyEdit?: (strategy: StrategyRecord) => void
  onStrategyDelete?: (strategyId: string) => void
  onStrategyRelations?: (strategy: StrategyRecord) => void
}

export default function MobileStrategyCards({ 
  strategies, 
  onStrategyClick,
  onStrategyEdit,
  onStrategyDelete,
  onStrategyRelations
}: MobileStrategyCardsProps) {
  
  const [deleteTooltip, setDeleteTooltip] = useState<{
    isOpen: boolean
    strategy: StrategyRecord | null
    triggerElement: HTMLElement | null
  }>({ isOpen: false, strategy: null, triggerElement: null })
  
  const deleteButtonRefs = useRef<{[strategyId: string]: HTMLButtonElement}>({})

  // Sort strategies by order (same as web version)
  const sortedStrategies = useMemo(() => {
    return strategies.sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999))
  }, [strategies])

  const formatDateRange = useCallback((startDate: string, endDate: string): string => {
    if (!startDate && !endDate) return 'No dates'
    
    try {
      // Convert UTC dates to local timezone for display
      const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
      const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
      
      if (start && end) {
        return `${start} - ${end}`
      }
      
      return start || end
    } catch (error) {
      return 'Invalid date'
    }
  }, [])

  const handleNotionClick = useCallback((strategy: StrategyRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    const notionPageUrl = `https://www.notion.so/${strategy.id.replace(/-/g, '')}`
    window.open(notionPageUrl, '_blank')
  }, [])

  const handleEditClick = useCallback((strategy: StrategyRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onStrategyEdit) {
      onStrategyEdit(strategy)
    }
  }, [onStrategyEdit])

  const handleRelationsClick = useCallback((strategy: StrategyRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onStrategyRelations) {
      onStrategyRelations(strategy)
    }
  }, [onStrategyRelations])

  const handleDeleteClick = useCallback((strategy: StrategyRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    const button = e.currentTarget as HTMLButtonElement
    setDeleteTooltip({
      isOpen: true,
      strategy,
      triggerElement: button
    })
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTooltip.strategy && onStrategyDelete) {
      onStrategyDelete(deleteTooltip.strategy.id)
    }
    setDeleteTooltip({ isOpen: false, strategy: null, triggerElement: null })
  }, [deleteTooltip.strategy, onStrategyDelete])

  if (sortedStrategies.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No strategies found</h3>
        <p className="text-gray-600">Create a new strategy to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedStrategies.map(strategy => {
        const isCompleted = strategy.status === 'Completed'
        
        return (
          <div
            key={strategy.id}
            className={`p-4 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl cursor-pointer
              ${isCompleted 
                ? 'bg-gradient-to-r from-purple-50/90 to-purple-100/90 opacity-75' 
                : 'bg-white/90 hover:bg-gradient-to-r hover:from-purple-25/90 hover:to-purple-50/90'
              }`}
            onClick={() => onStrategyClick && onStrategyClick(strategy)}
          >
            {/* Strategy Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 
                  className={`text-lg font-semibold ${
                    isCompleted ? 'text-purple-500 line-through' : 'text-purple-600'
                  } hover:underline transition-colors`}
                  onClick={(e) => handleNotionClick(strategy, e)}
                  title="Click to edit in Notion"
                >
                  {strategy.objective}
                </h3>
                
                {/* Date Range */}
                <span className="text-sm font-medium text-purple-500">
                  {formatDateRange(strategy.start_date, strategy.due_date)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1">
                {/* Row 1: Edit, Delete */}
                <div className="flex gap-1">
                  {/* Edit Button */}
                  {onStrategyEdit && (
                    <button
                      onClick={(e) => handleEditClick(strategy, e)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      title="Edit strategy"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Delete Button */}
                  {onStrategyDelete && (
                    <button
                      ref={el => {
                        if (el) deleteButtonRefs.current[strategy.id] = el
                      }}
                      onClick={(e) => handleDeleteClick(strategy, e)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete strategy"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Row 2: Relations Button */}
                {onStrategyRelations && (
                  <div className="flex">
                    <button
                      onClick={(e) => handleRelationsClick(strategy, e)}
                      className="w-full px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      title="View Relations"
                    >
                      Relations
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Labels Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {/* Status */}
              <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
                {strategy.status || 'No Status'}
              </span>

              {/* Priority */}
              <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
                {strategy.priority_quadrant || 'No Priority'}
              </span>

              {/* Category */}
              <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
                {strategy.category || 'No Category'}
              </span>
            </div>

            {/* Description */}
            {strategy.description && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{strategy.description}</p>
              </div>
            )}
          </div>
        )
      })}

      {/* Delete Confirmation Tooltip */}
      {deleteTooltip.isOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setDeleteTooltip({ isOpen: false, strategy: null, triggerElement: null })}>
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Strategy</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deleteTooltip.strategy?.objective}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTooltip({ isOpen: false, strategy: null, triggerElement: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}