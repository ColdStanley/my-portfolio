'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type TabKey = 'main' | 'custom' | 'plan'

interface TabContextType {
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabKey>('main')

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}

export function useTab() {
  const context = useContext(TabContext)
  if (context === undefined) {
    throw new Error('useTab must be used within a TabProvider')
  }
  return context
}