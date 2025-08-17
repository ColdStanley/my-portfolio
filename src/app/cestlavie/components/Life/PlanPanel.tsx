'use client'

import { useEffect, useState } from 'react'
import PlanTimeFilter from './PlanTimeFilter'
import RelationsTooltip from './RelationsTooltip'
import PlanFormPanel from './PlanFormPanel'

interface PlanRecord {
  id: string
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  total_tasks: number
  completed_tasks: number
  display_order?: number
}

// Format date range for display using local timezone
function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return 'No dates'
  
  try {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
    const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
    
    if (start && end) {
      return `${start} - ${end}`
    }
    
    return start || end
  } catch (error) {
    return 'Invalid date'
  }
}

export default function PlanPanel() {
  const [data, setData] = useState<PlanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<'all' | number>('all')
  const [relationsTooltip, setRelationsTooltip] = useState<{
    isOpen: boolean
    plan: PlanRecord | null
  }>({ isOpen: false, plan: null })
  const [strategies, setStrategies] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [formPanelOpen, setFormPanelOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanRecord | null>(null)

  useEffect(() => {
    fetchPlans()
    fetchStrategies()
    fetchTasks()
  }, [])
  
  const fetchStrategies = async () => {
    try {
      const response = await fetch('/api/strategy')
      if (response.ok) {
        const result = await response.json()
        setStrategies(result.data || [])
      }
    } catch (err) {
      console.warn('Failed to fetch strategies:', err)
    }
  }
  
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const result = await response.json()
        setTasks(result.data || [])
      }
    } catch (err) {
      console.warn('Failed to fetch tasks:', err)
    }
  }

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/plan')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setData(result.data || [])
    } catch (err) {
      console.error('Failed to fetch plans:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }


  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return

    try {
      const response = await fetch(`/api/plan?id=${planId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete plan')
      }

      fetchPlans()
    } catch (err) {
      console.error('Failed to delete plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete plan')
    }
  }

  const handleSavePlan = async (planData: any) => {
    try {
      const isEditing = !!editingPlan
      
      if (isEditing) {
        planData.id = editingPlan!.id
      }
      
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} plan`)
      }
      
      setFormPanelOpen(false)
      setEditingPlan(null)
      fetchPlans()
    } catch (err) {
      console.error('Failed to save plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to save plan')
    }
  }

  // Options for form
  const statusOptions = ['Not Started', 'In Progress', 'Completed', 'On Hold']
  const priorityOptions = ['Q1 - Urgent Important', 'Q2 - Important Not Urgent', 'Q3 - Urgent Not Important', 'Q4 - Neither']

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

      {/* Main Split Layout: Calendar (30%) | PlanList (70%) - Replicate Task Layout */}
      <div className="fixed top-32 left-[68px] right-4 bottom-4 flex gap-6 overflow-y-auto bg-white p-6 z-30">
        {/* Left: Time Filter Section - 30% */}
        <div className="w-3/10 space-y-6">
          {/* Plan Time Filter */}
          <div>
            <PlanTimeFilter
              plans={filteredPlans}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
              onPlanClick={(plan) => {
                const notionPageUrl = `https://www.notion.so/${plan.id.replace(/-/g, '')}`
                window.open(notionPageUrl, '_blank')
              }}
            />
          </div>
        </div>

        {/* Right: PlanList Section - 70% */}
        <div className="w-7/10 relative">
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
                        onClick={() => {
                          const notionPageUrl = `https://www.notion.so/${plan.id.replace(/-/g, '')}`
                          window.open(notionPageUrl, '_blank')
                        }}
                        title="Click to edit in Notion"
                      >
                        {plan.objective || 'Untitled Plan'}
                      </h3>
                      
                      {/* Fields below title - 2 columns for Plan */}
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded text-center">
                          {plan.status || 'No Status'}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-center">
                          {plan.priority_quadrant || 'No Priority'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions Section */}
                    <div className="w-20 flex-shrink-0 space-y-2">
                      {/* Row 1: Edit, Delete */}
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
                      
                      {/* Row 2: Relations Button */}
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
          parentStrategyForPlan={(() => {
            const plan = relationsTooltip.plan
            // Note: Need to add parent_goal field to PlanRecord interface
            // For now, return undefined until interface is updated
            return undefined
          })()}
          childTasks={(() => {
            const plan = relationsTooltip.plan
            // Filter tasks that belong to this plan
            return tasks.filter(task => 
              task.plan && task.plan.includes(plan.id)
            ).map(task => ({
              id: task.id,
              title: task.title,
              status: task.status,
              plan: task.plan
            }))
          })()}
        />
      )}
      
      {/* Plan Form Panel */}
      <PlanFormPanel
        isOpen={formPanelOpen}
        onClose={() => {
          setFormPanelOpen(false)
          setEditingPlan(null)
        }}
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