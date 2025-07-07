'use client'

import { useJobAppStore } from './store/useJobAppStore'
import SidebarTabs from './components/SidebarTabs'
import SummaryAndFilterPanel from './components/SummaryAndFilterPanel'
import ExperienceProjectSection from './components/ExperienceProjectSection'
import BasicProfileSection from './components/BasicProfileSection'
import JdInputPanel from './components/JdInputPanel'
import RuleBasedMatchingPanel from './components/RuleBasedMatchingPanel'

export default function JobApplicationPage() {
  const currentTab = useJobAppStore((s) => s.currentTab)

  return (
    <>
      {/* 左侧固定导航栏 */}
      <SidebarTabs />

      {/* 右侧主内容区域（根据当前 Tab 展示不同内容） */}
      <div className="ml-64 p-6 overflow-y-auto min-h-screen">
        {currentTab === 'summary' && <SummaryAndFilterPanel />}
        {currentTab === 'jd' && <JdInputPanel />}
        {['summary', 'jd', 'output', 'experience', 'basic'].includes(currentTab) && (
          <RuleBasedMatchingPanel active={false} />
        )}
        {currentTab === 'match' && <RuleBasedMatchingPanel active={true} />}
        {currentTab === 'output' && <div>The results generation module is currently under development.</div>}
        {currentTab === 'experience' && <ExperienceProjectSection />}
        {currentTab === 'basic' && <BasicProfileSection />}
      </div>
    </>
  )
}
