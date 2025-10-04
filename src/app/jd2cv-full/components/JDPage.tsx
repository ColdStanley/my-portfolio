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

interface CardMenuState {
  [key: string]: boolean
}

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

  // Deleting states for fade out animation
  const [deletingJDs, setDeletingJDs] = useState<Set<string>>(new Set())

  // Global Personal Info state
  const [showPersonalInfoTooltip, setShowPersonalInfoTooltip] = useState(false)

  // Card menu state (for 3-dot menu)
  const [cardMenus, setCardMenus] = useState<CardMenuState>({})

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Check if click is outside any menu
      if (!target.closest('.card-menu-container')) {
        setCardMenus({})
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
              className="text-xs text-gray-600 hover:text-gray-800 hover:underline flex items-center gap-1 truncate flex-1 min-w-0"
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
          <label className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 w-full justify-center cursor-pointer">
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
                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-500"></div>
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
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
                    className="w-32 px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add
                  </button>

                  {/* Global Personal Info Button */}
                  <button
                    onClick={() => setShowPersonalInfoTooltip(true)}
                    className="w-32 px-6 py-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-gray-700 rounded-lg font-medium border border-gray-300 transition-all duration-300 whitespace-nowrap inline-flex items-center justify-center gap-2"
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
                  className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 appearance-none cursor-pointer"
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
                  className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 appearance-none cursor-pointer"
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
                      className="w-40 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
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
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
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
                className="w-40 px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2"
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
                className="w-40 px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2"
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
          <div className="grid grid-cols-3 gap-3 transition-all duration-300 ease-in-out">
            {filteredJDs.map((jd) => {
            return (
              <div key={jd.id} id={`jd-card-${jd.id}`} className={`jd-card bg-white/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
                deletingJDs.has(jd.id) ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
              }`}>
                {/* New Vertical Layout */}
                <div className="p-4 relative">
                  {/* 3-dot menu button (top-right, vertically centered with title) */}
                  <div className="card-menu-container">
                    <button
                      onClick={() => setCardMenus(prev => ({ ...prev, [jd.id]: !prev[jd.id] }))}
                      className="absolute top-[18px] right-3 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="More options"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {cardMenus[jd.id] && (
                      <div className="absolute top-11 right-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden w-28 animate-dropdown">
                      <button
                        onClick={() => {
                          setViewingJD(jd)
                          setCardMenus(prev => ({ ...prev, [jd.id]: false }))
                        }}
                        className="w-full px-3 py-1.5 text-xs text-left text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteJD(jd.id)
                          setCardMenus(prev => ({ ...prev, [jd.id]: false }))
                        }}
                        className="w-full px-3 py-1.5 text-xs text-left text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        Delete
                      </button>
                      <LangChainButtonV2 jd={jd} className="!w-full !h-auto !bg-transparent !text-gray-700 hover:!bg-gray-50 !text-left !px-3 !py-1.5 !rounded-none !font-normal !text-xs" onMenuClick={() => setCardMenus(prev => ({ ...prev, [jd.id]: false }))} isManualMode />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Title - reduced width to avoid overlap with menu button */}
                    <input
                      type="text"
                      value={jd.title}
                      onChange={(e) => {
                        const newJds = jds.map(j => j.id === jd.id ? {...j, title: e.target.value} : j)
                        setJds(newJds)
                      }}
                      onBlur={(e) => handleUpdateField(jd.id, 'title', e.target.value)}
                      placeholder="Job title..."
                      className="w-[calc(100%-32px)] px-2 py-1 text-sm font-bold text-gray-900 bg-transparent border border-transparent rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent hover:border-gray-200 transition-colors"
                    />

                    {/* Company */}
                    <input
                      type="text"
                      value={jd.company}
                      onChange={(e) => {
                        const newJds = jds.map(j => j.id === jd.id ? {...j, company: e.target.value} : j)
                        setJds(newJds)
                      }}
                      onBlur={(e) => handleUpdateField(jd.id, 'company', e.target.value)}
                      placeholder="Company name..."
                      className="w-full px-2 py-1 text-xs text-gray-600 bg-transparent border border-transparent rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent hover:border-gray-200 transition-colors"
                    />

                    {/* Comment */}
                    <CommentInlineEdit
                      value={jd.comment || ''}
                      onSave={(value) => handleUpdateField(jd.id, 'comment', value)}
                    />

                    {/* PDF - Always show */}
                    <div className="bg-gray-50/80 rounded-lg px-2 py-1.5 min-h-[28px]">
                      <PDFSection jd={jd} onUpdate={handleUpdateField} />
                    </div>

                    {/* 3 Buttons: LC, CL, n8n */}
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <LangChainButtonV2 jd={jd} autoMode buttonText="LC" />
                      <CoverLetterButtonV2 jd={jd} buttonText="CL" />
                      <LightningButtonV2 jd={jd} buttonText="n8n" />
                    </div>

                    {/* Stage & Created - same row */}
                    <div className="flex gap-2">
                      {/* Stage - 50% */}
                      <select
                        value={jd.application_stage || 'Raw JD'}
                        onChange={(e) => {
                          handleUpdateField(jd.id, 'application_stage', e.target.value)
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
                        className="w-1/2 h-7 px-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-500 cursor-pointer transition-colors"
                      >
                        {stageOptions.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>

                      {/* Created - 50% */}
                      <div className="w-1/2 h-7 px-2 text-xs text-gray-500 flex items-center justify-end">
                        {formatDate(jd.created_at)}
                      </div>
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

