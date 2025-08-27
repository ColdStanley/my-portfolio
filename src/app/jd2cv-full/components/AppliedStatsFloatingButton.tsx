'use client'

import { useState, useMemo } from 'react'
import { JDRecord } from '@/shared/types'

interface AppliedStatsFloatingButtonProps {
  jds: JDRecord[]
}

export default function AppliedStatsFloatingButton({ jds }: AppliedStatsFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // 计算Applied状态的统计数据
  const stats = useMemo(() => {
    const appliedJDs = jds.filter(jd => jd.application_stage === 'Applied')
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay()) // 本周开始（周日）
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const todayCount = appliedJDs.filter(jd => {
      const createdDate = new Date(jd.created_at)
      return createdDate >= today
    }).length

    const thisWeekCount = appliedJDs.filter(jd => {
      const createdDate = new Date(jd.created_at)
      return createdDate >= thisWeekStart
    }).length

    const thisMonthCount = appliedJDs.filter(jd => {
      const createdDate = new Date(jd.created_at)
      return createdDate >= thisMonthStart
    }).length

    const allTimeCount = appliedJDs.length

    return {
      today: todayCount,
      thisWeek: thisWeekCount,
      thisMonth: thisMonthCount,
      allTime: allTimeCount
    }
  }, [jds])

  return (
    <div 
      className="fixed bottom-6 right-6 z-20"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Floating Stats Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group"
        style={{
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)'
        }}
        title="Applied Statistics"
      >
          {/* Chart Icon with total count */}
          <div className="flex flex-col items-center">
            <svg 
              className="w-4 h-4 text-purple-500 transition-transform duration-200" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
            </svg>
            <span className="text-xs text-purple-600 font-medium leading-none mt-0.5">
              {stats.allTime}
            </span>
          </div>
        </button>

      {/* Stats Tooltip */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-4 min-w-48 transform transition-all duration-200"
          style={{
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Applied Status</span>
          </div>

          {/* Stats Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Today</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.today}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.thisWeek}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.thisMonth}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">All Time</span>
                <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.allTime}
                </span>
              </div>
            </div>
          </div>

          {/* Helper text */}
          <div className="text-xs text-gray-400 mt-3 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            Applied jobs statistics
          </div>
        </div>
      )}
    </div>
  )
}