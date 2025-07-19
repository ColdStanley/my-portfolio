'use client'

import { useState } from 'react'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'

export default function CestLaViePage() {
  const [activeTab, setActiveTab] = useState('life')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="h-[calc(100vh-3.5rem)] flex relative overflow-hidden">
      {/* 移动端导航菜单按钮 - 悬浮设计 */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-20 right-4 z-50 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 hover:bg-gray-50/90 transition-all duration-200 hover:scale-110"
        aria-label="Toggle menu"
      >
        <div className="w-5 h-5 flex flex-col justify-center space-y-1">
          <div className={`w-full h-0.5 bg-purple-600 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
          <div className={`w-full h-0.5 bg-purple-600 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-full h-0.5 bg-purple-600 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
        </div>
      </button>


      {/* 侧边栏 */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden md:overflow-auto">
        <div className="h-full overflow-y-auto md:overflow-visible">
          <MainContent activeMainTab={activeTab} />
        </div>
      </div>
    </div>
  )
}