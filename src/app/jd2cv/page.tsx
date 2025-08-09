'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useWorkspaceStore } from './store/workspaceStore'
import PromptManager from './components/PromptManager'

export default function JD2CV() {
  const [activeTab, setActiveTab] = useState(0)
  const [jdSubTab, setJdSubTab] = useState(1)
  const [cvSubTab, setCvSubTab] = useState(1)
  const { user, loading } = useCurrentUser()
  const router = useRouter()

  // 检查用户认证状态
  useEffect(() => {
    if (!loading && !user) {
      // 未登录，重定向到登录页
      router.push('/login?redirect=/jd2cv')
    }
  }, [user, loading, router])

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // 未登录不渲染内容
  if (!user) {
    return null
  }
  
  const tabs = [
    {
      id: 'jd-library',
      label: 'JD'
    },
    {
      id: 'cv-library',
      label: 'CV'
    },
    {
      id: 'workspace',
      label: 'JD2CV - Workspace'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">JD2CV</h1>
            <div className="text-sm text-gray-600">
              <span className="font-medium">User ID:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs font-mono">{user.id}</code>
              <button
                onClick={() => navigator.clipboard.writeText(user.id)}
                className="ml-2 text-purple-500 hover:text-purple-600 text-xs"
                title="Copy User ID"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl">
            <div className="flex">
              {tabs.map((tab, index) => {
                const isActive = activeTab === index
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(index)}
                    className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                      index === 0 ? 'rounded-l-xl' : index === 2 ? 'rounded-r-xl' : 'rounded-none'
                    } ${
                      isActive 
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Sub Tab Navigation - Positioned under corresponding main tab */}
          <div className="flex mt-2">
            {/* JD Sub Tabs - Width matches JD tab (1/3) */}
            {activeTab === 0 && (
              <div className="w-1/3">
                <JDSubTabNavigation activeSubTab={jdSubTab} setActiveSubTab={setJdSubTab} />
              </div>
            )}
            
            {/* CV Sub Tabs - Width matches CV tab (1/3), positioned in middle */}
            {activeTab === 1 && (
              <>
                <div className="w-1/3"></div>
                <div className="w-1/3">
                  <CVSubTabNavigation activeSubTab={cvSubTab} setActiveSubTab={setCvSubTab} />
                </div>
              </>
            )}
            
            {/* Workspace has no sub tabs */}
            {activeTab === 2 && <div className="w-full"></div>}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 0 && <JDLibraryContent user={user} activeSubTab={jdSubTab} setActiveSubTab={setJdSubTab} />}
          {activeTab === 1 && <CVLibraryContent user={user} activeSubTab={cvSubTab} setActiveSubTab={setCvSubTab} />}
          {activeTab === 2 && <WorkspaceContent />}
        </div>
      </div>
    </div>
  )
}

// Workspace Tab Content
function WorkspaceContent() {
  const router = useRouter()
  const { 
    selectedJD, 
    selectedExperiences, 
    jdKeySentences, 
    jdKeywords, 
    jdAnalysisLoading,
    setJDAnalysis,
    setJDAnalysisLoading 
  } = useWorkspaceStore()

  const { user } = useCurrentUser()
  const [showPromptManager, setShowPromptManager] = useState(false)

  const analyzeJD = async () => {
    if (!selectedJD || !user) return

    setJDAnalysisLoading(true)
    try {
      const response = await fetch('/api/jd2cv/analyze-jd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jdId: selectedJD.id,
          userId: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze JD')
      }

      if (result.success) {
        setJDAnalysis(result.data.keySentences, result.data.keywords)
      }
    } catch (error: any) {
      console.error('JD analysis error:', error)
      alert(`Failed to analyze JD: ${error.message}`)
    } finally {
      setJDAnalysisLoading(false)
    }
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - JD Analysis */}
        <div className="col-span-5">
          <JDAnalysisSection 
            selectedJD={selectedJD}
            keySentences={jdKeySentences}
            keywords={jdKeywords}
            isLoading={jdAnalysisLoading}
            onAnalyze={analyzeJD}
          />
        </div>

        {/* Right Column - CV Optimization */}
        <div className="col-span-7">
          <CVOptimizationSection 
            selectedJD={selectedJD}
            selectedExperiences={selectedExperiences}
            jdKeywords={jdKeywords}
          />
        </div>
      </div>

      {/* Floating CV Builder Button */}
      <button
        onClick={() => router.push('/jd2cv/cv-builder')}
        className="fixed bottom-20 right-6 w-32 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium whitespace-nowrap shadow-lg transition-all duration-200 flex items-center justify-center gap-2 z-40"
        title="CV Builder"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm0 6h6v2H7v-2z" clipRule="evenodd" />
        </svg>
        CV Builder
      </button>

      {/* Floating Prompt Manager Button */}
      <button
        onClick={() => setShowPromptManager(true)}
        className="fixed bottom-6 right-6 w-10 h-10 bg-purple-400 hover:bg-purple-500 text-white rounded-full shadow-md transition-all duration-200 flex items-center justify-center group z-40 opacity-60 hover:opacity-100"
        title="Prompt Manager"
      >
        <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Prompt Manager Modal */}
      <PromptManager 
        isOpen={showPromptManager}
        onClose={() => setShowPromptManager(false)}
      />
    </div>
  )
}

// JD Analysis Section Component
function JDAnalysisSection({ 
  selectedJD, 
  keySentences, 
  keywords, 
  isLoading, 
  onAnalyze 
}: any) {
  if (!selectedJD) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">JD Analysis</h3>
        <div className="text-center text-gray-500">
          <p>No JD selected</p>
          <p className="text-sm mt-2">Select a JD from the JD Library to begin analysis</p>
        </div>
      </div>
    )
  }

  const hasAnalysis = keySentences.length > 0 && Object.keys(keywords).length > 0

  return (
    <div className="space-y-4">
      {/* Selected JD Info */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected JD</h3>
        <div className="bg-white/60 rounded-lg p-5 border border-gray-200">
          {/* First Row: Title, Company, Application Stage */}
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-800">{selectedJD.title}</h4>
            <span className="text-gray-400">•</span>
            <p className="text-sm text-gray-600 font-medium">{selectedJD.company}</p>
            {selectedJD.application_stage && (
              <>
                <span className="text-gray-400">•</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                  {selectedJD.application_stage}
                </span>
              </>
            )}
          </div>

          {/* Second Row: Metadata */}
          <div className="flex items-center gap-3 text-xs mb-3">
            {selectedJD.role_group && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {selectedJD.role_group}
              </span>
            )}
            
            {selectedJD.firm_type && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {selectedJD.firm_type}
              </span>
            )}
            
            {/* Score Display - Read Only in Workspace */}
            {selectedJD.match_score && selectedJD.match_score > 0 && (
              <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-medium text-xs">
                Score: {Math.min(10, Math.ceil(selectedJD.match_score / 10))}/10
              </span>
            )}
            
            {selectedJD.created_at && (
              <span className="text-gray-500">
                {new Date(selectedJD.created_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Keywords */}
          {selectedJD.keywords_from_sentences && (
            <div className="mb-3">
              <div className="text-xs text-gray-600 whitespace-pre-wrap">
                {selectedJD.keywords_from_sentences}
              </div>
            </div>
          )}

          {/* Key Sentences Preview */}
          {(() => {
            let keySentences = [];
            try {
              if (selectedJD.jd_key_sentences) {
                keySentences = selectedJD.jd_key_sentences.split('\n').filter(s => s.trim());
              }
            } catch (e) {
              keySentences = [];
            }
            
            return keySentences.length > 0 && (
              <div className="text-sm text-gray-600 mb-3">
                <p className="line-clamp-2">
                  {keySentences.slice(0, 2).join('. ')}
                  {keySentences.length > 2 ? '...' : ''}
                </p>
              </div>
            );
          })()}

          {/* CV PDF & Comment */}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
            {selectedJD.cv_pdf_url && selectedJD.cv_pdf_filename && (
              <a 
                href={selectedJD.cv_pdf_url} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-500 hover:text-purple-700 hover:underline flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
                </svg>
                {selectedJD.cv_pdf_filename}
              </a>
            )}
            
            {selectedJD.comment && (
              <span className="text-xs text-gray-500">
                "{selectedJD.comment}"
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={onAnalyze}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {hasAnalysis ? 'Re-analyze JD' : 'Analyze JD'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Key Sentences */}
      {keySentences && (
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Sentences</h3>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {keySentences}
          </div>
        </div>
      )}

      {/* Keywords */}
      {keywords && (
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Keywords</h3>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {keywords}
          </div>
        </div>
      )}
    </div>
  )
}

// CV Optimization Section Component  
function CVOptimizationSection({ selectedJD, selectedExperiences, jdKeywords }: any) {
  if (!selectedJD) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Experience Optimization</h3>
        <div className="text-center text-gray-500">
          <p>Please select a JD first</p>
        </div>
      </div>
    )
  }

  if (selectedExperiences.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Experience Optimization</h3>
        <div className="text-center text-gray-500">
          <p>No experiences selected</p>
          <p className="text-sm mt-2">Select experiences from the CV Library to optimize</p>
        </div>
      </div>
    )
  }


  // Sort experiences by time (most recent first)
  const sortedExperiences = [...selectedExperiences].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-4">
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Experience Optimization ({selectedExperiences.length} selected)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Target JD: <span className="font-medium">{selectedJD.title}</span> at{' '}
          <span className="font-medium">{selectedJD.company}</span>
        </p>
      </div>

      {/* Experience Optimization Cards */}
      <div className="space-y-4">
        {sortedExperiences.map((experience, index) => (
          <ExperienceOptimizationCard
            key={experience.id}
            experience={experience}
            jdKeywords={jdKeywords || selectedJD.keywords_from_sentences}
            selectedJD={selectedJD}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

// Experience Optimization Card Component
function ExperienceOptimizationCard({ experience, jdKeywords, selectedJD, index }: any) {
  const { 
    optimizedExperiences, 
    setOptimizedExperience, 
    setExperienceGenerating, 
    updateUserKeywords 
  } = useWorkspaceStore()
  
  const { user } = useCurrentUser()
  
  const optimizationData = optimizedExperiences[experience.id]
  const isGenerating = optimizationData?.isGenerating || false
  const isGenerated = optimizationData?.isGenerated || false
  const optimizedContent = optimizationData?.optimizedContent || ''
  const userKeywords = optimizationData?.userKeywords || []

  const generateOptimizedExperience = async () => {
    if (!user) return

    setExperienceGenerating(experience.id, true)
    
    try {
      const response = await fetch('/api/jd2cv/optimize-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experienceId: experience.id,
          jdKeywords: jdKeywords,
          userId: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to optimize experience')
      }

      if (result.success) {
        setOptimizedExperience(experience.id, result.data.optimizedContent, [])
      }
    } catch (error: any) {
      console.error('Experience optimization error:', error)
      alert(`Failed to optimize experience: ${error.message}`)
    } finally {
      setExperienceGenerating(experience.id, false)
    }
  }

  const saveOptimizedExperience = async () => {
    if (!user || !optimizedContent) return

    try {
      const response = await fetch('/api/jd2cv/optimize-cv', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalExperienceId: experience.id,
          optimizedContent: optimizedContent,
          userKeywords: userKeywords,
          userId: user.id,
          jdId: selectedJD?.id || null,
          jdTitle: selectedJD?.title || '',
          jdCompany: selectedJD?.company || ''
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save optimized experience')
      }

      if (result.success) {
        alert('Optimized experience saved successfully!')
      }
    } catch (error: any) {
      console.error('Save optimized experience error:', error)
      alert(`Failed to save: ${error.message}`)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-purple-600">#{index + 1}</span>
            <h4 className="font-semibold text-gray-800">{experience.title}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-1">{experience.company}</p>
          {experience.time && (
            <p className="text-xs text-gray-500">{experience.time}</p>
          )}
        </div>
        
      </div>

      {/* Original Experience */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Original Experience</h5>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{experience.experience}</p>
        
        {experience.keywords && experience.keywords.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Original Keywords:</p>
            <div className="flex flex-wrap gap-1">
              {experience.keywords.map((keyword: string, idx: number) => (
                <span 
                  key={idx}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      {!isGenerated && (
        <div className="mb-4">
          <button
            onClick={generateOptimizedExperience}
            disabled={isGenerating || !jdKeywords}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              !jdKeywords 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : !jdKeywords ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Analyze JD First
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                </svg>
                Generate Optimized Experience
              </>
            )}
          </button>
        </div>
      )}

      {/* Optimized Result */}
      {isGenerated && optimizedContent && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h5 className="text-sm font-medium text-purple-800 mb-2">Optimized Experience</h5>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{optimizedContent}</p>
          </div>

          {/* User Keywords Input */}
          <div>
            <KeywordsInput 
              keywords={userKeywords}
              onChange={(keywords) => updateUserKeywords(experience.id, keywords)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigator.clipboard.writeText(optimizedContent)}
              className="w-32 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
              </svg>
              Copy
            </button>
            
            <button
              onClick={saveOptimizedExperience}
              className="w-32 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
              Save
            </button>

            <button
              onClick={generateOptimizedExperience}
              className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"></path>
              </svg>
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Sub Tab Navigation Components
function JDSubTabNavigation({ activeSubTab, setActiveSubTab }: { activeSubTab: number, setActiveSubTab: (index: number) => void }) {
  const subTabs = [
    { id: 'create', label: 'Create' },
    { id: 'library', label: 'Library' }
  ]

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md">
      <div className="flex">
        {subTabs.map((tab, index) => {
          const isActive = activeSubTab === index
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(index)}
              className={`flex-1 px-4 py-2 text-center text-xs font-medium transition-all ${
                index === 0 ? 'rounded-l-lg' : 'rounded-r-lg'
              } ${
                isActive 
                  ? 'bg-purple-300 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-700 hover:bg-white/40'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CVSubTabNavigation({ activeSubTab, setActiveSubTab }: { activeSubTab: number, setActiveSubTab: (index: number) => void }) {
  const subTabs = [
    { id: 'create', label: 'Create' },
    { id: 'library', label: 'Library' }
  ]

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md">
      <div className="flex">
        {subTabs.map((tab, index) => {
          const isActive = activeSubTab === index
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(index)}
              className={`flex-1 px-4 py-2 text-center text-xs font-medium transition-all ${
                index === 0 ? 'rounded-l-lg' : 'rounded-r-lg'
              } ${
                isActive 
                  ? 'bg-purple-300 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-700 hover:bg-white/40'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// JD Library Tab Content
function JDLibraryContent({ user, activeSubTab, setActiveSubTab }: { user: any, activeSubTab: number, setActiveSubTab: (index: number) => void }) {
  const [jdData, setJdData] = useState({
    title: '',
    company: '',
    full_job_description: '',
    jd_key_sentences: '',
    keywords_from_sentences: '',
    application_stage: '',
    role_group: '',
    firm_type: '',
    comment: '',
    match_score: 0,
    cv_pdf_url: '',
    cv_pdf_filename: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [savedRecords, setSavedRecords] = useState<any[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [recordsLoaded, setRecordsLoaded] = useState(false)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)

  const subTabs = [
    { id: 'create', label: 'Create' },
    { id: 'library', label: 'Library' }
  ]

  const handleInputChange = (field: string, value: string | number) => {
    setJdData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!jdData.title || !jdData.company) {
      alert('Please fill in Title and Company')
      return
    }
    
    setIsLoading(true)
    try {
      const isUpdate = editingRecordId !== null
      const url = '/api/jd2cv/supabase'
      const method = isUpdate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...jdData,
          user_id: user.id,
          ...(isUpdate && { record_id: editingRecordId })
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save')
      }

      alert(isUpdate ? 'JD updated successfully' : 'JD saved successfully')
      // Clear form after successful save
      handleClear()
      // Reload records to show updated data
      loadSavedRecords()
    } catch (error: any) {
      console.error('Save error:', error)
      alert(`Failed to save: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setJdData({
      title: '',
      company: '',
      full_job_description: '',
      jd_key_sentences: '',
      keywords_from_sentences: '',
      application_stage: '',
      role_group: '',
      firm_type: '',
      comment: '',
      match_score: 0,
      cv_pdf_url: '',
      cv_pdf_filename: ''
    })
    setEditingRecordId(null)
  }

  const loadSavedRecords = async () => {
    setLoadingRecords(true)
    try {
      const response = await fetch(`/api/jd2cv/supabase?user_id=${user.id}&limit=20`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load records')
      }

      setSavedRecords(result.data || [])
      setRecordsLoaded(true)
    } catch (error: any) {
      console.error('Load error:', error)
      alert(`Failed to load records: ${error.message}`)
    } finally {
      setLoadingRecords(false)
    }
  }

  // Auto-load records when switching to Library tab
  React.useEffect(() => {
    if (activeSubTab === 1 && !recordsLoaded && !loadingRecords) {
      loadSavedRecords()
    }
  }, [activeSubTab, recordsLoaded, loadingRecords])

  // Update JD Score function
  const updateJDScore = async (recordId: string, newScore: number) => {
    try {
      const response = await fetch('/api/jd2cv/supabase', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          record_id: recordId,
          user_id: user.id,
          match_score: newScore
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update score')
      }

      // Update local state
      setSavedRecords(prev => 
        prev.map(record => 
          record.id === recordId 
            ? { ...record, match_score: newScore }
            : record
        )
      )
    } catch (error: any) {
      console.error('Update score error:', error)
      alert(`Failed to update score: ${error.message}`)
    }
  }

  const loadRecord = (record: any) => {
    setJdData({
      title: record.title || '',
      company: record.company || '',
      full_job_description: record.full_job_description || '',
      jd_key_sentences: record.jd_key_sentences || '',
      keywords_from_sentences: record.keywords_from_sentences || '',
      application_stage: record.application_stage || '',
      role_group: record.role_group || '',
      firm_type: record.firm_type || '',
      comment: record.comment || '',
      match_score: record.match_score || 0,
      cv_pdf_url: record.cv_pdf_url || '',
      cv_pdf_filename: record.cv_pdf_filename || ''
    })
    setEditingRecordId(record.id) // Track editing record ID
    setActiveSubTab(0) // Switch to Create tab with loaded data
  }

  return (
    <>
      {/* Tab Content */}
      {activeSubTab === 0 && <CreateJDContent 
        jdData={jdData}
        setJdData={setJdData}
        isLoading={isLoading}
        editingRecordId={editingRecordId}
        handleInputChange={handleInputChange}
        handleSave={handleSave}
        handleClear={handleClear}
      />}
      
      {activeSubTab === 1 && <LibraryJDContent 
        savedRecords={savedRecords}
        loadingRecords={loadingRecords}
        loadRecord={loadRecord}
        updateJDScore={updateJDScore}
      />}
    </>
  )
}

// Create JD Content Component
function CreateJDContent({ 
  jdData, 
  setJdData, 
  isLoading, 
  editingRecordId,
  handleInputChange, 
  handleSave, 
  handleClear 
}: any) {
  return (
    <>
      {/* Basic Information - Independent glass card */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
          {editingRecordId && (
            <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded">
              Editing existing JD
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Job Title"
            value={jdData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <input
            type="text"
            placeholder="Company Name"
            value={jdData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>
      </div>

      {/* Job Description - Independent glass card */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Job Description</h3>
        <textarea
          placeholder="Paste full job description here..."
          value={jdData.full_job_description}
          onChange={(e) => handleInputChange('full_job_description', e.target.value)}
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white resize-none"
        />
      </div>

      {/* Metadata - Independent glass card */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Metadata</h3>
        <div className="grid grid-cols-3 gap-4">
          <select
            value={jdData.application_stage}
            onChange={(e) => handleInputChange('application_stage', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="">Application Stage</option>
            <option value="Draft">Draft</option>
            <option value="JD Analysis">JD Analysis</option>
            <option value="CV Tailoring">CV Tailoring</option>
            <option value="CV Ready">CV Ready</option>
            <option value="Ready to Apply">Ready to Apply</option>
            <option value="Applied">Applied</option>
            <option value="Phone Screen">Phone Screen</option>
            <option value="Technical Interview">Technical Interview</option>
            <option value="Final Interview">Final Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
          <input
            type="text"
            placeholder="Role Group"
            value={jdData.role_group}
            onChange={(e) => handleInputChange('role_group', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <input
            type="text"
            placeholder="Firm Type"
            value={jdData.firm_type}
            onChange={(e) => handleInputChange('firm_type', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Comment"
            value={jdData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Score:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleInputChange('match_score', star)}
                className={`text-xl transition-colors ${
                  star <= jdData.match_score
                    ? 'text-purple-500'
                    : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions - Independent glass card */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="w-32 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !jdData.title || !jdData.company}
            className="w-32 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? (editingRecordId ? 'Updating...' : 'Saving...') : (editingRecordId ? 'Update' : 'Save')}
          </button>
        </div>
      </div>
    </>
  )
}

// Library JD Content Component
function LibraryJDContent({ 
  savedRecords, 
  loadingRecords, 
  loadRecord,
  updateJDScore 
}: any) {
  const { selectedJD, setSelectedJD } = useWorkspaceStore()

  const handleSelectForWorkspace = (record: any, e?: React.MouseEvent) => {
    e?.stopPropagation() // Prevent triggering loadRecord
    if (selectedJD?.id === record.id) {
      setSelectedJD(null) // 取消选择
    } else {
      setSelectedJD(record) // 选择新记录
    }
  }

  const handleDeleteJD = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this JD record? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/jd2cv/jd-records', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: recordId,
          user_id: user?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete JD record')
      }

      // Refresh the records list
      await loadSavedRecords()
      
      // Clear selected JD if it was deleted
      if (selectedJD?.id === recordId) {
        setSelectedJD(null)
      }

    } catch (error) {
      console.error('Error deleting JD record:', error)
      alert('Failed to delete JD record. Please try again.')
    }
  }
  if (loadingRecords) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-600">Loading JD records...</span>
        </div>
      </div>
    )
  }

  if (savedRecords.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <div className="text-center text-gray-500">
          <p>No JD records found.</p>
          <p className="text-sm mt-2">Switch to Create tab to add your first job description.</p>
        </div>
      </div>
    )
  }

  if (loadingRecords) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-600">Loading JD records...</span>
        </div>
      </div>
    )
  }

  if (savedRecords.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <div className="text-center text-gray-500">
          <p>No JD records found.</p>
          <p className="text-sm mt-2">Switch to Create tab to add your first job description.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Saved JD Records ({savedRecords.length})</h3>
      <div className="space-y-4">
        {savedRecords.map((record) => {
          // Parse Keywords into 3 groups
          const parseKeywords = (keywordsText: string) => {
            const groups = { group1: '', group2: '', group3: '' }
            if (!keywordsText) return groups
            
            const lines = keywordsText.split('\n')
            let currentGroup = ''
            let currentContent = []
            
            for (const line of lines) {
              if (line.includes('Group 1:')) {
                currentGroup = 'group1'
                currentContent = []
              } else if (line.includes('Group 2:')) {
                if (currentGroup === 'group1') groups.group1 = currentContent.join(' ')
                currentGroup = 'group2'
                currentContent = []
              } else if (line.includes('Group 3:')) {
                if (currentGroup === 'group2') groups.group2 = currentContent.join(' ')
                currentGroup = 'group3'
                currentContent = []
              } else if (line.trim() && currentGroup) {
                currentContent.push(line.trim())
              }
            }
            if (currentGroup === 'group3') groups.group3 = currentContent.join(' ')
            
            return groups
          }
          
          const keywordGroups = parseKeywords(record.keywords_from_sentences || '')
          
          return (
            <div key={record.id} className="bg-white/60 rounded-lg p-3 hover:bg-white/80 transition-colors border border-gray-200 grid grid-cols-10 gap-3">
              
              {/* Left 90%: Content Area */}
              <div className="col-span-9">
                {/* First Row: Title • Company • Role Group • Stage • Type • Score • Date */}
                <div className="relative mb-3">
                  {/* Title: 0% - 33% */}
                  <div className="absolute left-0 w-[33%]">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">{record.title}</h4>
                  </div>
                  
                  {/* Company: 33% - 48% */}
                  <div className="absolute left-[33%] w-[15%]">
                    <span className="text-gray-700 font-medium text-xs truncate block">{record.company}</span>
                  </div>
                  
                  {/* Role Group: 48% - 63% */}
                  <div className="absolute left-[48%] w-[15%]">
                    {record.role_group && (
                      <span className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded-full text-xs truncate block text-center">
                        {record.role_group}
                      </span>
                    )}
                  </div>
                  
                  {/* Stage: 63% - 72% */}
                  <div className="absolute left-[63%] w-[9%]">
                    {record.application_stage && (
                      <span className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded-full text-xs font-medium truncate block text-center">
                        {record.application_stage}
                      </span>
                    )}
                  </div>
                  
                  {/* Firm Type: 72% - 81% */}
                  <div className="absolute left-[72%] w-[9%]">
                    {record.firm_type && (
                      <span className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded-full text-xs truncate block text-center">
                        {record.firm_type}
                      </span>
                    )}
                  </div>
                  
                  {/* Score: 81% - 90% */}
                  <div className="absolute left-[81%] w-[9%]">
                    <span className="text-gray-500 text-xs block text-center">
                      {Math.min(10, Math.ceil((record.match_score || 0) / 10)) || 0}/10
                    </span>
                  </div>
                  
                  {/* Date: 90% - 100% */}
                  <div className="absolute left-[90%] w-[10%]">
                    {record.created_at && (
                      <span className="text-gray-400 text-xs block text-center truncate">
                        {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Spacer for absolute positioning */}
                  <div className="h-6"></div>
                </div>

                {/* Second Row: 3 Columns for Keywords Groups (90% width) */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-purple-50 p-2 rounded">
                    <div className="font-medium text-purple-700 mb-1">Group 1</div>
                    <div className="text-gray-700">
                      {keywordGroups.group1 || 'No keywords'}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-2 rounded">
                    <div className="font-medium text-purple-700 mb-1">Group 2</div>
                    <div className="text-gray-700">
                      {keywordGroups.group2 || 'No keywords'}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-2 rounded">
                    <div className="font-medium text-purple-700 mb-1">Group 3</div>
                    <div className="text-gray-700">
                      {keywordGroups.group3 || 'No keywords'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 10%: Action Buttons (Vertical Stack) */}
              <div className="col-span-1 flex flex-col justify-start gap-2">
                <button
                  onClick={() => handleSelectForWorkspace(record)}
                  className={`w-full px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1 transition-colors ${
                    selectedJD?.id === record.id
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {selectedJD?.id === record.id ? (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Selected
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Select
                    </>
                  )}
                </button>

                <button
                  onClick={() => loadRecord(record)}
                  className="w-full px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1 transition-colors"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteJD(record.id)}
                  className="w-full px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1 transition-colors"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// CV Library Tab Content  
function CVLibraryContent({ user, activeSubTab, setActiveSubTab }: { user: any, activeSubTab: number, setActiveSubTab: (index: number) => void }) {
  const [experienceData, setExperienceData] = useState({
    company: '',
    title: '',
    experience: '',
    keywords: [] as string[],
    role_group: '',
    work_or_project: '',
    time: '',
    comment: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [experienceRecords, setExperienceRecords] = useState<any[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [recordsLoaded, setRecordsLoaded] = useState(false)
  const [companyGroups, setCompanyGroups] = useState<{[key: string]: any[]}>({})

  const subTabs = [
    { id: 'create', label: 'Create' },
    { id: 'library', label: 'Library' }
  ]

  const handleInputChange = (field: string, value: string | string[]) => {
    setExperienceData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!experienceData.company || !experienceData.title || !experienceData.experience) {
      alert('Please fill in Company, Title and Experience')
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...experienceData,
          user_id: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save')
      }

      alert('Experience saved successfully')
      handleClear()
      // Refresh records if on Library tab
      if (recordsLoaded) {
        loadExperienceRecords()
      }
    } catch (error: any) {
      console.error('Save error:', error)
      alert(`Failed to save: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setExperienceData({
      company: '',
      title: '',
      experience: '',
      keywords: [],
      role_group: '',
      work_or_project: '',
      time: '',
      comment: ''
    })
  }

  const loadExperienceRecords = async () => {
    setLoadingRecords(true)
    try {
      const response = await fetch(`/api/experience?user_id=${user.id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load records')
      }

      setExperienceRecords(result.data || [])
      
      // Group by company
      const groups = (result.data || []).reduce((acc: any, record: any) => {
        const company = record.company
        if (!acc[company]) acc[company] = []
        acc[company].push(record)
        return acc
      }, {})
      setCompanyGroups(groups)
      setRecordsLoaded(true)
    } catch (error: any) {
      console.error('Load error:', error)
      alert(`Failed to load records: ${error.message}`)
    } finally {
      setLoadingRecords(false)
    }
  }

  const loadRecord = (record: any) => {
    setExperienceData({
      company: record.company || '',
      title: record.title || '',
      experience: record.experience || '',
      keywords: record.keywords || [],
      role_group: record.role_group || '',
      work_or_project: record.work_or_project || '',
      time: record.time || '',
      comment: record.comment || ''
    })
    setActiveSubTab(0) // Switch to Create tab with loaded data
  }

  // Auto-load records when switching to Library tab
  React.useEffect(() => {
    if (activeSubTab === 1 && !recordsLoaded && !loadingRecords) {
      loadExperienceRecords()
    }
  }, [activeSubTab, recordsLoaded, loadingRecords])

  return (
    <>
      {/* Tab Content */}
      {activeSubTab === 0 && <CreateExperienceContent 
        experienceData={experienceData}
        isLoading={isLoading}
        handleInputChange={handleInputChange}
        handleSave={handleSave}
        handleClear={handleClear}
      />}
      
      {activeSubTab === 1 && <ExperienceLibraryContent 
        companyGroups={companyGroups}
        loadingRecords={loadingRecords}
        loadRecord={loadRecord}
        user={user}
        loadExperienceRecords={loadExperienceRecords}
      />}
    </>
  )
}

// Create Experience Content Component
function CreateExperienceContent({ 
  experienceData, 
  isLoading, 
  handleInputChange, 
  handleSave, 
  handleClear 
}: any) {
  return (
    <>
      {/* Basic Information - Independent glass card */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Company"
            value={experienceData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <input
            type="text"
            placeholder="Job Title"
            value={experienceData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>
      </div>

      {/* Experience Description - Independent glass card */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Experience Description</h3>
        <textarea
          placeholder="Describe your experience in detail..."
          value={experienceData.experience}
          onChange={(e) => handleInputChange('experience', e.target.value)}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white resize-none"
        />
      </div>

      {/* Keywords - Independent glass card */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Keywords</h3>
        <KeywordsInput 
          keywords={experienceData.keywords}
          onChange={(keywords) => handleInputChange('keywords', keywords)}
        />
      </div>

      {/* Additional Details - Independent glass card */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Additional Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Role Group"
            value={experienceData.role_group}
            onChange={(e) => handleInputChange('role_group', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <select
            value={experienceData.work_or_project}
            onChange={(e) => handleInputChange('work_or_project', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="">Work or Project</option>
            <option value="work">Work</option>
            <option value="project">Project</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Time Period"
            value={experienceData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <input
            type="text"
            placeholder="Comment"
            value={experienceData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>
      </div>

      {/* Actions - Independent glass card */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="w-32 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !experienceData.company || !experienceData.title || !experienceData.experience}
            className="w-32 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z"></path>
            </svg>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </>
  )
}

// Experience Library Content Component
function ExperienceLibraryContent({ 
  companyGroups, 
  loadingRecords, 
  loadRecord,
  user,
  loadExperienceRecords 
}: any) {
  const { selectedExperiences, addSelectedExperience, removeSelectedExperience } = useWorkspaceStore()
  const [selectedCompany, setSelectedCompany] = React.useState<string>('')

  const handleToggleSelection = (record: any, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering loadRecord
    const isSelected = selectedExperiences.find(exp => exp.id === record.id)
    if (isSelected) {
      removeSelectedExperience(record.id)
    } else {
      addSelectedExperience(record)
    }
  }

  const handleDeleteCV = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this CV record? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/experience?id=${recordId}&user_id=${user?.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete CV record')
      }

      // Refresh the records list
      await loadExperienceRecords()
      
    } catch (error) {
      console.error('Error deleting CV record:', error)
      alert('Failed to delete CV record. Please try again.')
    }
  }

  // Parse time and extract end year for sorting
  const getEndYear = (timeString: string): number => {
    if (!timeString) return 0
    // Handle "Present", "Current", etc.
    if (timeString.toLowerCase().includes('present') || 
        timeString.toLowerCase().includes('current')) {
      return 9999 // Put current positions first
    }
    // Extract year from formats like "2021 - 2023", "2021-2023", "Jan 2021 - Dec 2023"
    const yearMatch = timeString.match(/(\d{4})\s*$/) || timeString.match(/(\d{4})\s*-\s*(\d{4})/)
    if (yearMatch) {
      return parseInt(yearMatch[yearMatch.length - 1]) || 0
    }
    return 0
  }

  // Get the latest end year for each company
  const getCompanyLatestEndYear = (companyName: string): number => {
    const records = companyGroups[companyName] || []
    return Math.max(...records.map((record: any) => getEndYear(record.time || '')))
  }

  // Sort companies by latest end year (descending - most recent first)
  const sortedCompanyNames = Object.keys(companyGroups).sort((a, b) => {
    const yearA = getCompanyLatestEndYear(a)
    const yearB = getCompanyLatestEndYear(b)
    return yearB - yearA
  })

  // Set default selected company to first one
  React.useEffect(() => {
    if (sortedCompanyNames.length > 0 && !selectedCompany) {
      setSelectedCompany(sortedCompanyNames[0])
    }
  }, [sortedCompanyNames, selectedCompany])

  if (loadingRecords) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-600">Loading experience records...</span>
        </div>
      </div>
    )
  }

  if (sortedCompanyNames.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <div className="text-center text-gray-500">
          <p>No experience records found.</p>
          <p className="text-sm mt-2">Switch to Create tab to add your first experience.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Company Tabs */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl">
        <div className="flex">
          {sortedCompanyNames.map((companyName, index) => (
            <button
              key={companyName}
              onClick={() => setSelectedCompany(companyName)}
              className={`flex-1 px-4 py-4 text-center font-medium whitespace-nowrap transition-all flex items-center justify-center gap-2 ${
                index === 0 ? 'rounded-l-xl' : ''
              } ${
                index === sortedCompanyNames.length - 1 ? 'rounded-r-xl' : ''
              } ${
                selectedCompany === companyName
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span className="truncate">{companyName}</span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                selectedCompany === companyName
                  ? 'bg-white/20 text-white'
                  : 'bg-purple-500 text-white'
              }`}>
                {companyGroups[companyName].length}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Company Content */}
      {selectedCompany && companyGroups[selectedCompany] && (
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
          <div className="space-y-3">
            {companyGroups[selectedCompany].map((record: any) => (
              <div key={record.id} className="bg-white/60 rounded-lg p-3 hover:bg-white/80 transition-colors border border-gray-200 grid grid-cols-10 gap-3">
                
                {/* Left 90%: Content Area */}
                <div className="col-span-9">
                  {/* First Row: Title • Time • Work/Project • Role Group • Comment */}
                  <div className="relative mb-3">
                    {/* Title: 0% - 30% */}
                    <div className="absolute left-0 w-[30%]">
                      <h4 className="text-sm font-semibold text-gray-800 truncate">{record.title}</h4>
                    </div>
                    
                    {/* Time: 30% - 50% */}
                    <div className="absolute left-[30%] w-[20%]">
                      {record.time && (
                        <span className="text-gray-600 text-xs truncate block">{record.time}</span>
                      )}
                    </div>
                    
                    {/* Work/Project: 50% - 65% */}
                    <div className="absolute left-[50%] w-[15%]">
                      {record.work_or_project && (
                        <span className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded-full text-xs truncate block text-center">
                          {record.work_or_project}
                        </span>
                      )}
                    </div>
                    
                    {/* Role Group: 65% - 80% */}
                    <div className="absolute left-[65%] w-[15%]">
                      {record.role_group && (
                        <span className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded-full text-xs truncate block text-center">
                          {record.role_group}
                        </span>
                      )}
                    </div>
                    
                    {/* Comment: 80% - 100% */}
                    <div className="absolute left-[80%] w-[20%]">
                      {record.comment && (
                        <span className="text-gray-600 text-xs truncate block">
                          "{record.comment}"
                        </span>
                      )}
                    </div>
                    
                    {/* Spacer for absolute positioning */}
                    <div className="h-6"></div>
                  </div>

                  {/* Second Row: Keywords (90% width) */}
                  {record.keywords && record.keywords.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {record.keywords.map((keyword: string, idx: number) => (
                          <span key={idx} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Third Row: Experience Content (90% width) */}
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {record.experience}
                  </div>
                </div>

                {/* Right 10%: Action Buttons (Vertical Stack) */}
                <div className="col-span-1 flex flex-col justify-start gap-2">
                  <button
                    onClick={(e) => handleToggleSelection(record, e)}
                    className={`w-full px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1 transition-colors ${
                      selectedExperiences.find(exp => exp.id === record.id)
                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {selectedExperiences.find(exp => exp.id === record.id) ? (
                      <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Selected
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Select
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => loadRecord(record)}
                    className="w-full px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteCV(record.id)}
                    className="w-full px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Keywords Input Component
function KeywordsInput({ keywords, onChange }: { keywords: string[], onChange: (keywords: string[]) => void }) {
  const [inputValue, setInputValue] = React.useState('')

  const addKeyword = () => {
    const newKeyword = inputValue.trim()
    if (newKeyword && !keywords.includes(newKeyword)) {
      onChange([...keywords, newKeyword])
      setInputValue('')
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    onChange(keywords.filter(keyword => keyword !== keywordToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add keyword..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        />
        <button
          type="button"
          onClick={addKeyword}
          disabled={!inputValue.trim()}
          className="w-32 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"></path>
          </svg>
          Add
        </button>
      </div>
      
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="ml-1 text-purple-500 hover:text-purple-700 transition-colors"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}