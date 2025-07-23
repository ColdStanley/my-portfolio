'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useTaskReducer } from './taskReducer'
import { TaskErrorBoundary, TaskLoadingSpinner, TaskErrorDisplay, ToastNotification } from './ErrorBoundary'
import TaskCharts from './TaskCharts'
import TaskFormPanel from './TaskFormPanel'
import TaskCalendarView from './TaskCalendarView'
import TaskListView from './TaskListView'
import TaskCompletionModal from './TaskCompletionModal'
import RenderBlock from '@/components/notion/RenderBlock'
import { getCurrentTorontoTime, extractTimeOnly, extractDateOnly } from '../../utils/timezone'

interface TaskFormData {
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
  plan: string[]
  priority_quadrant: string
  note: string
  budget_time: number
}

// Utility functions - moved outside component to prevent recreation


const hasTimeConflicts = (task: any, allTasks: any[]): boolean => {
  if (!task.start_date || !task.end_date) return false
  
  // Extract date part from task date string with timezone
  const newTaskDateStr = extractDateOnly(task.start_date)
  
  const conflicts = allTasks.filter(t => {
    if (t.id === task.id) return false
    if (!t.start_date || !t.end_date) return false
    
    // Extract date part from existing task with timezone
    const taskDateStr = extractDateOnly(t.start_date)
    if (taskDateStr !== newTaskDateStr) return false
    
    // Check time overlap using Toronto timezone parsing
    const startTime1 = new Date(task.start_date.replace(/-04:00$/, '')).getTime()
    const endTime1 = new Date(task.end_date.replace(/-04:00$/, '')).getTime()
    const startTime2 = new Date(t.start_date.replace(/-04:00$/, '')).getTime()
    const endTime2 = new Date(t.end_date.replace(/-04:00$/, '')).getTime()
    
    return startTime1 < endTime2 && startTime2 < endTime1
  })
  
  return conflicts.length > 0
}

export default function TaskPanelOptimized() {
  const [state, actions] = useTaskReducer()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)
  
  // Memoized filtered data to prevent unnecessary recalculations
  const filteredTasks = useMemo(() => {
    let filtered = state.tasks
    
    // Filter by status
    if (state.selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === state.selectedStatus)
    }
    
    // Filter by quadrant
    if (state.selectedQuadrant !== 'all') {
      filtered = filtered.filter(task => task.priority_quadrant === state.selectedQuadrant)
    }
    
    // Filter by plan
    if (state.selectedPlanFilter !== 'all') {
      filtered = filtered.filter(task => {
        if (!task.plan || task.plan.length === 0) return state.selectedPlanFilter === 'none'
        return task.plan.includes(state.selectedPlanFilter)
      })
    }
    
    return filtered
  }, [state.tasks, state.selectedStatus, state.selectedQuadrant, state.selectedPlanFilter])

  // Memoized week and month tasks
  const thisWeekTasks = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    return filteredTasks.filter(task => {
      if (!task.start_date) return false
      // Parse date from Toronto timezone string 
      const datePart = extractDateOnly(task.start_date)
      const [year, month, day] = datePart.split('-').map(Number)
      const taskDateOnly = new Date(year, month - 1, day)
      return taskDateOnly >= monday && taskDateOnly <= sunday
    }).sort((a, b) => {
      return a.start_date.localeCompare(b.start_date)
    })
  }, [filteredTasks])

  const thisMonthTasks = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    return filteredTasks.filter(task => {
      if (!task.start_date) return false
      // Parse date from Toronto timezone string
      const datePart = extractDateOnly(task.start_date)
      const [year, month, day] = datePart.split('-').map(Number)
      const taskDateOnly = new Date(year, month - 1, day)
      return taskDateOnly >= firstDayOfMonth && taskDateOnly <= lastDayOfMonth
    }).sort((a, b) => {
      return a.start_date.localeCompare(b.start_date)
    })
  }, [filteredTasks])

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        actions.setLoading(true)
        actions.setError(null)
        
        // Add timeout to prevent hanging requests
        const fetchWithTimeout = (url: string, timeout = 10000) => {
          return Promise.race([
            fetch(url),
            new Promise<Response>((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ])
        }
        
        // Fetch data with error handling and fallbacks
        const [tasksRes, schemaRes, planRes] = await Promise.allSettled([
          fetchWithTimeout('/api/tasks'),
          fetchWithTimeout('/api/tasks?action=schema'),
          fetchWithTimeout('/api/plan')
        ])
        
        // Handle tasks data
        let tasks: any[] = []
        if (tasksRes.status === 'fulfilled' && tasksRes.value.ok) {
          try {
            const tasksResult = await tasksRes.value.json()
            tasks = tasksResult.data || []
          } catch (err) {
            console.warn('Failed to parse tasks data:', err)
          }
        } else {
          console.warn('Failed to fetch tasks:', tasksRes.status === 'rejected' ? tasksRes.reason : 'Request failed')
        }
        
        // Handle schema data with fallbacks
        let statusOptions: string[] = ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled']
        let priorityOptions: string[] = ['Important & Urgent', 'Important & Not Urgent', 'Not Important & Urgent', 'Not Important & Not Urgent']
        
        if (schemaRes.status === 'fulfilled' && schemaRes.value.ok) {
          try {
            const schemaResult = await schemaRes.value.json()
            const schema = schemaResult.schema || {}
            if (schema.statusOptions && schema.statusOptions.length > 0) {
              statusOptions = schema.statusOptions
            }
            if (schema.priorityOptions && schema.priorityOptions.length > 0) {
              priorityOptions = schema.priorityOptions
            }
          } catch (err) {
            console.warn('Failed to parse schema data, using defaults:', err)
          }
        } else {
          console.warn('Failed to fetch schema, using default options:', schemaRes.status === 'rejected' ? schemaRes.reason : 'Request failed')
        }
        
        // Handle plans data
        let planOptions: any[] = []
        if (planRes.status === 'fulfilled' && planRes.value.ok) {
          try {
            const planResult = await planRes.value.json()
            const rawPlans = planResult.data || []
            // Map plan data to ensure consistent field naming
            planOptions = rawPlans.map((plan: any) => ({
              id: plan.id,
              title: plan.objective || 'Untitled Plan',
              budget_money: plan.budget_money || 0,
              budget_time: plan.budget_time || 0
            }))
          } catch (err) {
            console.warn('Failed to parse plans data:', err)
          }
        } else {
          console.warn('Failed to fetch plans:', planRes.status === 'rejected' ? planRes.reason : 'Request failed')
        }
        
        // Set data even if some requests failed
        actions.setTasks(tasks)
        actions.setStatusOptions(statusOptions)
        actions.setPriorityOptions(priorityOptions)
        actions.setPlanOptions(planOptions)
        
        // Show warning if some data is missing but don't block the UI
        const failedRequests = [tasksRes, schemaRes, planRes].filter(res => res.status === 'rejected').length
        if (failedRequests > 0) {
          setToast({ 
            message: `${failedRequests} data source(s) failed to load. Some features may be limited.`, 
            type: 'warning' 
          })
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
        actions.setError(error instanceof Error ? error.message : 'Failed to load task data')
        
        // Set fallback data to prevent completely broken UI
        actions.setStatusOptions(['Not Started', 'In Progress', 'Completed'])
        actions.setPriorityOptions(['Important & Urgent', 'Important & Not Urgent', 'Not Important & Urgent', 'Not Important & Not Urgent'])
        actions.setTasks([])
        actions.setPlanOptions([])
        
      } finally {
        actions.setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Task execution operations
  const handleTaskStart = useCallback(async (task: any) => {
    try {
      const updatedTask = {
        ...task,
        actual_start: getCurrentTorontoTime(),
        status: 'In Progress'
      }
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      })
      
      if (!response.ok) {
        throw new Error('Failed to start task')
      }
      
      actions.updateTask(updatedTask)
      setToast({ message: 'Task started successfully', type: 'success' })
      
    } catch (error) {
      console.error('Error starting task:', error)
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to start task', 
        type: 'error' 
      })
    }
  }, [actions])

  const handleTaskEnd = useCallback(async (task: any) => {
    try {
      const updatedTask = {
        ...task,
        actual_end: getCurrentTorontoTime(),
        status: 'Completed'
      }
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      })
      
      if (!response.ok) {
        throw new Error('Failed to end task')
      }
      
      actions.updateTask(updatedTask)
      setToast({ message: 'Task completed successfully', type: 'success' })
      
    } catch (error) {
      console.error('Error ending task:', error)
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to end task', 
        type: 'error' 
      })
    }
  }, [actions])

  // Task CRUD operations
  const handleSaveTask = useCallback(async (formData: TaskFormData) => {
    try {
      const taskData = {
        ...formData
      }
      
      const isEditing = !!state.editingTask
      
      // For editing tasks, we need to add the id to the data
      if (isEditing) {
        taskData.id = state.editingTask!.id
      }
      
      const url = '/api/tasks'
      
      const response = await fetch(url, {
        method: 'POST', // Both create and update use POST
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} task`)
      }
      
      const result = await response.json()
      
      if (isEditing) {
        // For updates, we need to refresh the task data or construct it
        const updatedTask = { ...state.editingTask, ...taskData, id: state.editingTask!.id }
        actions.updateTask(updatedTask)
        setToast({ message: 'Task updated successfully', type: 'success' })
      } else {
        // For new tasks, construct the task object with the returned ID
        const newTask = { ...taskData, id: result.id }
        actions.addTask(newTask)
        setToast({ message: 'Task created successfully', type: 'success' })
      }
      
      actions.closeFormPanel()
      
      // Optionally refresh data in the background without blocking UI
      setTimeout(() => {
        fetch('/api/tasks')
          .then(res => res.json())
          .then(result => {
            const tasks = result.data || []
            actions.setTasks(tasks)
          })
          .catch(err => console.warn('Background refresh failed:', err))
      }, 500)
      
    } catch (error) {
      console.error('Error saving task:', error)
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to save task', 
        type: 'error' 
      })
    }
  }, [state.editingTask, actions])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete task')
      }
      
      actions.deleteTask(taskId)
      setToast({ message: 'Task deleted successfully', type: 'success' })
      
    } catch (error) {
      console.error('Error deleting task:', error)
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to delete task', 
        type: 'error' 
      })
    }
  }, [actions])

  // Refresh data
  const handleRefresh = useCallback(async () => {
    try {
      actions.setRefreshing(true)
      const response = await fetch('/api/tasks')
      
      if (!response.ok) {
        throw new Error('Failed to refresh tasks')
      }
      
      const result = await response.json()
      const tasks = result.data || []
      actions.setTasks(tasks)
      setToast({ message: 'Tasks refreshed successfully', type: 'success' })
      
    } catch (error) {
      console.error('Error refreshing tasks:', error)
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to refresh tasks', 
        type: 'error' 
      })
    } finally {
      actions.setRefreshing(false)
    }
  }, [actions])

  // Format helper functions

  const getPriorityColor = useCallback((priority: string) => {
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
  }, [])

  const formatTimeRange = useCallback((startDate: string, endDate?: string) => {
    if (!startDate) return ''
    
    // Extract date and time from Toronto timezone string
    const datePart = extractDateOnly(startDate)
    const startTime = extractTimeOnly(startDate)
    
    // Parse date for weekday (this is safe as it's just date, no time)
    const [year, month, day] = datePart.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day) // Local date object
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weekday = weekdays[dateObj.getDay()]
    
    const dateStr = `${month}/${day}`
    
    if (!endDate) {
      return `${dateStr} ${weekday} ${startTime}`
    }
    
    const endTime = extractTimeOnly(endDate)
    
    // Since we don't support cross-day tasks, always same day
    return `${dateStr} ${weekday} ${startTime} - ${endTime}`
  }, [])

  // Loading state
  if (state.loading) {
    return (
      <TaskErrorBoundary>
        <TaskLoadingSpinner message="Loading tasks..." />
      </TaskErrorBoundary>
    )
  }

  // Error state
  if (state.error) {
    return (
      <TaskErrorBoundary>
        <TaskErrorDisplay error={state.error} onRetry={handleRefresh} />
      </TaskErrorBoundary>
    )
  }

  return (
    <TaskErrorBoundary>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-purple-900">Task Management</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={state.refreshing}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {state.refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Charts Section */}
        <TaskCharts tasks={filteredTasks} planOptions={state.planOptions} />

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Status Filter</label>
            <select
              value={state.selectedStatus}
              onChange={(e) => actions.setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              {state.statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Priority Filter</label>
            <select
              value={state.selectedQuadrant}
              onChange={(e) => actions.setSelectedQuadrant(e.target.value)}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Priorities</option>
              {state.priorityOptions.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Plan Filter</label>
            <select
              value={state.selectedPlanFilter}
              onChange={(e) => actions.setSelectedPlanFilter(e.target.value)}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Plans</option>
              <option value="none">No Plan</option>
              {state.planOptions.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content Layout - Task-Centric Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task List (Main Hero) */}
          <div className="lg:col-span-2">
            <TaskListView
              tasks={filteredTasks}
              selectedDate={state.selectedDate}
              onTaskClick={(task) => actions.openFormPanel(task)}
              onTaskDelete={handleDeleteTask}
              onTaskComplete={(task) => actions.openCompletionModal(task)}
              onTaskStart={handleTaskStart}
              onTaskEnd={handleTaskEnd}
              onCreateTask={(date) => {
                actions.setSelectedDate(date)
                actions.openFormPanel()
              }}
              formatTimeRange={formatTimeRange}
              getPriorityColor={getPriorityColor}
              hasTimeConflicts={(task) => hasTimeConflicts(task, state.tasks)}
            />
          </div>

          {/* Right Column - Calendar & Stats */}
          <div className="space-y-6">
            {/* Compact Calendar */}
            <div className="bg-white rounded-lg border border-purple-200">
              <div className="p-4 border-b border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900">Calendar Overview</h3>
                <p className="text-sm text-purple-600">Select date to view tasks</p>
              </div>
              <TaskCalendarView
                tasks={filteredTasks}
                currentMonth={state.currentMonth}
                selectedDate={state.selectedDate}
                onDateSelect={actions.setSelectedDate}
                onMonthChange={actions.setCurrentMonth}
                selectedPlanFilter={state.selectedPlanFilter}
                onTaskClick={(task) => actions.openFormPanel(task)}
                onTaskDelete={handleDeleteTask}
                formatTimeRange={formatTimeRange}
                getPriorityColor={getPriorityColor}
                hasTimeConflicts={(task) => hasTimeConflicts(task, state.tasks)}
                compact={true}
              />
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-purple-200 p-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Today's Tasks</span>
                  <span className="font-semibold text-purple-900">
                    {filteredTasks.filter(task => {
                      if (!task.start_date) return false
                      const taskDate = extractDateOnly(task.start_date)
                      const today = new Date().toISOString().split('T')[0]
                      return taskDate === today
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="font-semibold text-purple-900">{thisWeekTasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold text-purple-900">{thisMonthTasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-purple-600">
                    {filteredTasks.filter(task => task.status === 'Completed').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Form Panel */}
        <TaskFormPanel
          isOpen={state.formPanelOpen}
          onClose={actions.closeFormPanel}
          task={state.editingTask}
          onSave={handleSaveTask}
          statusOptions={state.statusOptions}
          priorityOptions={state.priorityOptions}
          planOptions={state.planOptions}
          allTasks={state.tasks}
        />

        {/* Task Completion Modal */}
        <TaskCompletionModal
          isOpen={state.completionModal.isOpen}
          onClose={actions.closeCompletionModal}
          task={state.completionModal.task}
        />

        {/* Toast Notification */}
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </TaskErrorBoundary>
  )
}