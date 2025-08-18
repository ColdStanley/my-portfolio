'use client'

import { useMemo, useCallback, useState, useRef } from 'react'
import BottomSheet from '../Life/BottomSheet'
import { PlanRecord, MobilePlanCardsProps } from '../../types/plan'
import { formatDateRange, openNotionPage } from '../../utils/planUtils'


export default function MobilePlanCards({ 
  plans, 
  onPlanClick,
  onPlanEdit,
  onPlanDelete,
  onPlanUpdate,
  onPlanRelations,
  statusOptions = [],
  priorityOptions = []
}: MobilePlanCardsProps) {
  
  const [deleteTooltip, setDeleteTooltip] = useState<{
    isOpen: boolean
    plan: PlanRecord | null
    triggerElement: HTMLElement | null
  }>({ isOpen: false, plan: null, triggerElement: null })
  
  const [bottomSheet, setBottomSheet] = useState<{
    isOpen: boolean
    planId: string | null
    field: 'status' | 'priority_quadrant' | null
    currentValue: string
  }>({ isOpen: false, planId: null, field: null, currentValue: '' })
  
  
  const deleteButtonRefs = useRef<{[planId: string]: HTMLButtonElement}>({})

  // Sort plans by display order (same as web version)
  const sortedPlans = useMemo(() => {
    return plans.sort((a, b) => (a.display_order ?? 999999) - (b.display_order ?? 999999))
  }, [plans])


  const handleNotionClick = useCallback((plan: PlanRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    openNotionPage(plan.id)
  }, [])

  const handleEditClick = useCallback((plan: PlanRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPlanEdit) {
      onPlanEdit(plan)
    }
  }, [onPlanEdit])

  const handleRelationsClick = useCallback((plan: PlanRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPlanRelations) {
      onPlanRelations(plan)
    }
  }, [onPlanRelations])

  const handleDeleteClick = useCallback((plan: PlanRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    const button = e.currentTarget as HTMLButtonElement
    setDeleteTooltip({
      isOpen: true,
      plan,
      triggerElement: button
    })
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTooltip.plan && onPlanDelete) {
      onPlanDelete(deleteTooltip.plan.id)
    }
    setDeleteTooltip({ isOpen: false, plan: null, triggerElement: null })
  }, [deleteTooltip.plan, onPlanDelete])

  const handleFieldClick = useCallback((planId: string, field: 'status' | 'priority_quadrant', currentValue: string) => {
    setBottomSheet({
      isOpen: true,
      planId,
      field,
      currentValue: currentValue || ''
    })
  }, [])

  const handleBottomSheetSelect = useCallback(async (value: string) => {
    if (!bottomSheet.planId || !bottomSheet.field || !onPlanUpdate) return

    try {
      await onPlanUpdate(bottomSheet.planId, bottomSheet.field, value)
    } catch (error) {
      console.error('Failed to update plan field:', error)
    } finally {
      setBottomSheet({ isOpen: false, planId: null, field: null, currentValue: '' })
    }
  }, [bottomSheet, onPlanUpdate])

  if (sortedPlans.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No plans found</h3>
        <p className="text-gray-600">Create a new plan to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedPlans.map(plan => {
        const isCompleted = plan.status === 'Completed'
        
        return (
          <div
            key={plan.id}
            className={`p-4 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl cursor-pointer
              ${isCompleted 
                ? 'bg-gradient-to-r from-purple-50/90 to-purple-100/90 opacity-75' 
                : 'bg-white/90 hover:bg-gradient-to-r hover:from-purple-25/90 hover:to-purple-50/90'
              }`}
            onClick={() => onPlanClick && onPlanClick(plan)}
          >
            {/* Plan Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 
                  className={`text-lg font-semibold ${
                    isCompleted ? 'text-purple-500 line-through' : 'text-purple-600'
                  } hover:underline transition-colors`}
                  onClick={(e) => handleNotionClick(plan, e)}
                  title="Click to edit in Notion"
                >
                  {plan.objective || 'Untitled Plan'}
                </h3>
                
                {/* Date Range */}
                <span className="text-sm font-medium text-purple-500">
                  {formatDateRange(plan.start_date, plan.due_date)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1">
                {/* Row 1: Edit, Delete */}
                <div className="flex gap-1">
                  {/* Edit Button */}
                  {onPlanEdit && (
                    <button
                      onClick={(e) => handleEditClick(plan, e)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      title="Edit plan"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Delete Button */}
                  {onPlanDelete && (
                    <button
                      ref={el => {
                        if (el) deleteButtonRefs.current[plan.id] = el
                      }}
                      onClick={(e) => handleDeleteClick(plan, e)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete plan"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Row 2: Relations Button */}
                {onPlanRelations && (
                  <div className="flex">
                    <button
                      onClick={(e) => handleRelationsClick(plan, e)}
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
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Status - Clickable */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFieldClick(plan.id, 'status', plan.status)
                }}
                className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {plan.status}
              </button>

              {/* Priority - Clickable */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFieldClick(plan.id, 'priority_quadrant', plan.priority_quadrant || '')
                }}
                className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {plan.priority_quadrant || 'No Priority'}
              </button>
            </div>

            {/* Description */}
            {plan.description && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{plan.description}</p>
              </div>
            )}
          </div>
        )
      })}

      {/* Delete Confirmation Tooltip */}
      {deleteTooltip.isOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setDeleteTooltip({ isOpen: false, plan: null, triggerElement: null })}>
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Plan</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deleteTooltip.plan?.objective}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTooltip({ isOpen: false, plan: null, triggerElement: null })}
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

      {/* Bottom Sheet for Status/Priority Selection */}
      <BottomSheet
        isOpen={bottomSheet.isOpen}
        onClose={() => setBottomSheet({ isOpen: false, planId: null, field: null, currentValue: '' })}
        onSelect={handleBottomSheetSelect}
        options={
          bottomSheet.field === 'status'
            ? statusOptions.map(option => ({ value: option, label: option }))
            : bottomSheet.field === 'priority_quadrant'
            ? [{ value: '', label: 'No Priority' }, ...priorityOptions.map(option => ({ value: option, label: option }))]
            : []
        }
        currentValue={bottomSheet.currentValue}
        title={`Select ${bottomSheet.field === 'status' ? 'Status' : 'Priority'}`}
        loading={false}
      />
    </div>
  )
}