'use client'

import { useState } from 'react'
import ResumeSubTabNav from './ResumeSubTabNav'
import JDTrackerPanel from './JDTrackerPanel'
import CVModuleVaultPanel from './CVModuleVaultPanel'
import UserMatcherPanel from './UserMatcherPanel'

const subTabs = [
  'notion', 'cv-modules', 'user-matcher',
] as const

type SubTabKey = typeof subTabs[number]

export default function ResumeManagerPage() {
  const [activeTab, setActiveTab] = useState<SubTabKey>('notion')

  const renderContent = () => {
    switch (activeTab) {
      case 'user-matcher': return <UserMatcherPanel />
      case 'notion': return <JDTrackerPanel />
      case 'cv-modules': return <CVModuleVaultPanel />
      default:
        return <div className="text-gray-500 text-sm">This section is under construction.</div>
    }
  }

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex">
      <ResumeSubTabNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
    </div>
  )
}
