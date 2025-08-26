import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getSupabaseClient } from '@/lib/supabase'
import { JDRecord, CreateJDRequest, APPLICATION_STAGES } from '@/shared/types'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useJDFilterStore } from '@/store/useJDFilterStore'
import { useBatchAutoCVStore } from '@/store/useBatchAutoCVStore'
import { useBatchSelectionStore } from '@/store/useBatchSelectionStore'
import InlineEditField from './InlineEditField'
import AddJDPopover from './AddJDPopover'
import ViewJDTooltip from './ViewJDTooltip'
import DeleteTooltip from './DeleteTooltip'
import CommentTooltip from './CommentTooltip'
import CommentInlineEdit from './CommentInlineEdit'
import EnhancedBatchProgressModal from './EnhancedBatchProgressModal'
import AppliedStatsFloatingButton from './AppliedStatsFloatingButton'
import LightningButtonV2 from './LightningButtonV2'
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
  const [deleteJD, setDeleteJD] = useState<JDRecord | null>(null)
  const [deleteButtonRef, setDeleteButtonRef] = useState<HTMLElement | null>(null)
  const [searchInput, setSearchInput] = useState('')
  
  // JD Transfer states for visual feedback
  const [transferredJDs, setTransferredJDs] = useState<Set<string>>(new Set())
  
  // Global Personal Info state
  const [showPersonalInfoTooltip, setShowPersonalInfoTooltip] = useState(false)
  
  // Auto CV automation states
  const [finalCVState, setFinalCVState] = useState({
    isProcessing: false,
    progress: 0,
    currentStep: '',
    processingJDId: null as string | null
  })
  const [showProgressTooltip, setShowProgressTooltip] = useState(false)
  const [showBatchProgressModal, setShowBatchProgressModal] = useState(false)
  
  // Workspace store for Select functionality
  const { selectedJD, setSelectedJD } = useWorkspaceStore()
  
  // Global filter store
  const { filters, sortOrder, handleFilterChange, handleSortChange, clearFilters } = useJDFilterStore()

  // Batch Auto CV store
  const { isProcessing: isBatchProcessing } = useBatchAutoCVStore()
  
  // Batch selection store
  const { 
    selectedJDIds, 
    batchMode, 
    setBatchMode, 
    toggleJDSelection, 
    selectAllJDs,
    clearSelection,
    getSelectedCount 
  } = useBatchSelectionStore()

  // Load JDs on mount and setup optimized refresh mechanism
  useEffect(() => {
    console.log('🚀 JDPage useEffect - Initial loadJDs called')
    loadJDs()

    let refreshTimeout: NodeJS.Timeout | null = null

    // 防抖刷新函数 - 针对 Realtime 使用立即刷新
    const debouncedRefresh = (immediate = false) => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout)
      }
      
      if (immediate) {
        loadJDs()
      } else {
        refreshTimeout = setTimeout(() => {
          loadJDs()
        }, 1200) // 1.2秒防抖，确保用户操作完成
      }
    }

    // Setup Supabase Realtime subscription for automatic refresh
    const supabase = getSupabaseClient()

    // Realtime 事件回调 - 立即刷新数据
    const handleRealtimeEvent = (payload) => {
      // Realtime 事件使用立即刷新，无延迟
      debouncedRefresh(true)
    }

    // Setup Realtime subscription
    const channel = supabase.channel('jd_records_changes')

    // Subscribe to changes in jd_records table for this user
    const subscription = channel
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'jd_records',
          filter: `user_id=eq.${user.id}`
        },
        handleRealtimeEvent
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Realtime connected successfully')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('📡 Realtime connection failed:', err)
        }
      })

    // Cleanup subscription on unmount
    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout)
      }
      subscription.unsubscribe()
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
      // Find the JD card and delete button elements
      const jdCard = document.getElementById(`jd-card-${jd.id}`)
      const deleteButton = deleteButtonRef
      
      if (jdCard && deleteButton) {
        // Create flying animation before deletion
        const cardRect = jdCard.getBoundingClientRect()
        const buttonRect = deleteButton.getBoundingClientRect()
        
        // Create flying clone of the entire JD card
        const clone = jdCard.cloneNode(true) as HTMLElement
        clone.style.position = 'fixed'
        clone.style.zIndex = '9999'
        clone.style.pointerEvents = 'none'
        clone.style.left = `${cardRect.left}px`
        clone.style.top = `${cardRect.top}px`
        clone.style.width = `${cardRect.width}px`
        clone.style.height = `${cardRect.height}px`
        clone.style.transform = 'scale(1) rotate(0deg)'
        clone.style.opacity = '0.95'
        clone.style.boxShadow = '0 20px 60px rgba(239, 68, 68, 0.4), 0 8px 30px rgba(0, 0, 0, 0.2)'
        clone.style.borderRadius = '12px'
        clone.style.transition = 'all 1400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        document.body.appendChild(clone)
        
        // Start continuous rotation animation (reverse direction like remove)
        let rotationAngle = 0
        const rotationInterval = setInterval(() => {
          rotationAngle -= 12 // Faster reverse rotation for deletion
          if (clone.parentNode) {
            const currentTransform = clone.style.transform
            const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/)
            const currentScale = scaleMatch ? scaleMatch[1] : '1'
            clone.style.transform = `scale(${currentScale}) rotate(${rotationAngle}deg)`
          }
        }, 16) // 60fps smooth rotation
        
        // Animate to delete button position
        setTimeout(() => {
          clone.style.left = `${buttonRect.left + buttonRect.width / 2 - cardRect.width / 2}px`
          clone.style.top = `${buttonRect.top + buttonRect.height / 2 - cardRect.height / 2}px`
          clone.style.width = `${cardRect.width * 0.1}px`
          clone.style.height = `${cardRect.height * 0.1}px`
          const currentRotation = rotationAngle
          clone.style.transform = `scale(0.05) rotate(${currentRotation}deg)`
          clone.style.opacity = '0.1'
          clone.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.6), 0 4px 15px rgba(0, 0, 0, 0.3)'
        }, 50)
        
        // Final fade out phase
        setTimeout(() => {
          clone.style.opacity = '0'
          const currentRotation = rotationAngle
          clone.style.transform = `scale(0.01) rotate(${currentRotation}deg)`
        }, 1000)
        
        // Clean up rotation interval
        setTimeout(() => {
          clearInterval(rotationInterval)
        }, 1400)
        
        // Clean up clone
        setTimeout(() => {
          if (clone.parentNode) {
            clone.parentNode.removeChild(clone)
          }
        }, 1400)
        
        // Hide original card immediately
        jdCard.style.opacity = '0'
        jdCard.style.transform = 'scale(0.95)'
        jdCard.style.transition = 'all 300ms ease-out'
        
        // Wait for animation to complete before actual deletion
        setTimeout(async () => {
          const response = await fetch(`/api/jds/${jd.id}?user_id=${user.id}`, {
            method: 'DELETE'
          })

          const result = await response.json()
          if (result.success) {
            setJds(prev => prev.filter(j => j.id !== jd.id))
            setDeleteJD(null)
          } else {
            // Restore card if deletion failed
            jdCard.style.opacity = '1'
            jdCard.style.transform = 'scale(1)'
            throw new Error(result.error || 'Delete failed')
          }
        }, 1400)
      } else {
        // Fallback: direct deletion without animation
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
    const button = e?.target as HTMLElement
    const actualButton = button?.closest('button') as HTMLElement
    
    if (selectedJD?.id === jd.id) {
      // Removing from workspace - reverse flying animation
      setSelectedJD(null)
      
      if (actualButton) {
        const buttonRect = actualButton.getBoundingClientRect()
        const tabElement = document.getElementById('tab-workspace')
        
        if (tabElement) {
          const tabRect = tabElement.getBoundingClientRect()
          
          // Create flying clone starting from tab position
          const clone = actualButton.cloneNode(true) as HTMLElement
          clone.style.position = 'fixed'
          clone.style.zIndex = '9999'
          clone.style.pointerEvents = 'none'
          clone.style.left = `${tabRect.left + tabRect.width / 2 - buttonRect.width / 2}px`
          clone.style.top = `${tabRect.top + tabRect.height / 2 - buttonRect.height / 2}px`
          clone.style.width = `${buttonRect.width}px`
          clone.style.height = `${buttonRect.height}px`
          clone.style.transform = 'scale(0.3) rotate(0deg)'
          clone.style.opacity = '0.3'
          clone.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.6), 0 4px 15px rgba(0, 0, 0, 0.3)'
          clone.style.borderRadius = '8px'
          clone.style.transition = 'all 1400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          
          // Update button text to show "Next Step" in clone
          const textSpan = clone.querySelector('span')
          if (textSpan) {
            textSpan.textContent = 'Next Step'
          }
          
          document.body.appendChild(clone)
          
          // Start continuous rotation animation (reverse direction)
          let rotationAngle = 0
          const rotationInterval = setInterval(() => {
            rotationAngle -= 8 // Reverse rotation
            if (clone.parentNode) {
              const currentTransform = clone.style.transform
              const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/)
              const currentScale = scaleMatch ? scaleMatch[1] : '1'
              clone.style.transform = `scale(${currentScale}) rotate(${rotationAngle}deg)`
            }
          }, 16) // 60fps smooth rotation
          
          // Animate back to button position
          setTimeout(() => {
            clone.style.left = `${buttonRect.left}px`
            clone.style.top = `${buttonRect.top}px`
            clone.style.width = `${buttonRect.width}px`
            clone.style.height = `${buttonRect.height}px`
            const currentRotation = rotationAngle
            clone.style.transform = `scale(1) rotate(${currentRotation}deg)`
            clone.style.opacity = '0.95'
            clone.style.boxShadow = '0 20px 60px rgba(139, 92, 246, 0.4), 0 8px 30px rgba(0, 0, 0, 0.2)'
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
    } else {
      // Adding to workspace - original flying animation
      setSelectedJD(jd)
      
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
          
          // Update button text to show "In Workspace" in clone
          const textSpan = clone.querySelector('span')
          if (textSpan) {
            textSpan.textContent = 'In Workspace'
          }
          
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
        case 'stage': return jd.application_stage || null
        case 'role': return jd.role_group || null
        case 'firm': return jd.firm_type || null
        case 'score': return jd.match_score?.toString() || null
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
        (!filters.stage || (filters.stage === 'null' ? !jd.application_stage : jd.application_stage === filters.stage)) &&
        (!filters.role || jd.role_group === filters.role) &&
        (!filters.firm || jd.firm_type === filters.firm) &&
        (!filters.score || jd.match_score?.toString() === filters.score)
      )

      // Search term filter for comment
      const passesSearchFilter = !filters.searchTerm || 
        (jd.comment && jd.comment.toLowerCase().includes(filters.searchTerm.toLowerCase()))

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

  // Filter and sort functions now come from useJDFilterStore

  // Handle Auto CV automation
  const handleFinalCV = async (jd: JDRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // If already processing, show tooltip
    if (finalCVState.isProcessing) {
      setShowProgressTooltip(true)
      return
    }

    // Check prerequisites
    const pdfSetupData = localStorage.getItem(`oneclick-pdf-data-${user.id}`)
    if (!pdfSetupData) {
      alert('Please configure PDF Setup first in the Workspace tab before using Auto CV automation.')
      return
    }

    // Start automation
    setFinalCVState({
      isProcessing: true,
      progress: 0,
      currentStep: 'Starting...',
      processingJDId: jd.id
    })
    setShowProgressTooltip(true)

    try {
      // Step 1: Analyze JD (20%)
      await step1_AnalyzeJD(jd)
      
      // Step 2: Import Starred Experiences (40%)
      const starredExperiences = await step2_ImportStarred()
      
      // Step 3: Batch Optimize (60%)
      const optimizedData = await step3_BatchOptimize(starredExperiences, jd)
      
      // Step 4: Batch Send to PDF (80%)
      const pdfModules = await step4_BatchSendToPDF(optimizedData)
      
      // Step 5: Generate PDF (100%)
      await step5_GeneratePDF(pdfModules, jd)
      
      // Workflow completed successfully
      
      // Reset state
      setFinalCVState({
        isProcessing: false,
        progress: 100,
        currentStep: 'Completed',
        processingJDId: null
      })
      
      // Close tooltip and reset progress after a moment
      setTimeout(() => {
        setShowProgressTooltip(false)
        setFinalCVState(prev => ({ ...prev, progress: 0, currentStep: '' }))
      }, 2000)
      
    } catch (error: any) {
      console.error('❌ [Final CV] Workflow failed:', error)
      alert(`Auto CV automation failed: ${error.message || 'Unknown error'}`)
      
      // Reset state and close tooltip
      setFinalCVState({
        isProcessing: false,
        progress: 0,
        currentStep: '',
        processingJDId: null
      })
      setShowProgressTooltip(false)
    }
  }

  // Cancel workflow
  const handleCancelWorkflow = () => {
    setFinalCVState({
      isProcessing: false,
      progress: 0,
      currentStep: '',
      processingJDId: null
    })
    setShowProgressTooltip(false)
  }

  // Step 1: Analyze JD
  const step1_AnalyzeJD = async (jd: JDRecord) => {
    setFinalCVState(prev => ({ ...prev, progress: 5, currentStep: 'Analyzing JD...' }))
    
    const response = await fetch('/api/jd2cv/analyze-jd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jdId: jd.id,
        userId: user.id
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to analyze JD')
    }
    
    const result = await response.json()
    setFinalCVState(prev => ({ ...prev, progress: 20 }))
    
    return result
  }

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

  // Step 3: Batch Optimize
  const step3_BatchOptimize = async (experiences: any[], jd: JDRecord) => {
    setFinalCVState(prev => ({ ...prev, progress: 45, currentStep: 'Optimizing...' }))
    
    const optimizedData: any = {}
    
    for (let i = 0; i < experiences.length; i++) {
      const experience = experiences[i]
      
      // Update progress within this step
      const stepProgress = 40 + ((i + 1) / experiences.length) * 20
      setFinalCVState(prev => ({ ...prev, progress: stepProgress }))
      
      const response = await fetch('/api/jd2cv/optimize-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId: experience.id,
          jdKeywords: jd.keywords_from_sentences,
          userId: user.id
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to optimize experience: ${experience.title}`)
      }
      
      const result = await response.json()
      optimizedData[experience.id] = {
        originalExperience: experience,  // 添加完整的experience对象
        optimizedContent: result.data.optimizedContent,
        userKeywords: result.data.jdKeywords || [],
        isGenerated: true,
        isGenerating: false
      }
    }
    
    setFinalCVState(prev => ({ ...prev, progress: 60 }))
    
    return { experiences, optimizedData }
  }

  // Step 4: Batch Send to PDF
  const step4_BatchSendToPDF = async ({ experiences, optimizedData }: any) => {
    setFinalCVState(prev => ({ ...prev, progress: 65, currentStep: 'Preparing PDF...' }))
    
    const pdfModules = []
    
    for (let i = 0; i < experiences.length; i++) {
      const experience = experiences[i]
      const optimization = optimizedData[experience.id]
      
      // Update progress within this step
      const stepProgress = 60 + ((i + 1) / experiences.length) * 20
      setFinalCVState(prev => ({ ...prev, progress: stepProgress }))
      
      const draft = {
        id: `${experience.id}-optimized-${Date.now()}`,
        title: generateModuleTitle(experience.company, experience.title, experience.time),
        items: extractBullets(optimization.optimizedContent),
        sourceType: 'optimized' as const,
        sourceIds: {
          experienceId: experience.id,
          optimizationId: `${experience.id}-opt`
        },
        // Preserve company information for PDF generation
        company: experience.company || 'Unknown Company'
      }
      
      pdfModules.push(draft)
    }
    
    setFinalCVState(prev => ({ ...prev, progress: 80 }))
    
    return pdfModules
  }

  // Step 5: Generate PDF
  const step5_GeneratePDF = async (pdfModules: any[], jd: JDRecord) => {
    setFinalCVState(prev => ({ ...prev, progress: 85, currentStep: 'Generating PDF...' }))
    
    // Get PDF config
    const storedConfig = localStorage.getItem(`oneclick-pdf-data-${user.id}`)
    if (!storedConfig) {
      throw new Error('PDF configuration not found')
    }
    
    const config = JSON.parse(storedConfig)
    
    // Prepare experience modules for PDF
    const experienceModules = pdfModules.map(module => ({
      id: module.sourceIds?.experienceId || module.id,
      title: module.title,
      company: module.company || 'Unknown Company',
      content: module.items.join('\n• '),
      isOptimized: module.sourceType === 'optimized'
    }))
    
    setFinalCVState(prev => ({ ...prev, progress: 90 }))
    
    // Call PDF generation API
    const response = await fetch('/api/jd2cv/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config,
        experienceModules,
        jdId: jd.id,
        userId: user.id
      })
    })
    
    setFinalCVState(prev => ({ ...prev, progress: 95 }))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate PDF')
    }
    
    // Download PDF
    const blob = await response.blob()
    // Create filename with JD info
    const safeName = (config.personalInfo.fullName || 'CV').replace(/[^a-zA-Z0-9\s]/g, '')
    const safeCompany = (jd.company || 'Company').replace(/[^a-zA-Z0-9\s]/g, '')
    const safeTitle = (jd.title || 'Position').replace(/[^a-zA-Z0-9\s]/g, '')
    const fileName = `${safeName} - ${safeCompany} - ${safeTitle}.pdf`

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    setFinalCVState(prev => ({ ...prev, progress: 100 }))
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

  // Handle Batch Auto CV automation - 新增批量处理函数
  const handleBatchAutoCV = async () => {
    if (selectedJDIds.size === 0 || isBatchProcessing) return

    // Show batch progress modal
    setShowBatchProgressModal(true)

    const { startBatchProcess, updateProgress, completeJD, failJD, resetState } = useBatchAutoCVStore.getState()

    try {
      // 获取PDF配置
      const pdfSetupData = localStorage.getItem(`oneclick-pdf-data-${user.id}`)
      if (!pdfSetupData) {
        alert('Please configure PDF Setup first in the Workspace tab before using Batch Auto CV.')
        return
      }

      const config = JSON.parse(pdfSetupData)
      
      // 获取starred experiences IDs
      const getStarredIds = () => {
        const starred = localStorage.getItem('starred-experiences')
        if (!starred) return []
        const starredObj = JSON.parse(starred)
        return Object.keys(starredObj).filter(id => starredObj[id])
      }

      const starredIds = getStarredIds()
      if (starredIds.length === 0) {
        alert('No starred experiences found. Please star some experiences first in the CV tab.')
        return
      }

      // 开始批量处理
      const selectedJDsArray = Array.from(selectedJDIds)
      startBatchProcess(selectedJDsArray)
      
      // 获取选中的JD记录
      const selectedJDs = jds.filter(jd => selectedJDIds.has(jd.id))
      
      // 逐个处理JD，复制现有Auto CV的逐步处理方式
      for (let i = 0; i < selectedJDs.length; i++) {
        const jd = selectedJDs[i]
        const currentProgress = (i / selectedJDs.length) * 100
        
        try {
          // 更新当前处理的JD
          updateProgress({
            currentJDIndex: i,
            currentJD: jd,
            currentStep: `Processing ${jd.title}...`,
            progress: currentProgress
          })
          
          // 调用单个JD的Auto CV API，复制现有Auto CV逻辑
          await processSingleJD(jd, starredIds, config)
          
          // 标记完成
          completeJD(jd.id)
          
        } catch (error: any) {
          console.error(`Failed to process JD ${jd.id}:`, error)
          failJD(jd, error.message)
        }
      }
      
      // 最终完成状态
      updateProgress({
        currentStep: `Batch processing completed!`,
        progress: 100
      })

      // 3秒后重置状态
      setTimeout(() => {
        resetState()
        clearSelection() // 清除选择
      }, 3000)

    } catch (error: any) {
      console.error('❌ [Batch Auto CV] Error:', error)
      alert(`Batch Auto CV failed: ${error.message}`)
      resetState()
    }
  }

  // 批量专用的JD分析函数 - 不更新单个Auto CV状态
  const batchStep1_AnalyzeJD = async (jd: JDRecord) => {
    try {
      const response = await fetch('/api/jd2cv/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jdId: jd.id,
          userId: user.id
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Analyze JD API error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 200) // 只显示前200字符
        })
        throw new Error(`API Error ${response.status}: ${response.statusText}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('❌ Non-JSON response:', {
          contentType,
          bodyPreview: text.substring(0, 200)
        })
        throw new Error('API returned non-JSON response')
      }
      
      const result = await response.json()
      return result
    } catch (error: any) {
      console.error('❌ batchStep1_AnalyzeJD error:', error)
      throw new Error(`Failed to analyze JD "${jd.title}": ${error.message}`)
    }
  }

  // 批量处理单个JD - 完全复制现有Auto CV的逻辑
  const processSingleJD = async (jd: JDRecord, starredIds: string[], config: any) => {
    // Step 1: Analyze JD (批量版本，不更新单个状态)
    await batchStep1_AnalyzeJD(jd)
    
    // Step 2: Import Starred Experiences  
    const allExperiences = await fetchAllExperiences()
    const starredExperiences = allExperiences
      .filter((exp: any) => starredIds.includes(exp.id))
      .sort((a: any, b: any) => {
        const endYearA = getEndYear(a.time)
        const endYearB = getEndYear(b.time)
        return endYearB - endYearA
      })
    
    // Step 3: Batch Optimize
    const optimizedData = await step3_BatchOptimize(starredExperiences, jd)
    
    // Step 4: Batch Send to PDF
    const pdfModules = await step4_BatchSendToPDF(optimizedData)
    
    // Step 5: Generate PDF
    await step5_GeneratePDF(pdfModules, jd)
  }

  // 获取所有experiences的辅助函数
  const fetchAllExperiences = async () => {
    const response = await fetch(`/api/experience?user_id=${user.id}`)
    if (!response.ok) throw new Error('Failed to fetch experiences')
    
    const result = await response.json()
    return result.data || []
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
                const hasFilters = filters.stage || filters.role || filters.firm || filters.score || filters.time || filters.searchTerm || sortOrder
                return hasFilters 
                  ? `${filteredCount} of ${jds.length} job descriptions`
                  : `${jds.length} job descriptions`
              })()}
            </p>
          </div>
          
          {/* Toolbar */}
          <div className="flex gap-3 flex-wrap">
            {(() => {
              const hasFilters = filters.stage || filters.role || filters.firm || filters.score || filters.time || sortOrder
              
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

                  {/* Batch Mode Toggle */}
                  <button
                    onClick={() => {
                      setBatchMode(!batchMode)
                      if (batchMode) {
                        clearSelection()
                      }
                    }}
                    className={`w-32 px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2 ${
                      batchMode
                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    {batchMode ? 'Exit' : 'Batch'}
                  </button>

                  {/* Select All - Always present, disabled when not in batch mode */}
                  <button
                    onClick={() => {
                      const allIds = getFilteredAndSortedJDs().map(jd => jd.id)
                      selectAllJDs(allIds)
                    }}
                    disabled={!batchMode}
                    className={`w-32 px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2 ${
                      batchMode
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Select All
                  </button>

                  {/* Clear Selection - Always present, disabled when not in batch mode */}
                  <button
                    onClick={() => clearSelection()}
                    disabled={!batchMode || getSelectedCount() === 0}
                    className={`w-32 px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-2 ${
                      batchMode && getSelectedCount() > 0
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Clear
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
                      placeholder="Search comments..."
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

      {/* Batch Toolbar - Only show when batch mode is active and JDs are selected */}
      {batchMode && getSelectedCount() > 0 && (
        <div className="bg-purple-50/80 backdrop-blur-sm border border-purple-200 rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-purple-700">
                {getSelectedCount()} JD{getSelectedCount() > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleBatchAutoCV()}
                disabled={isBatchProcessing}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                {isBatchProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Batch Auto CV
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  // TODO: 添加批量删除功能
                  if (confirm(`Are you sure you want to delete ${getSelectedCount()} selected JDs?`)) {
                    // handleBatchDelete()
                    // Batch delete not implemented yet
                  }
                }}
                disabled={isBatchProcessing}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}


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
              <div key={jd.id} id={`jd-card-${jd.id}`} className="jd-card bg-white/90 backdrop-blur-md rounded-xl shadow-xl overflow-hidden">
                {/* Optimized 2-Row Layout */}
                <div className="p-4 relative">
                  <div className="flex items-start">
                    
                    {/* 0-8%: Select & Final CV Buttons */}
                    <div className="w-[8%] flex-shrink-0">
                      <div className="flex flex-col gap-1 h-[4.5rem]">
                        {/* Batch Mode Checkbox or Select Button */}
                        {batchMode ? (
                          <div className="w-full flex-1 flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedJDIds.has(jd.id)}
                              onChange={(e) => {
                                e.stopPropagation()
                                toggleJDSelection(jd.id)
                              }}
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleSelectForWorkspace(jd, e)}
                            className={`w-full flex-1 rounded-lg font-medium text-xs transition-all duration-300 inline-flex items-center justify-center ${
                              selectedJD?.id === jd.id
                                ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg scale-105'
                                : 'bg-gray-100 hover:bg-purple-50 text-gray-600 hover:text-purple-600 border border-gray-200 hover:border-purple-300'
                            }`}
                            title={selectedJD?.id === jd.id ? 'Selected for Workspace' : 'Select for Workspace'}
                          >
                            {selectedJD?.id === jd.id ? (
                              <span className="text-xs font-medium">In Workspace</span>
                            ) : (
                              <span className="text-xs font-medium">Next Step</span>
                            )}
                          </button>
                        )}
                        
                        {/* Final CV Button - Bottom Half */}
                        <button
                          onClick={(e) => handleFinalCV(jd, e)}
                          disabled={finalCVState.isProcessing && finalCVState.processingJDId !== jd.id}
                          className={`w-full flex-1 rounded-lg font-medium text-xs transition-all duration-300 inline-flex items-center justify-center relative overflow-hidden ${
                            finalCVState.isProcessing && finalCVState.processingJDId === jd.id
                              ? 'bg-purple-500 hover:bg-purple-600 text-white'
                              : finalCVState.isProcessing && finalCVState.processingJDId !== jd.id
                              ? 'bg-gray-400 cursor-not-allowed text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                          title={
                            finalCVState.isProcessing && finalCVState.processingJDId === jd.id
                              ? 'View Progress'
                              : finalCVState.isProcessing && finalCVState.processingJDId !== jd.id
                              ? 'Another JD is being processed...'
                              : 'Generate Auto CV automatically'
                          }
                        >
                          {/* Button Content */}
                          <span className="relative z-10">
                            {finalCVState.isProcessing && finalCVState.processingJDId === jd.id
                              ? 'View'
                              : finalCVState.isProcessing && finalCVState.processingJDId !== jd.id
                              ? 'Wait'
                              : 'Auto CV'
                            }
                          </span>
                        </button>
                      </div>
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
                            <input
                              type="text"
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
                              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Not Set"
                            />
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
                      <div className="flex flex-col justify-between h-[6.5rem] items-end">
                        {/* First Actions Row - Original 3 buttons */}
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
                            onClick={(e) => {
                              setDeleteButtonRef(e.currentTarget)
                              setDeleteJD(jd)
                            }}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors border border-transparent"
                            title="Delete JD"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Second Actions Row - V2 buttons */}
                        <div className="flex items-center justify-end gap-1 h-9">
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

      {/* Auto CV Progress Tooltip */}
      {showProgressTooltip && (
        <ProgressTooltip
          isOpen={showProgressTooltip}
          onClose={handleCancelWorkflow}
          currentStep={finalCVState.currentStep}
          isProcessing={finalCVState.isProcessing}
        />
      )}

      {/* Enhanced Batch Progress Modal */}
      <EnhancedBatchProgressModal
        isOpen={showBatchProgressModal}
        onClose={() => {
          setShowBatchProgressModal(false)
          if (!isBatchProcessing) {
            useBatchAutoCVStore.getState().resetState()
          }
        }}
      />

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

// Progress Tooltip Component
interface ProgressTooltipProps {
  isOpen: boolean
  onClose: () => void
  currentStep: string
  isProcessing: boolean
}

function ProgressTooltip({ isOpen, onClose, currentStep, isProcessing }: ProgressTooltipProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const steps = [
    { key: 'Starting...', label: 'Starting workflow', icon: '○' },
    { key: 'Analyzing JD...', label: 'Analyzing job description', icon: '○' },
    { key: 'Importing starred...', label: 'Importing starred experiences', icon: '○' },
    { key: 'Optimizing...', label: 'Optimizing content with AI', icon: '○' },
    { key: 'Preparing PDF...', label: 'Preparing PDF modules', icon: '○' },
    { key: 'Generating PDF...', label: 'Generating final PDF', icon: '○' },
    { key: 'Completed', label: 'Workflow completed', icon: '○' }
  ]

  const getCurrentStepIndex = () => {
    const index = steps.findIndex(step => step.key === currentStep)
    return index === -1 ? 0 : index
  }

  const currentStepIndex = getCurrentStepIndex()

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed'
    if (stepIndex === currentStepIndex && isProcessing) return 'current'
    if (stepIndex === currentStepIndex && !isProcessing && currentStep === 'Completed') return 'completed'
    return 'pending'
  }

  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-4 transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.15), 0 8px 30px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
          <h3 className="text-lg font-semibold text-gray-800">Workflow Progress</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100/80 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-all duration-200 flex items-center justify-center group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            return (
              <div key={step.key} className="flex items-center gap-4">
                {/* Step Indicator */}
                <div className="flex-shrink-0 relative">
                  {status === 'completed' ? (
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg transform transition-all duration-300">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : status === 'current' ? (
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-50"></div>
                  )}
                  
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-8 left-1/2 w-0.5 h-6 transform -translate-x-1/2 transition-colors duration-300 ${
                      status === 'completed' ? 'bg-purple-300' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>

                {/* Step Label */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium transition-colors duration-300 ${
                    status === 'current' ? 'text-purple-700' : 
                    status === 'completed' ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {status === 'current' && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-purple-600">Processing...</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="bg-purple-50/80 rounded-lg p-4 border border-purple-100">
            <p className="text-sm text-purple-700 font-medium">Please wait and do not interrupt the process</p>
            <p className="text-xs text-purple-600 mt-1">The workflow will complete automatically</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}