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
  display_order?: number
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

interface TaskRecord {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  budget_time: number
  plan: string[]
  is_plan_critical?: boolean
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
    <>
      {/* 桌面端侧边栏表单 */}
      <div className="hidden md:flex fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-purple-200 flex-col">
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

      {/* 移动端全屏表单 */}
      <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
        {/* 移动端标题栏 */}
        <div className="p-4 border-b border-purple-200 flex items-center justify-between bg-white shadow-sm">
          <h4 className="text-lg font-semibold text-purple-900">
            {plan ? 'Edit Plan' : 'New Plan'}
          </h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl p-1"
          >
            ×
          </button>
        </div>
        
        {/* 移动端表单内容 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 核心信息优先 */}
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
            <label className="block text-sm font-medium text-purple-700 mb-1">Parent Strategy</label>
            <select
              value={formData.parent_goal[0] || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                parent_goal: e.target.value ? [e.target.value] : [] 
              }))}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Strategy</option>
              {strategyOptions.map(strategy => (
                <option key={strategy.id} value={strategy.id}>{strategy.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1">Priority</label>
              <select
                value={formData.priority_quadrant}
                onChange={(e) => setFormData(prev => ({ ...prev, priority_quadrant: e.target.value }))}
                className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Priority</option>
                {priorityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 可选的详细信息 - 折叠式 */}
          <details className="border border-gray-200 rounded-md">
            <summary className="px-3 py-2 bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-100">
              Additional Details (Optional)
            </summary>
            <div className="p-3 space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="背景、理由或详细说明"
                  className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget_money}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_money: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">Time (h)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.budget_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_time: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">Resources</label>
                <textarea
                  rows={2}
                  value={formData.estimate_resources}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimate_resources: e.target.value }))}
                  placeholder="时间、人力、预算等资源需求"
                  className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </details>

          {/* 移动端操作按钮 - 固定在底部 */}
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200"
              >
                <span>✕</span>
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm"
              >
                <span>{plan ? '📝' : '🎯'}</span>
                <span>{plan ? 'Update' : 'Create'}</span>
              </button>
            </div>
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

// 格式化Task的时间显示
function formatTaskTime(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return '时间待定'
  
  try {
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    
    if (start && end) {
      const isSameDay = start.toDateString() === end.toDateString()
      if (isSameDay) {
        const startTime = start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
        const endTime = end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
        return `${start.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })} ${startTime}-${endTime}`
      } else {
        return `${start.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })} - ${end.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}`
      }
    }
    
    if (start) {
      return start.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
    }
    
    if (end) {
      return end.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
    }
    
    return '时间待定'
  } catch (error) {
    return '时间待定'
  }
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
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedStrategyFilter, setSelectedStrategyFilter] = useState<string>('all')
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all')

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

  useEffect(() => {
    fetchPlans()
    fetchSchema()
    fetchRelatedData()
    fetchTasks()
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

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPlans()
    await fetchRelatedData()
    await fetchTasks()
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

  // 移动卡片向上
  const movePlanUp = async (planId: string) => {
    try {
      const currentPlans = [...data].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      const currentIndex = currentPlans.findIndex(p => p.id === planId)
      
      if (currentIndex > 0) {
        const currentPlan = currentPlans[currentIndex]
        const prevPlan = currentPlans[currentIndex - 1]
        
        // 交换display_order
        const tempOrder = currentPlan.display_order || currentIndex
        const newCurrentOrder = prevPlan.display_order || (currentIndex - 1)
        const newPrevOrder = tempOrder
        
        // 更新两个计划的order
        await updatePlanOrder(currentPlan.id, newCurrentOrder)
        await updatePlanOrder(prevPlan.id, newPrevOrder)
        
        // 刷新数据
        fetchPlans()
      }
    } catch (err) {
      console.error('Failed to move plan up:', err)
      setError('Failed to move plan')
    }
  }

  // 移动卡片向下
  const movePlanDown = async (planId: string) => {
    try {
      const currentPlans = [...data].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      const currentIndex = currentPlans.findIndex(p => p.id === planId)
      
      if (currentIndex < currentPlans.length - 1) {
        const currentPlan = currentPlans[currentIndex]
        const nextPlan = currentPlans[currentIndex + 1]
        
        // 交换display_order
        const tempOrder = currentPlan.display_order || currentIndex
        const newCurrentOrder = nextPlan.display_order || (currentIndex + 1)
        const newNextOrder = tempOrder
        
        // 更新两个计划的order
        await updatePlanOrder(currentPlan.id, newCurrentOrder)
        await updatePlanOrder(nextPlan.id, newNextOrder)
        
        // 刷新数据
        fetchPlans()
      }
    } catch (err) {
      console.error('Failed to move plan down:', err)
      setError('Failed to move plan')
    }
  }

  // 更新计划的display_order
  const updatePlanOrder = async (planId: string, newOrder: number) => {
    const response = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: planId,
        display_order: newOrder
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to update plan order')
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
    
    // 按display_order排序，如果没有order则按创建顺序
    return filteredData.sort((a, b) => {
      const orderA = a.display_order ?? 999999
      const orderB = b.display_order ?? 999999
      return orderA - orderB
    })
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
                  To use the plan management features, you need to configure your Notion integration. 
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
                    onClick={fetchPlans}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-all duration-200"
                    title="Retry loading plans"
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
      
      {/* 桌面端控制区 */}
      <div className="hidden md:flex items-center justify-between">
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

      {/* 移动端简化控制区 */}
      <div className="md:hidden space-y-3">
        {/* 第一行：主要筛选器和New Plan按钮 */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStrategyFilter}
            onChange={(e) => setSelectedStrategyFilter(e.target.value)}
            className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-md text-sm text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Strategies</option>
            <option value="none">No Strategy</option>
            {strategyOptions.map(strategy => (
              <option key={strategy.id} value={strategy.id}>
                {strategy.title.length > 15 ? strategy.title.substring(0, 15) + '...' : strategy.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditingPlan(null)
              setFormPanelOpen(true)
            }}
            className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm"
          >
            <span>🎯</span>
            <span>New</span>
          </button>
        </div>
        
        {/* 第二行：次要控制 */}
        <div className="flex items-center justify-between">
          <select
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-md text-sm text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mr-2"
          >
            <option value="all">All Months</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })}
              </option>
            ))}
          </select>
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
        <>
          {/* 桌面端双列布局 */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <h3 
                        className="text-lg font-semibold text-purple-900 flex-1 cursor-pointer hover:text-purple-600 hover:underline transition-colors flex items-center gap-1"
                        onClick={() => {
                          // 构建Notion页面URL
                          const notionPageUrl = `https://www.notion.so/${plan.id.replace(/-/g, '')}`
                          window.open(notionPageUrl, '_blank')
                        }}
                        title="Click to edit in Notion"
                      >
                        {plan.objective || 'Untitled Plan'}
                        <span className="text-xs text-gray-400">🔗</span>
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
                  {/* 上移按钮 */}
                  <button
                    onClick={() => movePlanUp(plan.id)}
                    disabled={filteredPlans.findIndex(p => p.id === plan.id) === 0}
                    className="p-2 text-purple-600 hover:text-white hover:bg-purple-600 text-sm rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-purple-600 disabled:hover:bg-transparent"
                    title="Move up"
                  >
                    ▲
                  </button>
                  {/* 下移按钮 */}
                  <button
                    onClick={() => movePlanDown(plan.id)}
                    disabled={filteredPlans.findIndex(p => p.id === plan.id) === filteredPlans.length - 1}
                    className="p-2 text-purple-600 hover:text-white hover:bg-purple-600 text-sm rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-purple-600 disabled:hover:bg-transparent"
                    title="Move down"
                  >
                    ▼
                  </button>
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
                    <span className="text-sm text-purple-600 flex-shrink-0">💰 Resources:</span>
                    <span className="text-sm text-purple-700">{plan.estimate_resources}</span>
                  </div>
                </div>
              )}

              {/* Related Tasks */}
              {(() => {
                const planTasks = getTasksForPlan(plan.id)
                if (planTasks.length === 0) return null
                
                return (
                  <div className="mt-4 pt-4 border-t border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-purple-700">Related Tasks</span>
                      <span className="text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">({planTasks.length})</span>
                    </div>
                    <div className="space-y-2">
                      {planTasks.map((task) => (
                        <div key={task.id} className={`p-3 rounded-lg border transition-colors ${
                          task.is_plan_critical 
                            ? 'border-l-4 border-purple-500 bg-purple-50/80 shadow-md hover:bg-purple-100/80' 
                            : 'bg-purple-50 border-purple-100 hover:bg-purple-100'
                        }`}>
                          {/* 第一行：时间 + title */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-purple-600 flex-shrink-0 font-medium">
                              {formatTaskTime(task.start_date, task.end_date)}
                            </span>
                            <span className={`text-sm ml-2 truncate text-purple-900 ${
                              task.is_plan_critical ? 'font-semibold' : 'font-medium'
                            }`}>
                              {task.title || 'Untitled Task'}
                            </span>
                          </div>
                          {/* 第二行：status + budget_time */}
                          <div className="flex items-center gap-2">
                            {task.status && (
                              <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs rounded-full font-medium">
                                {task.status}
                              </span>
                            )}
                            {task.budget_time > 0 && (
                              <span className="px-2 py-0.5 bg-purple-200 text-purple-700 text-xs rounded-full font-medium">
                                {task.budget_time}h
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          ))}
        </div>

        {/* 移动端单列简化布局 */}
        <div className="md:hidden space-y-4">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg border border-purple-200 p-4 hover:shadow-md transition-all duration-200"
            >
              {/* 头部信息 - 紧凑布局 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getStatusIcon(plan.status)}</span>
                    <h3 
                      className="text-base font-semibold text-purple-900 truncate cursor-pointer hover:text-purple-600 hover:underline transition-colors flex items-center gap-1"
                      onClick={() => {
                        // 构建Notion页面URL
                        const notionPageUrl = `https://www.notion.so/${plan.id.replace(/-/g, '')}`
                        window.open(notionPageUrl, '_blank')
                      }}
                      title="Click to edit in Notion"
                    >
                      {plan.objective || 'Untitled Plan'}
                      <span className="text-xs text-gray-400">🔗</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {plan.status && (
                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                        {plan.status}
                      </span>
                    )}
                    {plan.priority_quadrant && (
                      <span className={`px-1.5 py-0.5 text-xs rounded border ${getQuadrantColor(plan.priority_quadrant)}`}>
                        {plan.priority_quadrant.replace('且', '&').replace('不', '非')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1 ml-2">
                  {/* 上移按钮 */}
                  <button
                    onClick={() => movePlanUp(plan.id)}
                    disabled={filteredPlans.findIndex(p => p.id === plan.id) === 0}
                    className="p-1.5 text-purple-600 hover:bg-purple-100 text-sm rounded transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ▲
                  </button>
                  {/* 下移按钮 */}
                  <button
                    onClick={() => movePlanDown(plan.id)}
                    disabled={filteredPlans.findIndex(p => p.id === plan.id) === filteredPlans.length - 1}
                    className="p-1.5 text-purple-600 hover:bg-purple-100 text-sm rounded transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => {
                      setEditingPlan(plan)
                      setFormPanelOpen(true)
                    }}
                    className="p-1.5 text-purple-600 hover:bg-purple-100 text-sm rounded transition-all duration-200"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-1.5 text-red-600 hover:bg-red-100 text-sm rounded transition-all duration-200"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* 进度显示 - 简化 */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-sm font-bold text-purple-700">{plan.progress}%</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 rounded-full transition-all duration-500 bg-purple-600"
                    style={{ width: `${plan.progress}%` }}
                  >
                  </div>
                </div>
              </div>

              {/* 核心信息 - 只显示关键内容 */}
              <div className="space-y-1 text-xs text-gray-600">
                {/* 时间范围 */}
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span className="truncate">{formatDateRange(plan.start_date, plan.due_date)}</span>
                </div>
                
                {/* 任务统计 */}
                <div className="flex items-center gap-1">
                  <span>✅</span>
                  <span>{plan.completed_tasks || 0} / {plan.total_tasks || 0} Tasks</span>
                </div>
                
                {/* 关联策略 */}
                {getParentStrategyTitle(plan.parent_goal) && (
                  <div className="flex items-center gap-1">
                    <span>🎯</span>
                    <span className="text-purple-600 truncate">
                      {getParentStrategyTitle(plan.parent_goal)}
                    </span>
                  </div>
                )}
              </div>

              {/* Related Tasks - 移动端 */}
              {(() => {
                const planTasks = getTasksForPlan(plan.id)
                if (planTasks.length === 0) return null
                
                return (
                  <div className="mt-3 pt-3 border-t border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-purple-700">Related Tasks</span>
                      <span className="text-xs text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded-full">({planTasks.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {planTasks.map((task) => (
                        <div key={task.id} className={`p-2 rounded border ${
                          task.is_plan_critical 
                            ? 'border-l-4 border-purple-500 bg-purple-50/80 shadow-md' 
                            : 'bg-purple-50 border-purple-100'
                        }`}>
                          {/* 第一行：时间 + title */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-purple-600 flex-shrink-0 font-medium">
                              {formatTaskTime(task.start_date, task.end_date)}
                            </span>
                            <span className={`text-xs ml-2 truncate text-purple-900 ${
                              task.is_plan_critical ? 'font-semibold' : 'font-medium'
                            }`}>
                              {task.title || 'Untitled Task'}
                            </span>
                          </div>
                          {/* 第二行：status + budget_time */}
                          <div className="flex items-center gap-1">
                            {task.status && (
                              <span className="px-1.5 py-0.5 bg-purple-200 text-purple-800 text-xs rounded-full font-medium">
                                {task.status}
                              </span>
                            )}
                            {task.budget_time > 0 && (
                              <span className="px-1.5 py-0.5 bg-purple-200 text-purple-700 text-xs rounded-full font-medium">
                                {task.budget_time}h
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          ))}
        </div>
        </>
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