import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { JDRecord, CreateJDRequest, APPLICATION_STAGES } from '@/shared/types'
import { useWorkspaceStore } from '../store/workspaceStore'
import { useJDFilterStore } from '@/store/useJDFilterStore'
import InlineEditField from './InlineEditField'
import AddJDPopover from './AddJDPopover'
import ViewJDTooltip from './ViewJDTooltip'
import CommentInlineEdit from './CommentInlineEdit'
import AppliedStatsFloatingButton from './AppliedStatsFloatingButton'
import LightningButtonV2 from './LightningButtonV2'
import LangChainButtonV2 from './LangChainButtonV2'
import PersonalInfoTooltipV2 from './PersonalInfoTooltipV2'
import CoverLetterButtonV2 from './CoverLetterButtonV2'
import { extractBullets, generateModuleTitle } from '@/shared/utils'

interface JDPageProps {
  user: { id: string }
  globalLoading?: boolean
}

export default function JDPage({ user, globalLoading = false }: JDPageProps) {
  const [jds, setJds] = useState<JDRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPopover, setShowAddPopover] = useState(false)
  const [viewingJD, setViewingJD] = useState<JDRecord | null>(null)
  const [deleteButtonRef, setDeleteButtonRef] = useState<HTMLElement | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [stageOptions, setStageOptions] = useState<string[]>(['Raw JD', 'Applied'])

  // JD Transfer states for visual feedback
  const [transferredJDs, setTransferredJDs] = useState<Set<string>>(new Set())

  // Deleting states for fade out animation
  const [deletingJDs, setDeletingJDs] = useState<Set<string>>(new Set())

  // Global Personal Info state
  const [showPersonalInfoTooltip, setShowPersonalInfoTooltip] = useState(false)
  
  
  // Workspace store for Select functionality
  
  // Global filter store
  const { filters, sortOrder, handleFilterChange, handleSortChange, clearFilters } = useJDFilterStore()


  // Load JDs and stage options on mount
  useEffect(() => {
    loadJDs()
    loadStageOptions()
  }, [user.id])

  const loadJDs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/jds?user_id=${user.id}`)
      const result = await response.json()

      if (result.success) {
        setJds(result.data)
      } else {
        console.error('Failed to load JDs:', result.error)
      }
    } catch (error) {
      console.error('Error loading JDs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStageOptions = async () => {
    try {
      const response = await fetch(`/api/jds?user_id=${user.id}&get_stage_options=true`)
      const result = await response.json()

      if (result.success && result.stage_options) {
        setStageOptions(result.stage_options)
      }
    } catch (error) {
      console.error('Error loading stage options:', error)
    }
  }

  const handleCreateJD = async (data: CreateJDRequest) => {
    const response = await fetch('/api/jds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, user_id: user.id })
    })

    const result = await response.json()
    if (result.success) {
      // Add to beginning of list
      setJds(prev => [result.data, ...prev])
    } else {
      throw new Error(result.error || 'Failed to create JD')
    }
  }

  const handleUpdateField = async (id: string, field: string, value: string | number) => {
    // Optimistic update
    setJds(prev => prev.map(jd =>
      jd.id === id ? { ...jd, [field]: value } : jd
    ))

    try {
      const response = await fetch(`/api/jds/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, field, value })
      })

      const result = await response.json()
      if (!result.success) {
        // Rollback on failure
        loadJDs()
        console.error('Update failed:', result.error)
        throw new Error(result.error || 'Update failed')
      }
    } catch (error) {
      // Rollback on error
      console.error('Update error details:', error)
      console.error('Request details:', { id, field, value, user_id: user.id })
      loadJDs()
      throw error
    }
  }

  const handleDeleteJD = async (id: string) => {
    if (!confirm('Are you sure you want to delete this JD record? This action cannot be undone.')) {
      return
    }

    // Start fade out animation
    setDeletingJDs(prev => new Set(prev).add(id))

    try {
      const response = await fetch(`/api/jds/${id}?user_id=${user.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete JD record')
      }

      // Wait for fade out animation (300ms) then remove from local state
      setTimeout(() => {
        setJds(prev => prev.filter(jd => jd.id !== id))
        setDeletingJDs(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }, 300)

    } catch (error: any) {
      // Remove from deleting state if error occurs
      setDeletingJDs(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      console.error('Delete error:', error)
      alert(`Failed to delete JD record: ${error.message}`)
    }
  }


  const handleClearCVFile = async (id: string, field: 'cv_pdf_url' | 'cv_pdf_filename') => {
    await handleUpdateField(id, field, '')
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Get unique values for filter dropdowns
  const getUniqueValues = (field: string) => {
    const values = jds.map(jd => {
      switch(field) {
        case 'stage': return jd.application_stage || null
        default: return null
      }
    }).filter(value => value !== null && value !== '')

    return [...new Set(values)].sort()
  }

  // Filter and sort JDs
  const getFilteredAndSortedJDs = () => {
    let filteredJDs = jds.filter(jd => {
      // Existing filters
      const passesExistingFilters = (
        (!filters.stage || (filters.stage === 'null' ? !jd.application_stage : jd.application_stage === filters.stage))
      )

      // Search term filter for comment and company
      const passesSearchFilter = !filters.searchTerm ||
        (jd.comment && jd.comment.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        (jd.company && jd.company.toLowerCase().includes(filters.searchTerm.toLowerCase()))

      const passesAllFilters = passesExistingFilters && passesSearchFilter

      // Time filter
      if (!filters.time) return passesAllFilters

      const createdAt = new Date(jd.created_at)
      const now = new Date()
      
      switch (filters.time) {
        case 'yesterday': {
          const yesterday = new Date(now)
          yesterday.setDate(now.getDate() - 1)
          yesterday.setHours(0, 0, 0, 0)
          const today = new Date(now)
          today.setHours(0, 0, 0, 0)
          return passesAllFilters && createdAt >= yesterday && createdAt < today
        }
        case 'past3days': {
          const threeDaysAgo = new Date(now)
          threeDaysAgo.setDate(now.getDate() - 3)
          return passesAllFilters && createdAt >= threeDaysAgo
        }
        case 'past7days': {
          const sevenDaysAgo = new Date(now)
          sevenDaysAgo.setDate(now.getDate() - 7)
          return passesAllFilters && createdAt >= sevenDaysAgo
        }
        case 'past30days': {
          const thirtyDaysAgo = new Date(now)
          thirtyDaysAgo.setDate(now.getDate() - 30)
          return passesAllFilters && createdAt >= thirtyDaysAgo
        }
        default:
          return passesAllFilters
      }
    })

    return filteredJDs
  }

  // Filter and sort functions now come from useJDFilterStore



  // Parse time and extract end year for sorting
  const getEndYear = (timeString: string | null): number => {
    if (!timeString) return 0
    // Handle "Present", "Current", etc.
    if (timeString.toLowerCase().includes('present') || 
        timeString.toLowerCase().includes('current')) {
      return new Date().getFullYear()
    }
    
    // Extract year from formats like "2020-2023", "Jan 2020 - Dec 2023", etc.
    const yearMatches = timeString.match(/\d{4}/g)
    if (yearMatches && yearMatches.length > 0) {
      // Return the last (most recent) year found
      return parseInt(yearMatches[yearMatches.length - 1])
    }
    
    return 0
  }

  // Step 2: Import Starred Experiences
  const step2_ImportStarred = async () => {
    setFinalCVState(prev => ({ ...prev, progress: 25, currentStep: 'Importing starred...' }))
    
    // Get starred IDs from localStorage (same format as existing workspace)
    const getStarredIds = () => {
      const starred = localStorage.getItem('starred-experiences')
      if (!starred) return []
      const starredObj = JSON.parse(starred)
      return Object.keys(starredObj).filter(id => starredObj[id])
    }
    
    const starredIds = getStarredIds()
    if (starredIds.length === 0) {
      throw new Error('No starred experiences found. Please star some experiences first.')
    }
    
    // Fetch all experiences
    const response = await fetch(`/api/experience?user_id=${user.id}`)
    if (!response.ok) throw new Error('Failed to fetch experiences')
    
    const result = await response.json()
    const allExperiences = result.data || []
    
    // Filter to only starred experiences and sort by work experience time (most recent first)
    const starredExperiences = allExperiences
      .filter((exp: any) => starredIds.includes(exp.id))
      .sort((a: any, b: any) => {
        const endYearA = getEndYear(a.time)
        const endYearB = getEndYear(b.time)
        return endYearB - endYearA // Descending order (most recent first)
      })
    
    setFinalCVState(prev => ({ ...prev, progress: 40 }))
    
    return starredExperiences
  }




  // PDF Section Component
  function PDFSection({ jd, onUpdate }: { jd: any, onUpdate: (id: string, field: string, value: string) => void }) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) {
        return
      }

      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed')
        return
      }

      setIsUploading(true)
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('jdId', jd.id)
        formData.append('userId', jd.user_id)

        const response = await fetch('/api/jds/upload-pdf', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Upload failed')
        }

        // Update the UI immediately with the new PDF info
        onUpdate(jd.id, 'cv_pdf_url', result.cv_pdf_url)
        onUpdate(jd.id, 'cv_pdf_filename', result.cv_pdf_filename)

      } catch (error: any) {
        console.error('Upload error:', error)
        alert(`Upload failed: ${error.message}`)
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }

    const handleRemovePDF = async () => {
      try {
        await onUpdate(jd.id, 'cv_pdf_url', '')
        await onUpdate(jd.id, 'cv_pdf_filename', '')
      } catch (error) {
        console.error('Remove error:', error)
      }
    }

    return (
      <div className="flex items-center gap-1 w-full">
        {jd.cv_pdf_url && jd.cv_pdf_filename ? (
          // PDF exists - show filename and remove option
          <>
            <a
              href={jd.cv_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-500 hover:text-purple-700 hover:underline flex items-center gap-1 truncate flex-1 min-w-0"
              title={jd.cv_pdf_filename}
            >
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{jd.cv_pdf_filename}</span>
            </a>
            <button
              onClick={handleRemovePDF}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 flex-shrink-0"
              title="Remove PDF"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        ) : (
          // No PDF - show upload button using label approach
          <label className="text-xs text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-50 w-full justify-center cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-500"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>Upload</span>
              </>
            )}
          </label>
        )}
      </div>
    )
  }




  // 获取所有experiences的辅助函数
  const fetchAllExperiences = async () => {
    const response = await fetch(`/api/experience?user_id=${user.id}`)
    if (!response.ok) throw new Error('Failed to fetch experiences')
    
    const result = await response.json()
    return result.data || []
  }


  // 隐藏局部loading当全局loading时
  if (loading && !globalLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }
  
  // 全局loading时不显示任何内容
  if (globalLoading) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">JD</h1>
            <p className="text-sm text-gray-600 mt-1">
              {(() => {
                const filteredCount = getFilteredAndSortedJDs().length
                const hasFilters = filters.stage || filters.time || filters.searchTerm
                return hasFilters
                  ? `${filteredCount} of ${jds.length} job descriptions`
                  : `${jds.length} job descriptions`
              })()}
            </p>
          </div>
          
          {/* Toolbar */}
          <div className="flex gap-3 flex-wrap">
            {(() => {
              const hasFilters = filters.stage || filters.time

              return (
                <>
                  <button
                    onClick={() => setShowAddPopover(true)}
                    className="w-32 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add
                  </button>

                  {/* Global Personal Info Button */}
                  <button
                    onClick={() => setShowPersonalInfoTooltip(true)}
                    className="w-32 px-6 py-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-purple-600 rounded-lg font-medium border border-purple-200 transition-all duration-300 whitespace-nowrap inline-flex items-center justify-center gap-2"
                    title="Configure Personal Information"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Profile
                  </button>

                  {/* Filter Dropdowns */}
                  <div className="flex gap-2">
              {/* Stage Filter */}
              <div className="relative">
                <select
                  value={filters.stage}
                  onChange={(e) => handleFilterChange('stage', e.target.value)}
                  className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">All Stages</option>
                  <option value="null">Not Set</option>
                  {getUniqueValues('stage').map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Time Filter */}
              <div className="relative">
                <select
                  value={filters.time}
                  onChange={(e) => handleFilterChange('time', e.target.value)}
                  className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">All Time</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="past3days">Past 3 days</option>
                  <option value="past7days">Past week</option>
                  <option value="past30days">Past month</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                  </div>
                  </div>

                  {/* Search Box */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search companies, comments..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleFilterChange('searchTerm', searchInput)
                        }
                      }}
                      className="w-40 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {searchInput && (
                      <button
                        onClick={() => {
                          setSearchInput('')
                          handleFilterChange('searchTerm', '')
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Clear Filters Button - Fixed Position */}
                  <button
                    onClick={clearFilters}
                    disabled={!hasFilters}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2 ${
                      hasFilters
                        ? 'bg-purple-100 hover:bg-purple-200 text-purple-600 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Clear
                  </button>
                </>
              )
            })()}
          </div>
        </div>
      </div>



      {/* JD List */}
      {(() => {
        const filteredJDs = getFilteredAndSortedJDs()
        
        if (jds.length === 0) {
          return (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-16 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm0 6h6v2H7v-2z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No JDs yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first job description</p>
              <button
                onClick={() => setShowAddPopover(true)}
                className="w-40 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add First JD
              </button>
            </div>
          )
        }
        
        if (filteredJDs.length === 0) {
          return (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-16 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No matching JDs</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters to see more results</p>
              <button
                onClick={clearFilters}
                className="w-40 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Clear Filters
              </button>
            </div>
          )
        }
        
        return (
          <div className="grid grid-cols-1 gap-4 transition-all duration-300 ease-in-out">
            {filteredJDs.map((jd) => {
            return (
              <div key={jd.id} id={`jd-card-${jd.id}`} className={`jd-card bg-white/90 backdrop-blur-md rounded-xl shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
                deletingJDs.has(jd.id) ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
              }`}>
                {/* Optimized 2-Row Layout */}
                <div className="p-4 relative">
                  <div className="flex items-start">

                    {/* 0-35%: Title & Company */}
                    <div className="w-[35%] px-3">
                      <div className="flex flex-col justify-between h-[4.5rem]">
                        <input
                          type="text"
                          value={jd.title}
                          onChange={(e) => {
                            // Optimistic update
                            const newJds = jds.map(j => j.id === jd.id ? {...j, title: e.target.value} : j)
                            setJds(newJds)
                          }}
                          onBlur={(e) => handleUpdateField(jd.id, 'title', e.target.value)}
                          placeholder="Job title..."
                          className="w-full h-9 px-3 text-base font-bold text-gray-900 bg-transparent border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-200"
                        />
                        <input
                          type="text"
                          value={jd.company}
                          onChange={(e) => {
                            // Optimistic update
                            const newJds = jds.map(j => j.id === jd.id ? {...j, company: e.target.value} : j)
                            setJds(newJds)
                          }}
                          onBlur={(e) => handleUpdateField(jd.id, 'company', e.target.value)}
                          placeholder="Company name..."
                          className="w-full h-9 px-3 text-sm font-medium text-gray-600 bg-transparent border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-200"
                        />
                      </div>
                    </div>

                    {/* 35-80%: Meta Fields - Stage Only */}
                    <div className="w-[45%] px-2">
                      <div className="flex flex-col justify-between h-[4.5rem]">
                        {/* Label Row - align with Title */}
                        <div className="h-9 flex items-center">
                          <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Stage</label>
                        </div>
                        {/* Input Row - align with Company */}
                        <div className="h-9">
                          <div className="relative w-1/2">
                            <select
                              value={jd.application_stage || ''}
                              onChange={(e) => {
                                handleUpdateField(jd.id, 'application_stage', e.target.value)
                                // Flash success effect
                                if (e.target.value) {
                                  const card = e.target.closest('.jd-card')
                                  if (card) {
                                    card.classList.add('bg-green-50', 'border-green-300')
                                    setTimeout(() => {
                                      card.classList.remove('bg-green-50', 'border-green-300')
                                    }, 800)
                                  }
                                }
                              }}
                              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer"
                            >
                              <option value="">Not Set</option>
                              {stageOptions.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 80-100%: Actions & Created */}
                    <div className="w-[20%] flex flex-col items-end">
                      <div className="flex flex-col justify-between h-[6.5rem] items-end">
                        {/* First Actions Row - 3 buttons */}
                        <div className="flex items-center gap-1 h-9">
                          <button
                            onClick={() => {
                              // Save JD data to localStorage for JD2CV 2.0
                              localStorage.setItem('jd2cv-transfer', JSON.stringify({
                                title: jd.title,
                                company: jd.company,
                                description: jd.full_job_description || ''
                              }))
                              // Add visual feedback - mark as transferred
                              setTransferredJDs(prev => new Set(prev).add(jd.id))
                              // No page navigation - user manually goes to JD2CV 2.0
                            }}
                            className={`p-2 rounded transition-colors border border-transparent ${
                              transferredJDs.has(jd.id)
                                ? 'text-purple-600 bg-purple-100 hover:bg-purple-200'
                                : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                            }`}
                            title={transferredJDs.has(jd.id) ? "Data ready for JD2CV 2.0" : "Generate with AI (JD2CV 2.0)"}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M13 10V3L4 14h7v7l9-11h-7z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setViewingJD(jd)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors border border-transparent"
                            title="View JD"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteJD(jd.id)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors border border-transparent"
                            title="Delete JD"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>

                        {/* Second Actions Row - V2 buttons */}
                        <div className="flex items-center justify-end gap-1 h-9">
                          <LangChainButtonV2 jd={jd} />
                          <LightningButtonV2 jd={jd} />
                          <CoverLetterButtonV2 jd={jd} />
                        </div>

                        {/* Created Row - at bottom */}
                        <div className="text-[10px] text-gray-400 text-right h-6 flex items-center">
                          Created: {formatDate(jd.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Comment Row (73%) + PDF Row (27%) */}
                  <div className="mt-3 flex gap-3 items-center">
                    {/* Comment Section - 73% */}
                    <div className="w-[73%] min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium flex-shrink-0">Comment:</span>
                        <div className="bg-gray-50/80 rounded-lg px-3 py-2 flex-1 min-w-0 overflow-hidden">
                          <div className="break-words overflow-wrap-anywhere word-break-break-word">
                            <CommentInlineEdit
                              value={jd.comment || ''}
                              onSave={(value) => handleUpdateField(jd.id, 'comment', value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PDF Section - 27% */}
                    <div className="w-[27%] flex justify-end">
                      <PDFSection jd={jd} onUpdate={handleUpdateField} />
                    </div>
                  </div>
                </div>

              </div>
            )
          })}
          </div>
        )
      })()}

      {/* Add JD Popover */}
      <AddJDPopover
        isOpen={showAddPopover}
        onClose={() => setShowAddPopover(false)}
        onSave={handleCreateJD}
        userId={user.id}
        stageOptions={stageOptions}
      />

      {/* View JD Tooltip */}
      {viewingJD && (
        <ViewJDTooltip
          isOpen={true}
          onClose={() => setViewingJD(null)}
          title={viewingJD.title}
          company={viewingJD.company}
          fullJobDescription={viewingJD.full_job_description || ''}
        />
      )}




      {/* Global Personal Info Tooltip */}
      <PersonalInfoTooltipV2 
        isOpen={showPersonalInfoTooltip}
        onClose={() => setShowPersonalInfoTooltip(false)}
      />

      {/* Applied Stats Floating Button */}
      <AppliedStatsFloatingButton jds={jds} />
    </div>
  )
}

