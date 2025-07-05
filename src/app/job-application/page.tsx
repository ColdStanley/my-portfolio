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
{currentTab === 'match' && <RuleBasedMatchingPanel />}

        {currentTab === 'match' && <div>匹配度分析模块开发中...</div>}
        {currentTab === 'output' && <div>生成结果模块开发中...</div>}
        {currentTab === 'experience' && <ExperienceProjectSection />}
        {currentTab === 'basic' && <BasicProfileSection />}
      </div>
    </>
  )
}
