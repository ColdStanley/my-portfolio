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

export default function TaskPanelOptimized({
  onTasksUpdate,
  user,
  loading: authLoading
}: TaskPanelOptimizedProps) {
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

  // Dropdown menu states
  const [strategyMenuOpen, setStrategyMenuOpen] = useState(false)
  const [planMenuOpen, setPlanMenuOpen] = useState(false)
  const [taskMenuOpen, setTaskMenuOpen] = useState(false)

  // Drill-down state
  const [drillDownMode, setDrillDownMode] = useState<'all' | 'strategy-plans' | 'plan-tasks'>('all')
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  
  // Auto-select largest strategy on load
  useEffect(() => {
    if (strategies.length > 0 && !selectedStrategyId) {
      const largestStrategy = strategies.reduce((max, strategy) => 
        (strategy.importance_percentage || 0) > (max.importance_percentage || 0) ? strategy : max
      )
      setSelectedStrategyId(largestStrategy.id)
    }
  }, [strategies, selectedStrategyId])

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

  // Enhanced text display logic for treemap rectangles
  const getTextDisplay = useCallback((name: string, value: number, width: number, height: number) => {
    const area = width * height
    
    // Very small rectangles - only show percentage
    if (area < 1800 || width < 40 || height < 30) {
      return {
        showName: false,
        showPercentage: true,
        fontSize: Math.max(Math.min(area / 600, 12), 8),
        nameText: '',
        lineHeight: '1.0'
      }
    }
    
    // Small rectangles - abbreviated name
    if (area < 4000 || width < 70) {
      const maxChars = Math.floor(width / 8)
      const abbreviatedName = name.length > maxChars ? name.substring(0, maxChars - 1) + '…' : name
      return {
        showName: true,
        showPercentage: true,
        fontSize: Math.max(Math.min(area / 800, 12), 9),
        nameText: abbreviatedName,
        lineHeight: '1.1'
      }
    }
    
    // Medium rectangles - full name with possible wrapping
    if (area < 8000) {
      const maxCharsPerLine = Math.floor(width / 7)
      const words = name.split(' ')
      let lines = []
      let currentLine = ''
      
      for (const word of words) {
        if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
          currentLine = currentLine ? currentLine + ' ' + word : word
        } else {
          if (currentLine) lines.push(currentLine)
          currentLine = word.length > maxCharsPerLine ? word.substring(0, maxCharsPerLine - 1) + '…' : word
        }
      }
      if (currentLine) lines.push(currentLine)
      
      // Limit to 2 lines max for medium rectangles
      const displayText = lines.slice(0, 2).join('\n')
      
      return {
        showName: true,
        showPercentage: true,
        fontSize: Math.max(Math.min(area / 1000, 14), 10),
        nameText: displayText,
        lineHeight: '1.2'
      }
    }
    
    // Large rectangles - full name with smart wrapping
    const maxCharsPerLine = Math.floor(width / 6)
    const words = name.split(' ')
    let lines = []
    let currentLine = ''
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine = currentLine ? currentLine + ' ' + word : word
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    }
    if (currentLine) lines.push(currentLine)
    
    // Limit to 3 lines max for large rectangles
    const displayText = lines.slice(0, 3).join('\n')
    
    return {
      showName: true,
      showPercentage: true,
      fontSize: Math.max(Math.min(area / 1200, 16), 11),
      nameText: displayText,
      lineHeight: '1.3'
    }
  }, [])

  // Treemap calculation that fills entire space
  const calculateTreemap = useCallback((items: Array<{ id: string; value: number; name: string }>, width: number, height: number) => {
    if (!items.length) return []
    
    const totalValue = items.reduce((sum, item) => sum + item.value, 0)
    let allItems = [...items]
    
    // Add blank space if total < 100%
    if (totalValue < 100) {
      allItems.push({
        id: 'blank',
        name: '',
        value: 100 - totalValue
      })
    }
    
    const finalTotal = allItems.reduce((sum, item) => sum + item.value, 0)
    if (finalTotal === 0) return []
    
    // Sort by value descending
    const sortedItems = allItems.sort((a, b) => b.value - a.value)
    
    const rectangles: Array<{
      id: string
      name: string
      value: number
      x: number
      y: number
      width: number
      height: number
      isBlank?: boolean
    }> = []
    
    // Simple binary space partitioning for treemap
    function partition(items: typeof sortedItems, x: number, y: number, w: number, h: number) {
      if (items.length === 0) return
      
      if (items.length === 1) {
        const item = items[0]
        rectangles.push({
          id: item.id,
          name: item.name,
          value: item.value,
          x,
          y,
          width: w,
          height: h,
          isBlank: item.id === 'blank'
        })
        return
      }
      
      // Split items into two groups
      const mid = Math.floor(items.length / 2)
      const leftItems = items.slice(0, mid)
      const rightItems = items.slice(mid)
      
      const leftSum = leftItems.reduce((sum, item) => sum + item.value, 0)
      const totalSum = items.reduce((sum, item) => sum + item.value, 0)
      const leftRatio = leftSum / totalSum
      
      // Decide whether to split horizontally or vertically
      if (w > h) {
        // Split vertically
        const leftWidth = w * leftRatio
        partition(leftItems, x, y, leftWidth, h)
        partition(rightItems, x + leftWidth, y, w - leftWidth, h)
      } else {
        // Split horizontally
        const leftHeight = h * leftRatio
        partition(leftItems, x, y, w, leftHeight)
        partition(rightItems, x, y + leftHeight, w, h - leftHeight)
      }
    }
    
    partition(sortedItems, 0, 0, width, height)
    return rectangles
  }, [])

  // Bubble chart calculation
  const calculateBubbles = useCallback((items: Array<{ id: string; value: number; name: string; time: string }>, width: number, height: number) => {
    if (!items.length) return []
    
    const maxValue = Math.max(...items.map(item => item.value))
    const minRadius = 15
    const maxRadius = 40
    
    return items.map((item, index) => {
      const radius = minRadius + (item.value / maxValue) * (maxRadius - minRadius)
      const angle = (index / items.length) * 2 * Math.PI
      const centerX = width / 2
      const centerY = height / 2
      const maxDistance = Math.min(width, height) / 3
      const distance = Math.random() * maxDistance
      
      return {
        id: item.id,
        name: item.name,
        value: item.value,
        time: item.time,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        radius
      }
    })
  }, [])

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

  // Calculate treemap data
  const strategyRectangles = useMemo(() => {
    const items = strategies.map(strategy => ({
      id: strategy.id,
      name: strategy.objective,
      value: strategy.importance_percentage || 1
    }))
    return calculateTreemap(items, 300, 300)
  }, [strategies, calculateTreemap])

  const planRectangles = useMemo(() => {
    // Show plans for selected strategy
    const selectedStrategyPlans = plans.filter(plan => plan.strategy === selectedStrategyId)
    const items = selectedStrategyPlans.map(plan => ({
      id: plan.id,
      name: plan.objective,
      value: plan.importance_percentage || 1
    }))
    return calculateTreemap(items, 300, 300)
  }, [plans, selectedStrategyId, calculateTreemap])

  // Calculate task list for selected plan
  const selectedPlanTasks = useMemo(() => {
    if (!selectedPlanId) return []
    return tasks
      .filter(task => task.plan === selectedPlanId)
      .sort((a, b) => {
        // Sort by start_date, then by title
        const aDate = a.start_date ? new Date(a.start_date).getTime() : 0
        const bDate = b.start_date ? new Date(b.start_date).getTime() : 0
        if (aDate !== bDate) return aDate - bDate
        return a.title.localeCompare(b.title)
      })
  }, [tasks, selectedPlanId])

  // Handle Strategy click
  const handleStrategyClick = useCallback((strategyId: string) => {
    if (strategyId === 'blank') return // Ignore blank areas
    setSelectedStrategyId(strategyId)
    setSelectedPlanId(null) // Reset plan selection
  }, [])

  // Handle Plan click  
  const handlePlanClick = useCallback((planId: string) => {
    if (planId === 'blank') return // Ignore blank areas
    setSelectedPlanId(planId)
  }, [])

  // Auto-select largest plan when strategy changes
  useEffect(() => {
    if (selectedStrategyId && planRectangles.length > 0) {
      const largestPlan = planRectangles
        .filter(rect => !rect.isBlank)
        .reduce((max, rect) => rect.value > max.value ? rect : max, planRectangles[0])
      if (largestPlan && !largestPlan.isBlank) {
        setSelectedPlanId(largestPlan.id)
      }
    }
  }, [selectedStrategyId, planRectangles])

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
            objective: plan.objective || 'Untitled Plan',
            importance_percentage: plan.importance_percentage || 0
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
        objective: plan.objective || 'Untitled Plan',
        importance_percentage: plan.importance_percentage || 0
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
          onClick={() => loadAllData(true)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Main Content Area - Standard Layout */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 pb-60">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* First Row - 3 Columns Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Left Column - Calendar Card */}
          <div className="flex flex-col gap-2">
            {/* Calendar Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700">Calendar</span>
              <button className="w-6 h-6 flex items-center justify-center hover:bg-purple-50 rounded-full transition-colors">
                <span className="text-gray-500 text-xs">⋮</span>
              </button>
            </div>

            {/* Calendar Content */}
            <div className="aspect-square">
              <TaskCalendarView
                tasks={tasks}
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onMonthChange={setCurrentMonth}
                onTaskSelect={openFormPanel}
              />
            </div>
          </div>

          {/* Middle Column - Daily Tasks */}
          <div className="flex flex-col gap-2">
            {/* Daily Tasks Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedDate === new Date().toLocaleDateString('en-CA') ? `${selectedDate} (Today)` : selectedDate}
                </span>
                <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {tasks.filter(task => {
                    if (!task.start_date && !task.end_date) return false
                    const taskDate = task.start_date || task.end_date
                    if (!taskDate) return false
                    const taskDateString = new Date(taskDate).toLocaleDateString('en-CA')
                    return taskDateString === selectedDate
                  }).length}
                </div>
              </div>
              <button className="w-6 h-6 flex items-center justify-center hover:bg-purple-50 rounded-full transition-colors">
                <span className="text-gray-500 text-xs">⋮</span>
              </button>
            </div>

            {/* Daily Tasks Content */}
            <div className="aspect-square bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4 overflow-y-auto">
              {(() => {
                const dailyTasks = tasks
                  .filter(task => {
                    if (!task.start_date && !task.end_date) return false

                    const taskDate = task.start_date || task.end_date
                    if (!taskDate) return false

                    // Use same date conversion logic as calendar
                    const taskDateString = new Date(taskDate).toLocaleDateString('en-CA')
                    return taskDateString === selectedDate
                  })
                  .sort((a, b) => {
                    const aTime = a.start_date ? new Date(a.start_date).getTime() : 0
                    const bTime = b.start_date ? new Date(b.start_date).getTime() : 0
                    return aTime - bTime
                  })

                if (dailyTasks.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📅</div>
                        <p className="text-sm">No tasks for this date</p>
                      </div>
                    </div>
                  )
                }

                return (
                  <div className="space-y-3">
                    {dailyTasks.map((task) => {
                      const startDate = task.start_date ? new Date(task.start_date) : null
                      const endDate = task.end_date ? new Date(task.end_date) : null

                      const startTime = startDate
                        ? startDate.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false })
                        : '??:??'

                      const endTime = endDate
                        ? endDate.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false })
                        : '??:??'

                      const planInfo = planOptions.find(p => p.id === task.plan)

                      return (
                        <div
                          key={task.id}
                          className="group flex gap-3 p-2 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                          onClick={() => openFormPanel(task)}
                        >
                          <div className="text-xs font-mono text-purple-600 min-w-[4rem] flex-shrink-0 text-right">
                            {startTime} - {endTime}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-gray-700 leading-tight font-medium">
                              {task.title}
                            </div>
                            {planInfo && (
                              <div className="text-xs text-gray-500 mt-1">
                                [{planInfo.objective} - {planInfo.importance_percentage || 0}%]
                              </div>
                            )}
                          </div>
                          {task.status === 'Completed' && (
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Right Column - Strategy Countdown */}
          <div className="flex flex-col gap-2">
            {/* Strategy Countdown Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Strategy Timeline</span>
                <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {strategies.length}
                </div>
              </div>
              <button className="w-6 h-6 flex items-center justify-center hover:bg-purple-50 rounded-full transition-colors">
                <span className="text-gray-500 text-xs">⋮</span>
              </button>
            </div>

            {/* Strategy Countdown Content */}
            <div className="aspect-square bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl">
              <div className="h-full overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 h-full">
                  {strategies
                    .sort((a, b) => (b.importance_percentage || 0) - (a.importance_percentage || 0))
                    .slice(0, 8).map((strategy, index) => {
                    const daysLeft = strategy.due_date
                      ? Math.ceil((new Date(strategy.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : null;

                    const getStatusColor = (days: number | null) => {
                      if (days === null) return 'gray';
                      if (days < 0) return 'red';
                      if (days <= 3) return 'red';
                      if (days <= 7) return 'yellow';
                      return 'purple';
                    };

                    const getStatusBg = (days: number | null) => {
                      if (days === null) return 'from-gray-50 to-gray-100';
                      if (days < 0) return 'from-red-50 to-red-100';
                      if (days <= 3) return 'from-red-50 to-red-100';
                      if (days <= 7) return 'from-yellow-50 to-yellow-100';
                      return 'from-purple-50 to-purple-100';
                    };

                    const getProgressWidth = (days: number | null, strategy: StrategyRecord) => {
                      if (!days || !strategy.due_date || !strategy.start_date) return '0%';
                      const totalDays = Math.ceil((new Date(strategy.due_date).getTime() - new Date(strategy.start_date).getTime()) / (1000 * 60 * 60 * 24));
                      const passedDays = totalDays - days;
                      const progress = Math.max(0, Math.min(100, (passedDays / totalDays) * 100));
                      return `${progress}%`;
                    };

                    const color = getStatusColor(daysLeft);
                    const bgGradient = getStatusBg(daysLeft);

                    return (
                      <div key={strategy.id} className="flex flex-col">
                        {/* 倒计时卡片 */}
                        <div className={`bg-gradient-to-br ${bgGradient} rounded-lg p-3 border border-white/50 flex flex-col h-20 relative`}>
                          {/* 状态点 */}
                          <div className="absolute top-2 right-2">
                            <div className={`w-2 h-2 rounded-full ${
                              color === 'purple' ? 'bg-purple-500' :
                              color === 'yellow' ? 'bg-yellow-500' :
                              color === 'red' ? 'bg-red-500' : 'bg-gray-400'
                            }`}></div>
                          </div>

                          {/* 倒计时数字 - 居中显示 */}
                          <div className="flex-1 flex flex-col justify-center text-center">
                            <div className={`text-lg font-bold ${
                              color === 'purple' ? 'text-purple-600' :
                              color === 'yellow' ? 'text-yellow-600' :
                              color === 'red' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {daysLeft === null ? '--' : daysLeft < 0 ? Math.abs(daysLeft) : daysLeft}
                            </div>
                            <div className="text-xs text-gray-500">
                              {daysLeft === null ? '未设定' : daysLeft < 0 ? '超期' : '天'}
                            </div>
                          </div>

                          {/* 底部进度条 */}
                          <div className="w-full bg-gray-200/50 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full transition-all duration-300 ${
                                color === 'purple' ? 'bg-purple-500' :
                                color === 'yellow' ? 'bg-yellow-500' :
                                color === 'red' ? 'bg-red-500' : 'bg-gray-400'
                              }`}
                              style={{ width: getProgressWidth(daysLeft, strategy) }}
                            ></div>
                          </div>
                        </div>

                        {/* 策略名称 - 显示在卡片下方居中 */}
                        <div className="mt-2 text-center">
                          <span className="text-xs font-medium text-gray-700 block truncate" title={strategy.objective}>
                            {strategy.objective}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* 如果策略少于4个，显示空白占位 */}
                  {Array.from({ length: Math.max(0, 4 - strategies.length) }).map((_, index) => (
                    <div key={`empty-${index}`} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 border-dashed flex items-center justify-center">
                      <span className="text-xs text-gray-400">暂无策略</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row - 3 Columns Grid (Same as first row) */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Strategy */}
          <div className="flex flex-col gap-2">
            {/* Strategy Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm relative">
              <span className="text-sm font-medium text-gray-700">Strategy</span>
              <div className="relative">
                <button
                  onClick={() => setStrategyMenuOpen(!strategyMenuOpen)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-purple-50 rounded-full transition-colors"
                >
                  <span className="text-gray-500 text-xs">⋮</span>
                </button>

                {strategyMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setStrategyMenuOpen(false)}
                    />
                    <div className="absolute top-full mt-2 right-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-1 min-w-32">
                      <button
                        onClick={() => {
                          openStrategyForm()
                          setStrategyMenuOpen(false)
                        }}
                        className="w-full px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left"
                      >
                        Add Strategy
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Strategy Treemap */}
          {strategyRectangles.length > 0 ? (
            <svg width="100%" height="100%" viewBox="0 0 300 300" className="rounded-lg overflow-hidden aspect-square">
              {strategyRectangles.map((rect) => {
                // Handle blank areas
                if (rect.isBlank) {
                  return (
                    <rect
                      key={rect.id}
                      x={rect.x}
                      y={rect.y}
                      width={rect.width}
                      height={rect.height}
                      fill="hsl(260, 60%, 85%)"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  )
                }
                
                // Strategy: Blue-purple gradient
                const intensity = Math.min(rect.value / 100, 1)
                const saturation = 60 + (intensity * 30) // 60-90%
                const lightness = 80 - (intensity * 40) // 80-40%
                const bgColor = `hsl(260, ${saturation}%, ${lightness}%)`
                const textColor = intensity > 0.5 ? 'white' : '#4a5568'
                const isSelected = selectedStrategyId === rect.id
                
                // Get smart text display
                const textDisplay = getTextDisplay(rect.name, rect.value, rect.width, rect.height)
                
                return (
                  <g key={rect.id}>
                    <rect
                      x={rect.x}
                      y={rect.y}
                      width={rect.width}
                      height={rect.height}
                      fill={bgColor}
                      stroke="#ffffff"
                      strokeWidth="1"
                      className="transition-all duration-200 hover:brightness-110 hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-md"
                      style={{ transformOrigin: `${rect.x + rect.width/2}px ${rect.y + rect.height/2}px` }}
                      onClick={() => handleStrategyClick(rect.id)}
                    />
                    
                    <foreignObject
                      x={rect.x + 2}
                      y={rect.y + 2}
                      width={rect.width - 4}
                      height={rect.height - 4}
                      className="pointer-events-none"
                    >
                      <div className="flex flex-col justify-center h-full text-center px-1">
                        {textDisplay.showName && textDisplay.nameText && (
                          <div 
                            className="font-medium"
                            style={{ 
                              color: textColor,
                              fontSize: `${textDisplay.fontSize}px`,
                              lineHeight: textDisplay.lineHeight,
                              whiteSpace: 'pre-line'
                            }}
                          >
                            {textDisplay.nameText}
                          </div>
                        )}
                        {textDisplay.showPercentage && (
                          <div 
                            className={`font-semibold ${textDisplay.showName && textDisplay.nameText ? 'mt-1' : ''}`}
                            style={{ 
                              color: textColor,
                              fontSize: `${textDisplay.fontSize * 0.8}px`,
                              opacity: 0.9
                            }}
                          >
                            {rect.value}%
                          </div>
                        )}
                      </div>
                    </foreignObject>
                    
                    {/* Strategy Control Dot - Top Right Corner */}
                    <foreignObject
                      x={rect.x + rect.width - 20}
                      y={rect.y + 2}
                      width="18"
                      height="18"
                      className="pointer-events-auto"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Find strategy and open edit form
                          const strategy = strategies.find(s => s.id === rect.id)
                          if (strategy) {
                            setEditingStrategy(strategy)
                            setStrategyFormOpen(true)
                          }
                        }}
                        className="w-full h-full bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-150"
                      >
                        <span className="text-gray-600 text-xs leading-none">⋮</span>
                      </button>
                    </foreignObject>
                  </g>
                )
              })}
            </svg>
          ) : (
            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">No strategies</span>
            </div>
          )}
          </div>

          {/* Middle Column - Plan */}
          <div className="flex flex-col gap-2">
            {/* Plan Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm relative">
              <span className="text-sm font-medium text-gray-700">Plan</span>
              <div className="relative">
                <button
                  onClick={() => setPlanMenuOpen(!planMenuOpen)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-purple-50 rounded-full transition-colors"
                >
                  <span className="text-gray-500 text-xs">⋮</span>
                </button>

                {planMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setPlanMenuOpen(false)}
                    />
                    <div className="absolute top-full mt-2 right-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-1 min-w-32">
                      <button
                        onClick={() => {
                          openPlanForm()
                          setPlanMenuOpen(false)
                        }}
                        className="w-full px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left"
                      >
                        Add Plan
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Plan Treemap */}
          {planRectangles.length > 0 ? (
            <svg width="100%" height="100%" viewBox="0 0 300 300" className="rounded-lg overflow-hidden aspect-square">
              {planRectangles.map((rect) => {
                // Handle blank areas
                if (rect.isBlank) {
                  return (
                    <rect
                      key={rect.id}
                      x={rect.x}
                      y={rect.y}
                      width={rect.width}
                      height={rect.height}
                      fill="hsl(280, 50%, 90%)"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  )
                }
                
                // Plan: Pink-purple gradient
                const intensity = Math.min(rect.value / 100, 1)
                const saturation = 50 + (intensity * 30) // 50-80%
                const lightness = 85 - (intensity * 25) // 85-60%
                const bgColor = `hsl(280, ${saturation}%, ${lightness}%)`
                const textColor = intensity > 0.5 ? 'white' : '#4a5568'
                const isSelected = selectedPlanId === rect.id
                
                // Get smart text display
                const textDisplay = getTextDisplay(rect.name, rect.value, rect.width, rect.height)
                
                return (
                  <g key={rect.id}>
                    <rect
                      x={rect.x}
                      y={rect.y}
                      width={rect.width}
                      height={rect.height}
                      fill={bgColor}
                      stroke="#ffffff"
                      strokeWidth="1"
                      className="transition-all duration-200 hover:brightness-110 hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-md"
                      style={{ transformOrigin: `${rect.x + rect.width/2}px ${rect.y + rect.height/2}px` }}
                      onClick={() => handlePlanClick(rect.id)}
                    />
                    
                    <foreignObject
                      x={rect.x + 2}
                      y={rect.y + 2}
                      width={rect.width - 4}
                      height={rect.height - 4}
                      className="pointer-events-none"
                    >
                      <div className="flex flex-col justify-center h-full text-center px-1">
                        {textDisplay.showName && textDisplay.nameText && (
                          <div 
                            className="font-medium"
                            style={{ 
                              color: textColor,
                              fontSize: `${textDisplay.fontSize}px`,
                              lineHeight: textDisplay.lineHeight,
                              whiteSpace: 'pre-line'
                            }}
                          >
                            {textDisplay.nameText}
                          </div>
                        )}
                        {textDisplay.showPercentage && (
                          <div 
                            className={`font-semibold ${textDisplay.showName && textDisplay.nameText ? 'mt-1' : ''}`}
                            style={{ 
                              color: textColor,
                              fontSize: `${textDisplay.fontSize * 0.8}px`,
                              opacity: 0.9
                            }}
                          >
                            {rect.value}%
                          </div>
                        )}
                      </div>
                    </foreignObject>
                    
                    {/* Plan Control Dot - Top Right Corner */}
                    <foreignObject
                      x={rect.x + rect.width - 20}
                      y={rect.y + 2}
                      width="18"
                      height="18"
                      className="pointer-events-auto"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Find plan and open edit form
                          const plan = plans.find(p => p.id === rect.id)
                          if (plan) {
                            setEditingPlan(plan)
                            setPlanFormOpen(true)
                          }
                        }}
                        className="w-full h-full bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-150"
                      >
                        <span className="text-gray-600 text-xs leading-none">⋮</span>
                      </button>
                    </foreignObject>
                  </g>
                )
              })}
            </svg>
          ) : (
            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">No plans</span>
            </div>
          )}
          </div>

          {/* Right Column - Task */}
          <div className="flex flex-col gap-2">
            {/* Task Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm relative">
              <span className="text-sm font-medium text-gray-700">Task</span>
              <div className="relative">
                <button
                  onClick={() => setTaskMenuOpen(!taskMenuOpen)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-purple-50 rounded-full transition-colors"
                >
                  <span className="text-gray-500 text-xs">⋮</span>
                </button>

                {taskMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setTaskMenuOpen(false)}
                    />
                    <div className="absolute top-full mt-2 right-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-1 min-w-32">
                      <button
                        onClick={() => {
                          openFormPanel()
                          setTaskMenuOpen(false)
                        }}
                        className="w-full px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left"
                      >
                        Add Task
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Task List */}
          <div className="aspect-square bg-white/90 rounded-xl shadow-xl p-4">
            {selectedPlanTasks.length > 0 ? (
              <div className="space-y-2">
                {selectedPlanTasks.map((task) => {
                  const startDate = task.start_date ? new Date(task.start_date) : null
                  const endDate = task.end_date ? new Date(task.end_date) : null

                  const dateStr = startDate
                    ? startDate.toLocaleDateString('en-CA')
                    : '????-??-??'

                  const startTime = startDate
                    ? startDate.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false })
                    : '??:??'

                  const endTime = endDate
                    ? endDate.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false })
                    : '??:??'

                  return (
                    <div
                      key={task.id}
                      className="group flex items-start gap-3 p-2 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-mono text-purple-600 min-w-[8rem] flex-shrink-0">
                        <div>{dateStr}</div>
                        <div>{startTime} - {endTime}</div>
                      </div>
                      <div className="flex-1 text-sm text-gray-700 leading-tight">
                        {task.title}
                      </div>
                      {task.status === 'Completed' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      
                      {/* Task Control Dot - Right Side */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Open task edit form
                          setEditingTask(task)
                          setFormPanelOpen(true)
                        }}
                        className="w-6 h-6 flex items-center justify-center hover:bg-purple-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <span className="text-gray-500 text-xs leading-none">⋮</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-sm">No tasks</p>
                </div>
              </div>
            )}
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
        <div className={`fixed top-6 right-6 z-60 px-3 py-2 rounded-lg shadow-xl backdrop-blur-md transition-all duration-300 text-sm ${
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