'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { TaskRecord, TaskFormData, PlanOption, StrategyOption } from '../../types/task'
import { StrategyRecord } from '../../types/strategy'
import { PlanRecord } from '../../types/plan'
import { saveTask, deleteTask } from '../../services/taskService'
import { updateStrategyField } from '../../services/strategyService'
import { updatePlanField } from '../../services/planService'
import { dataCache, CACHE_KEYS } from '../../utils/dataCache'
import { getDefaultTaskFormData } from '../../utils/taskUtils'
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
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([])
  const [strategyOptions, setStrategyOptions] = useState<StrategyOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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
  
  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Drill-down state
  const [drillDownMode, setDrillDownMode] = useState<'all' | 'strategy-plans' | 'plan-tasks'>('all')
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])


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
      return tasks.filter(task => task.plan === selectedPlanId)
    }
    return tasks
  }, [tasks, drillDownMode, selectedPlanId])

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
      
      // 优化：直接并行调用API，避免重复请求
      const [tasksResponse, strategiesResponse, plansResponse, taskSchemaResponse, strategySchemaResponse, planSchemaResponse] = await Promise.all([
        fetch('/api/tasks').then(res => res.json()),
        fetch('/api/strategy').then(res => res.json()),
        fetch('/api/plan').then(res => res.json()),
        fetch('/api/tasks?action=schema').then(res => res.json()).catch(() => ({ schema: { statusOptions: [] } })),
        fetch('/api/strategy?action=schema').then(res => res.json()).catch(() => ({ schema: { statusOptions: [], categoryOptions: [] } })),
        fetch('/api/plan?action=schema').then(res => res.json()).catch(() => ({ schema: { statusOptions: [] } }))
      ])
      
      // 处理响应数据
      const taskData = {
        tasks: tasksResponse.data || [],
        schemaOptions: taskSchemaResponse.schema || { statusOptions: [] }
      }
      const strategyData = {
        strategies: strategiesResponse.data || []
      }
      const planData = plansResponse.data || []
      
      // Cache the data
      dataCache.set(CACHE_KEYS.TASKS, taskData)
      dataCache.set(CACHE_KEYS.STRATEGIES, strategyData)
      dataCache.set(CACHE_KEYS.PLANS, planData)
      
      // Set task data
      setTasks(taskData.tasks)
      setStatusOptions(taskData.schemaOptions.statusOptions)
      
      // Set strategy data
      setStrategies(strategyData.strategies)
      const strategyOpts = strategyData.strategies.map((strategy: any) => ({
        id: strategy.id,
        objective: strategy.objective || 'Untitled Strategy'
      }))
      setStrategyOptions(strategyOpts)
      
      // Set strategy schema options
      setStrategyStatusOptions(strategySchemaResponse.schema?.statusOptions || [])
      setStrategyCategoryOptions(strategySchemaResponse.schema?.categoryOptions || [])
      
      // Set plan data
      setPlans(planData)
      const planOpts = planData.map((plan: any) => ({
        id: plan.id,
        objective: plan.objective || 'Untitled Plan'
      }))
      setPlanOptions(planOpts)
      
      // Set plan schema options
      setPlanStatusOptions(planSchemaResponse.schema?.statusOptions || [])
      
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

  const openFormPanel = useCallback((task?: TaskRecord, defaultPlanId?: string) => {
    setEditingTask(task || null)
    setFormPanelOpen(true)
    // Store default plan ID for new tasks
    if (!task && defaultPlanId) {
      // We'll pass this to TaskFormPanel via a new prop
      (window as any).__defaultPlanId = defaultPlanId
    }
  }, [])

  const closeFormPanel = useCallback(() => {
    setFormPanelOpen(false)
    setEditingTask(null)
    // Clear default plan ID
    if ((window as any).__defaultPlanId) {
      delete (window as any).__defaultPlanId
    }
  }, [])

  // Strategy update handler
  const handleStrategyUpdate = useCallback(async (strategyId: string, field: 'status', value: string) => {
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
  const handlePlanUpdate = useCallback(async (planId: string, field: 'status', value: string) => {
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
  const openPlanForm = useCallback((plan?: PlanRecord, defaultStrategyId?: string) => {
    setEditingPlan(plan || null)
    setPlanFormOpen(true)
    // Store default strategy ID for new plans
    if (!plan && defaultStrategyId) {
      // We'll pass this to PlanFormPanel via a new prop
      (window as any).__defaultStrategyId = defaultStrategyId
    }
  }, [])

  const closePlanForm = useCallback(() => {
    setPlanFormOpen(false)
    setEditingPlan(null)
    // Clear default strategy ID
    if ((window as any).__defaultStrategyId) {
      delete (window as any).__defaultStrategyId
    }
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        <h3 className="font-semibold mb-2">Error Loading Data</h3>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Main Content Area - Responsive Layout */}
        <div className="fixed top-16 left-4 right-4 bottom-4 md:top-32 md:left-[68px] overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Breadcrumb Navigation - Desktop Only */}
          <div className="hidden md:block mb-4 p-3 bg-white/90 backdrop-blur-md rounded-lg shadow-sm">
            <nav className="flex items-center gap-2 text-sm">
              <button
                onClick={handleBackToAll}
                className={`transition-colors ${drillDownMode === 'all' ? 'text-gray-700 font-medium' : 'text-purple-600 hover:text-purple-800 hover:underline'}`}
              >
                All
              </button>
              
              {selectedStrategyId && (
                <>
                  <span className="text-gray-400">></span>
                  <button
                    onClick={handleBackToStrategy}
                    className={`transition-colors ${drillDownMode === 'strategy-plans' ? 'text-gray-700 font-medium' : 'text-purple-600 hover:text-purple-800 hover:underline'}`}
                  >
                    Strategy: {strategies.find(s => s.id === selectedStrategyId)?.objective || 'Unknown'}
                  </button>
                </>
              )}
              
              {selectedPlanId && (
                <>
                  <span className="text-gray-400">></span>
                  <span className="text-gray-700 font-medium">
                    Plan: {plans.find(p => p.id === selectedPlanId)?.objective || 'Unknown'}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Responsive Layout: Mobile vertical stack, Desktop 3-column */}
          <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:gap-6">
            
            {/* Calendar Module - Mobile first, Desktop right column with Task */}
            <div className="order-1 md:order-3 md:flex-1 md:min-w-0 md:space-y-6">
              <TaskCalendarView
                tasks={tasks}
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onMonthChange={setCurrentMonth}
                onTaskSelect={openFormPanel}
              />

              {/* Task Module - Mobile second, grouped with Calendar on desktop */}
              <div className="order-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xl">
                {/* Task Module Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-purple-900">Tasks</h3>
                    <button
                      onClick={() => openFormPanel()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all duration-200"
                    >
                      <span>Add Task</span>
                    </button>
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
                    selectedDate={selectedDate}
                  />
                </div>
              </div>
            </div>

            {/* Plan Module - Mobile third, Desktop middle column */}
            <div className="order-3 md:order-2 md:flex-1 md:min-w-0">
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-purple-900">Plans</h3>
                  <button 
                    onClick={() => openPlanForm()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all duration-200"
                  >
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
                  onAddTaskFromPlan={(planId) => openFormPanel(undefined, planId)}
                  enableDrillDown={typeof window !== 'undefined' && window.innerWidth >= 768}
                  statusOptions={planStatusOptions}
                />
              </div>
            </div>

            {/* Strategy Module - Mobile fourth (last), Desktop left column */}
            <div className="order-4 md:order-1 md:flex-1 md:min-w-0">
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-purple-900">Strategy</h3>
                  <button 
                    onClick={() => openStrategyForm()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all duration-200"
                  >
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
                  onAddPlanFromStrategy={(strategyId) => openPlanForm(undefined, strategyId)}
                  enableDrillDown={typeof window !== 'undefined' && window.innerWidth >= 768}
                  statusOptions={strategyStatusOptions}
                          categoryOptions={strategyCategoryOptions}
                />
              </div>
            </div>
          </div>
          
          {/* 移动端底部留出安全距离，避免被底部聚合导航遮挡 */}
          <div className="pb-20 md:pb-4"></div>
        </div>

        {/* Task Form Panel */}
        <TaskFormPanel
          isOpen={formPanelOpen}
          onClose={closeFormPanel}
          task={editingTask}
          onSave={handleSaveTask}
          statusOptions={statusOptions}
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
          categoryOptions={strategyCategoryOptions}
          allStrategies={strategies}
        />

        {/* Plan Form Panel */}
        <PlanFormPanel
          isOpen={planFormOpen}
          onClose={closePlanForm}
          plan={editingPlan}
          onSave={handleSavePlan}
          statusOptions={planStatusOptions}
          strategyOptions={strategyOptions}
          allPlans={plans}
        />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-3 py-2 rounded-lg shadow-xl backdrop-blur-md transition-all duration-300 text-sm ${
          toast.type === 'success' 
            ? 'bg-purple-600/90 text-white border border-purple-500/20' 
            : 'bg-purple-900/90 text-white border border-purple-800/20'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 text-white/80 hover:text-white transition-colors text-lg font-semibold leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}