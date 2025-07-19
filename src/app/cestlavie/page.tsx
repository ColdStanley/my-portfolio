'use client'

import { useState } from 'react'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'

export default function CestLaViePage() {
  const [activeTab, setActiveTab] = useState('life')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="h-[calc(100vh-3.5rem)] flex relative">
      {/* 移动端汉堡菜单按钮 */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        <div className="w-5 h-5 flex flex-col justify-center space-y-1">
          <div className={`w-full h-0.5 bg-purple-600 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
          <div className={`w-full h-0.5 bg-purple-600 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-full h-0.5 bg-purple-600 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
        </div>
      </button>

      {/* 移动端遮罩层 */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* 侧边栏 */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden pt-16 md:pt-0">
        <MainContent activeMainTab={activeTab} />
      </div>
    </div>
  )
}