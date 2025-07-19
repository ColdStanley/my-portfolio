'use client'

import { useEffect, useState } from 'react'

interface PlanRecord {
  id: string
  objective: string
  description: string
  parent_goal: string[]
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  progress: number
  linked_tasks: string[]
  estimate_resources: string
  budget_money: number
  budget_time: number
  total_tasks: number
  completed_tasks: number
}

interface PlanFormData {
  objective: string
  description: string
  parent_goal: string[]
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  estimate_resources: string
  budget_money: number
  budget_time: number
}

interface StrategyOption {
  id: string
  title: string
}


interface PlanFormPanelProps {
  isOpen: boolean
  onClose: () => void
  plan?: PlanRecord | null
  onSave: (plan: PlanFormData) => void
  statusOptions: string[]
  priorityOptions: string[]
  strategyOptions: StrategyOption[]
}

function PlanFormPanel({ 
  isOpen, 
  onClose, 
  plan, 
  onSave, 
  statusOptions, 
  priorityOptions,
  strategyOptions
}: PlanFormPanelProps) {
  const [formData, setFormData] = useState<PlanFormData>({
    objective: '',
    description: '',
    parent_goal: [],
    start_date: '',
    due_date: '',
    status: '',
    priority_quadrant: '',
    estimate_resources: '',
    budget_money: 0,
    budget_time: 0
  })

  useEffect(() => {
    if (plan) {
      setFormData({
        objective: plan.objective || '',
        description: plan.description || '',
        parent_goal: plan.parent_goal || [],
        start_date: plan.start_date || '',
        due_date: plan.due_date || '',
        status: plan.status || '',
        priority_quadrant: plan.priority_quadrant || '',
        estimate_resources: plan.estimate_resources || '',
        budget_money: plan.budget_money || 0,
        budget_time: plan.budget_time || 0
      })
    } else {
      // 创建新计划时，使用当前日期作为默认值
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const defaultDue = nextMonth.toISOString().split('T')[0]
      
      setFormData({
        objective: '',
        description: '',
        parent_goal: [],
        start_date: today,
        due_date: defaultDue,
        status: '',
        priority_quadrant: '',
        estimate_resources: '',
        budget_money: 0,
        budget_time: 0
      })
    }
  }, [plan, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-purple-200 flex flex-col">
      <div className="p-4 border-b border-purple-200 flex items-center justify-between">
        <h4 className="text-lg font-semibold text-purple-900">
          {plan ? 'Edit Plan' : 'New Plan'}
        </h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
        >
          ×
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Parent Strategy (所属长期目标)</label>
          <select
            value={formData.parent_goal[0] || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              parent_goal: e.target.value ? [e.target.value] : [] 
            }))}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select Parent Strategy</option>
            {strategyOptions.map(strategy => (
              <option key={strategy.id} value={strategy.id}>{strategy.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Objective (子目标) *</label>
          <input
            type="text"
            required
            value={formData.objective}
            onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
            placeholder="简洁的子目标标题"
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Description (说明)</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="子目标的背景、理由或详细说明"
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Start Date (开始)</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Due Date (截止)</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Status (状态)</label>
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
            <label className="block text-sm font-medium text-purple-700 mb-1">Budget Money (预算金额)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.budget_money}
              onChange={(e) => setFormData(prev => ({ ...prev, budget_money: parseFloat(e.target.value) || 0 }))}
              placeholder="项目预算金额"
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Budget Time (预算时间)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.budget_time}
              onChange={(e) => setFormData(prev => ({ ...prev, budget_time: parseFloat(e.target.value) || 0 }))}
              placeholder="预计工时(小时)"
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>


        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Estimate Resources (预估资源)</label>
          <textarea
            rows={2}
            value={formData.estimate_resources}
            onChange={(e) => setFormData(prev => ({ ...prev, estimate_resources: e.target.value }))}
            placeholder="时间、人力、预算等资源需求"
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <span>✕</span>
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
          >
            <span>{plan ? '📝' : '🎯'}</span>
            <span>{plan ? 'Update' : 'Create'}</span>
          </button>
        </div>
      </form>
    </div>
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

// 格式化日期范围
function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return '时间待定'
  
  const start = startDate ? formatDate(startDate) : ''
  const end = endDate ? formatDate(endDate) : ''
  
  if (start && end) {
    return `${start} - ${end}`
  }
  
  return start || end
}

export default function PlanPanel() {
  const [data, setData] = useState<PlanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formPanelOpen, setFormPanelOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanRecord | null>(null)
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [priorityOptions, setPriorityOptions] = useState<string[]>([])
  const [strategyOptions, setStrategyOptions] = useState<StrategyOption[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedStrategyFilter, setSelectedStrategyFilter] = useState<string>('all')
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all')

  useEffect(() => {
    fetchPlans()
    fetchSchema()
    fetchRelatedData()
  }, [])

  const fetchSchema = async () => {
    try {
      const response = await fetch('/api/plan?action=schema')
      if (response.ok) {
        const result = await response.json()
        console.log('Plan schema loaded:', result)
        setStatusOptions(result.schema?.statusOptions || [])
        setPriorityOptions(result.schema?.priorityOptions || [])
        console.log('Priority options set:', result.schema?.priorityOptions || [])
      } else {
        console.error('Schema fetch failed:', response.status)
      }
    } catch (err) {
      console.error('Failed to fetch schema:', err)
    }
  }

  const fetchRelatedData = async () => {
    try {
      // Fetch strategies for parent_goal relation
      const strategyResponse = await fetch('/api/strategy')
      if (strategyResponse.ok) {
        const strategyResult = await strategyResponse.json()
        const strategies = strategyResult.data?.map((s: any) => ({
          id: s.id,
          title: s.objective || 'Untitled Strategy'
        })) || []
        setStrategyOptions(strategies)
      }
    } catch (err) {
      console.error('Failed to fetch related data:', err)
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

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPlans()
    await fetchRelatedData()
    setRefreshing(false)
  }

  const handleSavePlan = async (planData: PlanFormData) => {
    try {
      const dataToSend = editingPlan 
        ? { ...planData, id: editingPlan.id }
        : planData
        
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const responseData = await response.json()

      setFormPanelOpen(false)
      setEditingPlan(null)
      fetchPlans()
    } catch (err) {
      console.error('Failed to save plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to save plan')
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Not Started': return '⭕'
      case 'In Progress': return '🔄'
      case 'Completed': return '✅'
      case 'On Hold': return '⏸️'
      case 'Cancelled': return '❌'
      default: return '📋'
    }
  }

  const getParentStrategyTitle = (parentGoalIds: string[]) => {
    if (!parentGoalIds || parentGoalIds.length === 0) return null
    const strategy = strategyOptions.find(s => s.id === parentGoalIds[0])
    return strategy?.title || 'Unknown Strategy'
  }

  // 筛选函数
  const getFilteredPlans = () => {
    let filteredData = [...data]
    
    // 按策略筛选
    if (selectedStrategyFilter !== 'all') {
      if (selectedStrategyFilter === 'none') {
        filteredData = filteredData.filter(plan => !plan.parent_goal || plan.parent_goal.length === 0)
      } else {
        filteredData = filteredData.filter(plan => plan.parent_goal && plan.parent_goal.includes(selectedStrategyFilter))
      }
    }
    
    // 按月份筛选
    if (selectedMonthFilter !== 'all') {
      filteredData = filteredData.filter(plan => {
        const startDate = plan.start_date
        const endDate = plan.due_date
        
        if (!startDate && !endDate) return false
        
        // 如果只有开始日期或结束日期，检查该日期是否在选择的月份
        if (!startDate || !endDate) {
          const dateToCheck = startDate || endDate
          const dateMonth = dateToCheck.substring(0, 7) // YYYY-MM format
          return dateMonth === selectedMonthFilter
        }
        
        // 如果有开始和结束日期，检查选择的月份是否在时间范围内
        const selectedMonthStart = new Date(selectedMonthFilter + '-01')
        const selectedMonthEnd = new Date(selectedMonthStart.getFullYear(), selectedMonthStart.getMonth() + 1, 0)
        const planStart = new Date(startDate)
        const planEnd = new Date(endDate)
        
        // 检查月份范围是否与Plan时间范围有重叠
        return (selectedMonthStart <= planEnd && selectedMonthEnd >= planStart)
      })
    }
    
    return filteredData
  }

  // 获取所有可用的月份选项
  const getAvailableMonths = () => {
    const months = new Set<string>()
    
    data.forEach(plan => {
      const startDate = plan.start_date
      const endDate = plan.due_date
      
      if (!startDate && !endDate) return
      
      // 如果只有一个日期，添加该日期的月份
      if (!startDate || !endDate) {
        const dateToCheck = startDate || endDate
        months.add(dateToCheck.substring(0, 7))
        return
      }
      
      // 如果有开始和结束日期，添加所有跨越的月份
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      const current = new Date(start.getFullYear(), start.getMonth(), 1)
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
      
      while (current <= endMonth) {
        const monthStr = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0')
        months.add(monthStr)
        current.setMonth(current.getMonth() + 1)
      }
    })
    
    return Array.from(months).sort()
  }

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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-500 text-xl">!</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Failed to load plans</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchPlans}
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

  const filteredPlans = getFilteredPlans()
  const availableMonths = getAvailableMonths()

  return (
    <div className="w-full py-8 space-y-6">
      {/* 标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-purple-900">Plans</h1>
      </div>
      
      {/* 按钮和筛选器布局 */}
      <div className="flex items-center justify-between">
        {/* 左侧：Refresh按钮和筛选器 */}
        <div className="flex items-center gap-3">
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
          
          {/* Strategy筛选框 */}
          <select
            value={selectedStrategyFilter}
            onChange={(e) => setSelectedStrategyFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-purple-200 rounded-md text-sm text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-300 transition-all duration-200"
          >
            <option value="all">All Strategies</option>
            <option value="none">No Strategy</option>
            {strategyOptions.map(strategy => (
              <option key={strategy.id} value={strategy.id}>
                {strategy.title}
              </option>
            ))}
          </select>
          
          {/* 月份筛选框 */}
          <select
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-purple-200 rounded-md text-sm text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-300 transition-all duration-200"
          >
            <option value="all">All Months</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        
        {/* 右侧：New Plan按钮 */}
        <div>
          <button
            onClick={() => {
              setEditingPlan(null)
              setFormPanelOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
          >
            <span>🎯</span>
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl font-light mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {data.length === 0 ? 'No Plans Yet' : 'No Plans Match Filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {data.length === 0 
              ? 'Create your first sub-goal to bridge strategies and tasks'
              : 'Try adjusting your filters or create a new plan'
            }
          </p>
          <button
            onClick={() => {
              setEditingPlan(null)
              setFormPanelOpen(true)
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
          >
            {data.length === 0 ? 'Create First Plan' : 'Create New Plan'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-md transition-all duration-200"
            >
              {/* 头部信息 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xl">{getStatusIcon(plan.status)}</span>
                      <h3 className="text-lg font-semibold text-purple-900 flex-1">
                        {plan.objective || 'Untitled Plan'}
                      </h3>
                    </div>
                    <div className="ml-8 flex items-center gap-2">
                      {plan.status && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {plan.status}
                        </span>
                      )}
                      {plan.priority_quadrant && (
                        <span className={`px-2 py-1 text-xs rounded-full border ${getQuadrantColor(plan.priority_quadrant)}`}>
                          {plan.priority_quadrant}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 关联的长期目标 */}
                  {getParentStrategyTitle(plan.parent_goal) && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">Strategy:</span>
                      <span className="text-sm text-purple-600 font-medium">
                        {getParentStrategyTitle(plan.parent_goal)}
                      </span>
                    </div>
                  )}
                  
                  {/* 描述 */}
                  {plan.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => {
                      setEditingPlan(plan)
                      setFormPanelOpen(true)
                    }}
                    className="p-2 text-purple-600 hover:text-white hover:bg-purple-600 text-sm rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-600"
                    title="Edit this plan"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 text-red-600 hover:text-white hover:bg-red-600 text-sm rounded-lg transition-all duration-200 border border-red-200 hover:border-red-600"
                    title="Delete this plan"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* 进度显示 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress (Tasks Completion)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {plan.completed_tasks || 0} / {plan.total_tasks || 0} Tasks
                    </span>
                    <span className="text-lg font-bold text-purple-700">{plan.progress}%</span>
                  </div>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-3 rounded-full transition-all duration-500 bg-purple-600 flex items-center justify-center"
                    style={{ width: `${plan.progress}%` }}
                  >
                    {plan.progress > 15 && (
                      <span className="text-xs font-medium text-white">
                        {plan.progress}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 底部信息 */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  {/* 时间范围 */}
                  <div className="flex items-center gap-1 text-gray-600">
                    <span>📅</span>
                    <span>{formatDateRange(plan.start_date, plan.due_date)}</span>
                  </div>
                  
                  {/* 预算信息 */}
                  {(plan.budget_money > 0 || plan.budget_time > 0) && (
                    <div className="flex items-center gap-1">
                      <span>💰</span>
                      <span className="text-green-600 font-medium">
                        {plan.budget_money > 0 && `¥${plan.budget_money}`}
                        {plan.budget_money > 0 && plan.budget_time > 0 && ' / '}
                        {plan.budget_time > 0 && `${plan.budget_time}h`}
                      </span>
                    </div>
                  )}
                  
                </div>
                
              </div>

              {/* 资源估算 */}
              {plan.estimate_resources && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-500 flex-shrink-0">💰 资源需求:</span>
                    <span className="text-sm text-gray-600">{plan.estimate_resources}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
        strategyOptions={strategyOptions}
      />
    </div>
  )
}