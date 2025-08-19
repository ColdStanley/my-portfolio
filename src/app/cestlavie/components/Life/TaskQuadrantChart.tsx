'use client'

import { TaskRecord } from '../../types/task'

interface TaskQuadrantChartProps {
  tasks: TaskRecord[]
}

export default function TaskQuadrantChart({ tasks }: TaskQuadrantChartProps) {
  const quadrantCounts = tasks.reduce((acc, task) => {
    const quadrant = task.priority_quadrant || 'No Priority'
    acc[quadrant] = (acc[quadrant] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const quadrantColors: Record<string, string> = {
    'Important & Urgent': '#dc2626',
    'Important & Not Urgent': '#f97316',
    'Not Important & Urgent': '#eab308', 
    'Not Important & Not Urgent': '#6b7280',
    'No Priority': '#a1a1aa'
  }

  // Define simplified labels for better display
  const getQuadrantLabel = (quadrant: string) => {
    switch (quadrant) {
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
      {/* Legend - each priority on its own line */}
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