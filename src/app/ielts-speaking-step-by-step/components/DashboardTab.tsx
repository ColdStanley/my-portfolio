'use client'

import { useIELTSStepStore } from '../store/useIELTSStepStore'

export default function DashboardTab() {
  const { progress, setActivePart, setActiveTab } = useIELTSStepStore()

  const parts = [
    {
      id: 'part1' as const,
      title: 'Part 1',
      description: 'Personal Questions',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      id: 'part2' as const,
      title: 'Part 2',
      description: 'Individual Long Turn',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      id: 'part3' as const,
      title: 'Part 3',
      description: 'Two-way Discussion',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/>
        </svg>
      )
    }
  ]

  const handlePartSelect = (partId: 'part1' | 'part2' | 'part3') => {
    setActivePart(partId)
    setActiveTab('learning')
  }

  const getProgressPercentage = (partId: 'part1' | 'part2' | 'part3') => {
    const currentStep = progress[partId]?.currentStep || 1
    const totalSteps = 4 // 当前4个步骤
    return Math.min((currentStep / totalSteps) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">IELTS Speaking Step by Step</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI-guided practice for all three parts of IELTS Speaking test. Build confidence through structured learning.
          </p>
        </div>

        {/* Parts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {parts.map((part) => {
            const progressPercentage = getProgressPercentage(part.id)
            const currentStep = progress[part.id]?.currentStep || 1
            
            return (
              <div
                key={part.id}
                onClick={() => handlePartSelect(part.id)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl border border-purple-100 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer"
                style={{
                  boxShadow: '0 10px 30px rgba(139, 92, 246, 0.1), 0 4px 15px rgba(139, 92, 246, 0.05)'
                }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                        {part.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{part.title}</h3>
                        <p className="text-sm text-gray-600">{part.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>Step {currentStep}/4</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Continue Button */}
                  <button className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium whitespace-nowrap flex items-center justify-center gap-2 transition-colors">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    {progressPercentage === 0 ? 'Start Practice' : 'Continue'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}