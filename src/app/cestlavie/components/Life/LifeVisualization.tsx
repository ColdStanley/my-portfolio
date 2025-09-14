'use client'

import { useState, useMemo, useCallback } from 'react'
import { TaskRecord } from '../../types/task'
import { StrategyRecord } from '../../types/strategy'
import { PlanRecord } from '../../types/plan'

interface LifeVisualizationProps {
  strategies: StrategyRecord[]
  plans: PlanRecord[]
  tasks: TaskRecord[]
  onStrategySelect?: (strategyId: string) => void
  onPlanSelect?: (planId: string) => void
  onTaskSelect?: (taskId: string) => void
  onActionSelect?: (action: 'add' | 'edit' | 'delete', type: 'strategy' | 'plan' | 'task', id?: string) => void
  selectedStrategyId?: string | null
  selectedPlanId?: string | null
}

// Treemap calculation for rectangles
function calculateTreemap(items: Array<{ id: string; value: number; name: string }>, width: number, height: number) {
  if (!items.length) return []
  
  const totalValue = items.reduce((sum, item) => sum + item.value, 0)
  if (totalValue === 0) return []
  
  const areas = items.map(item => ({
    ...item,
    area: (item.value / totalValue) * width * height
  }))
  
  // Simple row-based treemap layout
  const rectangles: Array<{
    id: string
    name: string
    value: number
    x: number
    y: number
    width: number
    height: number
  }> = []
  
  let currentY = 0
  let remainingHeight = height
  let remainingItems = [...areas]
  
  while (remainingItems.length > 0) {
    const rowItems = remainingItems.splice(0, Math.min(3, remainingItems.length))
    const rowArea = rowItems.reduce((sum, item) => sum + item.area, 0)
    const rowHeight = Math.min(rowArea / width, remainingHeight)
    
    let currentX = 0
    rowItems.forEach(item => {
      const itemWidth = (item.area / rowArea) * width
      rectangles.push({
        id: item.id,
        name: item.name,
        value: item.value,
        x: currentX,
        y: currentY,
        width: itemWidth,
        height: rowHeight
      })
      currentX += itemWidth
    })
    
    currentY += rowHeight
    remainingHeight -= rowHeight
  }
  
  return rectangles
}

// Bubble chart calculation
function calculateBubbles(items: Array<{ id: string; value: number; name: string; time: string }>, width: number, height: number) {
  if (!items.length) return []
  
  const maxValue = Math.max(...items.map(item => item.value))
  const minRadius = 15
  const maxRadius = 40
  
  return items.map((item, index) => {
    const radius = minRadius + (item.value / maxValue) * (maxRadius - minRadius)
    const angle = (index / items.length) * 2 * Math.PI
    const centerX = width / 2
    const centerY = height / 2
    const maxDistance = Math.min(width, height) / 3
    const distance = Math.random() * maxDistance
    
    return {
      id: item.id,
      name: item.name,
      value: item.value,
      time: item.time,
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      radius
    }
  })
}

export default function LifeVisualization({
  strategies,
  plans,
  tasks,
  onStrategySelect,
  onPlanSelect,
  onTaskSelect,
  onActionSelect,
  selectedStrategyId,
  selectedPlanId
}: LifeVisualizationProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<{ type: string; id: string } | null>(null)

  // Get text size based on rectangle width
  const getTextSize = useCallback((width: number) => {
    if (width > 120) return 'text-base'
    if (width > 80) return 'text-sm'
    return 'text-xs'
  }, [])

  // Calculate displayed data based on selection
  const displayedPlans = useMemo(() => {
    if (selectedStrategyId) {
      return plans.filter(plan => plan.strategy === selectedStrategyId)
    }
    // Show plans from the strategy with highest importance_percentage
    const topStrategy = strategies.reduce((max, strategy) => 
      (strategy.importance_percentage || 0) > (max.importance_percentage || 0) ? strategy : max
    , strategies[0])
    return topStrategy ? plans.filter(plan => plan.strategy === topStrategy.id) : []
  }, [plans, strategies, selectedStrategyId])

  const displayedTasks = useMemo(() => {
    if (selectedPlanId) {
      return tasks.filter(task => task.plan === selectedPlanId)
    }
    // Show tasks from the plan with highest importance_percentage
    const topPlan = displayedPlans.reduce((max, plan) => 
      (plan.importance_percentage || 0) > (max.importance_percentage || 0) ? plan : max
    , displayedPlans[0])
    return topPlan ? tasks.filter(task => task.plan === topPlan.id) : []
  }, [tasks, displayedPlans, selectedPlanId])

  // Calculate treemap data
  const strategyRectangles = useMemo(() => {
    const items = strategies.map(strategy => ({
      id: strategy.id,
      name: strategy.objective,
      value: strategy.importance_percentage || 1
    }))
    return calculateTreemap(items, 300, 240)
  }, [strategies])

  const planRectangles = useMemo(() => {
    const items = displayedPlans.map(plan => ({
      id: plan.id,
      name: plan.objective,
      value: plan.importance_percentage || 1
    }))
    return calculateTreemap(items, 300, 240)
  }, [displayedPlans])

  // Calculate bubble data
  const taskBubbles = useMemo(() => {
    const items = displayedTasks.map(task => ({
      id: task.id,
      name: task.title,
      value: task.importance_percentage || 1,
      time: task.start_date ? new Date(task.start_date).toLocaleDateString() : 'No date'
    }))
    return calculateBubbles(items, 300, 240)
  }, [displayedTasks])

  const handleActionClick = useCallback((action: 'add' | 'edit' | 'delete', type: 'strategy' | 'plan' | 'task', id?: string) => {
    onActionSelect?.(action, type, id)
    setActionMenuOpen(false)
  }, [onActionSelect])

  return (
    <>
      {/* Action Menu */}
      <div className="relative flex justify-end mb-6">
        <button
          onClick={() => setActionMenuOpen(!actionMenuOpen)}
          className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-50 hover:shadow-md transition-all duration-200"
        >
          <span className="text-gray-600">⋮</span>
        </button>
        
        {actionMenuOpen && (
          <div className="absolute top-10 right-0 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-48">
            {/* Add Actions */}
            <div className="group relative">
              <div className="px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer">
                Add
              </div>
              <div className="absolute left-full top-0 ml-1 hidden group-hover:block bg-white rounded-lg shadow-xl border border-gray-200 p-1 min-w-24">
                <button
                  onClick={() => handleActionClick('add', 'strategy')}
                  className="block w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-purple-50 rounded text-left"
                >
                  Strategy
                </button>
                <button
                  onClick={() => handleActionClick('add', 'plan')}
                  className="block w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-purple-50 rounded text-left"
                >
                  Plan
                </button>
                <button
                  onClick={() => handleActionClick('add', 'task')}
                  className="block w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-purple-50 rounded text-left"
                >
                  Task
                </button>
              </div>
            </div>
            
            {/* Edit Actions */}
            <div className="group relative">
              <div className="px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer">
                Edit
              </div>
              <div className="absolute left-full top-0 ml-1 hidden group-hover:block bg-white rounded-lg shadow-xl border border-gray-200 p-1 min-w-24">
                <button
                  onClick={() => handleActionClick('edit', 'strategy', selectedStrategyId || undefined)}
                  className="block w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-purple-50 rounded text-left disabled:opacity-50"
                  disabled={!selectedStrategyId}
                >
                  Strategy
                </button>
                <button
                  onClick={() => handleActionClick('edit', 'plan', selectedPlanId || undefined)}
                  className="block w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-purple-50 rounded text-left disabled:opacity-50"
                  disabled={!selectedPlanId}
                >
                  Plan
                </button>
                <button
                  onClick={() => handleActionClick('edit', 'task')}
                  className="block w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-purple-50 rounded text-left"
                >
                  Task
                </button>
              </div>
            </div>
            
            {/* Delete Actions */}
            <div className="group relative">
              <div className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                Delete
              </div>
              <div className="absolute left-full top-0 ml-1 hidden group-hover:block bg-white rounded-lg shadow-xl border border-gray-200 p-1 min-w-24">
                <button
                  onClick={() => handleActionClick('delete', 'strategy', selectedStrategyId || undefined)}
                  className="block w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded text-left disabled:opacity-50"
                  disabled={!selectedStrategyId}
                >
                  Strategy
                </button>
                <button
                  onClick={() => handleActionClick('delete', 'plan', selectedPlanId || undefined)}
                  className="block w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded text-left disabled:opacity-50"
                  disabled={!selectedPlanId}
                >
                  Plan
                </button>
                <button
                  onClick={() => handleActionClick('delete', 'task')}
                  className="block w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded text-left"
                >
                  Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pure Charts - No Cards, Direct SVG Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Strategy Treemap - Pure Chart */}
        <div className="relative">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Strategies</h3>
          <svg width="100%" height="240" viewBox="0 0 300 240" className="rounded-xl shadow-lg">
            {strategyRectangles.map((rect) => (
              <g key={rect.id}>
                <rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  fill={selectedStrategyId === rect.id 
                    ? "url(#strategySelected)" 
                    : "url(#strategy)"
                  }
                  stroke="rgba(147, 51, 234, 0.3)"
                  strokeWidth="1"
                  rx="8"
                  ry="8"
                  className="cursor-pointer transition-all duration-200 hover:stroke-purple-500"
                  onClick={() => onStrategySelect?.(rect.id)}
                  onMouseEnter={() => setHoveredItem({ type: 'strategy', id: rect.id })}
                  onMouseLeave={() => setHoveredItem(null)}
                />
                <foreignObject
                  x={rect.x + 4}
                  y={rect.y + 4}
                  width={rect.width - 8}
                  height={rect.height - 8}
                  className="pointer-events-none"
                >
                  <div className="flex flex-col justify-center h-full text-white p-1">
                    <div 
                      className={`font-bold leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${getTextSize(rect.width)}`}
                      title={rect.name}
                    >
                      {rect.name}
                    </div>
                    <div className="text-xs text-white/70 font-light mt-1">
                      {rect.value}%
                    </div>
                  </div>
                </foreignObject>
              </g>
            ))}
            
            {/* Gradients */}
            <defs>
              <linearGradient id="strategy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(147, 51, 234)" />
                <stop offset="100%" stopColor="rgb(126, 34, 206)" />
              </linearGradient>
              <linearGradient id="strategySelected" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(126, 34, 206)" />
                <stop offset="100%" stopColor="rgb(107, 33, 168)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Plan Treemap - Pure Chart */}
        <div className="relative">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Plans</h3>
          <svg width="100%" height="240" viewBox="0 0 300 240" className="rounded-xl shadow-lg">
            {planRectangles.map((rect) => (
              <g key={rect.id}>
                <rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  fill={selectedPlanId === rect.id 
                    ? "url(#planSelected)" 
                    : "url(#plan)"
                  }
                  stroke="rgba(139, 69, 219, 0.3)"
                  strokeWidth="1"
                  rx="8"
                  ry="8"
                  className="cursor-pointer transition-all duration-200 hover:stroke-purple-400"
                  onClick={() => onPlanSelect?.(rect.id)}
                  onMouseEnter={() => setHoveredItem({ type: 'plan', id: rect.id })}
                  onMouseLeave={() => setHoveredItem(null)}
                />
                <foreignObject
                  x={rect.x + 4}
                  y={rect.y + 4}
                  width={rect.width - 8}
                  height={rect.height - 8}
                  className="pointer-events-none"
                >
                  <div className="flex flex-col justify-center h-full text-white p-1">
                    <div 
                      className={`font-bold leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${getTextSize(rect.width)}`}
                      title={rect.name}
                    >
                      {rect.name}
                    </div>
                    <div className="text-xs text-white/70 font-light mt-1">
                      {rect.value}%
                    </div>
                  </div>
                </foreignObject>
              </g>
            ))}
            
            {/* Gradients */}
            <defs>
              <linearGradient id="plan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(139, 69, 219)" />
                <stop offset="100%" stopColor="rgb(124, 58, 237)" />
              </linearGradient>
              <linearGradient id="planSelected" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(124, 58, 237)" />
                <stop offset="100%" stopColor="rgb(109, 40, 217)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Task Bubble Chart - Pure Chart */}
        <div className="relative">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Tasks</h3>
          <svg width="100%" height="240" viewBox="0 0 300 240" className="rounded-xl shadow-lg">
            {taskBubbles.map((bubble) => (
              <g key={bubble.id}>
                <circle
                  cx={bubble.x}
                  cy={bubble.y}
                  r={bubble.radius}
                  fill="rgba(147, 51, 234, 0.8)"
                  stroke="rgba(147, 51, 234, 0.3)"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:scale-110"
                  onClick={() => onTaskSelect?.(bubble.id)}
                  onMouseEnter={() => setHoveredItem({ type: 'task', id: bubble.id })}
                  onMouseLeave={() => setHoveredItem(null)}
                />
                <foreignObject
                  x={bubble.x - bubble.radius}
                  y={bubble.y - bubble.radius}
                  width={bubble.radius * 2}
                  height={bubble.radius * 2}
                  className="pointer-events-none"
                >
                  <div className="flex flex-col justify-center items-center h-full text-white text-center p-1">
                    <div className="text-xs font-medium leading-tight overflow-hidden">
                      {bubble.name.length > 15 ? bubble.name.substring(0, 12) + '...' : bubble.name}
                    </div>
                    <div className="text-xs text-white/70 mt-1">
                      {bubble.time}
                    </div>
                  </div>
                </foreignObject>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredItem && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-50">
          {hoveredItem.type === 'strategy' && (
            <div>
              Strategy: {strategies.find(s => s.id === hoveredItem.id)?.objective}
            </div>
          )}
          {hoveredItem.type === 'plan' && (
            <div>
              Plan: {plans.find(p => p.id === hoveredItem.id)?.objective}
            </div>
          )}
          {hoveredItem.type === 'task' && (
            <div>
              Task: {tasks.find(t => t.id === hoveredItem.id)?.title}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close action menu */}
      {actionMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActionMenuOpen(false)}
        />
      )}
    </>
  )
}