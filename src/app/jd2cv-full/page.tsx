'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useWorkspaceStore } from './store/workspaceStore'
import PromptManager from './components/PromptManager'
import JDPage from './components/JDPage'
import PDFSetupModal from './components/PDFSetupModal'
import { CVModuleDraft } from './shared/types'
import { extractBullets, generateModuleTitle } from './shared/utils'
import { useStarredExperiences } from './hooks/useStarredExperiences'
import DeleteTooltip from './components/DeleteTooltip'
import NewNavbar from '@/components/NewNavbar'
import FooterSection from '@/components/FooterSection'
import PageTransition from '@/components/PageTransition'
import { motion } from 'framer-motion'

export default function JD2CV() {
  const [activeTab, setActiveTab] = useState(0)
  const { selectedJD } = useWorkspaceStore()
  
  // 自动滚动到选中的JD
  const scrollToSelectedJD = () => {
    setTimeout(() => {
      if (selectedJD) {
        const element = document.getElementById(`jd-card-${selectedJD.id}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 100)
  }
  
  const handleTabChange = (index) => {
    setActiveTab(index)
    if (index === 0) { // Dashboard tab
      scrollToSelectedJD()
    }
  }
  const { user, loading } = useCurrentUser()
  const router = useRouter()
  
  
  // PDF related states - moved to WorkspaceContent
  const [showOneClickModal, setShowOneClickModal] = useState(false)
  
  

  // 检查用户认证状态
  useEffect(() => {
    if (!loading && !user) {
      // 未登录，重定向到登录页
      router.push('/login?redirect=/jd2cv-full')
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
    <>
      {/* Hide global navbar and footer for this page */}
      <style jsx global>{`
        body > nav,
        body > footer {
          display: none !important;
        }
      `}</style>
      
      {/* CSS Animations for Intro */}
      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(107, 114, 128, 0.4),
                        0 4px 15px rgba(107, 114, 128, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(107, 114, 128, 0.1),
                        0 8px 25px rgba(107, 114, 128, 0.4);
            transform: scale(1.02);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-3px);
          }
          60% {
            transform: translateY(-2px);
          }
        }
        
      `}</style>
      
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        {/* Custom Navigation */}
        <NewNavbar />


        {/* Fixed Tab Navigation */}
        <div className="fixed top-[104px] left-0 right-0 z-50 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 pb-4 border-b border-gray-100/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20">
            <div className="flex">
              {tabs.map((tab, index) => {
                const isActive = activeTab === index
                
                return (
                  <button
                    key={tab.id}
                    id={index === 2 ? 'tab-workspace' : undefined}
                    onClick={() => handleTabChange(index)}
                    className={`flex-1 px-3 py-3 sm:px-6 sm:py-4 text-center font-medium transition-all duration-300 transform hover:scale-105 text-sm sm:text-base relative ${
                      index === 0 ? 'rounded-l-xl' : index === 2 ? 'rounded-r-xl' : 'rounded-none'
                    } ${
                      isActive 
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                    }`}
                  >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">
                      {index === 0 ? 'JD' : index === 1 ? 'CV' : index === 2 ? 'Workspace' : tab.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Sub Tab Navigation - Positioned under corresponding main tab */}
          <div className="flex mt-2">
            {/* JD has no sub tabs - single page view */}
            {activeTab === 0 && <div className="w-full"></div>}
            
            {/* CV has no sub tabs */}
            {activeTab === 1 && <div className="w-full"></div>}
            
            {/* Workspace has no sub tabs */}
            {activeTab === 2 && <div className="w-full"></div>}
          </div>
        </div>
        </div>

        {/* Main Content - with top padding to account for fixed nav */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-[180px] pb-6">
          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 0 && <JDPage user={user} globalLoading={loading} />}
            {activeTab === 1 && <CVLibraryContent user={user} />}
            {activeTab === 2 && <WorkspaceContent globalLoading={loading} />}
          </div>
        </div>


        {/* PDF Setup Modal - TODO: Create simplified inline setup */}
        
        {/* Footer Section */}
        <FooterSection />
      </div>
      </PageTransition>
    </>
  )
}

// Workspace Tab Content
function WorkspaceContent({ globalLoading = false }) {
  const router = useRouter()
  const { 
    selectedJD, 
    selectedExperiences, 
    optimizedExperiences,
    jdAnalysis,
    jdAnalysisLoading,
    setJDAnalysis,
    setJDAnalysisLoading 
  } = useWorkspaceStore()

  const { user } = useCurrentUser()
  const [showPromptManager, setShowPromptManager] = useState(false)
  
  // PDF related states
  const [hasQuickPDFData, setHasQuickPDFData] = useState(false)
  const [isGeneratingQuickPDF, setIsGeneratingQuickPDF] = useState(false)
  const [quickPDFProgress, setQuickPDFProgress] = useState(0)
  const [pdfModules, setPdfModules] = useState<any[]>([])
  const [showPDFSetup, setShowPDFSetup] = useState(false)

  // Check for existing Quick PDF data
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`oneclick-pdf-data-${user.id}`)
      setHasQuickPDFData(!!stored)
    }
  }, [user])

  // Handle PDF Setup Configuration
  const handlePDFConfigSave = (config: any) => {
    setHasQuickPDFData(true)
  }

  // Handle Quick PDF Click
  const handleQuickPDFClick = async () => {
    if (!hasQuickPDFData || isGeneratingQuickPDF) return
    
    setIsGeneratingQuickPDF(true)
    setQuickPDFProgress(0)
    
    try {
      // Clear previous experiences from PDF modules, keep setup data
      setPdfModules([])
      
      // Get PDF config from localStorage
      const storedConfig = localStorage.getItem(`oneclick-pdf-data-${user?.id}`)
      if (!storedConfig) {
        alert('Please configure PDF settings first')
        return
      }
      
      const config = JSON.parse(storedConfig)
      
      // Prepare experience modules from PDF modules (sent via "Send to One Click PDF")
      const experienceModules = pdfModules.map(module => {
        return {
          id: module.sourceIds?.experienceId || module.id,
          title: module.title,
          content: module.items.join('\n• '),
          isOptimized: module.sourceType === 'optimized'
        }
      })
      
      if (experienceModules.length === 0) {
        alert('Please send some experiences to PDF first using "Send to Quick PDF" buttons')
        return
      }
      
      // Update progress
      setQuickPDFProgress(30)
      
      // Call new PDF generation API
      const response = await fetch('/api/jd2cv-full/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config,
          experienceModules,
          jdId: selectedJD?.id,
          userId: user?.id
        })
      })
      
      setQuickPDFProgress(70)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate PDF')
      }
      
      // Download PDF
      const blob = await response.blob()
      
      // Create filename with JD info
      const safeName = (config.personalInfo.fullName || 'CV').replace(/[^a-zA-Z0-9\s]/g, '')
      const safeCompany = selectedJD ? selectedJD.company.replace(/[^a-zA-Z0-9\s]/g, '') : 'Company'
      const safeTitle = selectedJD ? selectedJD.title.replace(/[^a-zA-Z0-9\s]/g, '') : 'Position'
      const fileName = `${safeName} - ${safeCompany} - ${safeTitle}.pdf`
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setQuickPDFProgress(100)
      
    } catch (error) {
      console.error('PDF generation error:', error)
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGeneratingQuickPDF(false)
      setQuickPDFProgress(0)
    }
  }

  // Add module to PDF data
  const addToPDFModules = (draft: any) => {
    const newModule = {
      id: `module-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: draft.title,
      items: draft.items,
      span: 12,
      sourceType: draft.sourceType,
      sourceIds: draft.sourceIds,
      meta: draft.meta,
      showTitle: true,
      rowId: `row-${Date.now()}`
    }
    
    setPdfModules(prev => [...prev, newModule])
    return { ok: true, id: newModule.id }
  }

  const analyzeJD = async () => {
    if (!selectedJD || !user) return

    setJDAnalysisLoading(true)
    try {
      const response = await fetch('/api/jd2cv-full/analyze-jd', {
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
        // Parse keySentences string into array
        let keySentences = []
        try {
          if (result.data.keySentences && typeof result.data.keySentences === 'string') {
            keySentences = result.data.keySentences
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .map(line => line.replace(/^\d+\.\s*/, '')) // Remove numbering like "1. "
            
          } else if (Array.isArray(result.data.keySentences)) {
            keySentences = result.data.keySentences
          }
        } catch (e) {
          console.error('Error parsing key sentences:', e)
        }

        // Parse keywords string 
        let keywords = { flat: [], groups: [] }
        try {
          if (result.data.keywords && typeof result.data.keywords === 'string') {
            // Try to extract keywords from the string format
            const lines = result.data.keywords.split('\n').filter(line => line.trim())
            const flat = []
            const groups = []
            let currentGroup = []
            
            for (const line of lines) {
              const trimmed = line.trim()
              if (trimmed.startsWith('Group ') && trimmed.includes(':')) {
                // Start new group
                if (currentGroup.length > 0) {
                  groups.push([...currentGroup])
                  currentGroup = []
                }
              } else if (trimmed.match(/^\d+\.\s/)) {
                // Extract keyword from numbered list
                const keyword = trimmed.replace(/^\d+\.\s*/, '').trim()
                if (keyword) {
                  flat.push(keyword)
                  currentGroup.push(keyword)
                }
              }
            }
            // Add last group
            if (currentGroup.length > 0) {
              groups.push(currentGroup)
            }
            
            keywords = { flat, groups }
          }
        } catch (e) {
          console.error('Error parsing keywords:', e)
        }

        setJDAnalysis({
          keySentences,
          keywords,
          jdRecord: result.data.jdRecord
        })
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
            jdAnalysis={jdAnalysis}
            isLoading={jdAnalysisLoading && !globalLoading}
            onAnalyze={analyzeJD}
            onQuickPDF={handleQuickPDFClick}
            hasQuickPDFData={hasQuickPDFData}
            isGeneratingQuickPDF={isGeneratingQuickPDF}
            quickPDFProgress={quickPDFProgress}
            onShowPDFSetup={() => setShowPDFSetup(true)}
          />
        </div>

        {/* Right Column - CV Optimization */}
        <div className="col-span-7">
          <CVOptimizationSection 
            selectedJD={selectedJD}
            selectedExperiences={selectedExperiences}
            jdKeywords={jdAnalysis?.keywords?.flat || []}
            addToPDFModules={addToPDFModules}
          />
        </div>
      </div>


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
      
      {/* PDF Setup Modal */}
      <PDFSetupModal 
        isOpen={showPDFSetup}
        onClose={() => setShowPDFSetup(false)}
        onSave={handlePDFConfigSave}
      />
    </div>
  )
}

// JD Analysis Section Component
function JDAnalysisSection({ 
  selectedJD, 
  jdAnalysis,
  isLoading, 
  onAnalyze,
  onQuickPDF,
  hasQuickPDFData,
  isGeneratingQuickPDF,
  quickPDFProgress,
  onShowPDFSetup
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

  const hasAnalysis = jdAnalysis && (
    (jdAnalysis.keySentences && jdAnalysis.keySentences.length > 0) ||
    (jdAnalysis.keywords && jdAnalysis.keywords.flat && jdAnalysis.keywords.flat.length > 0)
  )

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
                Score: {selectedJD.match_score}/5
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
      {jdAnalysis && jdAnalysis.keySentences && Array.isArray(jdAnalysis.keySentences) && jdAnalysis.keySentences.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Sentences</h3>
          <div className="bg-purple-50 rounded-lg p-4">
            <ul className="text-sm space-y-2">
              {jdAnalysis.keySentences.map((sentence, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1 text-xs font-bold">•</span>
                  <span className="text-gray-800 flex-1 leading-relaxed">
                    {sentence}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Keywords */}
      {jdAnalysis && jdAnalysis.keywords && (
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Keywords</h3>
          <div className="bg-purple-50 rounded-lg p-4">
            {jdAnalysis.keywords.groups && jdAnalysis.keywords.groups.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {jdAnalysis.keywords.groups.map((group, groupIndex) => (
                  <div key={groupIndex} className="bg-white rounded p-3">
                    <div className="flex flex-wrap gap-2">
                      {group.map((keyword, keywordIndex) => (
                        <span 
                          key={keywordIndex} 
                          className="px-3 py-1.5 bg-purple-200 text-purple-900 rounded-md text-sm font-semibold border border-purple-300"
                        >
                          {keyword || '[EMPTY KEYWORD]'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : jdAnalysis.keywords.flat && jdAnalysis.keywords.flat.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {jdAnalysis.keywords.flat.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1.5 bg-purple-200 text-purple-900 rounded-md text-sm font-semibold border border-purple-300"
                  >
                    {keyword || '[EMPTY KEYWORD]'}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
      
      {/* PDF Buttons - Fixed position bottom right, above prompt manager */}
      <div className="fixed bottom-20 right-6 flex flex-col gap-3 z-50">
        {/* PDF Setup/Edit Button */}
        <button
          onClick={onShowPDFSetup}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
PDF Setup
        </button>

        {/* One Click PDF Button */}
        <button
          id="one-click-pdf-button"
          onClick={onQuickPDF}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none shadow-lg hover:shadow-xl disabled:shadow-md relative overflow-hidden"
disabled={!hasQuickPDFData || isGeneratingQuickPDF}
        >
          {/* Progress bar */}
          {isGeneratingQuickPDF && (
            <div 
              className="absolute inset-0 bg-purple-700/30 transition-all duration-300"
              style={{ 
                width: `${quickPDFProgress}%`,
                transformOrigin: 'left'
              }}
            />
          )}
          {/* Button content */}
          <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"/>
            <path d="M6 6h8v2H6V6zm0 4h8v2H6v-2z"/>
          </svg>
          <span className="relative z-10">
            {isGeneratingQuickPDF ? `${quickPDFProgress}%` : 'Quick PDF'}
          </span>
        </button>
      </div>
    </div>
  )
}

// CV Optimization Section Component  
function CVOptimizationSection({ selectedJD, selectedExperiences, jdKeywords, addToPDFModules }: any) {
  // Batch optimization states
  const [isBatchOptimizing, setIsBatchOptimizing] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 })
  
  // Batch send to CV Builder states
  const [isBatchSending, setIsBatchSending] = useState(false)
  const [batchSendProgress, setBatchSendProgress] = useState({ current: 0, total: 0 })
  
  // Batch save to CV Library states
  const [isBatchSaving, setIsBatchSaving] = useState(false)
  const [batchSaveProgress, setBatchSaveProgress] = useState({ current: 0, total: 0 })
  
  const { optimizedExperiences, setExperienceGenerating, setOptimizedExperience, addSelectedExperience } = useWorkspaceStore()
  const { user } = useCurrentUser()
  const { getStarredIds, getStarredCount } = useStarredExperiences()
  
  // Import starred experiences function
  const importStarredExperiences = async () => {
    if (!user) return
    
    const starredIds = getStarredIds()
    if (starredIds.length === 0) return
    
    try {
      // Fetch starred experiences from backend
      const response = await fetch(`/api/experience?user_id=${user.id}`)
      if (!response.ok) throw new Error('Failed to fetch experiences')
      
      const result = await response.json()
      const allExperiences = result.data || []
      
      // Filter to only starred experiences and sort by updated_at (most recent first)
      const starredExperiences = allExperiences
        .filter((exp: any) => starredIds.includes(exp.id))
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      
      // Add each starred experience to workspace
      starredExperiences.forEach((experience: any) => {
        addSelectedExperience(experience)
      })
      
    } catch (error) {
      console.error('Failed to import starred experiences:', error)
    }
  }

  // Batch optimize all selected experiences
  const batchOptimizeExperiences = async () => {
    if (!user || !selectedJD || selectedExperiences.length === 0) return
    
    setIsBatchOptimizing(true)
    setBatchProgress({ current: 0, total: selectedExperiences.length })
    
    try {
      for (let i = 0; i < selectedExperiences.length; i++) {
        const experience = selectedExperiences[i]
        setBatchProgress({ current: i + 1, total: selectedExperiences.length })
        
        // Use same logic as individual generateOptimizedExperience
        setExperienceGenerating(experience.id, true)
        
        try {
          const response = await fetch('/api/jd2cv-full/optimize-cv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              experienceId: experience.id,
              jdKeywords: jdKeywords || selectedJD.keywords_from_sentences,
              userId: user.id
            })
          })
          
          const result = await response.json()
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to optimize experience')
          }
          
          if (result.success && result.data) {
            setOptimizedExperience(experience.id, result.data.optimizedContent, [])
          }
        } catch (error: any) {
          console.error(`Failed to optimize experience ${experience.id}:`, error)
          // Continue with next experience even if one fails
        } finally {
          setExperienceGenerating(experience.id, false)
        }
        
        // Small delay between requests to avoid overwhelming the API
        if (i < selectedExperiences.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      // Show completion for 2 seconds
      setTimeout(() => {
        setBatchProgress({ current: 0, total: 0 })
      }, 2000)
      
    } finally {
      setIsBatchOptimizing(false)
    }
  }

  // Batch send to CV Builder function
  const batchSendToCVBuilder = async () => {
    if (!user || selectedExperiences.length === 0) return

    // Filter experiences that have optimized content from optimizedExperiences state
    const experiencesWithOptimizedContent = selectedExperiences.filter(exp => {
      const optimizationData = optimizedExperiences[exp.id]
      return optimizationData?.optimizedContent && optimizationData.optimizedContent.trim()
    })

    if (experiencesWithOptimizedContent.length === 0) return

    setIsBatchSending(true)
    setBatchSendProgress({ current: 0, total: experiencesWithOptimizedContent.length })

    try {
      for (let i = 0; i < experiencesWithOptimizedContent.length; i++) {
        const experience = experiencesWithOptimizedContent[i]
        setBatchSendProgress({ current: i + 1, total: experiencesWithOptimizedContent.length })
        
        // Use same logic as handleSendToCVBuilder
        try {
          const optimizationData = optimizedExperiences[experience.id]
          const draft: CVModuleDraft = {
            title: generateModuleTitle(experience.company, experience.title, experience.time),
            items: extractBullets(optimizationData.optimizedContent!),
            sourceType: 'optimized',
            sourceIds: {
              experienceId: experience.id,
              jdId: selectedJD.id
            },
            meta: {
              jdTitle: selectedJD.title,
              jdCompany: selectedJD.company
            }
          }
          
          // Send to One Click PDF Modules
          const result = addToPDFModules(draft)
          
          if (!result.ok) {
            console.error(`Failed to send experience ${experience.id}:`, result.error)
          }
        } catch (error: any) {
          console.error(`Failed to send experience ${experience.id}:`, error)
        }
        
        // Small delay between sends
        if (i < experiencesWithOptimizedContent.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
      
      // Show completion for 2 seconds
      setTimeout(() => {
        setBatchSendProgress({ current: 0, total: 0 })
      }, 2000)
      
    } finally {
      setIsBatchSending(false)
    }
  }

  // Batch save to CV Library function
  const batchSaveToCV = async () => {
    if (!user || selectedExperiences.length === 0) return

    // Filter experiences that have optimized content from optimizedExperiences state
    const experiencesWithOptimizedContent = selectedExperiences.filter(exp => {
      const optimizationData = optimizedExperiences[exp.id]
      return optimizationData?.optimizedContent && optimizationData.optimizedContent.trim()
    })

    if (experiencesWithOptimizedContent.length === 0) return

    setIsBatchSaving(true)
    setBatchSaveProgress({ current: 0, total: experiencesWithOptimizedContent.length })

    try {
      for (let i = 0; i < experiencesWithOptimizedContent.length; i++) {
        const experience = experiencesWithOptimizedContent[i]
        setBatchSaveProgress({ current: i + 1, total: experiencesWithOptimizedContent.length })
        
        // Use same logic as saveOptimizedExperience
        try {
          const optimizationData = optimizedExperiences[experience.id]
          const response = await fetch('/api/jd2cv-full/optimize-cv', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              originalExperienceId: experience.id,
              optimizedContent: optimizationData.optimizedContent,
              userKeywords: optimizationData.userKeywords || [],
              userId: user.id,
              jdId: selectedJD?.id || null,
              jdTitle: selectedJD?.title || '',
              jdCompany: selectedJD?.company || ''
            })
          })

          const result = await response.json()

          if (!response.ok) {
            console.error(`Failed to save experience ${experience.id}:`, result.error)
          }
        } catch (error: any) {
          console.error(`Failed to save experience ${experience.id}:`, error)
        }
        
        // Small delay between saves
        if (i < experiencesWithOptimizedContent.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
      
      // Show completion for 2 seconds
      setTimeout(() => {
        setBatchSaveProgress({ current: 0, total: 0 })
      }, 2000)
      
    } finally {
      setIsBatchSaving(false)
    }
  }
  
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
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Experience Optimization</h3>
          
          {/* Show Import Starred button if there are starred experiences */}
          {getStarredCount() > 0 && (
            <div className="flex flex-col gap-2 items-end">
              <button
                onClick={importStarredExperiences}
                className="px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-xs">Import Starred ({getStarredCount()})</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="text-center text-gray-500">
          <p>No experiences selected</p>
          <p className="text-sm mt-2">Select experiences from the CV Library to optimize</p>
        </div>
      </div>
    )
  }


  // Parse time and extract end year for sorting
  const getEndYear = (timeString: string | null): number => {
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

  // Count optimized experiences
  const optimizedCount = selectedExperiences.filter(exp => {
    const optimizationData = optimizedExperiences[exp.id]
    return optimizationData?.optimizedContent && optimizationData.optimizedContent.trim()
  }).length

  // Sort experiences by work experience time (most recent first)
  const sortedExperiences = [...selectedExperiences].sort((a, b) => {
    const endYearA = getEndYear(a.time)
    const endYearB = getEndYear(b.time)
    return endYearB - endYearA // Descending order (most recent first)
  })

  return (
    <div className="space-y-4">
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Experience Optimization ({selectedExperiences.length} selected)
          </h3>
          
          {/* Vertical Button Layout */}
          <div className="flex flex-col gap-2 items-end">
            {/* Import Starred Experiences Button */}
            <button
              onClick={importStarredExperiences}
              disabled={getStarredCount() === 0}
              className={`w-52 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                getStarredCount() === 0
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="text-xs">
                {getStarredCount() === 0 ? 'No Starred' : `Import Starred (${getStarredCount()})`}
              </span>
            </button>

            {/* Batch Optimize All Button */}
            <button
              onClick={batchOptimizeExperiences}
              disabled={isBatchOptimizing || !jdKeywords || selectedExperiences.length === 0}
              className={`w-52 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 relative overflow-hidden ${
                isBatchOptimizing || !jdKeywords || selectedExperiences.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {/* Progress Bar Background */}
              {isBatchOptimizing && (
                <div 
                  className="absolute inset-0 bg-purple-600 transition-all duration-300 ease-out"
                  style={{ 
                    width: `${(batchProgress.current / batchProgress.total) * 100}%` 
                  }}
                />
              )}
              
              {/* Button Content */}
              <div className={`relative z-10 flex items-center gap-1 text-white ${
                isBatchOptimizing ? 'text-[10px]' : 'text-xs'
              }`}>
                {isBatchOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    <span>{batchProgress.current}/{batchProgress.total} Optimizing...</span>
                  </>
                ) : batchProgress.current === batchProgress.total && batchProgress.total > 0 ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>✓ All Optimized</span>
                  </>
                ) : !jdKeywords ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Analyze JD First</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                    </svg>
                    <span>Batch Optimize All</span>
                  </>
                )}
              </div>
            </button>

            {/* Batch Save to CV Library Button */}
            <button
              onClick={batchSaveToCV}
              disabled={isBatchSaving || optimizedCount === 0}
              className={`w-52 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 relative overflow-hidden ${
                isBatchSaving || optimizedCount === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {/* Progress Bar Background */}
              {isBatchSaving && (
                <div 
                  className="absolute inset-0 bg-purple-600 transition-all duration-300 ease-out"
                  style={{ 
                    width: `${(batchSaveProgress.current / batchSaveProgress.total) * 100}%` 
                  }}
                />
              )}
              
              {/* Button Content */}
              <div className={`relative z-10 flex items-center gap-1 text-white ${
                isBatchSaving ? 'text-[10px]' : 'text-xs'
              }`}>
                {isBatchSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    <span>{batchSaveProgress.current}/{batchSaveProgress.total} Saving...</span>
                  </>
                ) : batchSaveProgress.current === batchSaveProgress.total && batchSaveProgress.total > 0 ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>✓ All Saved</span>
                  </>
                ) : optimizedCount === 0 ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>No Optimized</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Batch Save to CV Library ({optimizedCount})</span>
                  </>
                )}
              </div>
            </button>

            {/* Batch Send to One Click PDF Button */}
            <button
              onClick={batchSendToCVBuilder}
              disabled={isBatchSending || optimizedCount === 0}
              className={`w-52 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 relative overflow-hidden ${
                isBatchSending || optimizedCount === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {/* Progress Bar Background */}
              {isBatchSending && (
                <div 
                  className="absolute inset-0 bg-purple-600 transition-all duration-300 ease-out"
                  style={{ 
                    width: `${(batchSendProgress.current / batchSendProgress.total) * 100}%` 
                  }}
                />
              )}
              
              {/* Button Content */}
              <div className={`relative z-10 flex items-center gap-1 text-white ${
                isBatchSending ? 'text-[10px]' : 'text-xs'
              }`}>
                {isBatchSending ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    <span>{batchSendProgress.current}/{batchSendProgress.total} Sending...</span>
                  </>
                ) : batchSendProgress.current === batchSendProgress.total && batchSendProgress.total > 0 ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>✓ All Sent</span>
                  </>
                ) : optimizedCount === 0 ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>No Optimized</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Batch Send to Quick PDF ({optimizedCount})</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
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
            addToPDFModules={addToPDFModules}
          />
        ))}
      </div>
    </div>
  )
}

// Experience Optimization Card Component
function ExperienceOptimizationCard({ experience, jdKeywords, selectedJD, index, addToPDFModules }: any) {
  const { 
    optimizedExperiences, 
    setOptimizedExperience, 
    setExperienceGenerating, 
    updateUserKeywords,
    removeSelectedExperience
  } = useWorkspaceStore()
  
  const { user } = useCurrentUser()
  const router = useRouter()
  
  const optimizationData = optimizedExperiences[experience.id]
  const isGenerating = optimizationData?.isGenerating || false
  const isGenerated = optimizationData?.isGenerated || false
  const optimizedContent = optimizationData?.optimizedContent || ''
  const userKeywords = optimizationData?.userKeywords || []
  
  // Send to One Click PDF 相关状态
  const [isSending, setIsSending] = useState(false)
  
  // 处理Send to One Click PDF - Optimized版本
  const handleSendToCVBuilder = async (e?: React.MouseEvent) => {
    if (!optimizedContent.trim()) return
    
    setIsSending(true)
    
    // Add flying animation
    const button = e?.target as HTMLElement
    if (button) {
      createFlyingAnimationToOneClickPDF(button)
    }
    
    try {
      // 构建CVModuleDraft
      const draft: CVModuleDraft = {
        title: generateModuleTitle(experience.company, experience.title, experience.time),
        items: extractBullets(optimizedContent),
        sourceType: 'optimized',
        sourceIds: {
          experienceId: experience.id,
          jdId: selectedJD?.id
        },
        meta: {
          jdTitle: selectedJD?.title,
          jdCompany: selectedJD?.company
        }
      }
      
      // Direct send without duplicate check confirmation
      
      // 发送到PDF modules
      const result = addToPDFModules(draft)
      
      if (result.ok) {
        // Flying animation provides sufficient feedback
      } else {
        console.error('Send failed:', result.error) // 调试日志
        alert(result.error || 'Failed to send to Quick PDF')
      }
    } catch (error: any) {
      console.error('Send to One Click PDF error:', error)
      alert('Failed to send to Quick PDF. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  // Flying animation helper function for CV Library targeting
  const createFlyingAnimationToCV = (sourceButton: HTMLElement) => {
    // 找到CV选项卡 (索引为1的选项卡)
    const cvTab = document.querySelector('button[class*="flex-1"]:nth-child(2)') as HTMLElement
    
    if (cvTab && sourceButton) {
      // Create flying clone with enhanced effects
      const clone = sourceButton.cloneNode(true) as HTMLElement
      const sourceRect = sourceButton.getBoundingClientRect()
      const targetRect = cvTab.getBoundingClientRect()
      
      clone.style.position = 'fixed'
      clone.style.zIndex = '9999'
      clone.style.pointerEvents = 'none'
      clone.style.left = `${sourceRect.left}px`
      clone.style.top = `${sourceRect.top}px`
      clone.style.width = `${sourceRect.width}px`
      clone.style.height = `${sourceRect.height}px`
      clone.style.transform = 'scale(1) rotate(0deg)'
      clone.style.transition = 'all 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      clone.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)'
      
      document.body.appendChild(clone)
      
      // Enhanced rotation effect
      let rotationDegree = 0
      const rotationInterval = setInterval(() => {
        rotationDegree += 15
        clone.style.transform = `scale(${1 - rotationDegree / 720}) rotate(${rotationDegree}deg)`
      }, 50)
      
      requestAnimationFrame(() => {
        const deltaX = targetRect.left + targetRect.width / 2 - sourceRect.left - sourceRect.width / 2
        const deltaY = targetRect.top + targetRect.height / 2 - sourceRect.top - sourceRect.height / 2
        
        clone.style.left = `${sourceRect.left + deltaX}px`
        clone.style.top = `${sourceRect.top + deltaY}px`
        clone.style.transform = `scale(0.1) rotate(720deg)`
        clone.style.opacity = '0.3'
      })
      
      // Clean up rotation interval
      setTimeout(() => {
        clearInterval(rotationInterval)
      }, 1400)
      
      // Clean up
      setTimeout(() => {
        if (clone.parentNode) {
          clone.parentNode.removeChild(clone)
        }
      }, 1400)
    }
  }

  // Flying animation helper function for One Click PDF targeting
  const createFlyingAnimationToOneClickPDF = (sourceButton: HTMLElement) => {
    const pdfButton = document.querySelector('#one-click-pdf-button') as HTMLElement
    
    if (pdfButton && sourceButton) {
      // Create flying clone with enhanced effects
      const clone = sourceButton.cloneNode(true) as HTMLElement
      const sourceRect = sourceButton.getBoundingClientRect()
      const targetRect = pdfButton.getBoundingClientRect()
      
      clone.style.position = 'fixed'
      clone.style.zIndex = '9999'
      clone.style.pointerEvents = 'none'
      clone.style.left = `${sourceRect.left}px`
      clone.style.top = `${sourceRect.top}px`
      clone.style.width = `${sourceRect.width}px`
      clone.style.height = `${sourceRect.height}px`
      clone.style.transform = 'scale(1) rotate(0deg)'
      clone.style.opacity = '0.95'
      clone.style.boxShadow = '0 20px 60px rgba(139, 92, 246, 0.4), 0 8px 30px rgba(0, 0, 0, 0.2)'
      clone.style.borderRadius = '8px'
      clone.style.transition = 'all 1400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      document.body.appendChild(clone)
      
      // Start continuous rotation animation
      let rotationAngle = 0
      const rotationInterval = setInterval(() => {
        rotationAngle += 8
        if (clone.parentNode) {
          const currentTransform = clone.style.transform
          const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/)
          const currentScale = scaleMatch ? scaleMatch[1] : '1'
          clone.style.transform = `scale(${currentScale}) rotate(${rotationAngle}deg)`
        }
      }, 16) // 60fps smooth rotation
      
      // Enhanced animation to CV Builder button
      setTimeout(() => {
        clone.style.left = `${targetRect.left + targetRect.width / 2 - 15}px`
        clone.style.top = `${targetRect.top + targetRect.height / 2 - 15}px`
        clone.style.width = '30px'
        clone.style.height = '30px'
        const currentRotation = rotationAngle
        clone.style.transform = `scale(0.08) rotate(${currentRotation}deg)`
        clone.style.opacity = '0.3'
        clone.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.6), 0 4px 15px rgba(0, 0, 0, 0.3)'
      }, 50)
      
      // Final fade out phase
      setTimeout(() => {
        clone.style.opacity = '0'
        const currentRotation = rotationAngle
        clone.style.transform = `scale(0.02) rotate(${currentRotation}deg)`
      }, 1000)
      
      // Clean up rotation interval
      setTimeout(() => {
        clearInterval(rotationInterval)
      }, 1400)
      
      // Clean up
      setTimeout(() => {
        if (clone.parentNode) {
          clone.parentNode.removeChild(clone)
        }
      }, 1400)
    }
  }

  // 处理Send to One Click PDF - Original版本
  const handleSendOriginalToCVBuilder = async (e?: React.MouseEvent) => {
    if (!experience.experience.trim()) return
    
    setIsSending(true)
    
    // Add flying animation
    const button = e?.target as HTMLElement
    if (button) {
      createFlyingAnimationToOneClickPDF(button)
    }
    
    try {
      // 构建CVModuleDraft
      const draft: CVModuleDraft = {
        title: generateModuleTitle(experience.company, experience.title, experience.time),
        items: extractBullets(experience.experience),
        sourceType: 'manual',
        sourceIds: {
          experienceId: experience.id
        }
      }
      
      // Direct send without duplicate check confirmation
      
      // 发送到PDF modules
      const result = addToPDFModules(draft)
      
      if (result.ok) {
        // Flying animation provides sufficient feedback
      } else {
        console.error('Send failed:', result.error) // 调试日志
        alert(result.error || 'Failed to send to Quick PDF')
      }
    } catch (error: any) {
      console.error('Send to One Click PDF error:', error)
      alert('Failed to send to Quick PDF. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const generateOptimizedExperience = async () => {
    if (!user) return

    setExperienceGenerating(experience.id, true)
    
    try {
      const response = await fetch('/api/jd2cv-full/optimize-cv', {
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

  const saveOptimizedExperience = async (e?: React.MouseEvent) => {
    if (!user || !optimizedContent) return
    
    // Add flying animation to CV tab
    const button = e?.target as HTMLElement
    if (button) {
      createFlyingAnimationToCV(button)
    }

    try {
      const response = await fetch('/api/jd2cv-full/optimize-cv', {
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

      // Flying animation已经提供了视觉反馈，不需要alert
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
        
        {/* Remove Button - Only show if not analyzed yet */}
        {!optimizedContent && (
          <button
            onClick={() => removeSelectedExperience(experience.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Remove from workspace"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Original Experience */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <h5 className="text-sm font-medium text-gray-700">Original Experience</h5>
          <button
            onClick={(e) => handleSendOriginalToCVBuilder(e)}
            disabled={isSending || !experience.experience.trim()}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 text-xs ${
              !experience.experience.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Send to Quick PDF
              </>
            )}
          </button>
        </div>
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
            <div className="flex justify-between items-start mb-2">
              <h5 className="text-sm font-medium text-purple-800">Optimized Experience</h5>
              <div className="flex gap-2">
                <button
                  onClick={(e) => saveOptimizedExperience(e)}
                  className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-1 text-xs"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                  Save to CV Library
                </button>
                <button
                  onClick={(e) => handleSendToCVBuilder(e)}
                  disabled={isSending || !isGenerated || !optimizedContent.trim()}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 text-xs ${
                    !isGenerated || !optimizedContent.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Send to Quick PDF
                    </>
                  )}
                </button>
              </div>
            </div>
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
          <div className="flex justify-center">
            <button
              onClick={generateOptimizedExperience}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
    match_score: 3,
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
      const url = '/api/jd2cv-full/supabase'
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
      match_score: 3,
      cv_pdf_url: '',
      cv_pdf_filename: ''
    })
    setEditingRecordId(null)
  }

  const loadSavedRecords = async () => {
    setLoadingRecords(true)
    try {
      const response = await fetch(`/api/jd2cv-full/supabase?user_id=${user.id}&limit=20`)
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
      const response = await fetch('/api/jd2cv-full/supabase', {
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
      match_score: record.match_score 
        ? (record.match_score > 10 ? Math.round(record.match_score / 20 * 2) / 2 : record.match_score) // Convert old 0-100 to 1-5
        : 3,
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
      
      // Enhanced flying animation effect - button only
      const button = e?.target as HTMLElement
      const actualButton = button?.closest('button') as HTMLElement
      if (actualButton) {
        const buttonRect = actualButton.getBoundingClientRect()
        const tabElement = document.getElementById('tab-workspace')
        
        if (tabElement) {
          // Create flying clone of the button only (not the whole card)
          const clone = actualButton.cloneNode(true) as HTMLElement
          clone.style.position = 'fixed'
          clone.style.zIndex = '9999'
          clone.style.pointerEvents = 'none'
          clone.style.left = `${buttonRect.left}px`
          clone.style.top = `${buttonRect.top}px`
          clone.style.width = `${buttonRect.width}px`
          clone.style.height = `${buttonRect.height}px`
          clone.style.transform = 'scale(1) rotate(0deg)'
          clone.style.opacity = '0.95'
          clone.style.boxShadow = '0 20px 60px rgba(139, 92, 246, 0.4), 0 8px 30px rgba(0, 0, 0, 0.2)'
          clone.style.borderRadius = '8px'
          clone.style.transition = 'all 1400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          document.body.appendChild(clone)
          
          // Start continuous rotation animation
          let rotationAngle = 0
          const rotationInterval = setInterval(() => {
            rotationAngle += 8
            if (clone.parentNode) {
              const currentTransform = clone.style.transform
              const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/)
              const currentScale = scaleMatch ? scaleMatch[1] : '1'
              clone.style.transform = `scale(${currentScale}) rotate(${rotationAngle}deg)`
            }
          }, 16) // 60fps smooth rotation
          
          // Enhanced animation to tab
          const tabRect = tabElement.getBoundingClientRect()
          setTimeout(() => {
            clone.style.left = `${tabRect.left + tabRect.width / 2 - buttonRect.width / 2}px`
            clone.style.top = `${tabRect.top + tabRect.height / 2 - buttonRect.height / 2}px`
            clone.style.width = `${buttonRect.width}px`
            clone.style.height = `${buttonRect.height}px`
            const currentRotation = rotationAngle
            clone.style.transform = `scale(0.3) rotate(${currentRotation}deg)`
            clone.style.opacity = '0.3'
            clone.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.6), 0 4px 15px rgba(0, 0, 0, 0.3)'
          }, 50)
          
          // Final fade out phase
          setTimeout(() => {
            clone.style.opacity = '0'
            const currentRotation = rotationAngle
            clone.style.transform = `scale(0.1) rotate(${currentRotation}deg)`
          }, 1000)
          
          // Clean up rotation interval
          setTimeout(() => {
            clearInterval(rotationInterval)
          }, 1400)
          
          // Clean up
          setTimeout(() => {
            if (clone.parentNode) {
              clone.parentNode.removeChild(clone)
            }
          }, 1400)
        }
      }
    }
  }

  const handleDeleteJD = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this JD record? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/jd2cv-full/jd-records', {
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
                      {record.match_score || 3}/5
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

// Experience Modal Form Component (consistent with JD Add modal)
function ExperienceTooltipForm({ 
  experienceData, 
  handleInputChange, 
  handleSave, 
  handleClear, 
  isLoading, 
  onClose, 
  isEditMode 
}: any) {
  const modalRef = React.useRef<HTMLDivElement>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Close on click outside and ESC key
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!experienceData.company || !experienceData.title || !experienceData.experience) {
      setError('Please fill in Company, Title and Experience')
      return
    }

    try {
      await handleSave()
      onClose()
    } catch (error: any) {
      setError(error.message || 'Failed to save experience')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/10 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Experience' : 'Add New Experience'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <input
                type="text"
                placeholder="Company name"
                value={experienceData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                disabled={isEditMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                placeholder="Your job title"
                value={experienceData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period {isEditMode && '*'}
              </label>
              <input
                type="text"
                placeholder="e.g. Jan 2020 - Present"
                value={experienceData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                disabled={isEditMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={experienceData.work_or_project}
                onChange={(e) => handleInputChange('work_or_project', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="work">Work Experience</option>
                <option value="project">Project Experience</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Group
            </label>
            <select
              value={experienceData.role_group}
              onChange={(e) => handleInputChange('role_group', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select role group</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Data Science">Data Science</option>
              <option value="Product Management">Product Management</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Experience Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Details *
            </label>
            <textarea
              placeholder="Describe your experience, responsibilities, and achievements..."
              value={experienceData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. React, Node.js, Python, Machine Learning"
              value={Array.isArray(experienceData.keywords) ? experienceData.keywords.join(', ') : experienceData.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value.split(',').map((k: string) => k.trim()).filter((k: string) => k))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !experienceData.company || !experienceData.title || !experienceData.experience}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {isEditMode ? 'Update Experience' : 'Add Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// CV Library Tab Content - Refactored to remove sub-tabs
function CVLibraryContent({ user }: { user: any }) {
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

  // Add/Edit tooltip states
  const [showAddTooltip, setShowAddTooltip] = useState(false)
  const [showEditTooltip, setShowEditTooltip] = useState(false)
  const [editingExperience, setEditingExperience] = useState<any>(null)

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
      const isEditMode = editingExperience !== null
      const method = isEditMode ? 'PUT' : 'POST'
      
      const requestBody = isEditMode 
        ? {
            ...experienceData,
            id: editingExperience.id,
            user_id: user.id
          }
        : {
            ...experienceData,
            user_id: user.id
          }
      
      const response = await fetch('/api/experience', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save')
      }

      // Success - close modal and refresh
      handleClear()
      // Refresh records
      if (recordsLoaded) {
        await loadExperienceRecords()
      }
    } catch (error: any) {
      console.error('Save error:', error)
      throw error // Let modal handle the error display
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
    setEditingExperience(null)
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
    // Experience loaded for editing
  }

  // Auto-load records when component mounts
  React.useEffect(() => {
    if (!recordsLoaded && !loadingRecords) {
      loadExperienceRecords()
    }
  }, [recordsLoaded, loadingRecords])

  // Handle Add button click
  const handleAddExperience = () => {
    // Reset form data
    setExperienceData({
      company: '',
      title: '',
      experience: '',
      keywords: [] as string[],
      role_group: '',
      work_or_project: '',
      time: '',
      comment: ''
    })
    setEditingExperience(null)
    setShowAddTooltip(true)
  }

  // Handle Edit button click
  const handleEditExperience = (experience: any) => {
    setExperienceData({
      company: experience.company || '',
      title: experience.title || '',
      experience: experience.experience || '',
      keywords: experience.keywords || [],
      role_group: experience.role_group || '',
      work_or_project: experience.work_or_project || '',
      time: experience.time || '',
      comment: experience.comment || ''
    })
    setEditingExperience(experience)
    setShowEditTooltip(true)
  }

  return (
    <>
      {/* Operations Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">CV Library</h3>
          <div className="flex gap-3">
            {/* Add Button */}
            <button
              onClick={handleAddExperience}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add
            </button>

            {/* Filter & Sort Button (Placeholder) */}
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Filter & Sort
            </button>
          </div>
        </div>
      </div>

      {/* Experience Library Content */}
      <ExperienceLibraryContent 
        companyGroups={companyGroups}
        loadingRecords={loadingRecords}
        loadRecord={loadRecord}
        user={user}
        loadExperienceRecords={loadExperienceRecords}
        onEditExperience={handleEditExperience}
      />

      {/* Add Modal */}
      {showAddTooltip && (
        <ExperienceTooltipForm
          experienceData={experienceData}
          handleInputChange={handleInputChange}
          handleSave={handleSave}
          handleClear={() => {
            setExperienceData({
              company: '',
              title: '',
              experience: '',
              keywords: [] as string[],
              role_group: '',
              work_or_project: '',
              time: '',
              comment: ''
            })
          }}
          isLoading={isLoading}
          onClose={() => setShowAddTooltip(false)}
          isEditMode={false}
        />
      )}

      {/* Edit Modal */}
      {showEditTooltip && editingExperience && (
        <ExperienceTooltipForm
          experienceData={experienceData}
          handleInputChange={handleInputChange}
          handleSave={handleSave}
          handleClear={() => {
            setExperienceData({
              company: editingExperience.company || '',
              title: editingExperience.title || '',
              experience: editingExperience.experience || '',
              keywords: editingExperience.keywords || [],
              role_group: editingExperience.role_group || '',
              work_or_project: editingExperience.work_or_project || '',
              time: editingExperience.time || '',
              comment: editingExperience.comment || ''
            })
          }}
          isLoading={isLoading}
          onClose={() => setShowEditTooltip(false)}
          isEditMode={true}
        />
      )}
    </>
  )
}


// Experience Library Content Component
function ExperienceLibraryContent({ 
  companyGroups, 
  loadingRecords, 
  loadRecord,
  user,
  loadExperienceRecords,
  onEditExperience
}: any) {
  const { selectedExperiences, addSelectedExperience, removeSelectedExperience } = useWorkspaceStore()
  const [selectedCompany, setSelectedCompany] = React.useState<string>('')
  
  // Star functionality
  const { toggleStar, isStarred } = useStarredExperiences()

  const handleToggleSelection = (record: any, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering loadRecord
    const isSelected = selectedExperiences.find(exp => exp.id === record.id)
    if (isSelected) {
      removeSelectedExperience(record.id)
    } else {
      addSelectedExperience(record)
      
      // Enhanced flying animation effect - Select button only
      const button = e?.target as HTMLElement
      const actualButton = button?.closest('button') as HTMLElement
      if (actualButton) {
        const buttonRect = actualButton.getBoundingClientRect()
        const tabElement = document.getElementById('tab-workspace')
        
        if (tabElement) {
          // Create flying clone of the button only (not the whole card)
          const clone = actualButton.cloneNode(true) as HTMLElement
          clone.style.position = 'fixed'
          clone.style.zIndex = '9999'
          clone.style.pointerEvents = 'none'
          clone.style.left = `${buttonRect.left}px`
          clone.style.top = `${buttonRect.top}px`
          clone.style.width = `${buttonRect.width}px`
          clone.style.height = `${buttonRect.height}px`
          clone.style.transform = 'scale(1) rotate(0deg)'
          clone.style.opacity = '0.95'
          clone.style.boxShadow = '0 20px 60px rgba(139, 92, 246, 0.4), 0 8px 30px rgba(0, 0, 0, 0.2)'
          clone.style.borderRadius = '8px'
          clone.style.transition = 'all 1400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          document.body.appendChild(clone)
          
          // Start continuous rotation animation
          let rotationAngle = 0
          const rotationInterval = setInterval(() => {
            rotationAngle += 8
            if (clone.parentNode) {
              const currentTransform = clone.style.transform
              const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/)
              const currentScale = scaleMatch ? scaleMatch[1] : '1'
              clone.style.transform = `scale(${currentScale}) rotate(${rotationAngle}deg)`
            }
          }, 16) // 60fps smooth rotation
          
          // Enhanced animation to tab
          const tabRect = tabElement.getBoundingClientRect()
          setTimeout(() => {
            clone.style.left = `${tabRect.left + tabRect.width / 2 - buttonRect.width / 2}px`
            clone.style.top = `${tabRect.top + tabRect.height / 2 - buttonRect.height / 2}px`
            clone.style.width = `${buttonRect.width}px`
            clone.style.height = `${buttonRect.height}px`
            const currentRotation = rotationAngle
            clone.style.transform = `scale(0.3) rotate(${currentRotation}deg)`
            clone.style.opacity = '0.3'
            clone.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.6), 0 4px 15px rgba(0, 0, 0, 0.3)'
          }, 50)
          
          // Final fade out phase
          setTimeout(() => {
            clone.style.opacity = '0'
            const currentRotation = rotationAngle
            clone.style.transform = `scale(0.1) rotate(${currentRotation}deg)`
          }, 1000)
          
          // Clean up rotation interval
          setTimeout(() => {
            clearInterval(rotationInterval)
          }, 1400)
          
          // Clean up
          setTimeout(() => {
            if (clone.parentNode) {
              clone.parentNode.removeChild(clone)
            }
          }, 1400)
        }
      }
    }
  }

  const [deleteCV, setDeleteCV] = React.useState<{record: any, buttonRef: HTMLElement} | null>(null)

  const handleDeleteCV = async (record: any) => {
    try {
      const response = await fetch(`/api/experience?id=${record.id}&user_id=${user?.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete CV record')
      }

      // Refresh the records list
      await loadExperienceRecords()
      setDeleteCV(null)
      
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
                  {/* Star Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleStar(record.id)
                    }}
                    className={`w-full px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1 transition-colors ${
                      isStarred(record.id)
                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {isStarred(record.id) ? (
                      <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Starred
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Star
                      </>
                    )}
                  </button>

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
                    onClick={() => onEditExperience(record)}
                    className="w-full px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteCV({ record, buttonRef: e.currentTarget })
                    }}
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

      {/* Delete Confirmation Tooltip */}
      {deleteCV && (
        <DeleteTooltip
          isOpen={true}
          onClose={() => setDeleteCV(null)}
          onConfirm={() => handleDeleteCV(deleteCV.record)}
          title={`${deleteCV.record.title} at ${deleteCV.record.company}`}
          triggerElement={deleteCV.buttonRef}
        />
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