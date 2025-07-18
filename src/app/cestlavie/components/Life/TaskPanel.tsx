'use client'

import { useEffect, useState } from 'react'
import { useOutlookAuth } from '@/hooks/useOutlookAuth'

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
}

interface PlanOption {
  id: string
  title: string
}

interface TaskFormPanelProps {
  isOpen: boolean
  onClose: () => void
  task?: TaskRecord | null
  onSave: (task: TaskFormData) => void
  statusOptions: string[]
  priorityOptions: string[]
  planOptions: PlanOption[]
}

function TaskFormPanel({ isOpen, onClose, task, onSave, statusOptions, priorityOptions, planOptions }: TaskFormPanelProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    status: '',
    start_date: '',
    end_date: '',
    all_day: false,
    remind_before: 15,
    plan: [],
    priority_quadrant: '',
    note: ''
  })

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
        note: task.note || ''
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
        note: ''
      })
    }
  }, [task, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-purple-200 flex flex-col">
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
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Related Plan (关联计划) *</label>
          <select
            value={formData.plan[0] || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              plan: e.target.value ? [e.target.value] : [] 
            }))}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Select a Plan First</option>
            {planOptions.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.title}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">每个任务必须归属于一个计划</p>
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
  
  // 计时器相关状态
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())
  const [updatingTimer, setUpdatingTimer] = useState<string | null>(null)
  
  // 日历相关状态
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const { isAuthenticated, authenticate, addToCalendar } = useOutlookAuth()

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
    return data.filter(task => {
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
          title: p.objective || 'Untitled Plan'
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
      case '重要不紧急': return 'bg-yellow-100 text-yellow-800'
      case '不重要但紧急': return 'bg-orange-100 text-orange-800'
      case '不重要不紧急': return 'bg-gray-100 text-gray-800'
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
    <div className="w-full py-8 space-y-6">
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
      <div className="grid grid-cols-12 gap-6">
        {/* 左侧日历 */}
        <div className="col-span-5">
          {/* Refresh按钮与日历右对齐 */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-md hover:bg-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              <div className={`${refreshing ? 'animate-spin' : ''}`}>
                {refreshing ? '⟳' : '↻'}
              </div>
              <span className="whitespace-nowrap">Refresh</span>
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
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
                      relative p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105
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

            {/* 今日信息 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                选择日期: <span className="font-medium text-purple-700">
                  {new Date(selectedDate).toLocaleDateString('zh-CN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedDateTasks.length} 个任务
              </p>
            </div>
          </div>
        </div>

        {/* 右侧任务列表 */}
        <div className="col-span-7">
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
          <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
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
                          {/* 紧凑的头部 - 时间范围突出显示 */}
                          <div className="flex items-start gap-3">
                            {/* 时间范围显示 */}
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
                            
                            {/* 任务信息 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-purple-900 truncate">
                                  {task.title || 'Untitled Task'}
                                </h4>
                                
                                {/* 计时器按钮 */}
                                <button
                                  onClick={() => handleStartStopTimer(task)}
                                  disabled={isUpdating}
                                  className={`ml-2 px-2 py-1 text-xs rounded-full border transition-all duration-200 ${
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
                              </div>
                              
                              {/* 计划归属显示 */}
                              {getPlanTitle(task.plan) && (
                                <div className="text-xs text-purple-600 mb-1">
                                  📋 {getPlanTitle(task.plan)}
                                </div>
                              )}
                              
                              {/* 紧凑的元信息行 - 内联显示 */}
                              <div className="flex items-center gap-2 mt-1 text-xs">
                                {task.status && (
                                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                                    {task.status}
                                  </span>
                                )}
                                {task.priority_quadrant && (
                                  <span className={`px-1.5 py-0.5 rounded ${getQuadrantColor(task.priority_quadrant)}`}>
                                    {task.priority_quadrant}
                                  </span>
                                )}
                                {task.budget_time > 0 && (
                                  <span className="text-purple-700 font-medium">
                                    预算: {task.budget_time}h
                                  </span>
                                )}
                                {task.actual_time > 0 && (
                                  <span className="text-purple-700 font-medium">
                                    实际: {task.actual_time}h
                                  </span>
                                )}
                                
                                {/* API/Web 按钮内联显示 */}
                                <div className="flex gap-1 ml-auto">
                                  <button
                                    onClick={() => handleAddToOutlook(task)}
                                    disabled={addingToCalendar === task.id}
                                    className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100 transition-all duration-200 disabled:opacity-50"
                                    title={isAuthenticated ? "Add to Outlook Calendar via API" : "Connect to Outlook first"}
                                  >
                                    {addingToCalendar === task.id ? (
                                      <div className="animate-spin rounded-full h-2 w-2 border-b border-purple-600"></div>
                                    ) : (
                                      'API'
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleAddToOutlookWeb(task)}
                                    className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100 transition-all duration-200"
                                    title="Add to Outlook Calendar via web interface"
                                  >
                                    Web
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingTask(task)
                                      setFormPanelOpen(true)
                                    }}
                                    className="px-1.5 py-0.5 text-purple-600 hover:text-white hover:bg-purple-600 text-xs rounded transition-all duration-200 border border-purple-200 hover:border-purple-600"
                                    title="Edit this task"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="px-1.5 py-0.5 text-red-600 hover:text-white hover:bg-red-600 text-xs rounded transition-all duration-200 border border-red-200 hover:border-red-600"
                                    title="Delete this task"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                              
                              {/* 时间显示 */}
                              <TimeDisplay task={task} />
                              
                              {/* 简化的备注 */}
                              {task.note && (
                                <p className="text-xs text-gray-600 mt-1 overflow-hidden" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical'
                                }}>
                                  {task.note}
                                </p>
                              )}
                              
                              {/* 实际运行时间显示 */}
                              {(task.actual_start || task.actual_end) && (
                                <div className="text-xs text-purple-700 mt-1 font-mono">
                                  实际: {task.actual_start ? formatDateTime(task.actual_start).split(' ')[1] : '--:--'} - 
                                  {task.actual_end ? formatDateTime(task.actual_end).split(' ')[1] : (isRunning ? '进行中' : '--:--')}
                                </div>
                              )}
                            </div>
                          </div>
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
      />
    </div>
  )
}