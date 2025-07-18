'use client'

import { useState } from 'react'
import ResumeSubTabNav from './Career/ResumeSubTabNav'
import JDTrackerPanel from './Career/JDTrackerPanel'
import CVModuleVaultPanel from './Career/CVModuleVaultPanel'
import UserMatcherPanel from './Career/UserMatcherPanel'
import FigmaBuilderPanel from './Career/FigmaBuilderPanel'
import LifeSubTabNav from './Life/LifeSubTabNav'
import StrategyPanel from './Life/StrategyPanel'
import PlanPanel from './Life/PlanPanel'
import TaskPanel from './Life/TaskPanel'
import TBDPanel from './Life/TBDPanel'

interface MainContentProps {
  activeMainTab: string
}

const careerSubTabs = ['user-matcher', 'notion', 'cv-modules', 'figma-builder'] as const
const lifeSubTabs = ['strategy', 'plan', 'task', 'tbd'] as const
type CareerSubTabKey = typeof careerSubTabs[number]
type LifeSubTabKey = typeof lifeSubTabs[number]

export default function MainContent({ activeMainTab }: MainContentProps) {
  const [activeCareerSubTab, setActiveCareerSubTab] = useState<CareerSubTabKey>('cv-modules')
  const [activeLifeSubTab, setActiveLifeSubTab] = useState<LifeSubTabKey>('task')

  const renderCareerContent = () => {
    switch (activeCareerSubTab) {
      case 'user-matcher': return <UserMatcherPanel />
      case 'notion': return <JDTrackerPanel />
      case 'cv-modules': return <CVModuleVaultPanel />
      case 'figma-builder': return <FigmaBuilderPanel />
      default: return <div className="text-gray-500 text-sm">This section is under construction.</div>
    }
  }

  const renderLifeContent = () => {
    switch (activeLifeSubTab) {
      case 'strategy': return <StrategyPanel />
      case 'plan': return <PlanPanel />
      case 'task': return <TaskPanel />
      case 'tbd': return <TBDPanel />
      default: return <div className="text-gray-500 text-sm">This section is under construction.</div>
    }
  }

  const renderContent = () => {
    switch (activeMainTab) {
      case 'life':
        return (
          <>
            <LifeSubTabNav activeTab={activeLifeSubTab} setActiveTab={setActiveLifeSubTab} />
            <div className="flex-1 overflow-y-auto p-6">{renderLifeContent()}</div>
          </>
        )
      case 'career':
        return (
          <>
            <ResumeSubTabNav activeTab={activeCareerSubTab} setActiveTab={setActiveCareerSubTab} />
            <div className="flex-1 overflow-y-auto p-6">{renderCareerContent()}</div>
          </>
        )
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