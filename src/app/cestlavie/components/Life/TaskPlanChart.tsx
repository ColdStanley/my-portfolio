'use client'

import { TaskRecord, PlanOption } from '../../types/task'

interface TaskPlanChartProps {
  tasks: TaskRecord[]
  planOptions: PlanOption[]
}

export default function TaskPlanChart({ tasks, planOptions }: TaskPlanChartProps) {
  const planCounts = tasks.reduce((acc, task) => {
    const planId = task.plan?.[0] || 'No Plan'
    const planName = planId === 'No Plan' ? 'No Plan' : 
      planOptions.find(p => p.id === planId)?.objective || 'Unknown Plan'
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
      {/* Legend - each plan on its own line */}
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