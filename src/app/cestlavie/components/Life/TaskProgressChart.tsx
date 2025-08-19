'use client'

import { TaskRecord } from '../../types/task'

interface TaskProgressChartProps {
  tasks: TaskRecord[]
}

export default function TaskProgressChart({ tasks }: TaskProgressChartProps) {
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

  const statusData = [
    { name: 'Completed', count: completedTasks, percentage: completedPercentage, color: statusColors['Completed'] },
    { name: 'In Progress', count: inProgressTasks, percentage: inProgressPercentage, color: statusColors['In Progress'] },
    { name: 'Not Started', count: notStartedTasks, percentage: notStartedPercentage, color: statusColors['Not Started'] },
    { name: 'Other', count: otherTasks, percentage: otherPercentage, color: statusColors['Other'] }
  ].filter(item => item.count > 0)

  return (
    <div>
      <h4 className="text-xs font-medium text-purple-700 mb-2">Progress Distribution</h4>
      <div className="flex items-center gap-3">
        {/* Progress bar */}
        <div className="flex-1">
          <div className="flex h-3 bg-gray-100 rounded-full overflow-hidden">
            {statusData.map((status) => (
              <div
                key={status.name}
                className="h-full"
                style={{
                  width: `${status.percentage}%`,
                  backgroundColor: status.color
                }}
                title={`${status.name}: ${status.count} (${status.percentage.toFixed(1)}%)`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1 text-xs">
          {statusData.map((status) => (
            <div key={status.name} className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: status.color }}
              />
              <span className="text-gray-600">
                {status.name}: {status.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}