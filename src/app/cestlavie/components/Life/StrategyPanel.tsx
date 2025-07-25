'use client'

import { useEffect, useState } from 'react'

interface StrategyRecord {
  id: string
  objective: string
  description: string
  key_results: string
  progress: number
  start_date: string
  due_date: string
  status: string
  category: string
  priority_quadrant: string
  estimate_cost: string
  total_plans: number
  completed_plans: number
  order?: number
}

interface PlanRecord {
  id: string
  objective: string
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  budget_time: number
  parent_goal: string[]
}

interface TaskRecord {
  id: string
  title: string
  start_date: string
  end_date: string
  status: string
  priority: string
  budget_time: number
  plan: string[]
}

interface StrategyFormData {
  objective: string
  description: string
  key_results: string
  start_date: string
  due_date: string
  status: string
  category: string
  priority_quadrant: string
}

interface StrategyFormPanelProps {
  isOpen: boolean
  onClose: () => void
  strategy?: StrategyRecord | null
  onSave: (strategy: StrategyFormData) => void
  statusOptions: string[]
  categoryOptions: string[]
  priorityOptions: string[]
}

function StrategyFormPanel({ isOpen, onClose, strategy, onSave, statusOptions, categoryOptions, priorityOptions }: StrategyFormPanelProps) {
  const [formData, setFormData] = useState<StrategyFormData>({
    objective: '',
    description: '',
    key_results: '',
    start_date: '',
    due_date: '',
    status: '',
    category: '',
    priority_quadrant: ''
  })

  useEffect(() => {
    if (strategy) {
      // 编辑模式：使用现有strategy的数据，保持原有时间
      setFormData({
        objective: strategy.objective || '',
        description: strategy.description || '',
        key_results: strategy.key_results || '',
        start_date: strategy.start_date || '',
        due_date: strategy.due_date || '',
        status: strategy.status || '',
        category: strategy.category || '',
        priority_quadrant: strategy.priority_quadrant || ''
      })
    } else {
      // 新建模式：使用默认时间
      const currentDate = new Date()
      const currentDateStr = currentDate.toISOString().split('T')[0] // YYYY-MM-DD format
      const nextYear = new Date(currentDate)
      nextYear.setFullYear(currentDate.getFullYear() + 1)
      const nextYearStr = nextYear.toISOString().split('T')[0]
      
      setFormData({
        objective: '',
        description: '',
        key_results: '',
        start_date: currentDateStr,
        due_date: nextYearStr,
        status: '',
        category: '',
        priority_quadrant: ''
      })
    }
  }, [strategy, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <>
      {/* Transparent click area, click to close */}
      <div 
        className={`fixed top-0 left-0 h-full z-40 md:block hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ width: 'calc(100vw - 384px)' }}
        onClick={onClose}
      ></div>
      
      {/* Mobile full screen overlay */}
      <div 
        className={`fixed inset-0 bg-black z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-50 opacity-100' : 'bg-opacity-0 opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      
      {/* Form panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 md:border-l border-purple-200 flex flex-col
        transition-transform duration-300 ease-out ${
          isOpen ? 'transform translate-x-0' : 'transform translate-x-full'
        }`}>
      <div className="p-4 border-b border-purple-200 flex items-center justify-between">
        <h4 className="text-lg font-semibold text-purple-900">
          {strategy ? 'Edit Strategy' : 'New Strategy'}
        </h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
        >
          ×
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Objective *</label>
          <input
            type="text"
            required
            value={formData.objective}
            onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
            placeholder="Clear long-term objective description"
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Why do you want to achieve this objective? Background and motivation."
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Key Results *</label>
          <textarea
            rows={4}
            required
            value={formData.key_results}
            onChange={(e) => setFormData(prev => ({ ...prev, key_results: e.target.value }))}
            placeholder="Quantifiable result metrics, for example:&#10;1. Complete 10 projects&#10;2. Achieve revenue of $XX&#10;3. Obtain XX certification"
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Category</option>
              {categoryOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Priority Quadrant</label>
            <select
              value={formData.priority_quadrant}
              onChange={(e) => setFormData(prev => ({ ...prev, priority_quadrant: e.target.value }))}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Quadrant</option>
              {priorityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Select start date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Select due date"
              min={formData.start_date || undefined}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select Status</option>
            {statusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>



        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
          >
            <span>{strategy ? 'Update' : 'Create'}</span>
          </button>
        </div>
      </form>
      </div>
    </>
  )
}

// 格式化日期显示
function formatDate(dateString: string): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}

// 格式化时间范围
function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return '时间待定'
  
  const start = startDate ? formatDate(startDate) : ''
  const end = endDate ? formatDate(endDate) : ''
  
  if (start && end) {
    return `${start} - ${end}`
  }
  
  return start || end
}

export default function StrategyPanel() {
  const [data, setData] = useState<StrategyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formPanelOpen, setFormPanelOpen] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<StrategyRecord | null>(null)
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [categoryOptions, setCategoryOptions] = useState<string[]>([])
  const [priorityOptions, setPriorityOptions] = useState<string[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [plans, setPlans] = useState<PlanRecord[]>([])
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchStrategies()
    fetchSchema()
    fetchPlans()
    fetchTasks()
  }, [])

  const fetchSchema = async () => {
    try {
      const response = await fetch('/api/strategy?action=schema')
      if (response.ok) {
        const result = await response.json()
        setStatusOptions(result.schema?.statusOptions || [])
        setCategoryOptions(result.schema?.categoryOptions || [])
        setPriorityOptions(result.schema?.priorityOptions || [])
      }
    } catch (err) {
      console.error('Failed to fetch schema:', err)
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

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStrategies()
    await fetchPlans()
    await fetchTasks()
    setRefreshing(false)
  }

  const handleSaveStrategy = async (strategyData: StrategyFormData) => {
    try {
      const dataToSend = editingStrategy 
        ? { ...strategyData, id: editingStrategy.id }
        : strategyData
        
      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        throw new Error('Failed to save strategy')
      }

      setFormPanelOpen(false)
      setEditingStrategy(null)
      fetchStrategies()
    } catch (err) {
      console.error('Failed to save strategy:', err)
      setError(err instanceof Error ? err.message : 'Failed to save strategy')
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

  // 移动策略向上
  const moveStrategyUp = async (strategyId: string) => {
    try {
      const sortedStrategies = [...data].sort((a, b) => (a.order || 0) - (b.order || 0))
      const currentIndex = sortedStrategies.findIndex(s => s.id === strategyId)
      
      if (currentIndex > 0) {
        const currentStrategy = sortedStrategies[currentIndex]
        const prevStrategy = sortedStrategies[currentIndex - 1]
        
        // 交换order值
        const tempOrder = currentStrategy.order || currentIndex
        const newCurrentOrder = prevStrategy.order || (currentIndex - 1)
        const newPrevOrder = tempOrder
        
        // 更新两个策略的order
        await updateStrategyOrder(currentStrategy.id, newCurrentOrder)
        await updateStrategyOrder(prevStrategy.id, newPrevOrder)
        
        // 刷新数据
        fetchStrategies()
      }
    } catch (err) {
      console.error('Failed to move strategy up:', err)
      setError('Failed to move strategy')
    }
  }

  // 移动策略向下
  const moveStrategyDown = async (strategyId: string) => {
    try {
      const sortedStrategies = [...data].sort((a, b) => (a.order || 0) - (b.order || 0))
      const currentIndex = sortedStrategies.findIndex(s => s.id === strategyId)
      
      if (currentIndex < sortedStrategies.length - 1) {
        const currentStrategy = sortedStrategies[currentIndex]
        const nextStrategy = sortedStrategies[currentIndex + 1]
        
        // 交换order值
        const tempOrder = currentStrategy.order || currentIndex
        const newCurrentOrder = nextStrategy.order || (currentIndex + 1)
        const newNextOrder = tempOrder
        
        // 更新两个策略的order
        await updateStrategyOrder(currentStrategy.id, newCurrentOrder)
        await updateStrategyOrder(nextStrategy.id, newNextOrder)
        
        // 刷新数据
        fetchStrategies()
      }
    } catch (err) {
      console.error('Failed to move strategy down:', err)
      setError('Failed to move strategy')
    }
  }

  // 更新策略的order
  const updateStrategyOrder = async (strategyId: string, newOrder: number) => {
    const response = await fetch('/api/strategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: strategyId,
        order: newOrder
      })
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('API Error Response:', errorData)
      throw new Error(`Failed to update strategy order: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('Update successful:', result)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    if (progress >= 20) return 'bg-orange-500'
    return 'bg-gray-400'
  }

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case '重要且紧急': return 'bg-red-100 text-red-800 border-red-200'
      case '重要不紧急': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case '不重要但紧急': return 'bg-orange-100 text-orange-800 border-orange-200'
      case '不重要不紧急': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-purple-100 text-purple-800 border-purple-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '职业': return '💼'
      case '健康': return '🏃‍♂️'
      case '财务': return '💰'
      case '学业': return '📚'
      case '家庭': return '👨‍👩‍👧‍👦'
      case '个人成长': return '🌱'
      default: return '🎯'
    }
  }

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plan')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setPlans(result.data || [])
    } catch (err) {
      console.error('Failed to fetch plans:', err)
      // 不设置错误状态，因为 plans 是可选的
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setTasks(result.data || [])
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      // 不设置错误状态，因为 tasks 是可选的
    }
  }

  // 根据Strategy ID获取关联的Plans
  const getPlansForStrategy = (strategyId: string) => {
    return plans.filter(plan => plan.parent_goal && plan.parent_goal.includes(strategyId))
      .sort((a, b) => {
        // 按开始时间排序
        const aTime = a.start_date || ''
        const bTime = b.start_date || ''
        return aTime.localeCompare(bTime)
      })
  }

  // 根据Plan ID获取关联的Tasks
  const getTasksForPlan = (planId: string) => {
    return tasks.filter(task => task.plan && task.plan.includes(planId))
      .sort((a, b) => {
        // 按开始时间排序
        const aTime = a.start_date || ''
        const bTime = b.start_date || ''
        return aTime.localeCompare(bTime)
      })
  }

  // 格式化时间显示
  const formatTimeRange = (startDate: string, endDate: string): string => {
    if (!startDate && !endDate) return 'No dates'
    
    try {
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null
      
      if (start && end) {
        const isSameDay = start.toDateString() === end.toDateString()
        if (isSameDay) {
          const startTime = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
          const endTime = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
          return `${start.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })} ${startTime}-${endTime}`
        } else {
          return `${start.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}`
        }
      }
      
      if (start) {
        return start.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
      }
      
      if (end) {
        return end.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
      }
      
      return 'No dates'
    } catch (error) {
      return 'Invalid dates'
    }
  }

  // 切换Plan的展开/收起状态
  const togglePlanExpanded = (planId: string) => {
    setExpandedPlans(prev => {
      const newSet = new Set(prev)
      if (newSet.has(planId)) {
        newSet.delete(planId)
      } else {
        newSet.add(planId)
      }
      return newSet
    })
  }

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
    // 检查是否是Notion配置相关的错误
    const isConfigError = error.toLowerCase().includes('notion') || 
                         error.toLowerCase().includes('configured') ||
                         error.toLowerCase().includes('configuration')
    
    if (isConfigError) {
      return (
        <div className="w-full py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-500 text-xl">⚙️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Notion Configuration Required</h3>
                <p className="mt-2 text-sm text-yellow-700">
                  To use the strategy management features, you need to configure your Notion integration. 
                  Click the settings button (⚙️) in the top-right corner to set up your Notion API key and database IDs.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => {
                      // 触发配置模态框打开
                      const configButton = document.querySelector('[title="Notion Configuration"]') as HTMLButtonElement
                      if (configButton) {
                        configButton.click()
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    <span>⚙️</span>
                    <span>Configure Notion</span>
                  </button>
                  <button
                    onClick={fetchStrategies}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-all duration-200"
                    title="Retry loading strategies"
                  >
                    <span>🔄</span>
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    // 其他错误显示通用错误信息
    return (
      <div className="w-full py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-500 text-xl">!</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Failed to load strategies</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchStrategies}
                className="flex items-center gap-2 mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <span>🔄</span>
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-8 space-y-6">
      {/* 桌面端标题和控制区 */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-900">Strategy</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            <div className={`${refreshing ? 'animate-spin' : ''}`}>
              {refreshing ? '⟳' : '↻'}
            </div>
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setEditingStrategy(null)
              setFormPanelOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
          >
            <span>🎯</span>
            <span>New Strategy</span>
          </button>
        </div>
      </div>

      {/* 移动端简化标题和控制区 */}
      <div className="md:hidden">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-purple-900">Strategy</h1>
        </div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              setEditingStrategy(null)
              setFormPanelOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm"
          >
            <span>🎯</span>
            <span>New Strategy</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
          >
            <div className={`${refreshing ? 'animate-spin' : ''}`}>
              {refreshing ? '⟳' : '↻'}
            </div>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl font-light mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Strategies Yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first long-term objective</p>
          <button
            onClick={() => {
              setEditingStrategy(null)
              setFormPanelOpen(true)
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
          >
            Create First Strategy
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {(() => {
            const sortedData = data.sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999))
            return sortedData.map((strategy) => (
            <div
              key={strategy.id}
              className="bg-white rounded-xl border border-purple-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              {/* 桌面端横向布局 */}
              <div className="hidden md:flex items-center justify-between gap-6">
                {/* 左侧：基本信息 */}
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl">{getCategoryIcon(strategy.category)}</span>
                  <div className="flex-1">
                    <h3 
                      className="text-xl font-bold text-purple-900 mb-1 cursor-pointer hover:text-purple-600 hover:underline transition-colors flex items-center gap-1"
                      onClick={() => {
                        // 构建Notion页面URL
                        const notionPageUrl = `https://www.notion.so/${strategy.id.replace(/-/g, '')}`
                        window.open(notionPageUrl, '_blank')
                      }}
                      title="Click to edit in Notion"
                    >
                      {strategy.objective || 'Untitled Strategy'}
                      <span className="text-xs text-gray-400">🔗</span>
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {strategy.category && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {strategy.category}
                        </span>
                      )}
                      <span>{formatDateRange(strategy.start_date, strategy.due_date)}</span>
                      {strategy.status && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          {strategy.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 中间：进度显示 */}
                <div className="flex-shrink-0 w-64">
                  <div className="text-center mb-2">
                    <div className="text-2xl font-bold text-purple-700">{strategy.progress}%</div>
                    <div className="text-xs text-gray-500">
                      {strategy.completed_plans || 0} / {strategy.total_plans || 0} Plans Completed
                    </div>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-3 rounded-full transition-all duration-500 bg-purple-600"
                      style={{ width: `${strategy.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* 右侧：操作按钮 */}
                <div className="flex gap-2">
                  {/* 上移按钮 */}
                  <button
                    onClick={() => moveStrategyUp(strategy.id)}
                    disabled={sortedData.findIndex(s => s.id === strategy.id) === 0}
                    className="p-2 text-purple-600 hover:text-white hover:bg-purple-600 text-sm rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-purple-600 disabled:hover:bg-transparent"
                    title="Move up"
                  >
                    ▲
                  </button>
                  {/* 下移按钮 */}
                  <button
                    onClick={() => moveStrategyDown(strategy.id)}
                    disabled={sortedData.findIndex(s => s.id === strategy.id) === sortedData.length - 1}
                    className="p-2 text-purple-600 hover:text-white hover:bg-purple-600 text-sm rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-purple-600 disabled:hover:bg-transparent"
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => {
                      setEditingStrategy(strategy)
                      setFormPanelOpen(true)
                    }}
                    className="p-2 text-purple-600 hover:text-white hover:bg-purple-600 text-sm rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-600"
                    title="Edit this strategy"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteStrategy(strategy.id)}
                    className="p-2 text-purple-600 hover:text-white hover:bg-purple-600 text-sm rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-600"
                    title="Delete this strategy"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* 移动端垂直布局 */}
              <div className="md:hidden space-y-4">
                {/* 顶部：标题和图标 */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl mt-1">{getCategoryIcon(strategy.category)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-lg font-bold text-purple-900 mb-2 line-clamp-2 cursor-pointer hover:text-purple-600 hover:underline transition-colors flex items-center gap-1"
                        onClick={() => {
                          // 构建Notion页面URL
                          const notionPageUrl = `https://www.notion.so/${strategy.id.replace(/-/g, '')}`
                          window.open(notionPageUrl, '_blank')
                        }}
                        title="Click to edit in Notion"
                      >
                        {strategy.objective || 'Untitled Strategy'}
                        <span className="text-xs text-gray-400">🔗</span>
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {strategy.category && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                            {strategy.category}
                          </span>
                        )}
                        {strategy.status && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                            {strategy.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* 操作按钮 */}
                  <div className="flex gap-1 ml-2">
                    {/* 上移按钮 */}
                    <button
                      onClick={() => moveStrategyUp(strategy.id)}
                      disabled={sortedData.findIndex(s => s.id === strategy.id) === 0}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ▲
                    </button>
                    {/* 下移按钮 */}
                    <button
                      onClick={() => moveStrategyDown(strategy.id)}
                      disabled={sortedData.findIndex(s => s.id === strategy.id) === sortedData.length - 1}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => {
                        setEditingStrategy(strategy)
                        setFormPanelOpen(true)
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteStrategy(strategy.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* 中部：进度显示 */}
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700">Progress</span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-700">{strategy.progress}%</div>
                      <div className="text-xs text-gray-500">
                        {strategy.completed_plans || 0}/{strategy.total_plans || 0} Plans
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-2 rounded-full transition-all duration-500 bg-purple-600"
                      style={{ width: `${strategy.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* 底部：时间信息 */}
                <div className="flex items-center text-xs text-gray-600">
                  <span>{formatDateRange(strategy.start_date, strategy.due_date)}</span>
                </div>

                {/* Related Plans and Tasks - 移动端 */}
                {(() => {
                  const strategyPlans = getPlansForStrategy(strategy.id)
                  if (strategyPlans.length === 0) return null
                  
                  return (
                    <div className="mt-3 pt-3 border-t border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-purple-700">Related Plans & Tasks</span>
                        <span className="text-xs text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded-full">
                          {strategyPlans.length}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {strategyPlans.map((plan) => {
                          const planTasks = getTasksForPlan(plan.id)
                          const isExpanded = expandedPlans.has(plan.id)
                          
                          return (
                            <div key={plan.id} className="bg-purple-50 rounded border border-purple-100 p-2">
                              {/* Plan Information - 移动端简化 */}
                              <div className="mb-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-semibold text-purple-900 truncate flex-1">
                                    {plan.objective || 'Untitled Plan'}
                                  </span>
                                  <div className="flex items-center gap-1 ml-2">
                                    {plan.status && (
                                      <span className="px-1.5 py-0.5 bg-purple-200 text-purple-800 text-xs rounded-full font-medium">
                                        {plan.status}
                                      </span>
                                    )}
                                    {planTasks.length > 0 && (
                                      <button
                                        onClick={() => togglePlanExpanded(plan.id)}
                                        className="p-1 text-purple-600 hover:bg-purple-200 rounded transition-all duration-200 text-xs"
                                        title={isExpanded ? 'Hide tasks' : 'Show tasks'}
                                      >
                                        {isExpanded ? '▼' : '▶'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-purple-600">
                                  <span className="font-medium">
                                    {formatTimeRange(plan.start_date, plan.due_date)}
                                  </span>
                                  {plan.budget_time > 0 && (
                                    <span className="bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                                      {plan.budget_time}h
                                    </span>
                                  )}
                                  {planTasks.length > 0 && (
                                    <span className="bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                                      {planTasks.length} tasks
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Plan's Tasks - 移动端简化 */}
                              {planTasks.length > 0 && isExpanded && (
                                <div className="ml-2 space-y-1">
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="text-xs font-medium text-purple-600">Tasks</span>
                                    <span className="text-xs text-purple-500 bg-purple-100 px-1 py-0.5 rounded-full">
                                      {planTasks.length}
                                    </span>
                                  </div>
                                  
                                  {planTasks.map((task) => (
                                    <div key={task.id} className="bg-white rounded border border-purple-100 p-1.5">
                                      <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-xs font-medium text-purple-900 truncate flex-1">
                                          {task.title || 'Untitled Task'}
                                        </span>
                                        <div className="flex items-center gap-1 ml-1">
                                          {task.status && (
                                            <span className="px-1 py-0.5 bg-purple-100 text-purple-800 text-xs rounded font-medium">
                                              {task.status}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-xs text-purple-600">
                                        <span className="font-medium">
                                          {formatTimeRange(task.start_date, task.end_date)}
                                        </span>
                                        {task.budget_time > 0 && (
                                          <span className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-medium">
                                            {task.budget_time}h
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>

              
              {/* Related Plans and Tasks */}
              {(() => {
                const strategyPlans = getPlansForStrategy(strategy.id)
                if (strategyPlans.length === 0) return null
                
                return (
                  <div className="mt-4 pt-4 border-t border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-purple-700">Related Plans & Tasks</span>
                      <span className="text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                        {strategyPlans.length} {strategyPlans.length === 1 ? 'Plan' : 'Plans'}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {strategyPlans.map((plan) => {
                        const planTasks = getTasksForPlan(plan.id)
                        const isExpanded = expandedPlans.has(plan.id)
                        
                        return (
                          <div key={plan.id} className="bg-purple-50 rounded-lg border border-purple-100 p-3">
                            {/* Plan Information */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-purple-900 truncate flex-1">
                                  {plan.objective || 'Untitled Plan'}
                                </h4>
                                <div className="flex items-center gap-2 ml-2">
                                  {plan.status && (
                                    <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs rounded-full font-medium">
                                      {plan.status}
                                    </span>
                                  )}
                                  {plan.priority_quadrant && (
                                    <span className="px-2 py-0.5 bg-purple-200 text-purple-700 text-xs rounded-full font-medium">
                                      {plan.priority_quadrant}
                                    </span>
                                  )}
                                  {planTasks.length > 0 && (
                                    <button
                                      onClick={() => togglePlanExpanded(plan.id)}
                                      className="p-1.5 text-purple-600 hover:bg-purple-200 rounded-lg transition-all duration-200 text-sm border border-purple-200 hover:border-purple-300"
                                      title={isExpanded ? 'Hide tasks' : 'Show tasks'}
                                    >
                                      {isExpanded ? '▼' : '▶'}
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-purple-600">
                                <span className="font-medium">
                                  {formatTimeRange(plan.start_date, plan.due_date)}
                                </span>
                                {plan.budget_time > 0 && (
                                  <span className="bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                    {plan.budget_time}h
                                  </span>
                                )}
                                {planTasks.length > 0 && (
                                  <span className="bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                    {planTasks.length} {planTasks.length === 1 ? 'task' : 'tasks'}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Plan's Tasks */}
                            {planTasks.length > 0 && isExpanded && (
                              <div className="ml-4 space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-medium text-purple-600">Tasks</span>
                                  <span className="text-xs text-purple-500 bg-purple-100 px-1.5 py-0.5 rounded-full">
                                    {planTasks.length}
                                  </span>
                                </div>
                                
                                {planTasks.map((task) => (
                                  <div key={task.id} className="bg-white rounded border border-purple-100 p-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-purple-900 truncate flex-1">
                                        {task.title || 'Untitled Task'}
                                      </span>
                                      <div className="flex items-center gap-1 ml-2">
                                        {task.status && (
                                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded font-medium">
                                            {task.status}
                                          </span>
                                        )}
                                        {task.priority && (
                                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                            {task.priority}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-xs text-purple-600">
                                      <span className="font-medium">
                                        {formatTimeRange(task.start_date, task.end_date)}
                                      </span>
                                      {task.budget_time > 0 && (
                                        <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                                          {task.budget_time}h
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* 可展开的详细信息 */}
              {(strategy.key_results || strategy.description) && (
                <div className="mt-4 pt-4 border-t border-purple-100">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-purple-600 hover:text-purple-700 font-medium">
                      View Details
                    </summary>
                    <div className="mt-3 space-y-3">
                      {strategy.key_results && (
                        <div>
                          <h4 className="text-sm font-semibold text-purple-700 mb-1">Key Results:</h4>
                          <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg whitespace-pre-line">
                            {strategy.key_results}
                          </div>
                        </div>
                      )}
                      {strategy.description && (
                        <div>
                          <h4 className="text-sm font-semibold text-purple-700 mb-1">Description:</h4>
                          <p className="text-sm text-gray-600">
                            {strategy.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))
          })()}
        </div>
      )}


      <StrategyFormPanel
        isOpen={formPanelOpen}
        onClose={() => {
          setFormPanelOpen(false)
          setEditingStrategy(null)
        }}
        strategy={editingStrategy}
        onSave={handleSaveStrategy}
        statusOptions={statusOptions}
        categoryOptions={categoryOptions}
        priorityOptions={priorityOptions}
      />
    </div>
  )
}