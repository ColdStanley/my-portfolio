'use client'

import { useState } from 'react'
import Sidebar from './components/Sidebar'
import WebhookTester from './components/WebhookTester'

export default function AIAgentGalaPage() {
  const [activeTab, setActiveTab] = useState('option1')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Handle tab change with scroll reset
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    // Reset scroll position to top when switching tabs
    setTimeout(() => {
      const selectors = [
        '.h-full.overflow-y-auto',
        '.overflow-y-auto',
        '.main-content-scroll'
      ]
      
      for (const selector of selectors) {
        const element = document.querySelector(selector)
        if (element) {
          element.scrollTop = 0
          break
        }
      }
      
      window.scrollTo(0, 0)
    }, 50)
  }

  return (
    <div className="pt-16 min-h-screen flex relative">
      {/* 侧边栏 */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      {/* 主内容区域 - L形预留空间布局 */}
      <div className="flex-1 ml-[68px] mt-[52px]">
        {activeTab === 'option1' && (
          <div className="h-[calc(100vh-148px)]">
            <WebhookTester />
          </div>
        )}
        
        {activeTab === 'option2' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Option 2</h2>
              <p className="text-gray-500">Content for option 2 coming soon...</p>
            </div>
          </div>
        )}
        
        {activeTab === 'option3' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Option 3</h2>
              <p className="text-gray-500">Content for option 3 coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}