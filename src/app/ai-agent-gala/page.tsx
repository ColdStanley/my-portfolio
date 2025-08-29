'use client'

import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Overview from './components/Overview'
import WebhookTester from './components/WebhookTester'
import IELTSSpeaking from './components/IELTSSpeaking'
import AICardStudio from './components/AICardStudio'
import JD2CV2 from './components/JD2CV2'
import ParagrapheMagique from './components/ParagrapheMagique'
import NewNavbar from '@/components/NewNavbar'
import FooterSection from '@/components/FooterSection'
import PageTransition from '@/components/PageTransition'

export default function AIAgentGalaPage() {
  const [activeTab, setActiveTab] = useState('overview') // Default to Overview
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start closed for bounce effect

  // Check URL parameters for tab switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get('tab')
      if (tabParam && ['overview', 'option1', 'option2', 'option3', 'option4', 'option5'].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])

  // Sidebar discovery animation - quick bounce 1 time then trigger button blink
  useEffect(() => {
    const sidebarDiscovery = () => {
      // Single quick bounce: open
      setTimeout(() => setSidebarOpen(true), 100)
      // Quick retract
      setTimeout(() => setSidebarOpen(false), 250)
      // Trigger hamburger button blink after retract
      setTimeout(() => {
        const hamburgerButton = document.querySelector('.hamburger-btn')
        if (hamburgerButton) {
          hamburgerButton.classList.add('blink-animation')
        }
      }, 300)
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
      {/* Hide global navbar/footer + Hamburger blink animation */}
      <style jsx global>{`
        nav[role="banner"], 
        footer[role="contentinfo"],
        .navbar,
        .footer {
          display: none !important;
        }
        
        /* Hamburger button blink animation */
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        .blink-animation {
          animation: blink 0.4s ease-in-out 3;
        }
        
        .blink-animation svg {
          animation: blink 0.4s ease-in-out 3;
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
        {activeTab === 'overview' && (
          <div>
            <Overview />
          </div>
        )}
        
        {activeTab === 'option1' && (
          <div>
            <WebhookTester />
          </div>
        )}
        
        {activeTab === 'option2' && (
          <div>
            <IELTSSpeaking />
          </div>
        )}
        
        {activeTab === 'option3' && (
          <div>
            <JD2CV2 />
          </div>
        )}
        
        {activeTab === 'option4' && (
          <div>
            <ParagrapheMagique />
          </div>
        )}
        
        {activeTab === 'option5' && (
          <div>
            <AICardStudio />
          </div>
        )}
      </div>
    </div>
    
    <FooterSection hasSidebar />
      </PageTransition>
    </>
  )
}