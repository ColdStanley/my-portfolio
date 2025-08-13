import { useState } from 'react'
import React from 'react'
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
      label: 'New',
      value: stats.todayNewJD,
      target: targets.dailyNewJD,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      label: 'Applied',
      value: stats.todayApplications,
      target: targets.dailyApplications,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      label: 'Week',
      value: stats.weeklyApplications,
      target: targets.weeklyApplications,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      label: 'Month',
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
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl shadow-purple-500/10 border border-purple-200/60 p-4 mb-6 relative">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-purple-50/30 rounded-xl pointer-events-none" />
        
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="text-lg font-semibold text-gray-800 tracking-tight">Progress Dashboard</h3>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50/80 hover:shadow-lg hover:shadow-purple-500/20 rounded-lg transition-all duration-200"
            title="Settings"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* 1x4 Tech Compact Layout */}
        <div className="grid grid-cols-4 gap-3 relative z-10">
          {statItems.map((item, index) => {
            const progress = Math.min((item.value / item.target) * 100, 100)
            const completionLevel = item.value >= item.target ? 3 : item.value >= item.target * 0.7 ? 2 : item.value >= item.target * 0.3 ? 1 : 0
            
            return (
              <div 
                key={index} 
                className="bg-gradient-to-br from-white/80 to-purple-50/60 backdrop-blur-sm rounded-lg border border-purple-200/50 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Inner glass effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-100/20 to-white/10 pointer-events-none" />
                
                <div className="px-3 py-2 relative z-10">
                  {/* Header with icon and label */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="text-purple-500 group-hover:text-purple-600 transition-colors">
                      {React.cloneElement(item.icon as React.ReactElement, { className: 'w-3 h-3' })}
                    </div>
                    <span className="text-xs font-medium text-gray-600 tracking-tight truncate">
                      {item.label.replace(' ', '').toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="relative h-1.5 bg-gradient-to-r from-purple-100 to-purple-50 rounded-full mb-2 overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 rounded-full shadow-sm shadow-purple-500/30 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                    {/* Glow effect */}
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-400/50 to-purple-600/50 rounded-full blur-sm transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  {/* Stats and LED indicators */}
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm font-bold text-gray-800 tracking-tight">
                      <span className="text-purple-600">{item.value}</span>
                      <span className="text-gray-400">/</span>
                      <span>{item.target}</span>
                    </div>
                    
                    {/* 3-dot LED indicator */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            completionLevel >= level
                              ? 'bg-purple-500 shadow-sm shadow-purple-500/50'
                              : 'bg-purple-200'
                          } ${completionLevel === level ? 'animate-pulse' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Percentage */}
                  <div className="text-center mt-1">
                    <span className="text-xs font-medium text-purple-600 font-mono tracking-tight">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
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