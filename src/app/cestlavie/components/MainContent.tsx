'use client'

import { useState } from 'react'
import StrategyPanel from './Life/StrategyPanel'
import PlanPanel from './Life/PlanPanel'
import TaskPanelOptimized from './Life/TaskPanelOptimized'

interface TaskRecord {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
  plan: string[]
  note: string
  actual_start?: string
  actual_end?: string
  budget_time: number
  actual_time: number
  quality_rating?: number
  next?: string
  is_plan_critical?: boolean
}

interface MainContentProps {
  activeMainTab: string
  onConfigClick?: () => void
  onTasksUpdate?: (tasks: TaskRecord[]) => void
}

const lifeSubTabs = ['strategy', 'plan', 'task', 'tbd'] as const
type LifeSubTabKey = typeof lifeSubTabs[number]

export default function MainContent({ activeMainTab, onConfigClick, onTasksUpdate }: MainContentProps) {
  // Determine if we're in life mode and which sub-tab is active
  const isLifeSubTab = lifeSubTabs.includes(activeMainTab as LifeSubTabKey)
  const effectiveMainTab = isLifeSubTab ? 'life' : activeMainTab
  const activeLifeSubTab = isLifeSubTab ? (activeMainTab as LifeSubTabKey) : 'task'

  const renderCareerContent = () => {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💼</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Career</h2>
          <p className="text-gray-500">Coming soon...</p>
        </div>
      </div>
    )
  }

  const renderLifeContent = () => {
    switch (activeLifeSubTab) {
      case 'strategy': return <StrategyPanel />
      case 'plan': return <PlanPanel />
      case 'task': return <TaskPanelOptimized onTasksUpdate={onTasksUpdate} />
      case 'tbd': return <div className="text-center text-gray-500 py-8">TBD module coming soon...</div>
      default: return <div className="text-gray-500 text-sm">This section is under construction.</div>
    }
  }

  const renderContent = () => {
    switch (effectiveMainTab) {
      case 'life':
        return renderLifeContent()
      case 'career':
        return renderCareerContent()
      case 'study':
        return (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Study</h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        )
      default:
        return <div className="flex-1 p-6 text-gray-500">Select a tab to get started.</div>
    }
  }

  return (
    <div className="flex-1 flex relative">
      {renderContent()}
    </div>
  )
}