'use client'

import { useEffect, useState } from 'react'
import RelationsTooltip from './RelationsTooltip'
import PlanFormPanel from './PlanFormPanel'
import { PlanRecord } from '../../types/plan'
import { formatDateRange, fetchSchemaOptions, openNotionPage, getPlanRelationsData, createFormCloseHandler } from '../../utils/planUtils'
import { fetchPlans, fetchStrategies, fetchTasks, deletePlan, savePlan, updatePlanField } from '../../services/planService'



export default function PlanPanel() {
  const [data, setData] = useState<PlanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relationsTooltip, setRelationsTooltip] = useState<{
    isOpen: boolean
    plan: PlanRecord | null
  }>({ isOpen: false, plan: null })
  const [strategies, setStrategies] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [formPanelOpen, setFormPanelOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanRecord | null>(null)
  const [statusOptions, setStatusOptions] = useState<string[]>(['Not Started', 'In Progress', 'Completed', 'On Hold'])
  const [priorityOptions, setPriorityOptions] = useState<string[]>(['Q1 - Urgent Important', 'Q2 - Important Not Urgent', 'Q3 - Urgent Not Important', 'Q4 - Neither'])

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [plans, strategies, tasks, schemaOptions] = await Promise.all([
        fetchPlans(),
        fetchStrategies(),
        fetchTasks(),
        fetchSchemaOptions()
      ])
      
      setData(plans)
      setStrategies(strategies)
      setTasks(tasks)
      setStatusOptions(schemaOptions.statusOptions)
      setPriorityOptions(schemaOptions.priorityOptions)
    } catch (err) {
      console.error('Failed to load initial data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }


  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return

    try {
      await deletePlan(planId)
      const plans = await fetchPlans()
      setData(plans)
    } catch (err) {
      console.error('Failed to delete plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete plan')
    }
  }

  const handleSavePlan = async (planData: any) => {
    try {
      const isEditing = !!editingPlan
      
      await savePlan(planData, isEditing ? editingPlan!.id : undefined)
      
      setFormPanelOpen(false)
      setEditingPlan(null)
      const plans = await fetchPlans()
      setData(plans)
    } catch (err) {
      console.error('Failed to save plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to save plan')
    }
  }

  const handlePlanUpdate = async (planId: string, field: 'status' | 'priority_quadrant', value: string) => {
    const plan = data.find(p => p.id === planId)
    if (!plan) return

    try {
      await updatePlanField(plan, field, value)
      const updatedPlan = { ...plan, [field]: value }
      setData(prev => prev.map(p => p.id === planId ? updatedPlan : p))
    } catch (error) {
      console.error(`Failed to update plan ${field}:`, error)
      setError(`Failed to update plan ${field}`)
    }
  }

  // Options loaded from database schema

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full py-8">
        <div className="bg-red-50 p-6">
          <div className="flex items-start">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Failed to load plans</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchPlans}
                className="mt-4 px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const filteredPlans = data.sort((a, b) => (a.display_order ?? 999999) - (b.display_order ?? 999999))

  return (
    <>
      {/* Control Bar - Replicate Task Layout */}
      <div className="fixed top-20 right-4 flex items-center gap-4 z-40">
        <button
          onClick={() => {
            setEditingPlan(null)
            setFormPanelOpen(true)
          }}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Plan
        </button>
      </div>

      {/* Main Content Area - Full Width */}
      <div className="fixed top-32 left-[68px] right-4 bottom-4 overflow-y-auto bg-white p-6 z-30">

        {/* PlanList Section - Full Width */}
        <div className="w-full relative">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Plans Yet</h3>
              <p className="text-gray-600 mb-6">Create your first sub-goal to bridge strategies and tasks</p>
              <button
                onClick={() => {
                  setEditingPlan(null)
                  setFormPanelOpen(true)
                }}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create First Plan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6">
                  {/* Plan Card Layout: Time - Title - Actions */}
                  <div className="flex gap-6">
                    {/* Left: Time Section */}
                    <div className="w-[120px] flex-shrink-0">
                      <span className="text-sm font-semibold text-purple-500">
                        {formatDateRange(plan.start_date, plan.due_date)}
                      </span>
                    </div>

                    {/* Middle: Title Section */}
                    <div className="flex-1">
                      <h3 
                        className="text-lg font-semibold text-purple-600 cursor-pointer hover:underline hover:text-purple-500 transition-colors mb-2"
                        onClick={() => openNotionPage(plan.id)}
                        title="Click to edit in Notion"
                      >
                        {plan.objective || 'Untitled Plan'}
                      </h3>
                      
                      {/* Fields below title - 2 columns for Plan */}
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        {/* Status - Dropdown Select */}
                        <div className="relative">
                          <select
                            value={plan.status || ''}
                            onChange={(e) => handlePlanUpdate(plan.id, 'status', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 border-0 appearance-none cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">No Status</option>
                            {statusOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Priority - Dropdown Select */}
                        <div className="relative">
                          <select
                            value={plan.priority_quadrant || ''}
                            onChange={(e) => handlePlanUpdate(plan.id, 'priority_quadrant', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 border-0 appearance-none cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">No Priority</option>
                            {priorityOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions Section */}
                    <div className="w-20 flex-shrink-0 flex flex-col justify-between">
                      {/* Top: Edit, Delete */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingPlan(plan)
                            setFormPanelOpen(true)
                          }}
                          className="flex-1 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="flex-1 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Bottom: Relations Button - Aligned with labels bottom */}
                      <div className="flex">
                        <button
                          onClick={() => setRelationsTooltip({ isOpen: true, plan })}
                          className="w-full px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                          title="View Relations"
                        >
                          Relations
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom: Description (full width) */}
                  {plan.description && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {plan.description}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
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
    </>
  )
}