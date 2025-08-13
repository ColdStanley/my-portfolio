import { useState } from 'react'
import CircularProgress from './CircularProgress'
import TargetSettings from './TargetSettings'
import { useJDStats } from '../hooks/useJDStats'
import { JDRecord } from '@/shared/types'

interface StatsPanelProps {
  jds: JDRecord[]
}

export default function StatsPanel({ jds }: StatsPanelProps) {
  const { targets, updateTargets, stats } = useJDStats(jds)
  const [showSettings, setShowSettings] = useState(false)

  const statItems = [
    {
      label: 'Today New JD',
      value: stats.todayNewJD,
      target: targets.dailyNewJD,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      label: 'Today Applied',
      value: stats.todayApplications,
      target: targets.dailyApplications,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      label: 'Week Applied',
      value: stats.weeklyApplications,
      target: targets.weeklyApplications,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      label: 'Month Applied',
      value: stats.monthlyApplications,
      target: targets.monthlyApplications,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  return (
    <>
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Progress Dashboard</h3>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Settings"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* 1x4 Horizontal Layout */}
        <div className="grid grid-cols-4 gap-4">
          {statItems.map((item, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-100/60 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-purple-500">
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-600">{item.label}</span>
                </div>
                <CircularProgress 
                  value={item.value} 
                  target={item.target} 
                  size={32} 
                  strokeWidth={2}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">
                  {item.value} / {item.target}
                </span>
                <span className={`text-xs font-medium ${
                  item.value >= item.target 
                    ? 'text-green-600' 
                    : item.value >= item.target * 0.7 
                      ? 'text-purple-600' 
                      : 'text-gray-500'
                }`}>
                  {item.value >= item.target ? 'Complete' : 
                   item.value >= item.target * 0.7 ? 'On Track' : 'Behind'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TargetSettings
        targets={targets}
        onUpdate={updateTargets}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  )
}