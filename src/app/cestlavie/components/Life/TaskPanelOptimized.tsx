'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { TaskRecord, TaskFormData, PlanOption, StrategyOption } from '../../types/task'
import { StrategyRecord } from '../../types/strategy'
import { PlanRecord } from '../../types/plan'
import { saveTask, deleteTask } from '../../services/taskService'
import { updateStrategyField, deleteStrategy } from '../../services/strategyService'
import { updatePlanField, deletePlan } from '../../services/planService'
import { dataCache, CACHE_KEYS } from '../../utils/dataCache'
import TaskFormPanel from './TaskFormPanel'
import TaskCalendarView from './TaskCalendarView'
import StrategyContent from './StrategyContent'
import PlanContent from './PlanContent'
import StrategyFormPanel from './StrategyFormPanel'
import PlanFormPanel from './PlanFormPanel'
import { saveStrategy } from '../../services/strategyService'
import { savePlan } from '../../services/planService'
import { StrategyRecord, StrategyFormData } from '../../types/strategy'
import { PlanRecord, PlanFormData } from '../../types/plan'
import type { User } from '@supabase/supabase-js'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/DropdownMenu'

const DEFAULT_TASK_STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed', 'On Hold']
const DEFAULT_STRATEGY_STATUS_OPTIONS: string[] = []
const DEFAULT_STRATEGY_CATEGORY_OPTIONS: string[] = []
const DEFAULT_PLAN_STATUS_OPTIONS: string[] = []

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
  

  // Refs to avoid fetch callbacks depending on state setters
  const statusOptionsRef = useRef<string[]>(DEFAULT_TASK_STATUS_OPTIONS)
  const strategyStatusOptionsRef = useRef<string[]>(DEFAULT_STRATEGY_STATUS_OPTIONS)
  const strategyCategoryOptionsRef = useRef<string[]>(DEFAULT_STRATEGY_CATEGORY_OPTIONS)
  const planStatusOptionsRef = useRef<string[]>(DEFAULT_PLAN_STATUS_OPTIONS)

  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Dropdown menu states
  const [strategyMenuOpen, setStrategyMenuOpen] = useState(false)
  const [planMenuOpen, setPlanMenuOpen] = useState(false)
  const [taskMenuOpen, setTaskMenuOpen] = useState(false)
  const [dailyTaskMenuOpen, setDailyTaskMenuOpen] = useState(false)

  // Individual item dropdown states
  const [strategyItemMenuOpen, setStrategyItemMenuOpen] = useState<string | null>(null)
  const [planItemMenuOpen, setPlanItemMenuOpen] = useState<string | null>(null)
  const [taskItemMenuOpen, setTaskItemMenuOpen] = useState<string | null>(null)

  // Portal dropdown position states
  const [strategyDropdownPosition, setStrategyDropdownPosition] = useState<{ top: number; left: number } | null>(null)
  const [planDropdownPosition, setPlanDropdownPosition] = useState<{ top: number; left: number } | null>(null)
  const [dailyTaskDropdownPosition, setDailyTaskDropdownPosition] = useState<{ top: number; left: number } | null>(null)

  // Close dropdowns on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (strategyItemMenuOpen || planItemMenuOpen || dailyTaskMenuOpen) {
        setStrategyItemMenuOpen(null)
        setStrategyDropdownPosition(null)
        setPlanItemMenuOpen(null)
        setPlanDropdownPosition(null)
        setDailyTaskMenuOpen(false)
        setDailyTaskDropdownPosition(null)
      }
    }

    window.addEventListener('scroll', handleScroll, true) // Use capture phase
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [strategyItemMenuOpen, planItemMenuOpen, dailyTaskMenuOpen])

  // Delete confirmation modal states
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean
    type: 'strategy' | 'plan' | 'task'
    item: any
  }>({ isOpen: false, type: 'strategy', item: null })

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

  useEffect(() => {
    statusOptionsRef.current = statusOptions.length ? statusOptions : DEFAULT_TASK_STATUS_OPTIONS
  }, [statusOptions])

  useEffect(() => {
    strategyStatusOptionsRef.current = strategyStatusOptions.length ? strategyStatusOptions : DEFAULT_STRATEGY_STATUS_OPTIONS
  }, [strategyStatusOptions])

  useEffect(() => {
    strategyCategoryOptionsRef.current = strategyCategoryOptions.length ? strategyCategoryOptions : DEFAULT_STRATEGY_CATEGORY_OPTIONS
  }, [strategyCategoryOptions])

  useEffect(() => {
    planStatusOptionsRef.current = planStatusOptions.length ? planStatusOptions : DEFAULT_PLAN_STATUS_OPTIONS
  }, [planStatusOptions])

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

  const strategyTimelineThemes = {
    purple: {
      badge: 'text-purple-700 bg-white/70',
      accent: 'text-purple-700',
      progress: 'from-purple-500 via-purple-400 to-purple-600',
      ring: 'shadow-[0_0_25px_-10px_rgba(129,140,248,0.8)]'
    },
    yellow: {
      badge: 'text-amber-700 bg-white/70',
      accent: 'text-amber-700',
      progress: 'from-amber-400 via-amber-300 to-amber-500',
      ring: 'shadow-[0_0_25px_-10px_rgba(251,191,36,0.9)]'
    },
    red: {
      badge: 'text-rose-700 bg-white/70',
      accent: 'text-rose-700',
      progress: 'from-rose-500 via-rose-400 to-rose-600',
      ring: 'shadow-[0_0_25px_-10px_rgba(244,63,94,0.8)]'
    },
    gray: {
      badge: 'text-slate-600 bg-white/70',
      accent: 'text-slate-600',
      progress: 'from-slate-400 via-slate-300 to-slate-500',
      ring: 'shadow-[0_0_25px_-12px_rgba(148,163,184,0.7)]'
    }
  } as const

  type TreemapTheme = {
    gradient: string
    border: string
    ring: string
    text: string
    mutedText: string
  }

  const baseTreemapPalette = {
    high: {
      gradient: 'linear-gradient(135deg, rgba(109,76,255,0.95), rgba(147,90,255,0.95))',
      border: 'rgba(167,139,250,0.55)',
      ring: 'drop-shadow(0 12px 22px rgba(126,103,255,0.32))',
      text: 'text-white',
      mutedText: 'text-white/80'
    },
    medium: {
      gradient: 'linear-gradient(135deg, rgba(129,102,255,0.88), rgba(167,139,250,0.88))',
      border: 'rgba(196,181,253,0.55)',
      ring: 'drop-shadow(0 10px 20px rgba(167,139,250,0.28))',
      text: 'text-white',
      mutedText: 'text-white/75'
    },
    low: {
      gradient: 'linear-gradient(135deg, rgba(209,196,255,0.92), rgba(224,214,255,0.92))',
      border: 'rgba(229,223,255,0.7)',
      ring: 'drop-shadow(0 8px 16px rgba(209,196,255,0.28))',
      text: 'text-slate-700',
      mutedText: 'text-slate-600'
    }
  } satisfies Record<'high' | 'medium' | 'low', TreemapTheme>

  const treemapThemes: Record<'strategy' | 'plan', typeof baseTreemapPalette> = {
    strategy: baseTreemapPalette,
    plan: baseTreemapPalette
  }

  const getTreemapTheme = (type: 'strategy' | 'plan', value: number): TreemapTheme => {
    const palette = treemapThemes[type]
    const importance = Math.max(0, Math.min(100, value || 0))
    if (importance >= 60) return palette.high
    if (importance >= 25) return palette.medium
    return palette.low
  }

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, TaskRecord[]> = {}

    for (const task of tasks) {
      const taskDate = task.start_date || task.end_date
      if (!taskDate) continue

      const dateKey = new Date(taskDate).toLocaleDateString('en-CA')
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(task)
    }

    for (const dateKey of Object.keys(grouped)) {
      grouped[dateKey].sort((a, b) => {
        const aCompleted = a.status === 'Completed'
        const bCompleted = b.status === 'Completed'

        if (aCompleted && !bCompleted) return 1
        if (!aCompleted && bCompleted) return -1

        const aTime = a.start_date || a.end_date
        const bTime = b.start_date || b.end_date
        if (!aTime || !bTime) return 0
        return aTime.localeCompare(bTime)
      })
    }

    return grouped
  }, [tasks])

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

  // Call onTasksUpdate when tasks change
  useEffect(() => {
    if (onTasksUpdate && tasks.length > 0) {
      onTasksUpdate(tasks)
    }
  }, [tasks, onTasksUpdate])

  const fetchTasksData = useCallback(async (
    { force = false, includeSchema = false }: { force?: boolean; includeSchema?: boolean } = {}
  ) => {
    if (!force) {
      const cached = dataCache.get<{
        tasks: TaskRecord[]
        schemaOptions: { statusOptions: string[] }
      }>(CACHE_KEYS.TASKS)

      if (cached) {
        const cachedStatus = cached.schemaOptions?.statusOptions?.length
          ? cached.schemaOptions.statusOptions
          : DEFAULT_TASK_STATUS_OPTIONS

        setTasks(cached.tasks)
        setStatusOptions(cachedStatus)

        if (!includeSchema || cached.schemaOptions?.statusOptions?.length) {
          return cached.tasks
        }
      }
    }

    const [tasksRes, schemaRes] = await Promise.all([
      fetch('/api/tasks'),
      includeSchema ? fetch('/api/tasks?action=schema').catch(() => null) : Promise.resolve(null)
    ])

    if (!tasksRes.ok) {
      throw new Error(`HTTP ${tasksRes.status}: failed to load tasks`)
    }

    const tasksJson = await tasksRes.json()
    const tasksData: TaskRecord[] = tasksJson.data || []

    let statusOpts = statusOptionsRef.current

    if (includeSchema) {
      if (schemaRes && schemaRes.ok) {
        const schemaJson = await schemaRes.json()
        statusOpts = schemaJson.schema?.statusOptions?.length
          ? schemaJson.schema.statusOptions
          : DEFAULT_TASK_STATUS_OPTIONS
      } else if (schemaRes) {
        statusOpts = DEFAULT_TASK_STATUS_OPTIONS
      }
    }

    setTasks(tasksData)
    setStatusOptions(statusOpts)
    dataCache.set(CACHE_KEYS.TASKS, {
      tasks: tasksData,
      schemaOptions: { statusOptions: statusOpts }
    })

    return tasksData
  }, [])

  const fetchStrategiesData = useCallback(async (
    { force = false, includeSchema = false }: { force?: boolean; includeSchema?: boolean } = {}
  ) => {
    if (!force) {
      const cached = dataCache.get<{ strategies: StrategyRecord[] }>(CACHE_KEYS.STRATEGIES)
      if (cached) {
        setStrategies(cached.strategies)
        const cachedOptions = cached.strategies.map(strategy => ({
          id: strategy.id,
          objective: strategy.objective || 'Untitled Strategy'
        }))
        setStrategyOptions(cachedOptions)

        if (!includeSchema) {
          return cached.strategies
        }
      }
    }

    const [strategyRes, schemaRes] = await Promise.all([
      fetch('/api/strategy'),
      includeSchema ? fetch('/api/strategy?action=schema').catch(() => null) : Promise.resolve(null)
    ])

    if (!strategyRes.ok) {
      throw new Error(`HTTP ${strategyRes.status}: failed to load strategies`)
    }

    const strategyJson = await strategyRes.json()
    const strategyData: StrategyRecord[] = strategyJson.data || []

    setStrategies(strategyData)
    const strategyOpts = strategyData.map(strategy => ({
      id: strategy.id,
      objective: strategy.objective || 'Untitled Strategy'
    }))
    setStrategyOptions(strategyOpts)

    if (includeSchema) {
      let statusOpts = strategyStatusOptionsRef.current
      let categoryOpts = strategyCategoryOptionsRef.current

      if (schemaRes && schemaRes.ok) {
        const schemaJson = await schemaRes.json()
        statusOpts = schemaJson.schema?.statusOptions || DEFAULT_STRATEGY_STATUS_OPTIONS
        categoryOpts = schemaJson.schema?.categoryOptions || DEFAULT_STRATEGY_CATEGORY_OPTIONS
      } else if (schemaRes) {
        statusOpts = DEFAULT_STRATEGY_STATUS_OPTIONS
        categoryOpts = DEFAULT_STRATEGY_CATEGORY_OPTIONS
      }

      setStrategyStatusOptions(statusOpts)
      setStrategyCategoryOptions(categoryOpts)
    }

    dataCache.set(CACHE_KEYS.STRATEGIES, { strategies: strategyData })

    return strategyData
  }, [])

  const fetchPlansData = useCallback(async (
    { force = false, includeSchema = false }: { force?: boolean; includeSchema?: boolean } = {}
  ) => {
    if (!force) {
      const cached = dataCache.get<PlanRecord[]>(CACHE_KEYS.PLANS)
      if (cached) {
        setPlans(cached)
        const cachedOptions = cached.map(plan => ({
          id: plan.id,
          objective: plan.objective || 'Untitled Plan',
          importance_percentage: plan.importance_percentage || 0
        }))
        setPlanOptions(cachedOptions)

        if (!includeSchema) {
          return cached
        }
      }
    }

    const [planRes, schemaRes] = await Promise.all([
      fetch('/api/plan'),
      includeSchema ? fetch('/api/plan?action=schema').catch(() => null) : Promise.resolve(null)
    ])

    if (!planRes.ok) {
      throw new Error(`HTTP ${planRes.status}: failed to load plans`)
    }

    const planJson = await planRes.json()
    const planData: PlanRecord[] = planJson.data || []

    setPlans(planData)
    const planOpts = planData.map(plan => ({
      id: plan.id,
      objective: plan.objective || 'Untitled Plan',
      importance_percentage: plan.importance_percentage || 0
    }))
    setPlanOptions(planOpts)

    if (includeSchema) {
      let statusOpts = planStatusOptionsRef.current

      if (schemaRes && schemaRes.ok) {
        const schemaJson = await schemaRes.json()
        statusOpts = schemaJson.schema?.statusOptions || DEFAULT_PLAN_STATUS_OPTIONS
      } else if (schemaRes) {
        statusOpts = DEFAULT_PLAN_STATUS_OPTIONS
      }

      setPlanStatusOptions(statusOpts)
    }

    dataCache.set(CACHE_KEYS.PLANS, planData)

    return planData
  }, [])

  const loadAllData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      await Promise.all([
        fetchTasksData({ force: forceRefresh, includeSchema: true }),
        fetchStrategiesData({ force: forceRefresh, includeSchema: true }),
        fetchPlansData({ force: forceRefresh, includeSchema: true })
      ])
    } catch (err) {
      console.error('Failed to load data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')

      setStatusOptions(prev => (prev.length ? prev : DEFAULT_TASK_STATUS_OPTIONS))
      setStrategyStatusOptions(prev => (prev.length ? prev : DEFAULT_STRATEGY_STATUS_OPTIONS))
      setStrategyCategoryOptions(prev => (prev.length ? prev : DEFAULT_STRATEGY_CATEGORY_OPTIONS))
      setPlanStatusOptions(prev => (prev.length ? prev : DEFAULT_PLAN_STATUS_OPTIONS))

      if (forceRefresh) {
        setTasks([])
        setStrategies([])
        setPlans([])
        setPlanOptions([])
        setStrategyOptions([])
        setStatusOptions(DEFAULT_TASK_STATUS_OPTIONS)
        setStrategyStatusOptions(DEFAULT_STRATEGY_STATUS_OPTIONS)
        setStrategyCategoryOptions(DEFAULT_STRATEGY_CATEGORY_OPTIONS)
        setPlanStatusOptions(DEFAULT_PLAN_STATUS_OPTIONS)
      }
    } finally {
      setLoading(false)
    }
  }, [fetchPlansData, fetchStrategiesData, fetchTasksData])

  // Load all data only after authentication is complete and user exists
  useEffect(() => {
    if (!authLoading && user) {
      loadAllData()
    }
  }, [authLoading, user, loadAllData])

  // n8n sync helper function
  const syncTaskToN8n = useCallback(async (action: 'create' | 'update' | 'delete', taskData: any) => {
    try {
      await fetch('http://localhost:5678/webhook/Sync Task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          data: taskData
        })
      })
    } catch (error) {
      console.error(`n8n ${action} sync error:`, error)
    }
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

        // Auto-sync update to n8n if task has outlook_event_id
        if (editingTask?.outlook_event_id) {
          await syncTaskToN8n('update', {
            id: updatedTask.id,
            outlook_event_id: editingTask.outlook_event_id,
            title: updatedTask.title,
            start_date: updatedTask.start_date,
            end_date: updatedTask.end_date,
            all_day: updatedTask.all_day,
            note: updatedTask.note
          })
        }
      } else {
        // Refresh only task data for new entries
        await fetchTasksData({ force: true })
      }

      setFormPanelOpen(false)
      setEditingTask(null)
      setToast({ message: isEditing ? 'Task updated successfully' : 'Task created successfully', type: 'success' })
      
    } catch (err) {
      console.error('Failed to save task:', err)
      setToast({ message: 'Failed to save task', type: 'error' })
    }
  }, [editingTask, fetchTasksData, syncTaskToN8n])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      // Find the task to get outlook_event_id before deletion
      const taskToDelete = tasks.find(task => task.id === taskId)

      await deleteTask(taskId)
      // Invalidate cache since task data changed
      dataCache.delete(CACHE_KEYS.TASKS)
      setTasks(prev => prev.filter(task => task.id !== taskId))
      setToast({ message: 'Task deleted successfully', type: 'success' })

      // Auto-sync deletion to n8n if task has outlook_event_id
      if (taskToDelete?.outlook_event_id) {
        await syncTaskToN8n('delete', {
          id: taskToDelete.id,
          outlook_event_id: taskToDelete.outlook_event_id
        })
      }

    } catch (err) {
      console.error('Failed to delete task:', err)
      setToast({ message: 'Failed to delete task', type: 'error' })
    }
  }, [tasks, syncTaskToN8n])

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
      if (selectedStrategyId === strategyId) {
        setSelectedStrategyId(null)
      }
      setSelectedPlanId(null)

      // Refresh related collections without full reload
      await Promise.all([
        fetchStrategiesData({ force: true }),
        fetchPlansData({ force: true }),
        fetchTasksData({ force: true })
      ])
      
      const { cascadeDeleted } = result
      const message = `Strategy deleted (${cascadeDeleted.plans} plans, ${cascadeDeleted.tasks} tasks also deleted)`
      setToast({ message, type: 'success' })
    } catch (error) {
      console.error('Failed to delete strategy:', error)
      setToast({ message: 'Failed to delete strategy', type: 'error' })
    }
  }, [fetchPlansData, fetchStrategiesData, fetchTasksData, selectedStrategyId])

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
      if (selectedPlanId === planId) {
        setSelectedPlanId(null)
      }

      // Refresh plans and tasks without full reload
      await Promise.all([
        fetchPlansData({ force: true }),
        fetchTasksData({ force: true })
      ])
      
      const { cascadeDeleted } = result
      const message = `Plan deleted (${cascadeDeleted.tasks} tasks also deleted)`
      setToast({ message, type: 'success' })
    } catch (error) {
      console.error('Failed to delete plan:', error)
      setToast({ message: 'Failed to delete plan', type: 'error' })
    }
  }, [fetchPlansData, fetchTasksData, selectedPlanId])

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
      
      // Refresh strategies to get updated relationships
      await fetchStrategiesData({ force: true })
      
      setStrategyFormOpen(false)
      setEditingStrategy(null)
      setToast({ message: isEditing ? 'Strategy updated successfully' : 'Strategy created successfully', type: 'success' })
      
    } catch (err) {
      console.error('Failed to save strategy:', err)
      setToast({ message: 'Failed to save strategy', type: 'error' })
    }
  }, [editingStrategy, fetchStrategiesData])

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
      
      // Refresh plans to reflect changes
      await fetchPlansData({ force: true })
      
      setPlanFormOpen(false)
      setEditingPlan(null)
      setToast({ message: isEditing ? 'Plan updated successfully' : 'Plan created successfully', type: 'success' })
      
    } catch (err) {
      console.error('Failed to save plan:', err)
      setToast({ message: 'Failed to save plan', type: 'error' })
    }
  }, [editingPlan, fetchPlansData])

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
                tasksByDate={tasksByDate}
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
            <div className="flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm relative">
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
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()

                    if (dailyTaskMenuOpen) {
                      // Close dropdown
                      setDailyTaskMenuOpen(false)
                      setDailyTaskDropdownPosition(null)
                    } else {
                      // Calculate position and open dropdown
                      const buttonRect = e.currentTarget.getBoundingClientRect()
                      const dropdownPosition = {
                        top: buttonRect.bottom + 10,
                        left: buttonRect.left + buttonRect.width - 115, // Fine tune position
                      }

                      // Boundary check for viewport
                      const viewport = { width: window.innerWidth, height: window.innerHeight }
                      if (dropdownPosition.left < 4) dropdownPosition.left = 4
                      if (dropdownPosition.left + 80 > viewport.width) dropdownPosition.left = viewport.width - 84

                      setDailyTaskDropdownPosition(dropdownPosition)
                      setDailyTaskMenuOpen(true)
                    }
                  }}
                  className="w-6 h-6 flex items-center justify-center hover:bg-purple-50 rounded-full transition-colors"
                >
                  <span className="text-gray-500 text-xs">⋮</span>
                </button>
              </div>
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
                        >
                          <div className="text-xs font-mono text-purple-600 min-w-[4rem] flex-shrink-0 text-right">
                            {startTime} - {endTime}
                          </div>
                          <div className="flex-1" onClick={() => openFormPanel(task)}>
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
                            <div className="flex-shrink-0 mt-1">
                              <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}

                          {/* Daily Task Control Dot - Right Side */}
                          <div className="flex-shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <button className="w-6 h-6 flex items-center justify-center hover:bg-purple-100 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                  <span className="text-gray-500 text-xs leading-none">⋮</span>
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-purple-100 p-1 min-w-20">
                                <DropdownMenuItem
                                  className="w-full px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left cursor-pointer"
                                  onClick={() => {
                                    setEditingTask(task)
                                    setFormPanelOpen(true)
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="w-full px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left cursor-pointer"
                                  onClick={async () => {
                                    try {
                                      await saveTask({
                                        title: task.title,
                                        status: 'Completed',
                                        start_date: task.start_date,
                                        end_date: task.end_date,
                                        all_day: task.all_day,
                                        plan: task.plan,
                                        note: task.note,
                                        importance_percentage: task.importance_percentage
                                      }, task.id)
                                      dataCache.delete(CACHE_KEYS.TASKS)
                                      await fetchTasksData({ force: true })
                                    } catch (error) {
                                      console.error('Failed to complete task:', error)
                                    }
                                  }}
                                >
                                  Complete
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="w-full px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left cursor-pointer"
                                  onClick={() => {
                                    setDeleteConfirmModal({
                                      isOpen: true,
                                      type: 'task',
                                      item: task
                                    })
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
                      if (days === null) return 'from-slate-100/90 via-white/60 to-slate-50/70'
                      if (days < 0) return 'from-rose-100/90 via-rose-200/70 to-white/60'
                      if (days <= 3) return 'from-rose-100/90 via-rose-200/70 to-white/60'
                      if (days <= 7) return 'from-amber-100/90 via-amber-200/60 to-white/70'
                      return 'from-indigo-100/90 via-indigo-200/60 to-white/70'
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
                    const theme = strategyTimelineThemes[color as keyof typeof strategyTimelineThemes] || strategyTimelineThemes.gray
                    const progressWidth = getProgressWidth(daysLeft, strategy)

                    return (
                      <div key={strategy.id} className="flex flex-col">
                        {/* 倒计时卡片 */}
                        <div
                          className={`relative flex h-28 flex-col rounded-2xl border border-white/60 bg-gradient-to-br ${bgGradient} p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${theme.ring}`}
                        >
                          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/20 backdrop-blur-[2px]"></div>
                          <div className="relative flex items-start justify-between">
                            <span className={`px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] uppercase rounded-full ${theme.badge}`}>
                              {daysLeft === null ? 'Unset' : daysLeft < 0 ? 'Overdue' : 'D-Day'}
                            </span>
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-[10px] font-semibold ${theme.accent}`}>
                              {strategy.importance_percentage ? `${strategy.importance_percentage}%` : '—'}
                            </div>
                          </div>

                          <div className="relative mt-4 flex flex-1 items-end justify-between">
                            <div>
                              <div className={`text-2xl font-bold leading-none ${theme.accent}`}>
                                {daysLeft === null ? '--' : Math.abs(daysLeft)}
                              </div>
                              <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                                {daysLeft === null ? '未设定' : daysLeft < 0 ? '逾期天数' : '剩余天数'}
                              </div>
                            </div>
                            {strategy.due_date && (
                              <div className="text-right text-[10px] font-medium text-slate-500">
                                <div>Due</div>
                                <div>{new Date(strategy.due_date).toLocaleDateString('zh-CN')}</div>
                              </div>
                            )}
                          </div>

                          <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/40">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${theme.progress}`}
                              style={{ width: progressWidth }}
                            ></div>
                          </div>
                        </div>

                        {/* 策略名称 - 显示在卡片下方居中 */}
                        <div className="mt-2 text-center">
                          <span className="line-clamp-2 text-xs font-semibold text-slate-700" title={strategy.objective}>
                            {strategy.objective || '未命名策略'}
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
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button className="w-6 h-6 flex items-center justify-center hover:bg-purple-50 rounded-full transition-colors">
                    <span className="text-gray-500 text-xs">⋮</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-purple-100 p-1 min-w-32">
                  <DropdownMenuItem
                    className="w-full px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left cursor-pointer"
                    onClick={() => openStrategyForm()}
                  >
                    Add Strategy
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                      fill="rgba(237,233,254,0.6)"
                    />
                  )
                }
                
                // Strategy: Blue-purple gradient
                const theme = getTreemapTheme('strategy', rect.value)
                const isSelected = selectedStrategyId === rect.id

                // Get smart text display
                const textDisplay = getTextDisplay(rect.name, rect.value, rect.width, rect.height)
                
                return (
                  <g key={rect.id} className="transition-all duration-200">
                    <foreignObject
                      x={rect.x + 1.5}
                      y={rect.y + 1.5}
                      width={rect.width - 3}
                      height={rect.height - 3}
                      className="pointer-events-none"
                    >
                      <div
                        className="h-full w-full overflow-hidden rounded-xl"
                        style={{ background: theme.gradient }}
                      onClick={() => handleStrategyClick(rect.id)}
                      >
                        <div className="flex h-full flex-col justify-between p-3">
                          <div className="flex justify-end">
                            {rect.value ? (
                              <span className={`text-xs font-semibold ${theme.mutedText}`}>
                                {rect.value}%
                              </span>
                            ) : null}
                          </div>
                          {textDisplay.showName && textDisplay.nameText && (
                            <div
                              className={`font-semibold ${theme.text}`}
                              style={{
                                fontSize: `${Math.max(12, textDisplay.fontSize)}px`,
                                lineHeight: textDisplay.lineHeight,
                                whiteSpace: 'pre-line'
                              }}
                            >
                              {textDisplay.nameText}
                            </div>
                          )}
                        </div>
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
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()

                            if (strategyItemMenuOpen === rect.id) {
                              // Close dropdown
                              setStrategyItemMenuOpen(null)
                              setStrategyDropdownPosition(null)
                            } else {
                              // Calculate position and open dropdown
                              const buttonRect = e.currentTarget.getBoundingClientRect()
                              const dropdownPosition = {
                                top: buttonRect.bottom + 2,
                                left: buttonRect.left + buttonRect.width - 100, // Move left more
                              }

                              // Boundary check for viewport
                              const viewport = { width: window.innerWidth, height: window.innerHeight }
                              if (dropdownPosition.left < 4) dropdownPosition.left = 4
                              if (dropdownPosition.left + 80 > viewport.width) dropdownPosition.left = viewport.width - 84

                              setStrategyDropdownPosition(dropdownPosition)
                              setStrategyItemMenuOpen(rect.id)
                            }
                          }}
                          className="w-full h-full bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-150"
                        >
                          <span className="text-gray-600 text-xs leading-none">⋮</span>
                        </button>

                      </div>
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
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button className="w-6 h-6 flex items-center justify-center hover:bg-purple-50 rounded-full transition-colors">
                    <span className="text-gray-500 text-xs">⋮</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-purple-100 p-1 min-w-32">
                  <DropdownMenuItem
                    className="w-full px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left cursor-pointer"
                    onClick={() => openPlanForm()}
                  >
                    Add Plan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                      fill="rgba(243,232,255,0.6)"
                    />
                  )
                }
                
                // Plan: Pink-purple gradient
                const theme = getTreemapTheme('plan', rect.value)
                const isSelected = selectedPlanId === rect.id
                
                // Get smart text display
                const textDisplay = getTextDisplay(rect.name, rect.value, rect.width, rect.height)
                
                return (
                  <g key={rect.id} className="transition-all duration-200">
                    <foreignObject
                      x={rect.x + 1.5}
                      y={rect.y + 1.5}
                      width={rect.width - 3}
                      height={rect.height - 3}
                      className="pointer-events-none"
                    >
                      <div
                        className="h-full w-full overflow-hidden rounded-xl"
                        style={{ background: theme.gradient }}
                      onClick={() => handlePlanClick(rect.id)}
                      >
                        <div className="flex h-full flex-col justify-between p-3">
                          <div className="flex justify-end">
                            {rect.value ? (
                              <span className={`text-xs font-semibold ${theme.mutedText}`}>
                                {rect.value}%
                              </span>
                            ) : null}
                          </div>
                          {textDisplay.showName && textDisplay.nameText && (
                            <div
                              className={`font-semibold ${theme.text}`}
                              style={{
                                fontSize: `${Math.max(12, textDisplay.fontSize)}px`,
                                lineHeight: textDisplay.lineHeight,
                                whiteSpace: 'pre-line'
                              }}
                            >
                              {textDisplay.nameText}
                            </div>
                          )}
                        </div>
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
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()

                            if (planItemMenuOpen === rect.id) {
                              // Close dropdown
                              setPlanItemMenuOpen(null)
                              setPlanDropdownPosition(null)
                            } else {
                              // Calculate position and open dropdown
                              const buttonRect = e.currentTarget.getBoundingClientRect()
                              const dropdownPosition = {
                                top: buttonRect.bottom + 2,
                                left: buttonRect.left + buttonRect.width - 100, // Move left more
                              }

                              // Boundary check for viewport
                              const viewport = { width: window.innerWidth, height: window.innerHeight }
                              if (dropdownPosition.left < 4) dropdownPosition.left = 4
                              if (dropdownPosition.left + 80 > viewport.width) dropdownPosition.left = viewport.width - 84

                              setPlanDropdownPosition(dropdownPosition)
                              setPlanItemMenuOpen(rect.id)
                            }
                          }}
                          className="w-full h-full bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-150"
                        >
                          <span className="text-gray-600 text-xs leading-none">⋮</span>
                        </button>

                      </div>
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
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button className="w-6 h-6 flex items-center justify-center hover:bg-purple-50 rounded-full transition-colors">
                    <span className="text-gray-500 text-xs">⋮</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-purple-100 p-1 min-w-32">
                  <DropdownMenuItem
                    className="w-full px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left cursor-pointer"
                    onClick={() => openFormPanel()}
                  >
                    Add Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                      <div className="flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <button className="w-6 h-6 flex items-center justify-center hover:bg-purple-100 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                              <span className="text-gray-500 text-xs leading-none">⋮</span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-purple-100 p-1 min-w-20">
                            <DropdownMenuItem
                              className="w-full px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left cursor-pointer"
                              onClick={() => {
                                setEditingTask(task)
                                setFormPanelOpen(true)
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="w-full px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left cursor-pointer"
                              onClick={() => {
                                setDeleteConfirmModal({
                                  isOpen: true,
                                  type: 'task',
                                  item: task
                                })
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-60 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete {deleteConfirmModal.type.charAt(0).toUpperCase() + deleteConfirmModal.type.slice(1)}
                </h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "<span className="font-medium">
                {deleteConfirmModal.type === 'strategy' ? deleteConfirmModal.item?.objective :
                 deleteConfirmModal.type === 'plan' ? deleteConfirmModal.item?.objective :
                 deleteConfirmModal.item?.title}
              </span>"?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: 'strategy', item: null })}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const itemId = deleteConfirmModal.item?.id
                    const itemType = deleteConfirmModal.type

                    if (!itemId) return

                    const refreshers: Promise<unknown>[] = []

                    // Call appropriate delete service
                    if (itemType === 'strategy') {
                      await deleteStrategy(itemId)
                      setStrategies(prev => prev.filter(s => s.id !== itemId))
                      setSelectedStrategyId(prev => (prev === itemId ? null : prev))
                      setSelectedPlanId(null)
                      dataCache.delete(CACHE_KEYS.STRATEGIES)
                      dataCache.delete(CACHE_KEYS.PLANS)
                      dataCache.delete(CACHE_KEYS.TASKS)
                      refreshers.push(
                        fetchStrategiesData({ force: true }),
                        fetchPlansData({ force: true }),
                        fetchTasksData({ force: true })
                      )
                    } else if (itemType === 'plan') {
                      await deletePlan(itemId)
                      setPlans(prev => prev.filter(p => p.id !== itemId))
                      setSelectedPlanId(prev => (prev === itemId ? null : prev))
                      dataCache.delete(CACHE_KEYS.PLANS)
                      dataCache.delete(CACHE_KEYS.TASKS)
                      refreshers.push(
                        fetchPlansData({ force: true }),
                        fetchTasksData({ force: true })
                      )
                    } else if (itemType === 'task') {
                      await deleteTask(itemId)
                      setTasks(prev => prev.filter(t => t.id !== itemId))
                      dataCache.delete(CACHE_KEYS.TASKS)
                      refreshers.push(fetchTasksData({ force: true }))
                    }

                    if (refreshers.length > 0) {
                      await Promise.all(refreshers)
                    }

                    setDeleteConfirmModal({ isOpen: false, type: 'strategy', item: null })
                    setToast({ message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`, type: 'success' })
                  } catch (error) {
                    console.error('Delete failed:', error)
                    setToast({ message: `Failed to delete ${deleteConfirmModal.type}`, type: 'error' })
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Strategy Dropdown Portal */}
      {strategyItemMenuOpen && strategyDropdownPosition && typeof window !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setStrategyItemMenuOpen(null)
              setStrategyDropdownPosition(null)
            }}
          />
          <div
            className="fixed z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-purple-100 p-1 min-w-20"
            style={{
              top: `${strategyDropdownPosition.top}px`,
              left: `${strategyDropdownPosition.left}px`
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                const strategy = strategies.find(s => s.id === strategyItemMenuOpen)
                if (strategy) {
                  setEditingStrategy(strategy)
                  setStrategyFormOpen(true)
                }
                setStrategyItemMenuOpen(null)
                setStrategyDropdownPosition(null)
              }}
              className="w-full px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const strategy = strategies.find(s => s.id === strategyItemMenuOpen)
                if (strategy) {
                  setDeleteConfirmModal({
                    isOpen: true,
                    type: 'strategy',
                    item: strategy
                  })
                }
                setStrategyItemMenuOpen(null)
                setStrategyDropdownPosition(null)
              }}
              className="w-full px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left"
            >
              Delete
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Plan Dropdown Portal */}
      {planItemMenuOpen && planDropdownPosition && typeof window !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setPlanItemMenuOpen(null)
              setPlanDropdownPosition(null)
            }}
          />
          <div
            className="fixed z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-purple-100 p-1 min-w-20"
            style={{
              top: `${planDropdownPosition.top}px`,
              left: `${planDropdownPosition.left}px`
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                const plan = plans.find(p => p.id === planItemMenuOpen)
                if (plan) {
                  setEditingPlan(plan)
                  setPlanFormOpen(true)
                }
                setPlanItemMenuOpen(null)
                setPlanDropdownPosition(null)
              }}
              className="w-full px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const plan = plans.find(p => p.id === planItemMenuOpen)
                if (plan) {
                  setDeleteConfirmModal({
                    isOpen: true,
                    type: 'plan',
                    item: plan
                  })
                }
                setPlanItemMenuOpen(null)
                setPlanDropdownPosition(null)
              }}
              className="w-full px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left"
            >
              Delete
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Daily Tasks Dropdown Portal */}
      {dailyTaskMenuOpen && dailyTaskDropdownPosition && typeof window !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setDailyTaskMenuOpen(false)
              setDailyTaskDropdownPosition(null)
            }}
          />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-1 min-w-32"
            style={{
              top: `${dailyTaskDropdownPosition.top}px`,
              left: `${dailyTaskDropdownPosition.left}px`
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                openFormPanel()
                setDailyTaskMenuOpen(false)
                setDailyTaskDropdownPosition(null)
              }}
              className="w-full px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left"
            >
              Add Task
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
