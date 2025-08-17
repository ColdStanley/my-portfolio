'use client'

import { useState, useRef } from 'react'
import MobileBottomTabs from './MobileBottomTabs'
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
  const [isTabSelectorOpen, setIsTabSelectorOpen] = useState(false)
  
  const taskPanelRef = useRef<PanelRef>(null)
  const planPanelRef = useRef<PanelRef>(null)
  const strategyPanelRef = useRef<PanelRef>(null)

  const showButtons = activeTab === 'life'

  const handleAddButtonClick = () => {
    if (activeSubTab === 'task' && taskPanelRef.current) {
      taskPanelRef.current.openCreateForm()
    } else if (activeSubTab === 'plan' && planPanelRef.current) {
      planPanelRef.current.openCreateForm()
    } else if (activeSubTab === 'strategy' && strategyPanelRef.current) {
      strategyPanelRef.current.openCreateForm()
    }
  }

  const handleSubTabChange = (subTab: string) => {
    setActiveSubTab(subTab)
    setIsTabSelectorOpen(false)
  }

  const getSubTabLabel = (subTab: string) => {
    switch (subTab) {
      case 'task': return 'Task'
      case 'plan': return 'Plan'
      case 'strategy': return 'Strategy'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            transform: translateX(20px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      {/* Content Area */}
      <div className="pb-16">
        {/* Floating Buttons - only show when in Life tab */}
        {showButtons && (
          <>
            {/* Add Button - moved up */}
            <div className="fixed bottom-32 right-4 z-50">
              <button 
                onClick={handleAddButtonClick}
                className="w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Tab Selector Buttons */}
            <div className="fixed bottom-20 right-4 z-50">
              {/* Sub tab buttons - show when expanded */}
              <div className="absolute bottom-0 right-12 flex gap-3">
                {['task', 'plan', 'strategy'].map((subTab, index) => (
                  <div 
                    key={subTab}
                    className={`transform transition-all duration-300 ease-out ${
                      isTabSelectorOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5 pointer-events-none'
                    }`}
                    style={{ 
                      transitionDelay: isTabSelectorOpen ? `${index * 50}ms` : `${(2 - index) * 50}ms`
                    }}
                  >
                    <button
                      onClick={() => handleSubTabChange(subTab)}
                      className={`px-3 py-2 rounded-lg shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 text-sm font-medium whitespace-nowrap ${
                        activeSubTab === subTab
                          ? 'bg-purple-500 text-white shadow-purple-200'
                          : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow-xl'
                      }`}
                      disabled={!isTabSelectorOpen}
                    >
                      {getSubTabLabel(subTab)}
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Main tab selector button */}
              <button 
                onClick={() => setIsTabSelectorOpen(!isTabSelectorOpen)}
                className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 bg-white text-gray-600 hover:bg-gray-50"
              >
                <svg 
                  className={`w-5 h-5 transition-transform duration-500 ease-out ${
                    isTabSelectorOpen ? 'rotate-45' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Main Content */}
        <div>
          {activeTab === 'life' && (
            <>
              {activeSubTab === 'task' && <MobileTaskPanel ref={taskPanelRef} onTasksUpdate={(tasks) => {
                // Handle tasks update if needed
                console.log('Tasks updated:', tasks.length)
              }} />}
              {activeSubTab === 'plan' && <MobilePlanPanel ref={planPanelRef} onPlansUpdate={(plans) => {
                // Handle plans update if needed
                console.log('Plans updated:', plans.length)
              }} />}
              {activeSubTab === 'strategy' && <MobileStrategyPanel ref={strategyPanelRef} onStrategiesUpdate={(strategies) => {
                // Handle strategies update if needed
                console.log('Strategies updated:', strategies.length)
              }} />}
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


      {/* Bottom Tabs */}
      <MobileBottomTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}