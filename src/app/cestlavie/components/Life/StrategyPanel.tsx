'use client'

import { useEffect, useState } from 'react'
import RelationsTooltip from './RelationsTooltip'
import StrategyFormPanel from './StrategyFormPanel'

interface StrategyRecord {
  id: string
  objective: string
  description: string
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  category: string
  plan?: string[]
  task?: string[]
  progress: number
  total_plans: number
  order?: number
}

export default function StrategyPanel() {
  const [data, setData] = useState<StrategyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relationsTooltip, setRelationsTooltip] = useState<{
    isOpen: boolean
    strategy: StrategyRecord | null
  }>({ isOpen: false, strategy: null })
  const [plans, setPlans] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [formPanelOpen, setFormPanelOpen] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<StrategyRecord | null>(null)
  const [statusOptions, setStatusOptions] = useState<string[]>(['Not Started', 'In Progress', 'Completed', 'On Hold'])
  const [priorityOptions, setPriorityOptions] = useState<string[]>(['Q1 - Urgent Important', 'Q2 - Important Not Urgent', 'Q3 - Urgent Not Important', 'Q4 - Neither'])

  useEffect(() => {
    fetchStrategies()
    fetchPlans()
    fetchTasks()
    fetchSchemaOptions()
  }, [])

  const fetchSchemaOptions = async () => {
    try {
      const response = await fetch('/api/tasks?action=schema')
      if (response.ok) {
        const result = await response.json()
        const schema = result.schema || {}
        
        if (schema.statusOptions && schema.statusOptions.length > 0) {
          setStatusOptions(schema.statusOptions)
        }
        if (schema.priorityOptions && schema.priorityOptions.length > 0) {
          setPriorityOptions(schema.priorityOptions)
        }
      }
    } catch (err) {
      console.warn('Failed to fetch schema options, using defaults:', err)
    }
  }
  
  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plan')
      if (response.ok) {
        const result = await response.json()
        setPlans(result.data || [])
      }
    } catch (err) {
      console.warn('Failed to fetch plans:', err)
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

  const fetchStrategies = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/strategy')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setData(result.data || [])
    } catch (err) {
      console.error('Failed to fetch strategies:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }


  const handleDeleteStrategy = async (strategyId: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return
    
    try {
      const response = await fetch(`/api/strategy?id=${strategyId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete strategy')
      }

      fetchStrategies()
    } catch (err) {
      console.error('Failed to delete strategy:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete strategy')
    }
  }

  const handleSaveStrategy = async (strategyData: any) => {
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
      
      setFormPanelOpen(false)
      setEditingStrategy(null)
      fetchStrategies()
    } catch (err) {
      console.error('Failed to save strategy:', err)
      setError(err instanceof Error ? err.message : 'Failed to save strategy')
    }
  }

  const handleStrategyUpdate = async (strategyId: string, field: 'status' | 'priority_quadrant', value: string) => {
    const strategy = data.find(s => s.id === strategyId)
    if (!strategy) return


    const updatedStrategy = { ...strategy, [field]: value }
    
    try {
      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStrategy)
      })
      
      if (response.ok) {
        setData(prev => prev.map(s => s.id === strategyId ? updatedStrategy : s))
      } else {
        throw new Error(`Failed to update strategy ${field}`)
      }
    } catch (error) {
      console.error(`Failed to update strategy ${field}:`, error)
      setError(`Failed to update strategy ${field}`)
    }
  }

  // Options loaded from database schema
  const categoryOptions = ['Career', 'Health', 'Finance', 'Personal', 'Learning', 'Relationships']

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading strategies...</p>
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
              <h3 className="text-sm font-medium text-red-800">Failed to load strategies</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchStrategies}
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

  const sortedData = data.sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999))

  const formatDateRange = (startDate: string, endDate: string): string => {
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
  }

  return (
    <>
      {/* Control Bar - Replicate Task Layout */}
      <div className="fixed top-20 right-4 flex items-center gap-4 z-40">
        <button
          onClick={() => {
            setEditingStrategy(null)
            setFormPanelOpen(true)
          }}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Strategy
        </button>
      </div>

      {/* Main Content Area - Full Width */}
      <div className="fixed top-32 left-[68px] right-4 bottom-4 overflow-y-auto bg-white p-6 z-30">

        {/* StrategyList Section - Full Width */}
        <div className="w-full relative">
          {sortedData.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Strategies Yet</h3>
              <p className="text-gray-600 mb-6">Create your first long-term goal to get started</p>
              <button
                onClick={() => {
                  setEditingStrategy(null)
                  setFormPanelOpen(true)
                }}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create First Strategy
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedData.map((strategy) => (
                <div key={strategy.id} className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6">
                  {/* Strategy Card Layout: Time - Title - Actions */}
                  <div className="flex gap-6">
                    {/* Left: Time Section */}
                    <div className="w-[120px] flex-shrink-0">
                      <span className="text-sm font-semibold text-purple-500">
                        {formatDateRange(strategy.start_date, strategy.due_date)}
                      </span>
                    </div>

                    {/* Middle: Title Section */}
                    <div className="flex-1">
                      <h3 
                        className="text-lg font-semibold text-purple-600 cursor-pointer hover:underline hover:text-purple-500 transition-colors mb-2"
                        onClick={() => {
                          const notionPageUrl = `https://www.notion.so/${strategy.id.replace(/-/g, '')}`
                          window.open(notionPageUrl, '_blank')
                        }}
                        title="Click to edit in Notion"
                      >
                        {strategy.objective || 'Untitled Strategy'}
                      </h3>
                      
                      {/* Fields below title */}
                      <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
                        {/* Status - Dropdown Select */}
                        <div className="relative">
                          <select
                            value={strategy.status || ''}
                            onChange={(e) => handleStrategyUpdate(strategy.id, 'status', e.target.value)}
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
                            value={strategy.priority_quadrant || ''}
                            onChange={(e) => handleStrategyUpdate(strategy.id, 'priority_quadrant', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-full font-medium bg-gray-100 text-gray-600 border-0 appearance-none cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">No Priority</option>
                            {priorityOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Category - Keep as span */}
                        <span className="px-2 py-1 bg-gray-100 rounded text-center">
                          {strategy.category || 'No Category'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions Section */}
                    <div className="w-20 flex-shrink-0 flex flex-col justify-between">
                      {/* Top: Edit, Delete */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingStrategy(strategy)
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
                          onClick={() => handleDeleteStrategy(strategy.id)}
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
                          onClick={() => setRelationsTooltip({ isOpen: true, strategy })}
                          className="w-full px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                          title="View Relations"
                        >
                          Relations
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom: Description (full width) */}
                  {strategy.description && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {strategy.description}
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
      {relationsTooltip.strategy && (
        <RelationsTooltip
          type="strategy"
          isOpen={relationsTooltip.isOpen}
          onClose={() => setRelationsTooltip({ isOpen: false, strategy: null })}
          childPlans={(() => {
            const strategy = relationsTooltip.strategy
            // Direct access to strategy plans using strategy.plan field
            return strategy.plan 
              ? plans.filter(plan => strategy.plan.includes(plan.id)).map(plan => ({
                  id: plan.id,
                  objective: plan.objective,
                  status: plan.status,
                  total_tasks: plan.total_tasks || 0,
                  completed_tasks: plan.completed_tasks || 0
                }))
              : []
          })()}
          allChildTasks={(() => {
            const strategy = relationsTooltip.strategy
            // Direct access to strategy tasks using strategy.task field
            return strategy.task 
              ? tasks.filter(task => strategy.task.includes(task.id)).map(task => ({
                  id: task.id,
                  title: task.title,
                  status: task.status,
                  plan: [] // Direct strategy tasks
                }))
              : []
          })()}
        />
      )}
      
      {/* Strategy Form Panel */}
      <StrategyFormPanel
        isOpen={formPanelOpen}
        onClose={() => {
          setFormPanelOpen(false)
          setEditingStrategy(null)
        }}
        strategy={editingStrategy}
        onSave={handleSaveStrategy}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        categoryOptions={categoryOptions}
      />
    </>
  )
}