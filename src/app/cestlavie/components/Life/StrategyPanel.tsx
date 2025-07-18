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
  estimate_cost: string
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
    priority_quadrant: '',
    estimate_cost: ''
  })

  useEffect(() => {
    if (strategy) {
      setFormData({
        objective: strategy.objective || '',
        description: strategy.description || '',
        key_results: strategy.key_results || '',
        start_date: strategy.start_date || '',
        due_date: strategy.due_date || '',
        status: strategy.status || '',
        category: strategy.category || '',
        priority_quadrant: strategy.priority_quadrant || '',
        estimate_cost: strategy.estimate_cost || ''
      })
    } else {
      // 创建新目标时，使用当前年月作为默认值
      const currentDate = new Date()
      const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      const nextYearMonth = `${currentDate.getFullYear() + 1}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      
      setFormData({
        objective: '',
        description: '',
        key_results: '',
        start_date: currentYearMonth,
        due_date: nextYearMonth,
        status: '',
        category: '',
        priority_quadrant: '',
        estimate_cost: ''
      })
    }
  }, [strategy, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-purple-200 flex flex-col">
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
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Objective (目标) *</label>
          <input
            type="text"
            required
            value={formData.objective}
            onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
            placeholder="清晰的长期目标描述"
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Description (补充说明)</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="为什么要实现这个目标？背景和动机是什么？"
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Key Results (关键结果) *</label>
          <textarea
            rows={4}
            required
            value={formData.key_results}
            onChange={(e) => setFormData(prev => ({ ...prev, key_results: e.target.value }))}
            placeholder="可量化的结果指标，例如：&#10;1. 完成10个项目&#10;2. 收入达到XX万&#10;3. 获得XX认证"
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Category (类型)</label>
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
            <label className="block text-sm font-medium text-purple-700 mb-1">Start Date (开始)</label>
            <input
              type="month"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Due Date (截止)</label>
            <input
              type="month"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

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
          <label className="block text-sm font-medium text-purple-700 mb-1">Estimate Cost (预估成本)</label>
          <textarea
            rows={2}
            value={formData.estimate_cost}
            onChange={(e) => setFormData(prev => ({ ...prev, estimate_cost: e.target.value }))}
            placeholder="时间、金钱、精力等资源投入预估"
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
            <span>{strategy ? '📝' : '🎯'}</span>
            <span>{strategy ? 'Update' : 'Create'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

// 格式化月份显示
function formatMonth(monthString: string): string {
  if (!monthString) return ''
  
  try {
    const [year, month] = monthString.split('-')
    return `${year}年${month}月`
  } catch (error) {
    return monthString
  }
}

// 格式化时间范围
function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return '时间待定'
  
  const start = startDate ? formatMonth(startDate) : ''
  const end = endDate ? formatMonth(endDate) : ''
  
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

  useEffect(() => {
    fetchStrategies()
    fetchSchema()
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-900">Strategy & OKRs</h1>
          <p className="text-sm text-gray-600 mt-1">长期目标与关键结果管理</p>
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
          {data.map((strategy) => (
            <div
              key={strategy.id}
              className="bg-white rounded-xl border border-purple-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              {/* 横向布局 - 适合全宽卡片 */}
              <div className="flex items-center justify-between gap-6">
                {/* 左侧：基本信息 */}
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl">{getCategoryIcon(strategy.category)}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-purple-900 mb-1">
                      {strategy.objective || 'Untitled Strategy'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {strategy.category && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {strategy.category}
                        </span>
                      )}
                      <span>📅 {formatDateRange(strategy.start_date, strategy.due_date)}</span>
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

              
              {/* 可展开的详细信息 */}
              {(strategy.key_results || strategy.description || strategy.estimate_cost) && (
                <div className="mt-4 pt-4 border-t border-purple-100">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-purple-600 hover:text-purple-700 font-medium">
                      ⛹️ 查看详细信息
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
                      {strategy.estimate_cost && (
                        <div>
                          <h4 className="text-sm font-semibold text-purple-700 mb-1">Estimate Cost:</h4>
                          <p className="text-sm text-gray-600">
                            💰 {strategy.estimate_cost}
                          </p>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 字段说明和使用指南 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6 mt-8">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">📖</span>
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">OKR策略框架使用指南</h3>
            <p className="text-sm text-gray-600">
              基于目标与关键结果(Objectives and Key Results)方法论，帮助你设定和追踪长期目标的实现进度
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 核心字段说明 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-purple-800 text-sm">🎯 核心字段说明</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-purple-700">Objective (目标):</span>
                <span className="text-gray-600 ml-2">清晰、鼓舞人心的长期目标描述</span>
              </div>
              <div>
                <span className="font-medium text-purple-700">Description (说明):</span>
                <span className="text-gray-600 ml-2">为什么要实现这个目标？背景和动机</span>
              </div>
              <div>
                <span className="font-medium text-purple-700">Key Results (关键结果):</span>
                <span className="text-gray-600 ml-2">3-5个可量化的成功指标，用于衡量目标完成度</span>
              </div>
              <div>
                <span className="font-medium text-purple-700">Progress (进度):</span>
                <span className="text-gray-600 ml-2">自动计算：该策略下已完成Plans数量 / 总 Plans数量</span>
              </div>
            </div>
          </div>

          {/* 分类和管理 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-purple-800 text-sm">📋 分类和管理</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-purple-700">Category (类别):</span>
                <span className="text-gray-600 ml-2">职业、健康、财务、学业、家庭、个人成长等领域</span>
              </div>
              <div>
                <span className="font-medium text-purple-700">Priority Quadrant (优先级):</span>
                <span className="text-gray-600 ml-2">基于重要性和紧急性的四象限分类</span>
              </div>
              <div>
                <span className="font-medium text-purple-700">Time Range (时间范围):</span>
                <span className="text-gray-600 ml-2">精确到年月的计划起止时间，建议3-12个月</span>
              </div>
              <div>
                <span className="font-medium text-purple-700">Estimate Cost (预估成本):</span>
                <span className="text-gray-600 ml-2">实现目标需要的时间、金钱、精力等资源投入</span>
              </div>
            </div>
          </div>
        </div>

        {/* 使用建议 */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-purple-100">
          <h4 className="font-semibold text-purple-800 text-sm mb-3">💡 最佳实践建议</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium text-purple-600">设定目标:</span>
              <ul className="mt-1 space-y-1 ml-2">
                <li>• 目标要具体、有挑战性但可实现</li>
                <li>• 每季度设定3-5个主要目标</li>
                <li>• 关注长期价值而非短期任务</li>
              </ul>
            </div>
            <div>
              <span className="font-medium text-purple-600">关键结果:</span>
              <ul className="mt-1 space-y-1 ml-2">
                <li>• 必须可量化和可验证</li>
                <li>• 每个目标设定2-4个关键结果</li>
                <li>• 使用数字、百分比、完成状态</li>
              </ul>
            </div>
            <div>
              <span className="font-medium text-purple-600">进度跟踪:</span>
              <ul className="mt-1 space-y-1 ml-2">
                <li>• 每周更新进度状态</li>
                <li>• 定期回顾和调整策略</li>
                <li>• 70%完成度已经是成功</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 示例 */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-purple-700 hover:text-purple-800">
            📝 查看OKR设定示例
          </summary>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg text-xs text-gray-700">
            <div className="space-y-3">
              <div>
                <span className="font-medium text-purple-600">目标示例:</span>
                <span className="ml-2">"提升专业技能，成为行业专家"</span>
              </div>
              <div>
                <span className="font-medium text-purple-600">关键结果:</span>
                <div className="ml-2 mt-1">
                  1. 完成3个专业认证课程<br/>
                  2. 发表5篇行业文章，获得1000+阅读<br/>
                  3. 在2个技术会议上发表演讲<br/>
                  4. 建立包含100+专业人士的网络
                </div>
              </div>
              <div>
                <span className="font-medium text-purple-600">类别:</span>
                <span className="ml-2">职业</span>
                <span className="ml-4 font-medium text-purple-600">优先级:</span>
                <span className="ml-2">重要不紧急</span>
              </div>
            </div>
          </div>
        </details>
      </div>

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