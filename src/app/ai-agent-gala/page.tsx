'use client'

import { useState } from 'react'
import Sidebar from './components/Sidebar'
import WebhookTester from './components/WebhookTester'
import IELTSSpeaking from './components/IELTSSpeaking'
import NewNavbar from '@/components/NewNavbar'
import FooterSection from '@/components/FooterSection'
import PageTransition from '@/components/PageTransition'

export default function AIAgentGalaPage() {
  const [activeTab, setActiveTab] = useState('option2') // Default to IELTS Speaking
  const [sidebarOpen, setSidebarOpen] = useState(true) // Default sidebar open

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
    <>
      {/* Hide global navbar/footer */}
      <style jsx global>{`
        nav[role="banner"], 
        footer[role="contentinfo"],
        .navbar,
        .footer {
          display: none !important;
        }
      `}</style>
      
      <NewNavbar />
      
      <PageTransition>
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
          <div className="h-[calc(100vh-100px)]">
            <IELTSSpeaking />
          </div>
        )}
        
        {activeTab === 'option3' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Agent 3</h2>
              <p className="text-gray-500">Next AI agent coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
    
    <FooterSection hasSidebar />
      </PageTransition>
    </>
  )
}