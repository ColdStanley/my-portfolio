'use client'

import { useEffect, useState } from 'react'
import { useOutlookAuth } from '@/hooks/useOutlookAuth'
import TaskCompletionModal from './TaskCompletionModal'

// Type imports
import { TaskRecord, TaskFormData, PlanOption } from '../../types/task'

// Service imports
import { fetchAllTaskData, saveTask, deleteTask } from '../../services/taskService'

// Utility imports
import { getDefaultTaskFormData, formatDateTime } from '../../utils/taskUtils'

// Component imports
import TaskProgressChart from './TaskProgressChart'
import TaskPlanChart from './TaskPlanChart'
import TaskQuadrantChart from './TaskQuadrantChart'

// UTC conversion functions (keep these as they're specific to this component)
function convertToUTCForNotion(localDateTime: string): string {
  if (!localDateTime) return ''
  try {
    const localDate = new Date(localDateTime)
    return localDate.toISOString()
  } catch (error) {
    console.error('Error converting to UTC:', error)
    return localDateTime
  }
}

function convertFromUTCForDisplay(utcDateTime: string): string {
  if (!utcDateTime) return ''
  try {
    const utcDate = new Date(utcDateTime)
    const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000))
    return localDate.toISOString().slice(0, 16)
  } catch (error) {
    console.error('Error converting from UTC:', error)
    return utcDateTime
  }
}

function isTaskRunning(task: TaskRecord): boolean {
  return !!(task.actual_start && !task.actual_end)
}

// Simplified TaskFormPanel component
function TaskFormPanel({ 
  isOpen, 
  onClose, 
  task, 
  onSave, 
  statusOptions, 
  priorityOptions, 
  planOptions 
}: {
  isOpen: boolean
  onClose: () => void
  task?: TaskRecord | null
  onSave: (task: TaskFormData) => void
  statusOptions: string[]
  priorityOptions: string[]
  planOptions: PlanOption[]
}) {
  const [formData, setFormData] = useState<TaskFormData>(getDefaultTaskFormData())

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        status: task.status || '',
        start_date: convertFromUTCForDisplay(task.start_date || ''),
        end_date: convertFromUTCForDisplay(task.end_date || ''),
        all_day: task.all_day || false,
        remind_before: task.remind_before,
        plan: task.plan || [],
        strategy: task.strategy || [],
        priority_quadrant: task.priority_quadrant || '',
        note: task.note || ''
      })
    } else {
      setFormData(getDefaultTaskFormData())
    }
  }, [task, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-purple-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Status</option>
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority_quadrant}
                  onChange={(e) => setFormData({ ...formData, priority_quadrant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Priority</option>
                  {priorityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-24 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium whitespace-nowrap"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function TaskPanel() {
  const [data, setData] = useState<TaskRecord[]>([])
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [priorityOptions, setPriorityOptions] = useState<string[]>([])
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Form state
  const [formPanelOpen, setFormPanelOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null)

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedQuadrant, setSelectedQuadrant] = useState('all')

  // Completion modal
  const [completionModal, setCompletionModal] = useState<{
    isOpen: boolean
    task: TaskRecord | null
  }>({ isOpen: false, task: null })

  const { addToCalendar, isAuthenticated, authenticate } = useOutlookAuth()

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { tasks, plans, schemaOptions } = await fetchAllTaskData()
      
      setData(tasks)
      setStatusOptions(schemaOptions.statusOptions)
      setPriorityOptions(schemaOptions.priorityOptions)
      
      // Convert plans to PlanOption format
      const planOptions = plans.map((plan: any) => ({
        id: plan.id,
        objective: plan.objective || 'Untitled Plan'
      }))
      setPlanOptions(planOptions)
      
    } catch (err) {
      console.error('Failed to load data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
  }

  const handleSaveTask = async (taskData: TaskFormData) => {
    try {
      // Convert times to UTC for API
      const utcTaskData = {
        ...taskData,
        start_date: taskData.start_date ? convertToUTCForNotion(taskData.start_date) : '',
        end_date: taskData.end_date ? convertToUTCForNotion(taskData.end_date) : ''
      }
      
      await saveTask(utcTaskData, editingTask?.id)
      
      setFormPanelOpen(false)
      setEditingTask(null)
      loadAllData() // Refresh data
    } catch (err) {
      console.error('Failed to save task:', err)
      setError(err instanceof Error ? err.message : 'Failed to save task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask(taskId)
      loadAllData() // Refresh data
    } catch (err) {
      console.error('Failed to delete task:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  // Filter tasks based on selected filters
  const filteredTasks = data.filter(task => {
    if (selectedStatus !== 'all' && task.status !== selectedStatus) return false
    if (selectedQuadrant !== 'all' && task.priority_quadrant !== selectedQuadrant) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    )
  }

  return (
    <>
      {/* Control Bar */}
      <div className="fixed top-20 right-4 flex items-center gap-4 z-40">
        {/* Refresh Button */}
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

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-white border border-purple-200 rounded-md text-sm text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-300 transition-all duration-200"
        >
          <option value="all">All Status</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={selectedQuadrant}
          onChange={(e) => setSelectedQuadrant(e.target.value)}
          className="px-3 py-2 bg-white border border-purple-200 rounded-md text-sm text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-300 transition-all duration-200"
        >
          <option value="all">All Priorities</option>
          {priorityOptions.map(priority => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>

        {/* New Task Button */}
        <button
          onClick={() => {
            setEditingTask(null)
            setFormPanelOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
        >
          <span>✅</span>
          <span>New Task</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="fixed top-32 left-[68px] right-4 bottom-4 overflow-y-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4">
            <TaskProgressChart tasks={filteredTasks} />
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4">
            <TaskPlanChart tasks={filteredTasks} planOptions={planOptions} />
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4">
            <TaskQuadrantChart tasks={filteredTasks} />
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">
              Tasks ({filteredTasks.length})
            </h3>
            
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tasks found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4 transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-900 mb-1">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                          <span>{task.priority_quadrant}</span>
                          <span>{formatDateTime(task.start_date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingTask(task)
                            setFormPanelOpen(true)
                          }}
                          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Form Panel */}
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

      {/* Completion Modal */}
      <TaskCompletionModal
        isOpen={completionModal.isOpen}
        task={completionModal.task}
        onClose={() => setCompletionModal({ isOpen: false, task: null })}
        onComplete={() => {
          setCompletionModal({ isOpen: false, task: null })
          loadAllData()
        }}
      />
    </>
  )
}