'use client'

import { useState } from 'react'
import ResumeSubTabNav from './ResumeSubTabNav'
import JD2CVPanel from './JD2CVPanel'

const subTabs = [
  'jd2cv',
] as const

type SubTabKey = typeof subTabs[number]

export default function ResumeManagerPage() {
  const [activeTab, setActiveTab] = useState<SubTabKey>('jd2cv')

  const renderContent = () => {
    switch (activeTab) {
      case 'jd2cv': return <JD2CVPanel />
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
