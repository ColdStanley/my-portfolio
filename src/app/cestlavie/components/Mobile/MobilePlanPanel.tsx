'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useTaskReducer, TaskRecord } from '../Life/taskReducer'
import { TaskErrorBoundary, TaskLoadingSpinner, TaskErrorDisplay, ToastNotification } from '../Life/ErrorBoundary'
import TaskFormPanel from '../Life/TaskFormPanel'
import TaskListView from '../Life/TaskListView'

interface MobilePlanPanelProps {
  onTasksUpdate?: (tasks: TaskRecord[]) => void
}

export default function MobilePlanPanel({ onTasksUpdate }: MobilePlanPanelProps) {
  const [state, actions] = useTaskReducer()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)
  
  // Memoized filtered data
  const filteredTasks = useMemo(() => {
    let filtered = state.tasks
    
    if (state.selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === state.selectedStatus)
    }
    
    if (state.selectedQuadrant !== 'all') {
      filtered = filtered.filter(task => task.priority_quadrant === state.selectedQuadrant)
    }
    
    if (state.selectedPlanFilter !== 'all') {
      filtered = filtered.filter(task => {
        if (!task.plan || task.plan.length === 0) return state.selectedPlanFilter === 'none'
        return task.plan.includes(state.selectedPlanFilter)
      })
    }
    
    return filtered
  }, [state.tasks, state.selectedStatus, state.selectedQuadrant, state.selectedPlanFilter])

  // Utility functions
  const formatTimeRange = useCallback((start: string, end: string, allDay: boolean) => {
    if (allDay) return 'All Day'
    
    const formatTime = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    }
    
    return `${formatTime(start)} - ${formatTime(end)}`
  }, [])

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'Important & Urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'Important & Not Urgent': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Not Important & Urgent': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Not Important & Not Urgent': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-purple-100 text-purple-800 border-purple-200'
    }
  }, [])

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        actions.setLoading(true)
        actions.setError(null)
        
        const requests = [
          fetch('/api/cestlavie/tasks'),
          fetch('/api/cestlavie/notion-schema'),
          fetch('/api/cestlavie/plans'),
          fetch('/api/cestlavie/strategies')
        ]
        
        const results = await Promise.allSettled(requests)
        const [tasksRes, schemaRes, planRes, strategyRes] = results
        
        let tasks: TaskRecord[] = []
        let statusOptions: string[] = ['Not Started', 'In Progress', 'Completed']
        let priorityOptions: string[] = ['Important & Urgent', 'Important & Not Urgent', 'Not Important & Urgent', 'Not Important & Not Urgent']
        let planOptions: any[] = []
        let strategyOptions: any[] = []
        
        if (tasksRes.status === 'fulfilled' && tasksRes.value.ok) {
          const taskData = await tasksRes.value.json()
          tasks = taskData.data || []
        }
        
        if (schemaRes.status === 'fulfilled' && schemaRes.value.ok) {
          try {
            const schemaData = await schemaRes.value.json()
            const statusProperty = schemaData.data?.properties?.Status
            if (statusProperty?.type === 'select' && statusProperty.select?.options) {
              statusOptions = statusProperty.select.options.map((opt: any) => opt.name)
            }
            
            const priorityProperty = schemaData.data?.properties?.['Priority Quadrant']
            if (priorityProperty?.type === 'select' && priorityProperty.select?.options) {
              priorityOptions = priorityProperty.select.options.map((opt: any) => opt.name)
            }
          } catch (err) {
            console.warn('Failed to parse schema data:', err)
          }
        }
        
        if (planRes.status === 'fulfilled' && planRes.value.ok) {
          try {
            const planResult = await planRes.value.json()
            const rawPlans = planResult.data || []
            planOptions = rawPlans.map((plan: any) => ({
              id: plan.id,
              title: plan.title || 'Untitled Plan'
            }))
          } catch (err) {
            console.warn('Failed to parse plans data:', err)
          }
        }
        
        if (strategyRes.status === 'fulfilled' && strategyRes.value.ok) {
          try {
            const strategyResult = await strategyRes.value.json()
            const rawStrategies = strategyResult.data || []
            strategyOptions = rawStrategies.map((strategy: any) => ({
              id: strategy.id,
              objective: strategy.objective || 'Untitled Strategy'
            }))
          } catch (err) {
            console.warn('Failed to parse strategies data:', err)
          }
        }
        
        actions.setTasks(tasks)
        actions.setStatusOptions(statusOptions)
        actions.setPriorityOptions(priorityOptions)
        actions.setPlanOptions(planOptions)
        actions.setStrategyOptions(strategyOptions)
        
        if (onTasksUpdate) {
          onTasksUpdate(tasks)
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
        actions.setError(error instanceof Error ? error.message : 'Failed to load task data')
        
        actions.setStatusOptions(['Not Started', 'In Progress', 'Completed'])
        actions.setPriorityOptions(['Important & Urgent', 'Important & Not Urgent', 'Not Important & Urgent', 'Not Important & Not Urgent'])
        actions.setTasks([])
        actions.setPlanOptions([])
        
        if (onTasksUpdate) {
          onTasksUpdate([])
        }
        
      } finally {
        actions.setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/cestlavie/tasks/${taskId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        actions.removeTask(taskId)
        setToast({ message: 'Task deleted successfully', type: 'success' })
        
        if (onTasksUpdate) {
          const updatedTasks = state.tasks.filter(t => t.id !== taskId)
          onTasksUpdate(updatedTasks)
        }
      } else {
        throw new Error('Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      setToast({ message: 'Failed to delete task', type: 'error' })
    }
  }, [state.tasks, onTasksUpdate])

  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  // Loading state
  if (state.loading) {
    return (
      <TaskErrorBoundary>
        <TaskLoadingSpinner />
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
      <div className="w-full space-y-4 pb-32">
        {/* Task Cards Only */}
        <div className="mx-4">
          <TaskListView
            tasks={filteredTasks}
            onTaskClick={(task) => actions.openFormPanel(task)}
            onTaskDelete={handleDeleteTask}
            formatTimeRange={formatTimeRange}
            getPriorityColor={getPriorityColor}
            compact={true}
          />
        </div>

        {/* Task Form Panel */}
        <TaskFormPanel
          isOpen={state.formPanelOpen}
          onClose={actions.closeFormPanel}
          editingTask={state.editingTask}
          statusOptions={state.statusOptions}
          priorityOptions={state.priorityOptions}
          planOptions={state.planOptions}
          strategyOptions={state.strategyOptions}
          onTaskCreated={(task) => {
            actions.addTask(task)
            actions.closeFormPanel()
            setToast({ message: 'Task created successfully', type: 'success' })
            
            if (onTasksUpdate) {
              onTasksUpdate([...state.tasks, task])
            }
          }}
          onTaskUpdated={(task) => {
            actions.updateTask(task)
            actions.closeFormPanel()
            setToast({ message: 'Task updated successfully', type: 'success' })
            
            if (onTasksUpdate) {
              const updatedTasks = state.tasks.map(t => t.id === task.id ? task : t)
              onTasksUpdate(updatedTasks)
            }
          }}
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