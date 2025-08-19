'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { TaskRecord, TaskFormData, PlanOption, StrategyOption } from '../../types/task'
import { StrategyRecord } from '../../types/strategy'
import { PlanRecord } from '../../types/plan'
import { fetchAllTaskData, saveTask, deleteTask } from '../../services/taskService'
import { fetchAllStrategyData, updateStrategyField } from '../../services/strategyService'
import { fetchPlans, updatePlanField } from '../../services/planService'
import { dataCache, CACHE_KEYS } from '../../utils/dataCache'
import { getDefaultTaskFormData } from '../../utils/taskUtils'
import { TaskErrorBoundary, TaskLoadingSpinner, TaskErrorDisplay, ToastNotification } from './ErrorBoundary'
import TaskFormPanel from './TaskFormPanel'
import TaskCalendarView from './TaskCalendarView'
import TaskListView from './TaskListView'
import StrategyContent from './StrategyContent'
import PlanContent from './PlanContent'
import StrategyFormPanel from './StrategyFormPanel'
import PlanFormPanel from './PlanFormPanel'
import { saveStrategy } from '../../services/strategyService'
import { savePlan } from '../../services/planService'
import { StrategyRecord, StrategyFormData } from '../../types/strategy'
import { PlanRecord, PlanFormData } from '../../types/plan'
import type { User } from '@supabase/supabase-js'

interface TaskPanelOptimizedProps {
  onTasksUpdate?: (tasks: TaskRecord[]) => void
  user?: User | null
  loading?: boolean
}

export default function TaskPanelOptimized({ onTasksUpdate, user, loading: authLoading }: TaskPanelOptimizedProps) {
  // State management - unified data management
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [strategies, setStrategies] = useState<StrategyRecord[]>([])
  const [plans, setPlans] = useState<PlanRecord[]>([])
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [priorityOptions, setPriorityOptions] = useState<string[]>([])
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([])
  const [strategyOptions, setStrategyOptions] = useState<StrategyOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  
  // Task Form state
  const [formPanelOpen, setFormPanelOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null)
  
  // Strategy Form state
  const [strategyFormOpen, setStrategyFormOpen] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<StrategyRecord | null>(null)
  const [strategyStatusOptions, setStrategyStatusOptions] = useState<string[]>([])
  const [strategyCategoryOptions, setStrategyCategoryOptions] = useState<string[]>([])
  
  // Plan Form state
  const [planFormOpen, setPlanFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanRecord | null>(null)
  const [planStatusOptions, setPlanStatusOptions] = useState<string[]>([])
  const [planPriorityOptions, setPlanPriorityOptions] = useState<string[]>([])
  
  // Filter state
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedQuadrant, setSelectedQuadrant] = useState('all')
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('all')
  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Drill-down state
  const [drillDownMode, setDrillDownMode] = useState<'all' | 'strategy-plans' | 'plan-tasks'>('all')
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Filtered tasks based on current filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus)
    }

    if (selectedQuadrant !== 'all') {
      filtered = filtered.filter(task => task.priority_quadrant === selectedQuadrant)
    }

    if (selectedPlanFilter !== 'all') {
      filtered = filtered.filter(task => {
        if (selectedPlanFilter === 'none') {
          return !task.plan
        } else {
          return task.plan === selectedPlanFilter
        }
      })
    }

    return filtered
  }, [tasks, selectedStatus, selectedQuadrant, selectedPlanFilter])

  // Filtered data based on drill-down mode
  const displayedStrategies = useMemo(() => {
    if (drillDownMode === 'strategy-plans' || drillDownMode === 'plan-tasks') {
      return strategies.filter(s => s.id === selectedStrategyId)
    }
    return strategies
  }, [strategies, drillDownMode, selectedStrategyId])

  const displayedPlans = useMemo(() => {
    if (drillDownMode === 'all') {
      return plans
    } else if (drillDownMode === 'strategy-plans' || drillDownMode === 'plan-tasks') {
      return plans.filter(plan => plan.strategy === selectedStrategyId)
    }
    return plans
  }, [plans, drillDownMode, selectedStrategyId])

  const displayedTasks = useMemo(() => {
    if (drillDownMode === 'plan-tasks') {
      return filteredTasks.filter(task => task.plan === selectedPlanId)
    }
    return filteredTasks
  }, [filteredTasks, drillDownMode, selectedPlanId])

  // Load all data only after authentication is complete and user exists
  useEffect(() => {
    if (!authLoading && user) {
      loadAllData()
    }
  }, [authLoading, user])

  // Call onTasksUpdate when tasks change
  useEffect(() => {
    if (onTasksUpdate && tasks.length > 0) {
      onTasksUpdate(tasks)
    }
  }, [tasks, onTasksUpdate])

  const loadAllData = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // Check cache first (skip if force refresh)
      if (!forceRefresh) {
        const cachedTasks = dataCache.get(CACHE_KEYS.TASKS)
        const cachedStrategies = dataCache.get(CACHE_KEYS.STRATEGIES)
        const cachedPlans = dataCache.get(CACHE_KEYS.PLANS)
        
        if (cachedTasks && cachedStrategies && cachedPlans) {
          // Load from cache
          setTasks(cachedTasks.tasks)
          setStatusOptions(cachedTasks.schemaOptions.statusOptions)
          setPriorityOptions(cachedTasks.schemaOptions.priorityOptions)
          
          setStrategies(cachedStrategies.strategies)
          const strategyOpts = cachedStrategies.strategies.map((strategy: any) => ({
            id: strategy.id,
            objective: strategy.objective || 'Untitled Strategy'
          }))
          setStrategyOptions(strategyOpts)
          
          setPlans(cachedPlans)
          const planOpts = cachedPlans.map((plan: any) => ({
            id: plan.id,
            objective: plan.objective || 'Untitled Plan'
          }))
          setPlanOptions(planOpts)
          
          setLoading(false)
          return
        }
      }
      
      // Parallel data loading for better performance
      const [taskData, strategyData, planData, strategySchemaData, planSchemaData] = await Promise.all([
        fetchAllTaskData(),
        fetchAllStrategyData(),
        fetchPlans(),
        fetch('/api/strategy?action=schema').then(res => res.json()).catch(() => ({ schema: { statusOptions: [], priorityOptions: [], categoryOptions: [] } })),
        fetch('/api/plan?action=schema').then(res => res.json()).catch(() => ({ schema: { statusOptions: [], priorityOptions: [] } }))
      ])
      
      // Cache the data
      dataCache.set(CACHE_KEYS.TASKS, taskData)
      dataCache.set(CACHE_KEYS.STRATEGIES, strategyData)
      dataCache.set(CACHE_KEYS.PLANS, planData)
      
      // Set task data
      setTasks(taskData.tasks)
      setStatusOptions(taskData.schemaOptions.statusOptions)
      setPriorityOptions(taskData.schemaOptions.priorityOptions)
      
      // Set strategy data
      setStrategies(strategyData.strategies)
      const strategyOpts = strategyData.strategies.map((strategy: any) => ({
        id: strategy.id,
        objective: strategy.objective || 'Untitled Strategy'
      }))
      setStrategyOptions(strategyOpts)
      
      // Set strategy schema options
      setStrategyStatusOptions(strategySchemaData.schema?.statusOptions || [])
      setStrategyCategoryOptions(strategySchemaData.schema?.categoryOptions || [])
      
      // Set plan data
      setPlans(planData)
      const planOpts = planData.map((plan: any) => ({
        id: plan.id,
        objective: plan.objective || 'Untitled Plan'
      }))
      setPlanOptions(planOpts)
      
      // Set plan schema options
      setPlanStatusOptions(planSchemaData.schema?.statusOptions || [])
      setPlanPriorityOptions(planSchemaData.schema?.priorityOptions || [])
      
    } catch (err) {
      console.error('Failed to load data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
      
      // Set default values on error
      setStatusOptions(['Not Started', 'In Progress', 'Completed', 'On Hold'])
      setPriorityOptions(['Important & Urgent', 'Important & Not Urgent', 'Not Important & Urgent', 'Not Important & Not Urgent'])
      setTasks([])
      setStrategies([])
      setPlans([])
      setPlanOptions([])
      setStrategyOptions([])
      setStrategyStatusOptions([])
      setStrategyCategoryOptions([])
      setPlanStatusOptions([])
      setPlanPriorityOptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadAllData(true) // Force refresh on manual refresh
    setRefreshing(false)
  }, [])

  const handleSaveTask = useCallback(async (taskData: TaskFormData) => {
    try {
      const isEditing = !!editingTask
      
      // Save task via service
      await saveTask(taskData, editingTask?.id)
      
      // Invalidate cache since task data changed
      dataCache.delete(CACHE_KEYS.TASKS)
      
      // Update local state
      if (isEditing) {
        const updatedTask = { ...editingTask!, ...taskData }
        setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task))
      } else {
        // For new tasks, we need to reload to get the generated ID
        await loadAllData(true)
      }

      setFormPanelOpen(false)
      setEditingTask(null)
      setToast({ message: isEditing ? 'Task updated successfully' : 'Task created successfully', type: 'success' })
      
    } catch (err) {
      console.error('Failed to save task:', err)
      setToast({ message: 'Failed to save task', type: 'error' })
    }
  }, [editingTask])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask(taskId)
      // Invalidate cache since task data changed
      dataCache.delete(CACHE_KEYS.TASKS)
      setTasks(prev => prev.filter(task => task.id !== taskId))
      setToast({ message: 'Task deleted successfully', type: 'success' })
    } catch (err) {
      console.error('Failed to delete task:', err)
      setToast({ message: 'Failed to delete task', type: 'error' })
    }
  }, [])

  const openFormPanel = useCallback((task?: TaskRecord) => {
    setEditingTask(task || null)
    setFormPanelOpen(true)
  }, [])

  const closeFormPanel = useCallback(() => {
    setFormPanelOpen(false)
    setEditingTask(null)
  }, [])

  // Strategy update handler
  const handleStrategyUpdate = useCallback(async (strategyId: string, field: 'status' | 'priority_quadrant', value: string) => {
    const strategy = strategies.find(s => s.id === strategyId)
    if (!strategy) return

    try {
      await updateStrategyField(strategy, field, value)
      // Invalidate cache since strategy data changed
      dataCache.delete(CACHE_KEYS.STRATEGIES)
      const updatedStrategy = { ...strategy, [field]: value }
      setStrategies(prev => prev.map(s => s.id === strategyId ? updatedStrategy : s))
    } catch (error) {
      console.error(`Failed to update strategy ${field}:`, error)
    }
  }, [strategies])

  // Plan update handler
  const handlePlanUpdate = useCallback(async (planId: string, field: 'status' | 'priority_quadrant', value: string) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    try {
      await updatePlanField(plan, field, value)
      // Invalidate cache since plan data changed
      dataCache.delete(CACHE_KEYS.PLANS)
      const updatedPlan = { ...plan, [field]: value }
      setPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p))
    } catch (error) {
      console.error(`Failed to update plan ${field}:`, error)
    }
  }, [plans])

  // Drill down handlers
  const handleStrategyDrillDown = useCallback((strategyId: string) => {
    setDrillDownMode('strategy-plans')
    setSelectedStrategyId(strategyId)
    setSelectedPlanId(null)
  }, [])

  const handlePlanDrillDown = useCallback((planId: string) => {
    setDrillDownMode('plan-tasks')
    setSelectedPlanId(planId)
  }, [])

  const handleBackToAll = useCallback(() => {
    setDrillDownMode('all')
    setSelectedStrategyId(null)
    setSelectedPlanId(null)
  }, [])

  const handleBackToStrategy = useCallback(() => {
    if (selectedStrategyId) {
      setDrillDownMode('strategy-plans')
      setSelectedPlanId(null)
    }
  }, [selectedStrategyId])

  // Strategy edit/delete handlers
  const handleStrategyEdit = useCallback((strategy: StrategyRecord) => {
    // Open Strategy form for editing
    openStrategyForm(strategy)
  }, [])

  const handleStrategyDelete = useCallback(async (strategyId: string) => {
    try {
      const response = await fetch(`/api/strategy?id=${strategyId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete strategy')
      }

      const result = await response.json()
      
      // Invalidate all related caches since cascade delete affects multiple entities
      dataCache.delete(CACHE_KEYS.STRATEGIES)
      dataCache.delete(CACHE_KEYS.PLANS)
      dataCache.delete(CACHE_KEYS.TASKS)
      
      // Remove strategy from local state
      setStrategies(prev => prev.filter(s => s.id !== strategyId))
      
      // Force reload all data to get accurate counts after cascade delete
      await loadAllData(true)
      
      const { cascadeDeleted } = result
      const message = `Strategy deleted (${cascadeDeleted.plans} plans, ${cascadeDeleted.tasks} tasks also deleted)`
      setToast({ message, type: 'success' })
    } catch (error) {
      console.error('Failed to delete strategy:', error)
      setToast({ message: 'Failed to delete strategy', type: 'error' })
    }
  }, [])

  // Plan edit/delete handlers
  const handlePlanEdit = useCallback((plan: PlanRecord) => {
    // Open Plan form for editing
    openPlanForm(plan)
  }, [])

  const handlePlanDelete = useCallback(async (planId: string) => {
    try {
      const response = await fetch(`/api/plan?id=${planId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete plan')
      }

      const result = await response.json()
      
      // Invalidate related caches since cascade delete affects tasks
      dataCache.delete(CACHE_KEYS.PLANS)
      dataCache.delete(CACHE_KEYS.TASKS)
      
      // Remove plan from local state
      setPlans(prev => prev.filter(p => p.id !== planId))
      
      // Force reload all data to get accurate counts after cascade delete
      await loadAllData(true)
      
      const { cascadeDeleted } = result
      const message = `Plan deleted (${cascadeDeleted.tasks} tasks also deleted)`
      setToast({ message, type: 'success' })
    } catch (error) {
      console.error('Failed to delete plan:', error)
      setToast({ message: 'Failed to delete plan', type: 'error' })
    }
  }, [])

  // Strategy form handlers
  const openStrategyForm = useCallback((strategy?: StrategyRecord) => {
    setEditingStrategy(strategy || null)
    setStrategyFormOpen(true)
  }, [])

  const closeStrategyForm = useCallback(() => {
    setStrategyFormOpen(false)
    setEditingStrategy(null)
  }, [])

  const handleSaveStrategy = useCallback(async (strategyData: StrategyFormData) => {
    try {
      const isEditing = !!editingStrategy
      
      // Save strategy via service
      await saveStrategy(strategyData, editingStrategy?.id)
      
      // Invalidate cache since strategy data changed
      dataCache.delete(CACHE_KEYS.STRATEGIES)
      dataCache.delete(CACHE_KEYS.PLANS)
      
      // Reload all data to get updated relationships
      await loadAllData(true)
      
      setStrategyFormOpen(false)
      setEditingStrategy(null)
      setToast({ message: isEditing ? 'Strategy updated successfully' : 'Strategy created successfully', type: 'success' })
      
    } catch (err) {
      console.error('Failed to save strategy:', err)
      setToast({ message: 'Failed to save strategy', type: 'error' })
    }
  }, [editingStrategy])

  // Plan form handlers
  const openPlanForm = useCallback((plan?: PlanRecord) => {
    setEditingPlan(plan || null)
    setPlanFormOpen(true)
  }, [])

  const closePlanForm = useCallback(() => {
    setPlanFormOpen(false)
    setEditingPlan(null)
  }, [])

  const handleSavePlan = useCallback(async (planData: PlanFormData) => {
    try {
      const isEditing = !!editingPlan
      
      // Save plan via service
      await savePlan(planData, editingPlan?.id)
      
      // Invalidate cache since plan data changed
      dataCache.delete(CACHE_KEYS.PLANS)
      dataCache.delete(CACHE_KEYS.TASKS)
      
      // Reload all data to get updated relationships
      await loadAllData(true)
      
      setPlanFormOpen(false)
      setEditingPlan(null)
      setToast({ message: isEditing ? 'Plan updated successfully' : 'Plan created successfully', type: 'success' })
      
    } catch (err) {
      console.error('Failed to save plan:', err)
      setToast({ message: 'Failed to save plan', type: 'error' })
    }
  }, [editingPlan])

  // Show loading spinner during auth loading or data loading
  if (authLoading || loading) {
    return (
      <TaskErrorBoundary>
        <TaskLoadingSpinner />
      </TaskErrorBoundary>
    )
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  if (error) {
    return (
      <TaskErrorBoundary>
        <TaskErrorDisplay error={error} onRetry={handleRefresh} />
      </TaskErrorBoundary>
    )
  }

  return (
    <TaskErrorBoundary>
      <>
        {/* Main Content Area - L-shaped Layout, Natural Content Flow */}
        <div className="fixed top-32 left-[68px] right-4 bottom-4 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Breadcrumb Navigation */}
          {drillDownMode !== 'all' && (
            <div className="mb-4 p-3 bg-white/90 backdrop-blur-md rounded-lg shadow-sm">
              <nav className="flex items-center gap-2 text-sm">
                <button
                  onClick={handleBackToAll}
                  className="text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                >
                  All
                </button>
                
                {drillDownMode === 'strategy-plans' && selectedStrategyId && (
                  <>
                    <span className="text-gray-400">></span>
                    <span className="text-gray-700">
                      Strategy: {strategies.find(s => s.id === selectedStrategyId)?.objective || 'Unknown'}
                    </span>
                  </>
                )}
                
                {drillDownMode === 'plan-tasks' && selectedPlanId && (
                  <>
                    {selectedStrategyId && (
                      <>
                        <span className="text-gray-400">></span>
                        <button
                          onClick={handleBackToStrategy}
                          className="text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                        >
                          Strategy: {strategies.find(s => s.id === selectedStrategyId)?.objective || 'Unknown'}
                        </button>
                      </>
                    )}
                    <span className="text-gray-400">></span>
                    <span className="text-gray-700">
                      Plan: {plans.find(p => p.id === selectedPlanId)?.objective || 'Unknown'}
                    </span>
                  </>
                )}
              </nav>
            </div>
          )}

          {/* 3-Column Layout: Strategy + Plan + Calendar/Task - Equal Width (1/3 each) */}
          <div className="flex gap-6">
            {/* Left Column: Strategy - 1/3 width */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-purple-900">Strategy</h3>
                  <button 
                    onClick={() => openStrategyForm()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-all duration-200"
                  >
                    <span>🎯</span>
                    <span>Add Strategy</span>
                  </button>
                </div>
                <StrategyContent 
                  strategies={displayedStrategies}
                  loading={loading}
                  error={error}
                  onStrategyUpdate={handleStrategyUpdate}
                  onStrategyEdit={handleStrategyEdit}
                  onStrategyDelete={handleStrategyDelete}
                  onStrategyDrillDown={handleStrategyDrillDown}
                  statusOptions={strategyStatusOptions}
                  priorityOptions={priorityOptions}
                  categoryOptions={strategyCategoryOptions}
                />
              </div>
            </div>

            {/* Middle Column: Plan - 1/3 width */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-purple-900">Plans</h3>
                  <button 
                    onClick={() => openPlanForm()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-all duration-200"
                  >
                    <span>📋</span>
                    <span>Add Plan</span>
                  </button>
                </div>
                <PlanContent 
                  plans={displayedPlans}
                  loading={loading}
                  error={error}
                  onPlanUpdate={handlePlanUpdate}
                  onPlanEdit={handlePlanEdit}
                  onPlanDelete={handlePlanDelete}
                  onPlanDrillDown={handlePlanDrillDown}
                  statusOptions={planStatusOptions}
                  priorityOptions={planPriorityOptions}
                />
              </div>
            </div>

            {/* Right Column: Calendar + Task - 1/3 width */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Calendar Module */}
              <TaskCalendarView
                tasks={filteredTasks}
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onMonthChange={setCurrentMonth}
                onTaskSelect={openFormPanel}
              />

              {/* Task Module */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl">
                {/* Task Module Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-purple-900">Tasks</h3>
                    <button
                      onClick={() => openFormPanel()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-all duration-200"
                    >
                      <span>✅</span>
                      <span>Add Task</span>
                    </button>
                  </div>
                  
                  {/* Task Filters - 2 rows layout */}
                  <div className="mt-3 space-y-2">
                    {/* First row */}
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border border-purple-200 rounded text-xs text-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="all">All Status</option>
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>

                      <select
                        value={selectedQuadrant}
                        onChange={(e) => setSelectedQuadrant(e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border border-purple-200 rounded text-xs text-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="all">All Priorities</option>
                        {priorityOptions.map(priority => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Second row */}
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedPlanFilter}
                        onChange={(e) => setSelectedPlanFilter(e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border border-purple-200 rounded text-xs text-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="all">All Plans</option>
                        <option value="none">No Plan</option>
                        {planOptions.map(plan => (
                          <option key={plan.id} value={plan.id}>{plan.objective}</option>
                        ))}
                      </select>

                      <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <div className={`${refreshing ? 'animate-spin' : ''}`}>
                          {refreshing ? '⟳' : '↻'}
                        </div>
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Task Content */}
                <div className="p-4">
                  <TaskListView
                    tasks={displayedTasks}
                    onTaskSelect={openFormPanel}
                    onTaskUpdate={async (taskId, updates) => {
                      const task = tasks.find(t => t.id === taskId)
                      if (task) {
                        const updatedTask = { ...task, ...updates }
                        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))
                      }
                    }}
                    onTaskDelete={handleDeleteTask}
                    statusOptions={statusOptions}
                    priorityOptions={priorityOptions}
                    selectedDate={selectedDate}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Form Panel */}
        <TaskFormPanel
          isOpen={formPanelOpen}
          onClose={closeFormPanel}
          task={editingTask}
          onSave={handleSaveTask}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          planOptions={planOptions}
          strategyOptions={strategyOptions}
          allTasks={tasks}
        />

        {/* Strategy Form Panel */}
        <StrategyFormPanel
          isOpen={strategyFormOpen}
          onClose={closeStrategyForm}
          strategy={editingStrategy}
          onSave={handleSaveStrategy}
          statusOptions={strategyStatusOptions}
          priorityOptions={priorityOptions}
          categoryOptions={strategyCategoryOptions}
        />

        {/* Plan Form Panel */}
        <PlanFormPanel
          isOpen={planFormOpen}
          onClose={closePlanForm}
          plan={editingPlan}
          onSave={handleSavePlan}
          statusOptions={planStatusOptions}
          priorityOptions={planPriorityOptions}
          strategyOptions={strategyOptions}
        />

        {/* Toast Notification */}
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    </TaskErrorBoundary>
  )
}