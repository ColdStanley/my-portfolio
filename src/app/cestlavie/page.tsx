'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth'
import { TaskRecord } from './types/task'
import Sidebar from './components/Sidebar'
import TaskPanelOptimized from './components/Life/TaskPanelOptimized'
import NotionConfigModal from './components/NotionConfigModal'
import FrenchPanel from './components/Study/FrenchPanel'
import NewNavbar from '@/components/NewNavbar'
import FooterSection from '@/components/FooterSection'
import PageTransition from '@/components/PageTransition'
import BottomAggregateNavigation from '@/components/mobile/BottomAggregateNavigation'

export default function CestLaViePage() {
  const [activeTab, setActiveTab] = useState('life')
  const [activeSubTab, setActiveSubTab] = useState('task')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const { user, loading, notionConfig } = useSimplifiedAuth()
  const router = useRouter()

  // Mobile navigation configuration
  const mobileNavTabs = [
    {
      key: 'life',
      label: 'Life',
      subTabs: [
        { key: 'task', label: 'Task Manager' }
      ]
    },
    {
      key: 'career',
      label: 'Career'
    },
    {
      key: 'study',
      label: 'Study',
      subTabs: [
        { key: 'french', label: 'French' }
      ]
    }
  ]

  // Handle tab change with scroll reset
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    // Reset scroll position to top when switching tabs
    setTimeout(() => {
      // Try multiple selectors to find the scrollable container
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
      
      // Also scroll window to top as fallback
      window.scrollTo(0, 0)
    }, 50) // Slightly longer timeout to ensure DOM is updated
  }

  // Handle mobile navigation
  const handleMobileMainTabChange = (tabKey: string) => {
    setActiveTab(tabKey)
  }

  const handleMobileSubTabChange = (subTabKey: string) => {
    setActiveSubTab(subTabKey)
    setActiveTab(subTabKey) // Also update the main activeTab for content rendering
  }

  // 检查用户认证状态
  useEffect(() => {
    if (!loading && !user) {
      // 未登录，重定向到登录页
      router.push('/auth/login?returnTo=/cestlavie')
    }
  }, [user, loading, router])

  // 检查用户Notion配置
  useEffect(() => {
    if (user && !loading) {
      // 使用简化的配置检查：如果没有API key就显示配置弹窗
      if (!notionConfig.hasApiKey) {
        setShowConfigModal(true)
      }
    }
  }, [user, loading, notionConfig])

  const handleConfigSaved = () => {
    // 关闭配置弹窗并刷新页面以确保新配置生效
    setShowConfigModal(false)
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
      <NewNavbar />
      <PageTransition>
        <div className="pt-16 min-h-screen flex relative">


        {/* 桌面端侧边栏 */}
        <div className="hidden md:block">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={handleTabChange}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onConfigClick={() => setShowConfigModal(true)}
            tasks={tasks}
          />
        </div>
        
        {/* 移动端底部聚合导航 */}
        <BottomAggregateNavigation
          mainTabs={mobileNavTabs}
          activeMainTab={activeTab}
          activeSubTab={activeSubTab}
          onMainTabChange={handleMobileMainTabChange}
          onSubTabChange={handleMobileSubTabChange}
        />
        
        {/* 主内容区域 - 响应式布局 */}
        <div className="flex-1 ml-0 mt-0 md:ml-[68px] md:mt-[52px]">
          {/* Life子导航路由逻辑 */}
          {(activeTab === 'life' || activeTab === 'task') && (
            <TaskPanelOptimized 
              onTasksUpdate={setTasks} 
              user={user}
              loading={loading}
            />
          )}
          
          {activeTab === 'career' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💼</div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Career</h2>
                <p className="text-gray-500">Coming soon...</p>
              </div>
            </div>
          )}
          
          {activeTab === 'study' && (
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Study</h2>
                <p className="text-gray-500">Select a study module from the sidebar</p>
              </div>
            </div>
          )}
          
          {activeTab === 'french' && <FrenchPanel />}
        </div>
      </div>

      {/* Notion配置模态框 */}
      <NotionConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfigSaved={handleConfigSaved}
      />
      <FooterSection hasSidebar />
      </PageTransition>
    </>
  )
}