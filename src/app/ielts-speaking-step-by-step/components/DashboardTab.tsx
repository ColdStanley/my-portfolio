'use client'

import { useState, useEffect } from 'react'
import { PartType } from '../store/useIELTSStepStore'
import MarkdownContent from './MarkdownContent'

interface SessionData {
  user_id: string
  part: string
  current_step: number
  step_results: Record<string, any>
  is_completed: boolean
}

interface CompletedQuestion {
  id: string
  content: string
  optimizations: {
    band6?: any
    band7?: any
    band8?: any
  }
}

export default function DashboardTab() {
  const [activePart, setActivePart] = useState<PartType>('part1')
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [activeOptimizationTab, setActiveOptimizationTab] = useState<string>('6')
  const [sessionsData, setSessionsData] = useState<Record<PartType, SessionData | null>>({
    part1: null,
    part2: null,
    part3: null
  })
  const [isLoading, setIsLoading] = useState(true)

  // Helper function to get user ID (same as in store)
  const getUserId = (): string => {
    if (typeof window === 'undefined') return ''
    
    let userId = localStorage.getItem('ielts-anonymous-user-id')
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    
    if (!userId || !uuidRegex.test(userId)) {
      // Generate new UUID if needed
      userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
      localStorage.setItem('ielts-anonymous-user-id', userId)
    }
    return userId
  }

  // Fetch session data for a specific part
  const fetchPartData = async (part: PartType): Promise<SessionData | null> => {
    try {
      const userId = getUserId()
      if (!userId) return null

      const response = await fetch(`/api/ielts-speaking-step-by-step/sessions?userId=${userId}&part=${part}`)
      if (!response.ok) return null
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Failed to fetch data for ${part}:`, error)
      return null
    }
  }

  // Load all session data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true)
      const parts: PartType[] = ['part1', 'part2', 'part3']
      
      const dataPromises = parts.map(part => fetchPartData(part))
      const results = await Promise.all(dataPromises)
      
      const newSessionsData: Record<PartType, SessionData | null> = {
        part1: results[0],
        part2: results[1], 
        part3: results[2]
      }
      
      setSessionsData(newSessionsData)
      setIsLoading(false)
    }

    loadAllData()
  }, [])

  // Check if a part has completed the full 7-step process
  const hasCompletedFullProcess = (sessionData: SessionData | null): boolean => {
    if (!sessionData || !sessionData.step_results) return false
    
    const stepResults = sessionData.step_results
    const step1Result = stepResults['1']
    const step7_band6 = stepResults['7_band6']
    const step7_band7 = stepResults['7_band7']  
    const step7_band8 = stepResults['7_band8']
    
    return step1Result && (step7_band6 || step7_band7 || step7_band8)
  }

  // Get completed questions for a part
  const getCompletedQuestions = (part: PartType): CompletedQuestion[] => {
    const sessionData = sessionsData[part]
    if (!hasCompletedFullProcess(sessionData)) return []
    
    const stepResults = sessionData!.step_results
    const step1Result = stepResults['1']
    const step7_band6 = stepResults['7_band6']
    const step7_band7 = stepResults['7_band7']
    const step7_band8 = stepResults['7_band8']
    
    return [{
      id: `${part}-question-1`, // Unique identifier for this question
      content: step1Result?.content || '',
      optimizations: {
        band6: step7_band6,
        band7: step7_band7, 
        band8: step7_band8
      }
    }]
  }

  const toggleQuestionExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const allParts: PartType[] = ['part1', 'part2', 'part3']
  const partTitles = {
    part1: 'Part 1',
    part2: 'Part 2', 
    part3: 'Part 3'
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-6">
      {/* Part Tabs - Always show all three parts */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            {allParts.map((part) => {
              const isActive = activePart === part
              
              return (
                <button
                  key={part}
                  onClick={() => setActivePart(part)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {partTitles[part]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto">
        {(() => {
          const completedQuestions = getCompletedQuestions(activePart)
          
          // No questions for this part
          if (completedQuestions.length === 0) {
            return (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions</h3>
                <p className="text-sm text-gray-500">Complete the 7-step learning process for {partTitles[activePart]} to see results here.</p>
              </div>
            )
          }

          // Show questions for this part
          return (
            <div className="space-y-4">
              {completedQuestions.map((question) => {
                const isExpanded = expandedQuestions.has(question.id)
                const availableBands = (['6', '7', '8'] as const).filter(band => 
                  question.optimizations[`band${band}` as keyof typeof question.optimizations]
                )
                
                return (
                  <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Question Header - Clickable to expand/collapse */}
                    <button
                      onClick={() => toggleQuestionExpansion(question.id)}
                      className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Question</h3>
                        <div className="text-gray-700 leading-relaxed">
                          <MarkdownContent 
                            content={question.content}
                            className="text-gray-700 leading-relaxed text-sm"
                          />
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </button>

                    {/* Optimization Results - Show when expanded */}
                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        <div className="p-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Optimization Results</h4>
                          
                          {/* Band Tabs */}
                          <div className="border-b border-gray-200 mb-6">
                            <div className="flex space-x-8">
                              {availableBands.map((band) => {
                                const isActive = activeOptimizationTab === band
                                
                                return (
                                  <button
                                    key={band}
                                    onClick={() => setActiveOptimizationTab(band)}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                      isActive
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                  >
                                    Band {band}
                                    <svg className="w-4 h-4 ml-1 inline text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Band Content */}
                          <div>
                            {(() => {
                              const currentBandResult = question.optimizations[`band${activeOptimizationTab}` as keyof typeof question.optimizations]
                              
                              return currentBandResult ? (
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <MarkdownContent 
                                    content={currentBandResult.content}
                                    className="text-gray-800 leading-relaxed text-sm"
                                  />
                                </div>
                              ) : (
                                <div className="text-center text-gray-500 py-8">
                                  <p className="text-sm">Band {activeOptimizationTab} optimization not available</p>
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>
    </div>
  )
}