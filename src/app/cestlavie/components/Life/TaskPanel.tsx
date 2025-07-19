'use client'

import { useEffect, useState } from 'react'
import { useOutlookAuth } from '@/hooks/useOutlookAuth'

// Task Plan Distribution Chart Component
function TaskPlanChart({ tasks, planOptions }: { tasks: TaskRecord[], planOptions: PlanOption[] }) {
  const planCounts = tasks.reduce((acc, task) => {
    const planId = task.plan?.[0] || 'No Plan'
    const planName = planId === 'No Plan' ? 'No Plan' : 
      planOptions.find(p => p.id === planId)?.title || 'Unknown Plan'
    acc[planName] = (acc[planName] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 更有区分度的颜色方案
  const colors = [
    '#8b5cf6', // 紫色
    '#06b6d4', // 青色
    '#10b981', // 绿色
    '#f59e0b', // 橙色
    '#ef4444', // 红色
    '#ec4899', // 粉色
    '#6366f1', // 靛蓝
    '#84cc16'  // 柠檬绿
  ]
  const entries = Object.entries(planCounts)
  const total = tasks.length

  if (entries.length === 0) return null

  return (
    <div>
      <h4 className="text-xs font-medium text-purple-700 mb-2">Plans Distribution</h4>
      <div className="flex items-center gap-3">
        {/* Simple visual bars instead of pie chart for better mobile display */}
        <div className="flex-1">
          <div className="flex h-3 bg-gray-100 rounded-full overflow-hidden">
            {entries.map(([planName, count], index) => {
              const percentage = (count / total) * 100
              return (
                <div
                  key={planName}
                  className="h-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                  title={`${planName}: ${count} tasks (${percentage.toFixed(1)}%)`}
                />
              )
            })}
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono">{total}</div>
      </div>
      {/* Legend - 每个plan独占一行 */}
      <div className="mt-2 space-y-1">
        {entries.map(([planName, count], index) => (
          <div key={planName} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-xs text-gray-600 flex-1" title={planName}>
              {planName}
            </span>
            <span className="text-xs text-gray-400 font-medium">({count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Task Priority Quadrant Chart Component  
function TaskQuadrantChart({ tasks }: { tasks: TaskRecord[] }) {
  const quadrantCounts = tasks.reduce((acc, task) => {
    const quadrant = task.priority_quadrant || 'No Priority'
    acc[quadrant] = (acc[quadrant] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const quadrantColors: Record<string, string> = {
    '重要且紧急': '#dc2626',      // 红色 - 最高优先级
    '重要不紧急': '#f97316',      // 橙色 - 高优先级  
    '不重要但紧急': '#eab308',    // 黄色 - 中优先级
    '不重要不紧急': '#6b7280',    // 灰色 - 低优先级
    'Important & Urgent': '#dc2626',
    'Important & Not Urgent': '#f97316',
    'Not Important & Urgent': '#eab308', 
    'Not Important & Not Urgent': '#6b7280',
    'No Priority': '#a1a1aa'     // 浅灰色
  }

  // 为了更好的显示，定义简化的标签
  const getQuadrantLabel = (quadrant: string) => {
    switch (quadrant) {
      case '重要且紧急': return '重要且紧急'
      case '重要不紧急': return '重要不紧急'
      case '不重要但紧急': return '不重要但紧急'
      case '不重要不紧急': return '不重要不紧急'
      case 'Important & Urgent': return 'Important & Urgent'
      case 'Important & Not Urgent': return 'Important & Not Urgent'
      case 'Not Important & Urgent': return 'Not Important & Urgent'
      case 'Not Important & Not Urgent': return 'Not Important & Not Urgent'
      case 'No Priority': return 'No Priority'
      default: return quadrant
    }
  }

  const entries = Object.entries(quadrantCounts)
  const total = tasks.length

  if (entries.length === 0) return null

  return (
    <div>
      <h4 className="text-xs font-medium text-purple-700 mb-2">Priority Distribution</h4>
      <div className="flex items-center gap-3">
        {/* Simple visual bars */}
        <div className="flex-1">
          <div className="flex h-3 bg-gray-100 rounded-full overflow-hidden">
            {entries.map(([quadrant, count]) => {
              const percentage = (count / total) * 100
              return (
                <div
                  key={quadrant}
                  className="h-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: quadrantColors[quadrant] || '#9333ea'
                  }}
                  title={`${getQuadrantLabel(quadrant)}: ${count} tasks (${percentage.toFixed(1)}%)`}
                />
              )
            })}
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono">{total}</div>
      </div>
      {/* Legend - 每个优先级独占一行 */}
      <div className="mt-2 space-y-1">
        {entries.map(([quadrant, count]) => (
          <div key={quadrant} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: quadrantColors[quadrant] || '#9333ea' }}
            />
            <span className="text-xs text-gray-600 flex-1" title={quadrant}>
              {getQuadrantLabel(quadrant)}
            </span>
            <span className="text-xs text-gray-400 font-medium">({count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface TaskRecord {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
  remind_before: number
  plan: string[]
  priority_quadrant: string
  note: string
  actual_start?: string
  actual_end?: string
  budget_time: number
  actual_time: number
}

interface TaskFormData {
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
  remind_before: number
  plan: string[]
  priority_quadrant: string
  note: string
  budget_time: number
}

interface PlanOption {
  id: string
  title: string
  budget_money?: number
  budget_time?: number
}

interface TaskFormPanelProps {
  isOpen: boolean
  onClose: () => void
  task?: TaskRecord | null
  onSave: (task: TaskFormData) => void
  statusOptions: string[]
  priorityOptions: string[]
  planOptions: PlanOption[]
  allTasks: TaskRecord[]
}

function TaskFormPanel({ isOpen, onClose, task, onSave, statusOptions, priorityOptions, planOptions, allTasks }: TaskFormPanelProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    status: '',
    start_date: '',
    end_date: '',
    all_day: false,
    remind_before: 15,
    plan: [],
    priority_quadrant: '',
    note: '',
    budget_time: 0
  })
  
  const [selectedPlanBudget, setSelectedPlanBudget] = useState<{money: number, time: number} | null>(null)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)

  // 计算剩余时间的函数
  const calculateRemainingTime = (planId: string, planBudgetTime: number, currentTaskBudgetTime: number = 0) => {
    if (!planId || !allTasks) return null
    
    // 找到属于该Plan的所有Tasks（排除当前正在编辑的Task）
    const planTasks = allTasks.filter(t => 
      t.plan && t.plan.includes(planId) && t.id !== task?.id
    )
    
    // 计算已分配的时间总和
    const allocatedTime = planTasks.reduce((total, t) => total + (t.budget_time || 0), 0)
    
    // 加上当前正在输入的task的budget_time
    return planBudgetTime - allocatedTime - currentTaskBudgetTime
  }

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        status: task.status || '',
        start_date: convertFromUTCForDisplay(task.start_date || ''),
        end_date: convertFromUTCForDisplay(task.end_date || ''),
        all_day: task.all_day || false,
        remind_before: task.remind_before || 15,
        plan: task.plan || [],
        priority_quadrant: task.priority_quadrant || '',
        note: task.note || '',
        budget_time: task.budget_time || 0
      })
    } else {
      // 创建新任务时，使用当前时间作为默认值
      const defaultStart = getDefaultDateTime()
      const defaultEnd = new Date(Date.now() + 60 * 60 * 1000) // 1小时后
      const defaultEndStr = defaultEnd.getFullYear() + '-' +
                            String(defaultEnd.getMonth() + 1).padStart(2, '0') + '-' +
                            String(defaultEnd.getDate()).padStart(2, '0') + 'T' +
                            String(defaultEnd.getHours()).padStart(2, '0') + ':' +
                            String(defaultEnd.getMinutes()).padStart(2, '0')
      
      setFormData({
        title: '',
        status: '',
        start_date: defaultStart,
        end_date: defaultEndStr,
        all_day: false,
        remind_before: 15,
        plan: [],
        priority_quadrant: '',
        note: '',
        budget_time: 0
      })
    }
  }, [task, isOpen])

  // 当planOptions或formData.plan改变时，更新预算信息显示
  useEffect(() => {
    if (formData.plan.length > 0 && planOptions.length > 0) {
      const selectedPlan = planOptions.find(p => p.id === formData.plan[0])
      if (selectedPlan) {
        const budget = {
          money: selectedPlan.budget_money || 0,
          time: selectedPlan.budget_time || 0
        }
        setSelectedPlanBudget(budget)
        
        // 计算剩余时间
        const remaining = calculateRemainingTime(selectedPlan.id, budget.time, formData.budget_time)
        setRemainingTime(remaining)
      }
    } else {
      setSelectedPlanBudget(null)
      setRemainingTime(null)
    }
  }, [formData.plan, formData.budget_time, planOptions, allTasks, task])

  // 当budget_time改变时，重新计算剩余时间
  useEffect(() => {
    if (formData.plan.length > 0 && selectedPlanBudget) {
      const selectedPlan = planOptions.find(p => p.id === formData.plan[0])
      if (selectedPlan) {
        const remaining = calculateRemainingTime(selectedPlan.id, selectedPlanBudget.time, formData.budget_time)
        setRemainingTime(remaining)
      }
    }
  }, [formData.budget_time, formData.plan, selectedPlanBudget, planOptions, allTasks, task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <>
      {/* 透明点击区域，点击关闭 */}
      <div 
        className="fixed top-0 left-0 h-full z-40 md:block hidden"
        style={{ width: 'calc(100vw - 384px)' }}
        onClick={onClose}
      ></div>
      
      {/* 移动端全屏覆盖 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      ></div>
      
      {/* 表单面板 */}
      <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 md:border-l border-purple-200 flex flex-col">
      <div className="p-4 border-b border-purple-200 flex items-center justify-between">
        <h4 className="text-lg font-semibold text-purple-900">
          {task ? 'Edit Task' : 'New Task'}
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
          <label className="block text-sm font-medium text-purple-700 mb-1">Related Plan (关联计划) *</label>
          <select
            value={formData.plan[0] || ''}
            onChange={(e) => {
              const planId = e.target.value
              setFormData(prev => ({ 
                ...prev, 
                plan: planId ? [planId] : [] 
              }))
              
              // 查找并设置选中Plan的预算信息
              if (planId) {
                const selectedPlan = planOptions.find(p => p.id === planId)
                if (selectedPlan) {
                  const budget = {
                    money: selectedPlan.budget_money || 0,
                    time: selectedPlan.budget_time || 0
                  }
                  setSelectedPlanBudget(budget)
                  
                  // 计算剩余时间
                  const remaining = calculateRemainingTime(planId, budget.time, formData.budget_time)
                  setRemainingTime(remaining)
                } else {
                  setSelectedPlanBudget(null)
                  setRemainingTime(null)
                }
              } else {
                setSelectedPlanBudget(null)
                setRemainingTime(null)
              }
            }}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Select a Plan First</option>
            {planOptions.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.title}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">每个任务必须归属于一个计划</p>
          
          {/* 显示选中Plan的预算信息 */}
          {selectedPlanBudget && (selectedPlanBudget.money > 0 || selectedPlanBudget.time > 0) && (
            <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
              <div className="text-xs text-purple-700 font-medium mb-1">Plan Budget Reference:</div>
              <div className="flex items-center gap-4 text-sm">
                {selectedPlanBudget.money > 0 && (
                  <span className="text-green-600">💰 ¥{selectedPlanBudget.money}</span>
                )}
                {selectedPlanBudget.time > 0 && (
                  <span className="text-blue-600">⏱️ {selectedPlanBudget.time}h</span>
                )}
                {remainingTime !== null && (
                  <span className={`text-sm ${remainingTime >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    📅 Remaining: {remainingTime > 0 ? '+' : ''}{remainingTime}h
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">时间设置</label>
            
            {/* 时间输入 */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-purple-600 w-12 flex-shrink-0">开始:</label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-purple-600 w-12 flex-shrink-0">结束:</label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Reminder (min)</label>
          <input
            type="number"
            min="0"
            value={formData.remind_before}
            onChange={(e) => setFormData(prev => ({ ...prev, remind_before: parseInt(e.target.value) || 15 }))}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Budget Time (hours)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={formData.budget_time}
            onChange={(e) => setFormData(prev => ({ ...prev, budget_time: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Expected time to complete this task"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.all_day}
              onChange={(e) => setFormData(prev => ({ ...prev, all_day: e.target.checked }))}
              className="mr-2 rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-purple-700">All Day Task</span>
          </label>
        </div>


        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Note</label>
          <textarea
            rows={3}
            value={formData.note}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
            title="Cancel and close form"
          >
            <span>✕</span>
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
            title={task ? "Update this task" : "Create new task"}
          >
            <span>{task ? '📝' : '✨'}</span>
            <span>{task ? 'Update' : 'Create'}</span>
          </button>
        </div>
      </form>
      </div>
    </>
  )
}

// 格式化时间显示，避免时区转换，使用24小时制
function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return ''
  
  try {
    // 如果输入的是datetime-local格式，直接使用
    if (dateTimeString.includes('T') && !dateTimeString.includes('Z')) {
      const [datePart, timePart] = dateTimeString.split('T')
      const [year, month, day] = datePart.split('-')
      const [hour, minute] = timePart.split(':')
      
      return `${month}/${day} ${hour}:${minute}`
    }
    
    // 否则作为ISO字符串处理
    const date = new Date(dateTimeString)
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric' 
    }) + ' ' + date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch (error) {
    return dateTimeString
  }
}

// 格式化时间范围显示
function formatTimeRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return ''
  
  const start = startDate ? formatDateTime(startDate) : ''
  const end = endDate ? formatDateTime(endDate) : ''
  
  if (start && end) {
    // 如果是同一天，只显示时间范围
    const startDay = start.split(' ')[0]
    const endDay = end.split(' ')[0]
    const startTime = start.split(' ')[1]
    const endTime = end.split(' ')[1]
    
    if (startDay === endDay) {
      return `${startDay} ${startTime}-${endTime}`
    } else {
      return `${start} - ${end}`
    }
  }
  
  return start || end
}

// 检查任务是否正在运行
function isTaskRunning(task: TaskRecord): boolean {
  return !!(task.actual_start && !task.actual_end)
}

// 计算运行时间（小时）
function calculateElapsedTime(actualStart: string): number {
  if (!actualStart) return 0
  const start = new Date(actualStart)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  return Math.max(0, diffMs / (1000 * 60 * 60)) // 转换为小时
}

// 时间显示组件
function TimeDisplay({ task }: { task: TaskRecord }) {
  const [elapsedTime, setElapsedTime] = useState(0)
  
  useEffect(() => {
    if (!isTaskRunning(task)) return
    
    const updateElapsed = () => {
      setElapsedTime(calculateElapsedTime(task.actual_start || ''))
    }
    
    updateElapsed()
    const interval = setInterval(updateElapsed, 1000) // 每秒更新
    
    return () => clearInterval(interval)
  }, [task.actual_start, task.actual_end])
  
  if (!isTaskRunning(task) || !task.budget_time) return null
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-purple-600">进行中</span>
        <span className="font-medium text-purple-700">
          {elapsedTime.toFixed(1)}h / {task.budget_time}h
        </span>
      </div>
    </div>
  )
}

// 将datetime-local格式转换为显示格式
function convertToDateTimeLocal(isoString: string): string {
  if (!isoString) return ''
  
  try {
    const date = new Date(isoString)
    // 格式化为 YYYY-MM-DDTHH:MM
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0') + 'T' +
           String(date.getHours()).padStart(2, '0') + ':' +
           String(date.getMinutes()).padStart(2, '0')
  } catch (error) {
    return isoString
  }
}

// 将datetime-local格式转换为UTC ISO字符串（用于Notion API）
function convertToUTCForNotion(localDateTimeString: string): string {
  if (!localDateTimeString) return ''
  
  try {
    // 将本地时间字符串转换为Date对象
    const localDate = new Date(localDateTimeString)
    // 转换为UTC ISO字符串
    return localDate.toISOString()
  } catch (error) {
    console.error('Error converting to UTC:', error)
    return localDateTimeString
  }
}

// 从UTC ISO字符串转换为本地时间字符串（用于表单显示）
function convertFromUTCForDisplay(utcISOString: string): string {
  if (!utcISOString) return ''
  
  try {
    const date = new Date(utcISOString)
    // 转换为本地时间的datetime-local格式
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0') + 'T' +
           String(date.getHours()).padStart(2, '0') + ':' +
           String(date.getMinutes()).padStart(2, '0')
  } catch (error) {
    console.error('Error converting from UTC:', error)
    return utcISOString
  }
}

// 获取当前日期时间的默认值
function getDefaultDateTime(): string {
  const now = new Date()
  return now.getFullYear() + '-' +
         String(now.getMonth() + 1).padStart(2, '0') + '-' +
         String(now.getDate()).padStart(2, '0') + 'T' +
         String(now.getHours()).padStart(2, '0') + ':' +
         String(now.getMinutes()).padStart(2, '0')
}

export default function TaskPanel() {
  const [data, setData] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formPanelOpen, setFormPanelOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('all')
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [priorityOptions, setPriorityOptions] = useState<string[]>([])
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [addingToCalendar, setAddingToCalendar] = useState<string | null>(null)
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all')
  
  // 计时器相关状态
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())
  const [updatingTimer, setUpdatingTimer] = useState<string | null>(null)
  
  // 日历相关状态
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const { isAuthenticated, authenticate, addToCalendar } = useOutlookAuth()

  // 按计划筛选任务的函数
  const filterTasksByPlan = (tasks: TaskRecord[]) => {
    if (selectedPlanFilter === 'all') return tasks
    return tasks.filter(task => {
      if (!task.plan || task.plan.length === 0) return selectedPlanFilter === 'none'
      return task.plan.includes(selectedPlanFilter)
    })
  }

  // 获取本周任务的函数
  const getThisWeekTasks = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // 获取本周一（周的开始）
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    
    // 获取本周日（周的结束）
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    const weekTasks = data.filter(task => {
      if (!task.start_date) return false
      const taskDate = new Date(task.start_date.split('T')[0])
      return taskDate >= monday && taskDate <= sunday
    }).sort((a, b) => {
      const dateA = new Date(a.start_date)
      const dateB = new Date(b.start_date)
      return dateA.getTime() - dateB.getTime()
    })
    
    return filterTasksByPlan(weekTasks)
  }

  const thisWeekTasks = getThisWeekTasks()

  // 获取状态图标
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

  // 获取优先级颜色（与图表一致的颜色方案）
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '重要且紧急': return 'bg-red-100 text-red-800 border-red-300'
      case '重要不紧急': return 'bg-orange-100 text-orange-800 border-orange-300'
      case '不重要但紧急': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case '不重要不紧急': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'Important & Urgent': return 'bg-red-100 text-red-800 border-red-300'
      case 'Important & Not Urgent': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'Not Important & Urgent': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Not Important & Not Urgent': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-purple-100 text-purple-800 border-purple-200'
    }
  }

  // 格式化日期时间，包含星期几
  const formatDateTimeWithWeekday = (dateTimeString: string) => {
    if (!dateTimeString) return ''
    
    const date = new Date(dateTimeString)
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[date.getDay()]
    
    const dateStr = date.toLocaleDateString('zh-CN', { 
      month: 'numeric', 
      day: 'numeric' 
    })
    
    const timeStr = date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
    
    return `${dateStr} 周${weekday} ${timeStr}`
  }

  // 格式化时间范围显示
  const formatTimeRange = (startDate: string, endDate?: string) => {
    if (!startDate) return ''
    
    const start = new Date(startDate)
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[start.getDay()]
    
    const dateStr = start.toLocaleDateString('zh-CN', { 
      month: 'numeric', 
      day: 'numeric' 
    })
    
    const startTime = start.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
    
    if (!endDate) {
      return `${dateStr} 周${weekday} ${startTime}`
    }
    
    const end = new Date(endDate)
    const endTime = end.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
    
    // 检查是否同一天
    const isSameDay = start.toDateString() === end.toDateString()
    
    if (isSameDay) {
      return `${dateStr} 周${weekday} ${startTime} - ${endTime}`
    } else {
      const endDateStr = end.toLocaleDateString('zh-CN', { 
        month: 'numeric', 
        day: 'numeric' 
      })
      const endWeekday = weekdays[end.getDay()]
      return `${dateStr} 周${weekday} ${startTime} - ${endDateStr} 周${endWeekday} ${endTime}`
    }
  }

  // 格式化日期和星期（不含时间）
  const formatDateWithWeekday = (dateTimeString: string) => {
    if (!dateTimeString) return ''
    
    const date = new Date(dateTimeString)
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[date.getDay()]
    
    const dateStr = date.toLocaleDateString('zh-CN', { 
      month: 'numeric', 
      day: 'numeric' 
    })
    
    return `${dateStr} 周${weekday}`
  }

  // 格式化时间范围（仅时间部分）
  const formatTimeOnly = (startDate: string, endDate?: string) => {
    if (!startDate) return ''
    
    const start = new Date(startDate)
    const startTime = start.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
    
    if (!endDate) {
      return startTime
    }
    
    const end = new Date(endDate)
    const endTime = end.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
    
    // 检查是否同一天
    const isSameDay = start.toDateString() === end.toDateString()
    
    if (isSameDay) {
      return `${startTime} - ${endTime}`
    } else {
      // 跨天的情况，需要显示完整信息
      return formatTimeRange(startDate, endDate)
    }
  }

  // 日历辅助函数
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // 添加上个月的日期填充
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: prevDate.toISOString().split('T')[0]
      })
    }
    
    // 添加当前月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        dateString: currentDate.toISOString().split('T')[0]
      })
    }
    
    // 添加下个月的日期填充
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: nextDate.toISOString().split('T')[0]
      })
    }
    
    return days
  }

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateString === today
  }

  const getTasksForDate = (dateString: string) => {
    const dateTasks = data.filter(task => {
      if (!task.start_date && !task.end_date) return false
      
      const taskDate = task.start_date || task.end_date
      if (!taskDate) return false
      
      const taskDateString = taskDate.split('T')[0]
      return taskDateString === dateString
    }).sort((a, b) => {
      const aTime = a.start_date || a.end_date
      const bTime = b.start_date || b.end_date
      if (!aTime || !bTime) return 0
      return aTime.localeCompare(bTime)
    })
    
    return filterTasksByPlan(dateTasks)
  }

  const getTaskCountForDate = (dateString: string) => {
    return getTasksForDate(dateString).length
  }

  const getTimeGroup = (task: TaskRecord) => {
    const timeStr = task.start_date || task.end_date
    if (!timeStr) return '其他'
    
    const hour = new Date(timeStr).getHours()
    if (hour >= 6 && hour < 12) return '上午'
    if (hour >= 12 && hour < 18) return '下午'
    if (hour >= 18 && hour < 24) return '晚上'
    return '深夜'
  }

  const getTimeGroupIcon = (timeGroup: string) => {
    switch (timeGroup) {
      case '上午': return '🌅'
      case '下午': return '☀️'
      case '晚上': return '🌙'
      case '深夜': return '🌃'
      default: return '⏰'
    }
  }

  const getGroupedTasks = (tasks: TaskRecord[]) => {
    const groups = {
      '上午': [] as TaskRecord[],
      '下午': [] as TaskRecord[],
      '晚上': [] as TaskRecord[],
      '深夜': [] as TaskRecord[],
      '其他': [] as TaskRecord[]
    }
    
    tasks.forEach(task => {
      const group = getTimeGroup(task)
      groups[group].push(task)
    })
    
    return groups
  }

  useEffect(() => {
    fetchTasks()
    fetchSchema()
    fetchPlanOptions()
  }, [])
  
  // 更新正在运行的任务状态
  useEffect(() => {
    const running = new Set<string>()
    data.forEach(task => {
      if (isTaskRunning(task)) {
        running.add(task.id)
      }
    })
    setRunningTasks(running)
  }, [data])

  const fetchSchema = async () => {
    try {
      const response = await fetch('/api/tasks?action=schema')
      if (response.ok) {
        const result = await response.json()
        setStatusOptions(result.schema?.statusOptions || [])
        setPriorityOptions(result.schema?.priorityOptions || [])
      }
    } catch (err) {
      console.error('Failed to fetch schema:', err)
    }
  }

  const fetchPlanOptions = async () => {
    try {
      const response = await fetch('/api/plan')
      if (response.ok) {
        const result = await response.json()
        const plans = result.data?.map((p: any) => ({
          id: p.id,
          title: p.objective || 'Untitled Plan',
          budget_money: p.budget_money || 0,
          budget_time: p.budget_time || 0
        })) || []
        setPlanOptions(plans)
      }
    } catch (err) {
      console.error('Failed to fetch plan options:', err)
    }
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/tasks')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setData(result.data || [])
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchTasks(), fetchPlanOptions()])
    setRefreshing(false)
  }

  const handleSaveTask = async (taskData: TaskFormData) => {
    try {
      // 转换时间为UTC格式，用于Notion API
      const utcTaskData = {
        ...taskData,
        start_date: taskData.start_date ? convertToUTCForNotion(taskData.start_date) : '',
        end_date: taskData.end_date ? convertToUTCForNotion(taskData.end_date) : ''
      }
      
      // 如果是编辑模式，添加任务ID
      const dataToSend = editingTask 
        ? { ...utcTaskData, id: editingTask.id }
        : utcTaskData
        
      console.log('Saving task with UTC times:', dataToSend)
        
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        throw new Error('Failed to save task')
      }

      setFormPanelOpen(false)
      setEditingTask(null)
      fetchTasks()
    } catch (err) {
      console.error('Failed to save task:', err)
      setError(err instanceof Error ? err.message : 'Failed to save task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      fetchTasks()
    } catch (err) {
      console.error('Failed to delete task:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const handleAddToOutlook = async (task: TaskRecord) => {
    try {
      setAddingToCalendar(task.id)
      
      if (!isAuthenticated) {
        await authenticate()
        return
      }

      const success = await addToCalendar(task)
      
      if (success) {
        setError(null)
        alert('Task successfully added to Outlook Calendar!')
      }
    } catch (err) {
      console.error('Failed to add to Outlook:', err)
      setError(err instanceof Error ? err.message : 'Failed to add to Outlook Calendar')
    } finally {
      setAddingToCalendar(null)
    }
  }

  const handleStartStopTimer = async (task: TaskRecord) => {
    try {
      setUpdatingTimer(task.id)
      
      const isRunning = isTaskRunning(task)
      const now = new Date().toISOString() // 已经是UTC格式
      
      const updateData = {
        id: task.id,
        title: task.title,
        status: task.status,
        start_date: task.start_date, // 保持原有UTC格式，不重新转换
        end_date: task.end_date, // 保持原有UTC格式，不重新转换
        all_day: task.all_day,
        remind_before: task.remind_before,
        plan: task.plan,
        priority_quadrant: task.priority_quadrant,
        note: task.note,
        actual_start: isRunning ? task.actual_start : now, // UTC格式的当前时间
        actual_end: isRunning ? now : undefined // UTC格式的当前时间
      }
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update timer')
      }
      
      // 更新本地状态
      if (isRunning) {
        setRunningTasks(prev => {
          const newSet = new Set(prev)
          newSet.delete(task.id)
          return newSet
        })
      } else {
        setRunningTasks(prev => new Set(prev).add(task.id))
      }
      
      fetchTasks() // 刷新任务列表
      
    } catch (err) {
      console.error('Failed to update timer:', err)
      setError(err instanceof Error ? err.message : 'Failed to update timer')
    } finally {
      setUpdatingTimer(null)
    }
  }

  const handleAddToOutlookWeb = (task: TaskRecord) => {
    const startDate = task.start_date || new Date().toISOString()
    const endDate = task.end_date || new Date(Date.now() + 60 * 60 * 1000).toISOString()
    
    const eventBody = [
      task.note,
      task.priority_quadrant ? `Priority: ${task.priority_quadrant}` : '',
      task.status ? `Status: ${task.status}` : '',
      `Budget Time: ${task.budget_time || 0} hours`
    ].filter(Boolean).join('\n\n')

    const params = new URLSearchParams({
      subject: task.title,
      body: eventBody,
      startdt: startDate,
      enddt: endDate,
      allday: task.all_day ? 'true' : 'false'
    })

    window.open(`https://outlook.live.com/calendar/0/deeplink/compose?${params}`, '_blank')
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-purple-600'
    if (progress >= 60) return 'bg-purple-500'
    if (progress >= 40) return 'bg-purple-400'
    return 'bg-purple-300'
  }
  
  const getPlanTitle = (planIds: string[]) => {
    if (!planIds || planIds.length === 0) return null
    const plan = planOptions.find(p => p.id === planIds[0])
    return plan?.title || 'Unknown Plan'
  }

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case '重要且紧急': return 'bg-red-100 text-red-800'
      case '重要不紧急': return 'bg-orange-100 text-orange-800'
      case '不重要但紧急': return 'bg-yellow-100 text-yellow-800'
      case '不重要不紧急': return 'bg-gray-100 text-gray-800'
      case 'Important & Urgent': return 'bg-red-100 text-red-800'
      case 'Important & Not Urgent': return 'bg-orange-100 text-orange-800'
      case 'Not Important & Urgent': return 'bg-yellow-100 text-yellow-800'
      case 'Not Important & Not Urgent': return 'bg-gray-100 text-gray-800'
      default: return 'bg-purple-100 text-purple-800'
    }
  }

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
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
              <h3 className="text-sm font-medium text-red-800">Failed to load tasks</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchTasks}
                className="flex items-center gap-2 mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                title="Retry loading tasks"
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

  const calendarDays = getDaysInMonth(currentMonth)
  const selectedDateTasks = getTasksForDate(selectedDate)
  const groupedTasks = getGroupedTasks(selectedDateTasks)

  return (
    <div className="w-full py-8 space-y-6 md:pr-0 pr-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-purple-900">Task Management</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600">Outlook Calendar:</span>
            <span className={`text-xs px-2 py-1 rounded ${
              isAuthenticated 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isAuthenticated ? '✓ Connected' : '○ Not Connected'}
            </span>
            {!isAuthenticated && (
              <button
                onClick={authenticate}
                className="text-xs text-purple-600 hover:text-purple-800 underline transition-all duration-200 transform hover:scale-105 active:scale-95"
                title="Connect to Microsoft Outlook"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 日历和任务布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧日历 */}
        <div className="lg:col-span-5">
          {/* Refresh按钮与筛选框 */}
          <div className="flex flex-col sm:flex-row justify-start items-stretch sm:items-center gap-3 mb-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-md hover:bg-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              <div className={`${refreshing ? 'animate-spin' : ''}`}>
                {refreshing ? '⟳' : '↻'}
              </div>
              <span className="whitespace-nowrap">Refresh</span>
            </button>
            
            {/* Plan筛选框 */}
            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-purple-200 rounded-md text-sm text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-300 transition-all duration-200 flex-1 sm:flex-initial"
            >
              <option value="all">All Plans</option>
              <option value="none">No Plan</option>
              {planOptions.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
              ))}
            </select>
          </div>
          {/* Web端日历 - 保持原样 */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm border border-purple-200 p-6">
            {/* 日历头部 */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              >
                <span className="text-purple-600">‹</span>
              </button>
              <h2 className="text-lg font-semibold text-purple-900">
                {currentMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              >
                <span className="text-purple-600">›</span>
              </button>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* 日历天数 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const taskCount = getTaskCountForDate(day.dateString)
                const isSelected = selectedDate === day.dateString
                const isTodayDate = isToday(day.dateString)
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.dateString)}
                    className={`
                      relative p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 min-h-[3rem]
                      ${day.isCurrentMonth 
                        ? 'text-gray-900 hover:bg-purple-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                      }
                      ${isSelected 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : ''
                      }
                      ${isTodayDate && !isSelected 
                        ? 'bg-purple-100 text-purple-700 font-semibold' 
                        : ''
                      }
                    `}
                  >
                    {day.date.getDate()}
                    {taskCount > 0 && (
                      <div className={`
                        absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center
                        ${isSelected ? 'bg-white text-purple-600' : 'bg-purple-600 text-white'}
                      `}>
                        {taskCount}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 移动端紧凑日历 */}
          <div className="md:hidden bg-white rounded-lg shadow-sm border border-purple-200 p-3">
            {/* 日历头部 */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
              >
                <span className="text-purple-600 text-sm">‹</span>
              </button>
              <h2 className="text-base font-semibold text-purple-900">
                {currentMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
              >
                <span className="text-purple-600 text-sm">›</span>
              </button>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-0.5 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
                  {day}
                </div>
              ))}
            </div>

            {/* 日历天数 - 移动端紧凑版 */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, index) => {
                const taskCount = getTaskCountForDate(day.dateString)
                const isSelected = selectedDate === day.dateString
                const isTodayDate = isToday(day.dateString)
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.dateString)}
                    className={`
                      relative p-1 text-xs rounded-md transition-all duration-200 min-h-[2rem] flex items-center justify-center
                      ${day.isCurrentMonth 
                        ? 'text-gray-900 hover:bg-purple-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                      }
                      ${isSelected 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : ''
                      }
                      ${isTodayDate && !isSelected 
                        ? 'bg-purple-100 text-purple-700 font-semibold' 
                        : ''
                      }
                    `}
                  >
                    {day.date.getDate()}
                    {taskCount > 0 && (
                      <div className={`
                        absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full text-xs flex items-center justify-center
                        ${isSelected ? 'bg-white text-purple-600' : 'bg-purple-600 text-white'}
                      `}>
                        {taskCount > 9 ? '•' : taskCount}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

          </div>
          
          {/* Task Analytics - 共享组件 */}
          <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-3 md:p-6 mt-6">
            <p className="text-sm text-gray-600 mb-3">
              Selected: <span className="font-medium text-purple-700">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <span className="text-xs text-gray-500 ml-2">({selectedDateTasks.length} tasks)</span>
            </p>
            
            {selectedDateTasks.length > 0 && (
              <div className="space-y-3">
                {/* Plans Distribution */}
                <TaskPlanChart tasks={selectedDateTasks} planOptions={planOptions} />
                
                {/* Priority Quadrant Distribution */}
                <TaskQuadrantChart tasks={selectedDateTasks} />
              </div>
            )}
          </div>
          
          {/* 本周任务 */}
          {thisWeekTasks.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-purple-200 p-3 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-900">This Week Tasks</h3>
                <span className="text-sm text-purple-600">{thisWeekTasks.length} tasks</span>
              </div>
              <div className="space-y-3">
                {thisWeekTasks.map(task => (
                  <div key={task.id} className="p-3 md:p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                      {/* 左侧时间列 */}
                      <div className="md:w-24 flex-shrink-0">
                        {/* 日期和星期 */}
                        <div className="text-xs text-purple-600 font-medium mb-1">
                          {formatDateWithWeekday(task.start_date)}
                        </div>
                        {/* 时间 */}
                        <div className="text-xs text-purple-800 font-semibold">
                          {formatTimeOnly(task.start_date, task.end_date)}
                        </div>
                      </div>
                      
                      {/* 右侧内容列 */}
                      <div className="flex-1">
                        {/* 标题行 */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-purple-900">{task.title}</span>
                        </div>
                        
                        {/* Status行 */}
                        <div className="mb-1">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            Status: {task.status}
                          </span>
                        </div>
                        
                        {/* Priority行 */}
                        {task.priority_quadrant && (
                          <div className="mb-1">
                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority_quadrant)}`}>
                              Priority: {task.priority_quadrant}
                            </span>
                          </div>
                        )}
                        
                        {/* Budget行 */}
                        {(task.budget_time > 0 || task.all_day) && (
                          <div className="mb-1">
                            {task.budget_time > 0 && (
                              <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded border border-purple-200 mr-2">
                                Budget: {task.budget_time}h
                              </span>
                            )}
                            {task.all_day && (
                              <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded border border-purple-200">
                                All Day
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Note占满整行（如果有） */}
                    {task.note && (
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-500 text-xs mt-0.5">📝</span>
                          <p className="text-sm text-purple-700 whitespace-pre-wrap break-words flex-1">
                            {task.note}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧任务列表 */}
        <div className="lg:col-span-7">
          {/* NewTask按钮与今日任务左对齐 */}
          <div className="flex justify-start mb-4">
            <button
              onClick={() => {
                setEditingTask(null)
                setFormPanelOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
            >
              <span>+</span>
              <span className="whitespace-nowrap">New Task</span>
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-3 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-900">
                {isToday(selectedDate) ? '今日任务' : '选定日期任务'}
              </h3>
              <span className="text-sm text-gray-500">
                {selectedDateTasks.length} 个任务
              </span>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl font-light">📅</div>
                <p className="text-gray-600 mt-4">这一天没有任务</p>
                <button
                  onClick={() => {
                    setEditingTask(null)
                    setFormPanelOpen(true)
                  }}
                  className="mt-2 text-purple-600 hover:text-purple-700 text-sm underline"
                >
                  添加任务
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedTasks).map(([timeGroup, tasks]) => 
                  tasks.length > 0 && (
                    <div key={timeGroup} className="space-y-2">
                      {/* 时间段标题 */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{getTimeGroupIcon(timeGroup)}</span>
                        <span className="text-sm font-semibold text-purple-800">{timeGroup}</span>
                        <div className="flex-1 h-px bg-purple-200"></div>
                        <span className="text-xs text-gray-500">{tasks.length}个任务</span>
                      </div>
                      
                      {/* 该时间段的任务列表 */}
                      {tasks.map((task) => {
                        const isRunning = isTaskRunning(task)
                        const isUpdating = updatingTimer === task.id
                        
                        return (
                        <div
                          key={task.id}
                          className={`bg-gradient-to-r from-purple-50 to-white rounded-lg border p-3 hover:shadow-md transition-all duration-200 ${
                            isRunning ? 'border-purple-400 bg-purple-50' : 'border-purple-200'
                          }`}
                        >
                          {/* 移动端垂直布局，桌面端三列布局 */}
                          <div className="flex flex-col md:flex-row md:items-start gap-3">
                            {/* 第一列：时间范围显示 */}
                            <div className="flex-shrink-0 text-center">
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                isRunning ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white'
                              }`}>
                                {task.start_date && task.end_date ? (
                                  formatTimeRange(task.start_date, task.end_date)
                                ) : (task.start_date || task.end_date) ? (
                                  formatDateTime(task.start_date || task.end_date).split(' ')[1]
                                ) : (
                                  '--:--'
                                )}
                              </div>
                            </div>
                            
                            {/* 第二列：任务信息 */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-purple-900 truncate mb-2">
                                {task.title || 'Untitled Task'}
                              </h4>
                              
                              {/* 计划归属显示 */}
                              {getPlanTitle(task.plan) && (
                                <div className="text-xs text-purple-600 mb-2">
                                  📋 {getPlanTitle(task.plan)}
                                </div>
                              )}
                              
                              {/* 元信息行 */}
                              <div className="space-y-1">
                                {task.status && (
                                  <div>
                                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                                      {task.status}
                                    </span>
                                  </div>
                                )}
                                {task.priority_quadrant && (
                                  <div>
                                    <span className={`px-1.5 py-0.5 text-xs rounded ${getQuadrantColor(task.priority_quadrant)}`}>
                                      {task.priority_quadrant}
                                    </span>
                                  </div>
                                )}
                                {(task.budget_time > 0 || task.actual_time > 0) && (
                                  <div className="text-xs">
                                    {task.budget_time > 0 && (
                                      <span className="text-purple-700 font-medium mr-2">
                                        预算: {task.budget_time}h
                                      </span>
                                    )}
                                    {task.actual_time > 0 && (
                                      <span className="text-purple-700 font-medium">
                                        实际: {task.actual_time}h
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* 时间显示 */}
                              <TimeDisplay task={task} />
                              
                              {/* 实际运行时间显示 */}
                              {(task.actual_start || task.actual_end) && (
                                <div className="text-xs text-purple-700 mt-1 font-mono">
                                  实际: {task.actual_start ? formatDateTime(task.actual_start).split(' ')[1] : '--:--'} - 
                                  {task.actual_end ? formatDateTime(task.actual_end).split(' ')[1] : (isRunning ? '进行中' : '--:--')}
                                </div>
                              )}
                            </div>
                            
                            {/* 第三列：操作按钮移动端横向，桌面端竖向 */}
                            <div className="flex md:flex-col gap-1 flex-shrink-0 justify-center md:justify-start flex-wrap">
                              {/* 计时器按钮 */}
                              <button
                                onClick={() => handleStartStopTimer(task)}
                                disabled={isUpdating}
                                className={`px-2 py-1 text-xs rounded border transition-all duration-200 ${
                                  isRunning 
                                    ? 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200' 
                                    : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                title={isRunning ? 'Stop timer' : 'Start timer'}
                              >
                                {isUpdating ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                                ) : (
                                  isRunning ? '⏹️' : '▶️'
                                )}
                              </button>
                              
                              {/* API按钮 */}
                              <button
                                onClick={() => handleAddToOutlook(task)}
                                disabled={addingToCalendar === task.id}
                                className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100 transition-all duration-200 disabled:opacity-50"
                                title={isAuthenticated ? "Add to Outlook Calendar via API" : "Connect to Outlook first"}
                              >
                                {addingToCalendar === task.id ? (
                                  <div className="animate-spin rounded-full h-2 w-2 border-b border-purple-600"></div>
                                ) : (
                                  'API'
                                )}
                              </button>
                              
                              {/* Web按钮 */}
                              <button
                                onClick={() => handleAddToOutlookWeb(task)}
                                className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100 transition-all duration-200"
                                title="Add to Outlook Calendar via web interface"
                              >
                                Web
                              </button>
                              
                              {/* 编辑按钮 */}
                              <button
                                onClick={() => {
                                  setEditingTask(task)
                                  setFormPanelOpen(true)
                                }}
                                className="px-2 py-1 text-purple-600 hover:text-white hover:bg-purple-600 text-xs rounded transition-all duration-200 border border-purple-200 hover:border-purple-600"
                                title="Edit this task"
                              >
                                ✏️
                              </button>
                              
                              {/* 删除按钮 */}
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="px-2 py-1 text-red-600 hover:text-white hover:bg-red-600 text-xs rounded transition-all duration-200 border border-red-200 hover:border-red-600"
                                title="Delete this task"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          
                          {/* Note独占底部一整行 */}
                          {task.note && (
                            <div className="mt-3 pt-3 border-t border-purple-200">
                              <p className="text-xs text-gray-600 whitespace-pre-wrap break-words">
                                {task.note}
                              </p>
                            </div>
                          )}
                        </div>
                        )
                      })}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskFormPanel
        isOpen={formPanelOpen}
        onClose={() => {
          setFormPanelOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
        onSave={handleSaveTask}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        planOptions={planOptions}
        allTasks={data}
      />
    </div>
  )
}