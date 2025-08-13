import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { JDRecord, CreateJDRequest, APPLICATION_STAGES } from '@/shared/types'
import { useWorkspaceStore } from '@/store/workspaceStore'
import InlineEditField from './InlineEditField'
import AddJDPopover from './AddJDPopover'
import ViewJDTooltip from './ViewJDTooltip'
import DeleteTooltip from './DeleteTooltip'
import CommentTooltip from './CommentTooltip'
import CommentInlineEdit from './CommentInlineEdit'
import StatsPanel from './StatsPanel'

interface JDPageProps {
  user: { id: string }
}

export default function JDPage({ user }: JDPageProps) {
  const [jds, setJds] = useState<JDRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPopover, setShowAddPopover] = useState(false)
  const [viewingJD, setViewingJD] = useState<JDRecord | null>(null)
  const [deleteJD, setDeleteJD] = useState<JDRecord | null>(null)
  const [deleteButtonRef, setDeleteButtonRef] = useState<HTMLElement | null>(null)
  
  // Filter and Sort states
  const [filters, setFilters] = useState({
    stage: '',
    role: '',
    firm: '',
    score: ''
  })
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('')
  
  // Workspace store for Select functionality
  const { selectedJD, setSelectedJD } = useWorkspaceStore()

  // Load JDs on mount and setup realtime subscription
  useEffect(() => {
    loadJDs()

    // Setup Supabase Realtime subscription for automatic refresh
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Subscribe to changes in jd_records table for this user
    const subscription = supabase
      .channel('jd_records_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'jd_records',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('JD record change detected:', payload)
          // Refresh data when any change is detected
          loadJDs()
        }
      )
      .subscribe()

    // Page focus listener as backup refresh mechanism
    const handlePageFocus = () => {
      loadJDs()
    }
    window.addEventListener('focus', handlePageFocus)

    // Cleanup subscription and listener on unmount
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('focus', handlePageFocus)
    }
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
      console.log('Update response:', { response: response.status, result })
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

  const handleDeleteJD = async (jd: JDRecord) => {
    try {
      const response = await fetch(`/api/jds/${jd.id}?user_id=${user.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        setJds(prev => prev.filter(j => j.id !== jd.id))
        setDeleteJD(null)
      } else {
        throw new Error(result.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Error deleting JD:', error)
      alert('Failed to delete JD. Please try again.')
    }
  }

  const handleClearCVFile = async (id: string, field: 'cv_pdf_url' | 'cv_pdf_filename') => {
    await handleUpdateField(id, field, '')
  }

  const handleSelectForWorkspace = (jd: JDRecord, e?: React.MouseEvent) => {
    e?.stopPropagation() // Prevent any parent click handlers
    if (selectedJD?.id === jd.id) {
      setSelectedJD(null) // 取消选择
    } else {
      setSelectedJD(jd) // 选择新记录
      
      // Enhanced flying animation effect - arrow button only
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
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Get unique values for filter dropdowns
  const getUniqueValues = (field: string) => {
    const values = jds.map(jd => {
      switch(field) {
        case 'stage': return jd.application_stage || ''
        case 'role': return jd.role_group || ''
        case 'firm': return jd.firm_type || ''
        case 'score': return jd.match_score?.toString() || ''
        default: return ''
      }
    }).filter(value => value !== '')
    
    return [...new Set(values)].sort()
  }

  // Filter and sort JDs
  const getFilteredAndSortedJDs = () => {
    let filteredJDs = jds.filter(jd => {
      return (
        (!filters.stage || jd.application_stage === filters.stage) &&
        (!filters.role || jd.role_group === filters.role) &&
        (!filters.firm || jd.firm_type === filters.firm) &&
        (!filters.score || jd.match_score?.toString() === filters.score)
      )
    })

    // Apply sorting by score
    if (sortOrder) {
      filteredJDs.sort((a, b) => {
        const scoreA = a.match_score || 0
        const scoreB = b.match_score || 0
        return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA
      })
    }

    return filteredJDs
  }

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle sort change
  const handleSortChange = () => {
    if (sortOrder === '') {
      setSortOrder('desc')
    } else if (sortOrder === 'desc') {
      setSortOrder('asc')
    } else {
      setSortOrder('')
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      stage: '',
      role: '',
      firm: '',
      score: ''
    })
    setSortOrder('')
  }

  // PDF Section Component
  function PDFSection({ jd, onUpdate }: { jd: any, onUpdate: (id: string, field: string, value: string) => void }) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

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
          // No PDF - show upload button
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-50 w-full justify-center"
            >
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
            </button>
          </>
        )}
      </div>
    )
  }

  const parseKeywords = (keywordsString?: string) => {
    if (!keywordsString) return []
    
    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(keywordsString)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // If JSON parsing fails, split by common delimiters
      return keywordsString.split(/[,;|\n]/).map(k => k.trim()).filter(k => k)
    }
    
    return []
  }

  const groupKeywords = (keywords: string[]) => {
    const groups: string[][] = []
    const itemsPerGroup = Math.ceil(keywords.length / 3) || 1
    
    for (let i = 0; i < keywords.length; i += itemsPerGroup) {
      groups.push(keywords.slice(i, i + itemsPerGroup))
    }
    
    return groups
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
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
                const hasFilters = filters.stage || filters.role || filters.firm || filters.score || sortOrder
                return hasFilters 
                  ? `${filteredCount} of ${jds.length} job descriptions`
                  : `${jds.length} job descriptions`
              })()}
            </p>
          </div>
          
          {/* Toolbar */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowAddPopover(true)}
              className="w-32 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add
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

              {/* Role Filter */}
              <div className="relative">
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">All Roles</option>
                  {getUniqueValues('role').map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Firm Filter */}
              <div className="relative">
                <select
                  value={filters.firm}
                  onChange={(e) => handleFilterChange('firm', e.target.value)}
                  className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">All Firms</option>
                  {getUniqueValues('firm').map(firm => (
                    <option key={firm} value={firm}>{firm}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Score Filter */}
              <div className="relative">
                <select
                  value={filters.score}
                  onChange={(e) => handleFilterChange('score', e.target.value)}
                  className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">All Scores</option>
                  {getUniqueValues('score').map(score => (
                    <option key={score} value={score}>{score}★</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort Button */}
            <button
              onClick={handleSortChange}
              className={`w-32 px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2 ${
                sortOrder 
                  ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                {sortOrder === 'asc' ? (
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                ) : sortOrder === 'desc' ? (
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                ) : (
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                )}
              </svg>
              {sortOrder === 'asc' ? 'Score ↑' : sortOrder === 'desc' ? 'Score ↓' : 'Sort'}
            </button>

            {/* Clear Filters Button */}
            {(filters.stage || filters.role || filters.firm || filters.score || sortOrder) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <StatsPanel jds={jds} />

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
          <div className="grid grid-cols-1 gap-4">
            {filteredJDs.map((jd) => {
            const keywords = parseKeywords(jd.keywords_from_sentences)
            const keywordGroups = groupKeywords(keywords)
            
            return (
              <div key={jd.id} className="jd-card bg-white/90 backdrop-blur-md rounded-xl shadow-xl overflow-hidden">
                {/* Optimized 2-Row Layout */}
                <div className="p-4 relative">
                  <div className="flex items-start">
                    
                    {/* 0-8%: Select Button */}
                    <div className="w-[8%] flex-shrink-0">
                      <button
                        onClick={(e) => handleSelectForWorkspace(jd, e)}
                        className={`w-full h-[4.5rem] rounded-lg font-medium text-xs transition-all duration-300 inline-flex items-center justify-center ${
                          selectedJD?.id === jd.id
                            ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 hover:bg-purple-50 text-gray-600 hover:text-purple-600 border border-gray-200 hover:border-purple-300'
                        }`}
                        title={selectedJD?.id === jd.id ? 'Selected for Workspace' : 'Select for Workspace'}
                      >
                        {selectedJD?.id === jd.id ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* 8-35%: Title & Company */}
                    <div className="w-[27%] px-3">
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

                    {/* 35-85%: Meta Fields - Label Row + Input Row */}
                    <div className="w-[50%] px-2">
                      <div className="flex flex-col justify-between h-[4.5rem]">
                        {/* Labels Row - align with Title */}
                        <div className="grid grid-cols-4 gap-2 h-9 items-center">
                          <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Stage</label>
                          <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Role</label>
                          <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Firm</label>
                          <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Score</label>
                        </div>
                        {/* Input Row - align with Company */}
                        <div className="grid grid-cols-4 gap-2 h-9">
                          <div className="relative">
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
                              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none pr-8 cursor-pointer"
                            >
                              <option value="" className="text-gray-400">Select...</option>
                              {APPLICATION_STAGES.map((stage) => (
                                <option key={stage} value={stage}>{stage}</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={jd.role_group || ''}
                            onChange={(e) => {
                              // Optimistic update
                              const newJds = jds.map(j => j.id === jd.id ? {...j, role_group: e.target.value} : j)
                              setJds(newJds)
                            }}
                            onBlur={(e) => handleUpdateField(jd.id, 'role_group', e.target.value)}
                            placeholder="Type..."
                            className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                          <input
                            type="text"
                            value={jd.firm_type || ''}
                            onChange={(e) => {
                              // Optimistic update
                              const newJds = jds.map(j => j.id === jd.id ? {...j, firm_type: e.target.value} : j)
                              setJds(newJds)
                            }}
                            onBlur={(e) => handleUpdateField(jd.id, 'firm_type', e.target.value)}
                            placeholder="Type..."
                            className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                          <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.5"
                            value={jd.match_score || 3}
                            onChange={(e) => {
                              const numValue = Math.max(1, Math.min(5, Math.round(Number(e.target.value) * 2) / 2))
                              // Optimistic update
                              const newJds = jds.map(j => j.id === jd.id ? {...j, match_score: numValue} : j)
                              setJds(newJds)
                            }}
                            onBlur={(e) => {
                              const numValue = Math.max(1, Math.min(5, Math.round(Number(e.target.value) * 2) / 2))
                              handleUpdateField(jd.id, 'match_score', numValue)
                            }}
                            placeholder="3"
                            className="w-full h-9 px-3 text-sm font-bold text-gray-700 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 85-100%: Actions & Created */}
                    <div className="w-[15%] flex flex-col items-end">
                      <div className="flex flex-col justify-between h-[4.5rem] items-end">
                        {/* Actions Row - align with Title */}
                        <div className="flex items-center gap-1 h-9">
                          <button
                            onClick={() => setViewingJD(jd)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="View JD"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              setDeleteButtonRef(e.currentTarget)
                              setDeleteJD(jd)
                            }}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="Delete JD"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Created Row - align with Company */}
                        <div className="text-xs text-gray-400 text-right h-9 flex items-center">
                          Created: {formatDate(jd.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Comment Row (73%) + PDF Row (27%) */}
                  <div className="mt-3 flex gap-3 items-center">
                    {/* Comment Section - 73% */}
                    <div className="w-[73%]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">Comment:</span>
                        <div className="bg-gray-50/80 rounded-lg px-3 py-2 flex-1">
                          <CommentInlineEdit
                            value={jd.comment || ''}
                            onSave={(value) => handleUpdateField(jd.id, 'comment', value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* PDF Section - 27% */}
                    <div className="w-[27%] flex justify-end">
                      <PDFSection jd={jd} onUpdate={handleUpdateField} />
                    </div>
                  </div>
                </div>

                {/* Keywords Area - Compact 3x4 Layout */}
                <div className="bg-gradient-to-r from-gray-50/60 via-purple-50/30 to-gray-50/60 border-t border-gray-200/50 px-4 py-2.5">
                  {keywords.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2.5">
                      {keywordGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="bg-white/60 backdrop-blur-sm rounded-md p-2 border border-gray-100/60 shadow-sm">
                          <div className="space-y-0.5 max-h-20 overflow-hidden">
                            {group.slice(0, 4).map((keyword, keywordIndex) => (
                              <div key={keywordIndex} className="text-xs text-gray-600 bg-gray-100/70 rounded-sm px-1.5 py-0.5 font-medium leading-tight truncate">
                                {keyword}
                              </div>
                            ))}
                            {group.length > 4 && (
                              <div className="text-xs text-gray-400 italic px-1.5 py-0.5">
                                +{group.length - 4} more
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-gray-400 text-xs font-medium">No keywords available</p>
                    </div>
                  )}
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

      {/* Delete Confirmation Tooltip */}
      {deleteJD && (
        <DeleteTooltip
          isOpen={true}
          onClose={() => {
            setDeleteJD(null)
            setDeleteButtonRef(null)
          }}
          onConfirm={() => handleDeleteJD(deleteJD)}
          title={`${deleteJD.title} at ${deleteJD.company}`}
          triggerElement={deleteButtonRef}
        />
      )}
    </div>
  )
}