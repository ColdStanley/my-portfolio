'use client'

import { useEffect, useState, useRef } from 'react'
import { TaskRecord } from '../../types/task'
import { PlanRecord } from '../../types/plan'
import { StrategyRecord } from '../../types/strategy'
import { getTaskRelationsData } from '../../utils/taskUtils'

interface RelationsTooltipProps {
  type: 'task' | 'plan' | 'strategy'
  isOpen: boolean
  onClose: () => void
  
  // Task relations data
  parentPlan?: PlanRecord
  parentStrategy?: StrategyRecord
  
  // Plan relations data
  parentStrategyForPlan?: StrategyRecord
  childTasks?: TaskRecord[]
  
  // Strategy relations data
  childPlans?: PlanRecord[]
  allChildTasks?: TaskRecord[]
}

export default function RelationsTooltip({
  type,
  isOpen,
  onClose,
  parentPlan,
  parentStrategy,
  parentStrategyForPlan,
  childTasks = [],
  childPlans = [],
  allChildTasks = []
}: RelationsTooltipProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tooltipRef.current) return
    
    const rect = tooltipRef.current.getBoundingClientRect()
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDragging(true)
  }

  if (!isOpen) return null

  const renderTaskRelations = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Task Relations
      </h3>
      
      {/* Parent Plan */}
      {parentPlan && (
        <div>
          <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            Parent Plan
          </div>
          <div 
            className="p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
            onClick={() => {
              const notionPageUrl = `https://www.notion.so/${parentPlan.id.replace(/-/g, '')}`
              window.open(notionPageUrl, '_blank')
            }}
            title="Click to edit in Notion"
          >
            <div className="font-medium text-gray-900">{parentPlan.objective}</div>
            <div className="text-sm text-gray-600">
              Status: {parentPlan.status} • {parentPlan.completed_tasks}/{parentPlan.total_tasks} tasks
            </div>
          </div>
        </div>
      )}
      
      {/* Parent Strategy */}
      {parentStrategy && (
        <div>
          <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            Parent Strategy
          </div>
          <div 
            className="p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
            onClick={() => {
              const notionPageUrl = `https://www.notion.so/${parentStrategy.id.replace(/-/g, '')}`
              window.open(notionPageUrl, '_blank')
            }}
            title="Click to edit in Notion"
          >
            <div className="font-medium text-gray-900">{parentStrategy.objective}</div>
            <div className="text-sm text-gray-600">
              Status: {parentStrategy.status} • Progress: {parentStrategy.progress}%
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderPlanRelations = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Plan Relations
      </h3>
      
      {/* Parent Strategy */}
      {parentStrategyForPlan && (
        <div>
          <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            Parent Strategy
          </div>
          <div 
            className="p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
            onClick={() => {
              const notionPageUrl = `https://www.notion.so/${parentStrategyForPlan.id.replace(/-/g, '')}`
              window.open(notionPageUrl, '_blank')
            }}
            title="Click to edit in Notion"
          >
            <div className="font-medium text-gray-900">{parentStrategyForPlan.objective}</div>
            <div className="text-sm text-gray-600">
              Status: {parentStrategyForPlan.status} • Progress: {parentStrategyForPlan.progress}%
            </div>
          </div>
        </div>
      )}
      
      {/* Child Tasks */}
      <div>
        <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
          Child Tasks ({childTasks.length})
        </div>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {childTasks.length === 0 ? (
            <div className="text-sm text-gray-500 italic">No tasks found</div>
          ) : (
            childTasks.map(task => (
              <div 
                key={task.id}
                className="p-2 bg-purple-50 rounded cursor-pointer hover:bg-purple-100 transition-colors"
                onClick={() => {
                  const notionPageUrl = `https://www.notion.so/${task.id.replace(/-/g, '')}`
                  window.open(notionPageUrl, '_blank')
                }}
                title="Click to edit in Notion"
              >
                <div className="text-sm font-medium text-gray-900">{task.title}</div>
                <div className="text-xs text-gray-600">{task.status}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  const renderStrategyRelations = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Strategy Relations
      </h3>
      
      {/* Child Plans */}
      <div>
        <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
          Child Plans ({childPlans.length})
        </div>
        <div className="max-h-32 overflow-y-auto space-y-2 mb-4">
          {childPlans.length === 0 ? (
            <div className="text-sm text-gray-500 italic">No plans found</div>
          ) : (
            childPlans.map(plan => (
              <div 
                key={plan.id}
                className="p-2 bg-purple-50 rounded cursor-pointer hover:bg-purple-100 transition-colors"
                onClick={() => {
                  const notionPageUrl = `https://www.notion.so/${plan.id.replace(/-/g, '')}`
                  window.open(notionPageUrl, '_blank')
                }}
                title="Click to edit in Notion"
              >
                <div className="text-sm font-medium text-gray-900">{plan.objective}</div>
                <div className="text-xs text-gray-600">
                  {plan.status} • {plan.completed_tasks}/{plan.total_tasks} tasks
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* All Child Tasks */}
      <div>
        <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
          All Tasks ({allChildTasks.length})
        </div>
        <div className="max-h-32 overflow-y-auto space-y-2">
          {allChildTasks.length === 0 ? (
            <div className="text-sm text-gray-500 italic">No tasks found</div>
          ) : (
            allChildTasks.map(task => (
              <div 
                key={task.id}
                className="p-2 bg-purple-50 rounded cursor-pointer hover:bg-purple-100 transition-colors"
                onClick={() => {
                  const notionPageUrl = `https://www.notion.so/${task.id.replace(/-/g, '')}`
                  window.open(notionPageUrl, '_blank')
                }}
                title="Click to edit in Notion"
              >
                <div className="text-sm font-medium text-gray-900">{task.title}</div>
                <div className="text-xs text-gray-600">{task.status}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div 
      ref={tooltipRef}
      className={`
        fixed w-96 h-[500px] bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 z-50
        transition-all duration-300 ease-out cursor-move flex flex-col
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
      `}
      style={{
        left: position.x || '50%',
        top: position.y || '50%',
        transform: position.x && position.y ? 'none' : 'translate(-50%, -50%)'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Relations</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1">
        {type === 'task' && renderTaskRelations()}
        {type === 'plan' && renderPlanRelations()}
        {type === 'strategy' && renderStrategyRelations()}
      </div>
    </div>
  )
}