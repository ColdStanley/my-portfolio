'use client'

import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import WebhookTester from './components/WebhookTester'
import IELTSSpeaking from './components/IELTSSpeaking'
import JD2CV2 from './components/JD2CV2'
import NewNavbar from '@/components/NewNavbar'
import FooterSection from '@/components/FooterSection'
import PageTransition from '@/components/PageTransition'

export default function AIAgentGalaPage() {
  const [activeTab, setActiveTab] = useState('option2') // Default to IELTS Speaking
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start closed for bounce effect

  // Check URL parameters for tab switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get('tab')
      if (tabParam && ['option1', 'option2', 'option3'].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])

  // Sidebar discovery animation - bounce 2 times then retract
  useEffect(() => {
    const sidebarDiscovery = () => {
      // First bounce: open
      setTimeout(() => setSidebarOpen(true), 500)
      // First retract
      setTimeout(() => setSidebarOpen(false), 1500)
      // Second bounce: open
      setTimeout(() => setSidebarOpen(true), 2500)
      // Final retract
      setTimeout(() => setSidebarOpen(false), 3500)
    }

    sidebarDiscovery()
  }, [])

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
          <div className="h-[calc(100vh-180px)]">
            <WebhookTester />
          </div>
        )}
        
        {activeTab === 'option2' && (
          <div className="h-[calc(100vh-180px)]">
            <IELTSSpeaking />
          </div>
        )}
        
        {activeTab === 'option3' && (
          <div className="h-[calc(100vh-180px)]">
            <JD2CV2 />
          </div>
        )}
      </div>
    </div>
    
    <FooterSection hasSidebar />
      </PageTransition>
    </>
  )
}