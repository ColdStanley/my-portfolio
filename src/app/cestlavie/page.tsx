'use client'

import { useState } from 'react'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'

export default function CestLaViePage() {
  const [activeTab, setActiveTab] = useState('life')

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <MainContent activeMainTab={activeTab} />
    </div>
  )
}