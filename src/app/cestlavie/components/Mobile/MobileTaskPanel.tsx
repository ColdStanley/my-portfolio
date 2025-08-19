'use client'

import { useEffect, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react'
import { TaskRecord, TaskFormData, MobileTaskPanelProps, MobileTaskPanelRef } from '../../types/task'
import { fetchAllTaskData, saveTask, deleteTask } from '../../services/taskService'
import { getDefaultTaskFormData } from '../../utils/taskUtils'
import { TaskErrorBoundary, TaskLoadingSpinner, TaskErrorDisplay, ToastNotification } from '../Life/ErrorBoundary'
import TaskFormPanel from '../Life/TaskFormPanel'
import TaskCalendarView from '../Life/TaskCalendarView'
import MobileTaskCards from './MobileTaskCards'
import { extractDateOnly, getTodayDate, extractTime12Hour } from '@/utils/dateUtils'

const MobileTaskPanel = forwardRef<MobileTaskPanelRef, MobileTaskPanelProps>(({ onTasksUpdate }, ref) => {
  // State management - simplified from useTaskReducer
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [priorityOptions, setPriorityOptions] = useState<string[]>([])
  const [planOptions, setPlanOptions] = useState<any[]>([])
  const [strategyOptions, setStrategyOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formPanelOpen, setFormPanelOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null)
  
  // Filter state
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedQuadrant, setSelectedQuadrant] = useState('all')
  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)

  // Expose openCreateForm method to parent component
  useImperativeHandle(ref, () => ({
    openCreateForm: () => {
      setEditingTask(null)
      setFormPanelOpen(true)
    }
  }), [])

  // Load all data on mount
  useEffect(() => {
    loadAllData()
  }, [])

  // Call onTasksUpdate when tasks change
  useEffect(() => {
    if (onTasksUpdate && tasks.length > 0) {
      onTasksUpdate(tasks)
    }
  }, [tasks, onTasksUpdate])
  
  // Memoized filtered data
  const filteredTasks = useMemo(() => {
    let filtered = tasks
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus)
    }
    
    if (selectedQuadrant !== 'all') {
      filtered = filtered.filter(task => task.priority_quadrant === selectedQuadrant)
    }
    
    return filtered
  }, [tasks, selectedStatus, selectedQuadrant])

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { tasks, plans, strategies, schemaOptions } = await fetchAllTaskData()
      
      setTasks(tasks)
      setStatusOptions(schemaOptions.statusOptions)
      setPriorityOptions(schemaOptions.priorityOptions)
      setPlanOptions(plans)
      setStrategyOptions(strategies)
      
    } catch (err) {
      console.error('Failed to load data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
      
      // Set default values on error
      setStatusOptions(['Not Started', 'In Progress', 'Completed'])
      setPriorityOptions(['Important & Urgent', 'Important & Not Urgent', 'Not Important & Urgent', 'Not Important & Not Urgent'])
      setTasks([])
      setPlanOptions([])
      setStrategyOptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTask = useCallback(async (taskData: TaskFormData) => {
    try {
      const isEditing = !!editingTask
      
      await saveTask(taskData, editingTask?.id)
      
      // Update local state
      if (isEditing) {
        const updatedTask = { ...editingTask!, ...taskData }
        setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task))
      } else {
        // For new tasks, reload to get generated ID
        await loadAllData()
      }

      setFormPanelOpen(false)
      setEditingTask(null)
      setToast({ 
        message: isEditing ? 'Task updated successfully' : 'Task created successfully', 
        type: 'success' 
      })
      
    } catch (err) {
      console.error('Failed to save task:', err)
      setToast({ message: 'Failed to save task', type: 'error' })
    }
  }, [editingTask])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
      setToast({ message: 'Task deleted successfully', type: 'success' })
    } catch (err) {
      console.error('Failed to delete task:', err)
      setToast({ message: 'Failed to delete task', type: 'error' })
    }
  }, [])

  const handleTaskUpdate = useCallback(async (taskId: string, field: 'status' | 'priority_quadrant', value: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      const updatedTask = { ...task, [field]: value }
      await saveTask(updatedTask, taskId)
      
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))
      setToast({ message: `Task ${field} updated successfully`, type: 'success' })
    } catch (err) {
      console.error(`Failed to update task ${field}:`, err)
      setToast({ message: `Failed to update task ${field}`, type: 'error' })
    }
  }, [tasks])

  const openFormPanel = useCallback((task?: TaskRecord) => {
    setEditingTask(task || null)
    setFormPanelOpen(true)
  }, [])

  const closeFormPanel = useCallback(() => {
    setFormPanelOpen(false)
    setEditingTask(null)
  }, [])

  if (loading) {
    return (
      <TaskErrorBoundary>
        <TaskLoadingSpinner />
      </TaskErrorBoundary>
    )
  }

  if (error) {
    return (
      <TaskErrorBoundary>
        <TaskErrorDisplay error={error} onRetry={loadAllData} />
      </TaskErrorBoundary>
    )
  }

  return (
    <TaskErrorBoundary>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg mx-4">
        {/* Mobile Task Cards */}
        <MobileTaskCards
          tasks={filteredTasks}
          selectedDate={selectedDate}
          onTaskClick={openFormPanel}
          onTaskDelete={handleDeleteTask}
          onTaskUpdate={handleTaskUpdate}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
        />

        {/* Task Form Panel */}
        <TaskFormPanel
          isOpen={formPanelOpen}
          onClose={closeFormPanel}
          task={editingTask}
          onSave={handleSaveTask}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          allTasks={tasks}
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
})

MobileTaskPanel.displayName = 'MobileTaskPanel'

export default MobileTaskPanel