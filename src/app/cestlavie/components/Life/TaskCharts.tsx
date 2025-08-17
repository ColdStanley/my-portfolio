'use client'

import { useMemo } from 'react'
import PhotoUpload from './PhotoUpload'

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
}

interface PlanOption {
  id: string
  title: string
}

interface TaskChartsProps {
  tasks: TaskRecord[]
  planOptions: PlanOption[]
}

// Task Progress Distribution Chart Component
function TaskProgressChart({ tasks }: { tasks: TaskRecord[] }) {
  const chartData = useMemo(() => {
    if (tasks.length === 0) return null

    const completedTasks = tasks.filter(task => task.status === 'Completed').length
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length
    const notStartedTasks = tasks.filter(task => task.status === 'Not Started').length
    const otherTasks = tasks.length - completedTasks - inProgressTasks - notStartedTasks

    const total = tasks.length
    const completedPercentage = (completedTasks / total) * 100
    const inProgressPercentage = (inProgressTasks / total) * 100
    const notStartedPercentage = (notStartedTasks / total) * 100
    const otherPercentage = (otherTasks / total) * 100

    const statusColors = {
      'Completed': '#10b981',
      'In Progress': '#f59e0b',
      'Not Started': '#6b7280',
      'Other': '#a1a1aa'
    }

    return {
      statusData: [
        { name: 'Completed', count: completedTasks, percentage: completedPercentage, color: statusColors['Completed'] },
        { name: 'In Progress', count: inProgressTasks, percentage: inProgressPercentage, color: statusColors['In Progress'] },
        { name: 'Not Started', count: notStartedTasks, percentage: notStartedPercentage, color: statusColors['Not Started'] },
        { name: 'Other', count: otherTasks, percentage: otherPercentage, color: statusColors['Other'] }
      ].filter(item => item.count > 0),
      completedPercentage
    }
  }, [tasks])

  if (!chartData) return null

  return (
    <div>
      <h4 className="text-xs font-medium text-purple-700 mb-2">Progress Distribution</h4>
      <div className="flex items-center gap-3">
        {/* Progress bar */}
        <div className="flex-1">
          <div className="flex h-3 bg-gray-100 rounded-full overflow-hidden">
            {chartData.statusData.map((status) => (
              <div
                key={status.name}
                className="h-full"
                style={{
                  width: `${status.percentage}%`,
                  backgroundColor: status.color
                }}
                title={`${status.name}: ${status.count} tasks (${status.percentage.toFixed(1)}%)`}
              />
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {chartData.completedPercentage.toFixed(0)}%
        </div>
      </div>
      {/* Legend */}
      <div className="mt-2 space-y-1">
        {chartData.statusData.map((status) => (
          <div key={status.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-xs text-gray-600 flex-1" title={status.name}>
              {status.name}
            </span>
            <span className="text-xs text-gray-400 font-medium">({status.count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Task Plan Distribution Chart Component
function TaskPlanChart({ tasks, planOptions }: { tasks: TaskRecord[], planOptions: PlanOption[] }) {
  const chartData = useMemo(() => {
    const planCounts = tasks.reduce((acc, task) => {
      const planId = task.plan?.[0] || 'No Plan'
      const planName = planId === 'No Plan' ? 'No Plan' : 
        planOptions.find(p => p.id === planId)?.title || 'Unknown Plan'
      acc[planName] = (acc[planName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Color scheme for better differentiation
    const colors = [
      '#8b5cf6',
      '#06b6d4',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#ec4899',
      '#6366f1',
      '#84cc16'
    ]

    const entries = Object.entries(planCounts)
    const total = tasks.length

    return { entries, total, colors }
  }, [tasks, planOptions])

  if (chartData.entries.length === 0) return null

  return (
    <div>
      <h4 className="text-xs font-medium text-purple-700 mb-2">Plans Distribution</h4>
      <div className="flex items-center gap-3">
        {/* Simple visual bars instead of pie chart for better mobile display */}
        <div className="flex-1">
          <div className="flex h-3 bg-gray-100 rounded-full overflow-hidden">
            {chartData.entries.map(([planName, count], index) => {
              const percentage = (count / chartData.total) * 100
              return (
                <div
                  key={planName}
                  className="h-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: chartData.colors[index % chartData.colors.length]
                  }}
                  title={`${planName}: ${count} tasks (${percentage.toFixed(1)}%)`}
                />
              )
            })}
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono">{chartData.total}</div>
      </div>
      {/* Legend - each plan on its own line */}
      <div className="mt-2 space-y-1">
        {chartData.entries.map(([planName, count], index) => (
          <div key={planName} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: chartData.colors[index % chartData.colors.length] }}
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


export default function TaskCharts({ tasks, planOptions }: TaskChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-purple-200">
        <TaskProgressChart tasks={tasks} />
      </div>
      <div className="bg-white p-4 rounded-lg border border-purple-200">
        <TaskPlanChart tasks={tasks} planOptions={planOptions} />
      </div>
      <div className="bg-white p-4 rounded-lg border border-purple-200">
        <PhotoUpload />
      </div>
    </div>
  )
}