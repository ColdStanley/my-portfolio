'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useWorkspaceStore } from './store/workspaceStore'
import JDPage from './components/JDPage'
import PDFSetupModal from './components/PDFSetupModal'
import { CVModuleDraft } from './shared/types'
import { extractBullets, generateModuleTitle } from './shared/utils'
import { useStarredExperiences } from './hooks/useStarredExperiences'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/30">
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/30">
        {/* Custom Navigation */}
        <NewNavbar />


        {/* Fixed Tab Navigation */}
        <div className="fixed top-[104px] left-0 right-0 z-50 bg-gradient-to-br from-slate-50 via-white to-gray-50/30 pb-4 border-b border-gray-100/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20">
            <div className="flex">
              {tabs.map((tab, index) => {
                const isActive = activeTab === index
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(index)}
                    className={`flex-1 px-3 py-3 sm:px-6 sm:py-4 text-center font-medium transition-all duration-300 transform hover:scale-105 text-sm sm:text-base relative ${
                      index === 0 ? 'rounded-l-xl' : index === 1 ? 'rounded-r-xl' : 'rounded-none'
                    } ${
                      isActive
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                    }`}
                    style={isActive ? { backgroundColor: '#111111' } : undefined}
                  >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">
                      {index === 0 ? 'JD' : index === 1 ? 'CV' : tab.label}
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
            
          </div>
        </div>
        </div>

        {/* Main Content - with top padding to account for fixed nav */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-[180px] pb-6">
          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 0 && <JDPage user={user} globalLoading={loading} />}
            {activeTab === 1 && <CVLibraryContent user={user} />}
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
                  ? 'bg-gray-700 text-white shadow-md'
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
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          />
          <input
            type="text"
            placeholder="Company Name"
            value={jdData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white resize-none"
        />
      </div>

      {/* Metadata - Independent glass card */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Metadata</h3>
        <div className="grid grid-cols-3 gap-4">
          <select
            value={jdData.application_stage}
            onChange={(e) => handleInputChange('application_stage', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
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
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          />
          <input
            type="text"
            placeholder="Firm Type"
            value={jdData.firm_type}
            onChange={(e) => handleInputChange('firm_type', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Comment"
            value={jdData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          />
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
            className="w-32 px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
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
  loadRecord
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

  if (loadingRecords) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
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
                      <span className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded-full text-xs font-medium truncate block text-center">
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

                  {/* Date: 81% - 100% */}
                  <div className="absolute left-[81%] w-[19%]">
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
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-medium text-gray-700 mb-1">Group 1</div>
                    <div className="text-gray-700">
                      {keywordGroups.group1 || 'No keywords'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-medium text-gray-700 mb-1">Group 2</div>
                    <div className="text-gray-700">
                      {keywordGroups.group2 || 'No keywords'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-medium text-gray-700 mb-1">Group 3</div>
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
                      ? 'bg-gray-800 hover:bg-gray-900 text-white'
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
                  className="w-full px-2 py-1 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1 transition-colors"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent ${
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent ${
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
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
              className="px-6 py-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
              className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
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
                  ? 'bg-gray-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span className="truncate">{companyName}</span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                selectedCompany === companyName
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-500 text-white'
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
                          <span key={idx} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
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
                        ? 'bg-gray-800 hover:bg-gray-900 text-white'
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
                        ? 'bg-gray-800 hover:bg-gray-900 text-white'
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
                    className="w-full px-2 py-1 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
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
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
        />
        <button
          type="button"
          onClick={addKeyword}
          disabled={!inputValue.trim()}
          className="w-32 px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
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
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="ml-1 text-gray-500 hover:text-gray-700 transition-colors"
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