'use client'

import { useState } from 'react'
import ResumeSubTabNav from './Career/ResumeSubTabNav'
import JDTrackerPanel from './Career/JDTrackerPanel'
import CVModuleVaultPanel from './Career/CVModuleVaultPanel'
import UserMatcherPanel from './Career/UserMatcherPanel'
import FigmaBuilderPanel from './Career/FigmaBuilderPanel'

interface MainContentProps {
  activeMainTab: string
}

const subTabs = ['user-matcher', 'notion', 'cv-modules', 'figma-builder'] as const
type SubTabKey = typeof subTabs[number]

export default function MainContent({ activeMainTab }: MainContentProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('cv-modules')

  const renderCareerContent = () => {
    switch (activeSubTab) {
      case 'user-matcher': return <UserMatcherPanel />
      case 'notion': return <JDTrackerPanel />
      case 'cv-modules': return <CVModuleVaultPanel />
      case 'figma-builder': return <FigmaBuilderPanel />
      default: return <div className="text-gray-500 text-sm">This section is under construction.</div>
    }
  }

  const renderContent = () => {
    switch (activeMainTab) {
      case 'life':
        return (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Life</h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        )
      case 'career':
        return (
          <>
            <ResumeSubTabNav activeTab={activeSubTab} setActiveTab={setActiveSubTab} />
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