'use client'

import { useState, useRef } from 'react'
import MobileBottomTabs from './MobileBottomTabs'
import MobileSubTabs from './MobileSubTabs'
import MobileTaskPanel from './MobileTaskPanel'
import MobilePlanPanel from './MobilePlanPanel'
import MobileStrategyPanel from './MobileStrategyPanel'

interface MobileLayoutProps {
  children?: React.ReactNode
}

interface PanelRef {
  openCreateForm: () => void
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState('life')
  const [activeSubTab, setActiveSubTab] = useState('task')
  
  const taskPanelRef = useRef<PanelRef>(null)
  const planPanelRef = useRef<PanelRef>(null)
  const strategyPanelRef = useRef<PanelRef>(null)

  const showAddButton = activeTab === 'life'
  const showSubTabs = activeTab === 'life'

  const handleAddButtonClick = () => {
    if (activeSubTab === 'task' && taskPanelRef.current) {
      taskPanelRef.current.openCreateForm()
    } else if (activeSubTab === 'plan' && planPanelRef.current) {
      planPanelRef.current.openCreateForm()
    } else if (activeSubTab === 'strategy' && strategyPanelRef.current) {
      strategyPanelRef.current.openCreateForm()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Content Area */}
      <div className="pb-16">
        {/* Add Button - only show when in Life tab */}
        {showAddButton && (
          <div className="fixed bottom-32 right-4 z-50">
            <button 
              onClick={handleAddButtonClick}
              className="w-12 h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className={`${showSubTabs ? 'pb-12' : ''}`}>
          {activeTab === 'life' && (
            <>
              {activeSubTab === 'task' && <MobileTaskPanel ref={taskPanelRef} onTasksUpdate={() => {}} />}
              {activeSubTab === 'plan' && <MobilePlanPanel ref={planPanelRef} onTasksUpdate={() => {}} />}
              {activeSubTab === 'strategy' && <MobileStrategyPanel ref={strategyPanelRef} onTasksUpdate={() => {}} />}
            </>
          )}
          {activeTab === 'career' && (
            <div className="flex items-center justify-center h-screen text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">💼</div>
                <div>Career module coming soon...</div>
              </div>
            </div>
          )}
          {activeTab === 'study' && (
            <div className="flex items-center justify-center h-screen text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📚</div>
                <div>Study module coming soon...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub Tabs - only show for Life */}
      <MobileSubTabs 
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
        show={showSubTabs}
      />

      {/* Bottom Tabs */}
      <MobileBottomTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}