'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import NotionConfigModal from './components/NotionConfigModal'

export default function CestLaViePage() {
  const [activeTab, setActiveTab] = useState('life')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [hasNotionConfig, setHasNotionConfig] = useState<boolean | null>(null)
  const { user, loading } = useCurrentUser()
  const router = useRouter()

  // 检查用户认证状态
  useEffect(() => {
    if (!loading && !user) {
      // 未登录，重定向到登录页
      router.push('/auth/callback?returnTo=/cestlavie')
    }
  }, [user, loading, router])

  // 检查用户Notion配置
  useEffect(() => {
    if (user && hasNotionConfig === null) {
      checkNotionConfig()
    }
  }, [user, hasNotionConfig])

  const checkNotionConfig = async () => {
    try {
      const response = await fetch('/api/user-notion-config')
      const result = await response.json()
      
      if (response.ok) {
        setHasNotionConfig(result.hasConfig)
        if (!result.hasConfig) {
          setShowConfigModal(true)
        }
      }
    } catch (error) {
      console.error('Failed to check notion config:', error)
      setHasNotionConfig(false)
    }
  }

  const handleConfigSaved = () => {
    setHasNotionConfig(true)
    // 刷新页面以确保新配置生效
    window.location.reload()
  }

  // 加载中显示
  if (loading) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // 未登录不渲染主内容
  if (!user) {
    return null
  }

  return (
    <>
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

        {/* 配置按钮 - 悬浮在右上角 */}
        <button
          onClick={() => setShowConfigModal(true)}
          className="fixed top-20 right-16 z-40 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 hover:bg-gray-50/90 transition-all duration-200 text-purple-600 hover:text-purple-700"
          title="Notion Configuration"
        >
          ⚙️
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

      {/* Notion配置模态框 */}
      <NotionConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfigSaved={handleConfigSaved}
      />
    </>
  )
}