'use client'

import { useState, useEffect, useRef } from 'react'

// Tooltip Prompt Component
interface TooltipPromptProps {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  placeholder: string
  disabled?: boolean
  saving?: boolean
}

function TooltipPrompt({ value, onChange, onSave, placeholder, disabled = false, saving = false }: TooltipPromptProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempValue, setTempValue] = useState(value)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTempValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setTempValue(value) // Reset to original value
      }
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setTempValue(value)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, value])

  const handleApply = () => {
    onChange(tempValue)
    setIsOpen(false)
  }

  const handleClear = () => {
    setTempValue('')
    onChange('')
    onSave()
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`h-10 px-2 rounded-md transition-colors duration-75 ${
          disabled 
            ? 'text-gray-300 cursor-not-allowed' 
            : value 
              ? 'text-purple-600 hover:bg-purple-50' 
              : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
        }`}
        title="Add custom instructions"
      >
        {saving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
        {value && !saving && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"></div>
        )}
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          className="absolute top-0 right-8 z-50 w-96 bg-white border border-purple-200 rounded-lg shadow-lg p-4"
        >
          <div className="absolute top-2 -right-2 w-4 h-4 bg-white border-r border-t border-purple-200 transform -rotate-45"></div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-800">Additional Instructions</h4>
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleClear}
                disabled={saving}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                disabled={saving}
                className="px-4 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface JDData {
  title: string
  company: string
  full_job_description: string
  capability_1: string
  capability_2: string
  capability_3: string
  capability_4: string
  capability_5: string
  generated_text_1: string
  generated_text_2: string
  generated_text_3: string
  generated_text_4: string
  generated_text_5: string
  your_experience_1: string
  your_experience_2: string
  your_experience_3: string
  your_experience_4: string
  your_experience_5: string
}

export default function JD2CVPanel() {
  const [jdData, setJdData] = useState<JDData>({
    title: '',
    company: '',
    full_job_description: '',
    capability_1: '',
    capability_2: '',
    capability_3: '',
    capability_4: '',
    capability_5: '',
    generated_text_1: '',
    generated_text_2: '',
    generated_text_3: '',
    generated_text_4: '',
    generated_text_5: '',
    your_experience_1: '',
    your_experience_2: '',
    your_experience_3: '',
    your_experience_4: '',
    your_experience_5: ''
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [jdSaveError, setJdSaveError] = useState(false)
  const [generatedCapabilities, setGeneratedCapabilities] = useState<string[]>([])
  const [showGenerated, setShowGenerated] = useState(false)
  const [generateError, setGenerateError] = useState(false)
  const [currentPageId, setCurrentPageId] = useState<string>('')
  
  // Individual capability states
  const [capabilitySaveMessages, setCapabilitySaveMessages] = useState<string[]>(['', '', '', '', ''])
  const [capabilityIsSaving, setCapabilityIsSaving] = useState<boolean[]>([false, false, false, false, false])
  const [experienceSaveMessages, setExperienceSaveMessages] = useState<string[]>(['', '', '', '', ''])
  const [experienceIsSaving, setExperienceIsSaving] = useState<boolean[]>([false, false, false, false, false])
  const [experienceInputs, setExperienceInputs] = useState<string[]>(['', '', '', '', ''])
  const [experiencePrompts, setExperiencePrompts] = useState<string[]>(['', '', '', '', ''])
  const [experienceGenerating, setExperienceGenerating] = useState<boolean[]>([false, false, false, false, false])
  const [experienceMessages, setExperienceMessages] = useState<string[]>(['', '', '', '', ''])
  const [inputExperienceSaving, setInputExperienceSaving] = useState<boolean[]>([false, false, false, false, false])
  const [inputExperienceMessages, setInputExperienceMessages] = useState<string[]>(['', '', '', '', ''])
  const [experienceSectionExpanded, setExperienceSectionExpanded] = useState<boolean[]>([false, false, false, false, false])
  const [showJDModal, setShowJDModal] = useState(false)
  const [jdSaved, setJdSaved] = useState(false)
  const [currentCapabilityIndex, setCurrentCapabilityIndex] = useState(-1)
  const [capabilitiesGenerated, setCapabilitiesGenerated] = useState(false)
  
  // Search states
  const [searchTitle, setSearchTitle] = useState('')
  const [searchCompany, setSearchCompany] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  // Filter states
  const [filterTitle, setFilterTitle] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [availableTitles, setAvailableTitles] = useState<string[]>([])
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([])
  const [optionsLoaded, setOptionsLoaded] = useState(false)

  // Auto-resize textarea function
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  // Sync heights for experience textareas in the same capability
  const syncExperienceTextareaHeights = (capabilityIndex: number) => {
    const yourExpTextarea = document.getElementById(`your-experience-${capabilityIndex}`)
    const generatedTextarea = document.getElementById(`generated-text-${capabilityIndex}`)
    
    if (yourExpTextarea && generatedTextarea) {
      // Reset heights to auto to get natural heights
      yourExpTextarea.style.height = 'auto'
      generatedTextarea.style.height = 'auto'
      
      // Get the natural scroll heights
      const yourExpHeight = yourExpTextarea.scrollHeight
      const generatedHeight = generatedTextarea.scrollHeight
      
      // Set both to the maximum height
      const maxHeight = Math.max(yourExpHeight, generatedHeight, 120) // minimum 120px
      yourExpTextarea.style.height = maxHeight + 'px'
      generatedTextarea.style.height = maxHeight + 'px'
    }
  }

  // Load available options on component mount
  useEffect(() => {
    loadFilterOptions()
  }, [])

  // Sync textarea heights when data changes
  useEffect(() => {
    // Sync heights for all capability pairs after data loads or changes
    for (let i = 0; i < 5; i++) {
      setTimeout(() => syncExperienceTextareaHeights(i), 100)
    }
  }, [jdData, experienceInputs])

  // Sync heights when experience is generated
  useEffect(() => {
    // Sync heights after experience generation completes
    for (let i = 0; i < 5; i++) {
      if (!experienceGenerating[i]) {
        setTimeout(() => syncExperienceTextareaHeights(i), 100)
      }
    }
  }, [experienceGenerating])

  const handleClearFilter = () => {
    setIsClearing(true)
    
    // Clear filter selections
    setFilterTitle('')
    setFilterCompany('')
    
    // Clear main form fields
    setJdData(prev => ({
      ...prev,
      title: '',
      company: '',
      full_job_description: ''
    }))
    
    // Clear other related states
    setJdSaved(false)
    setCapabilitiesGenerated(false)
    setCurrentPageId('')
    
    setTimeout(() => {
      setIsClearing(false)
    }, 500)
  }

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/jd2cv/options')
      if (response.ok) {
        const data = await response.json()
        setAvailableTitles(data.titles || [])
        setAvailableCompanies(data.companies || [])
        setOptionsLoaded(true)
      }
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  const handleJDSubmit = async () => {
    if (!jdData.title || !jdData.company || !jdData.full_job_description) {
      return
    }

    setIsSaving(true)
    setJdSaveError(false)
    try {
      const response = await fetch('/api/jd2cv/save-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          full_job_description: jdData.full_job_description
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id) {
          setCurrentPageId(data.id)
        }
        setJdSaved(true)
        setJdSaveError(false)
      } else if (response.status === 409) {
        const data = await response.json()
        if (data.existingPageId) {
          setCurrentPageId(data.existingPageId)
        }
        setJdSaved(true)
        setJdSaveError(false)
      } else {
        setJdSaveError(true)
      }
    } catch (error) {
      setJdSaveError(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateCapabilities = async () => {
    setIsGenerating(true)
    setGenerateError(false)
    try {
      const response = await fetch('/api/jd2cv/generate-capabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          full_job_description: jdData.full_job_description
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedCapabilities(data.capabilities)
        setShowGenerated(true)
        
        // Update the capability fields
        setJdData(prev => ({
          ...prev,
          capability_1: data.capabilities[0] || '',
          capability_2: data.capabilities[1] || '',
          capability_3: data.capabilities[2] || '',
          capability_4: data.capabilities[3] || '',
          capability_5: data.capabilities[4] || ''
        }))
        setCapabilitiesGenerated(true)
        setGenerateError(false)
      } else {
        setGenerateError(true)
      }
    } catch (error) {
      setGenerateError(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveCapabilities = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/jd2cv/save-capabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          capability_1: jdData.capability_1,
          capability_2: jdData.capability_2,
          capability_3: jdData.capability_3,
          capability_4: jdData.capability_4,
          capability_5: jdData.capability_5
        })
      })

      // Status handling silently, shown in button text if needed
    } catch (error) {
      // Error handling silently, status shown in button text
    } finally {
      setIsSaving(false)
    }
  }


  // Individual capability functions
  const handleSaveCapability = async (index: number) => {
    const capabilityKey = `capability_${index + 1}` as keyof JDData
    const capabilityValue = jdData[capabilityKey]

    setCapabilityIsSaving(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    setCapabilitySaveMessages(prev => {
      const newState = [...prev]
      newState[index] = ''
      return newState
    })

    try {
      const response = await fetch('/api/jd2cv/save-individual-capability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          capabilityIndex: index + 1,
          capabilityValue: capabilityValue
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id && !currentPageId) {
          setCurrentPageId(data.id)
        }
        setCapabilitySaveMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Saved successfully'
          return newState
        })
      } else {
        setCapabilitySaveMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Save failed'
          return newState
        })
      }
    } catch (error) {
      setCapabilitySaveMessages(prev => {
        const newState = [...prev]
        newState[index] = 'Save error'
        return newState
      })
    } finally {
      setCapabilityIsSaving(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
      // Keep status message visible
      // setTimeout removed to maintain persistent status display
    }
  }

  const handleGenerateExperience = async (index: number) => {
    const experienceInput = experienceInputs[index]
    const experiencePrompt = experiencePrompts[index]
    const capabilityKey = `capability_${index + 1}` as keyof JDData
    const capability = jdData[capabilityKey]

    setExperienceGenerating(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    setExperienceMessages(prev => {
      const newState = [...prev]
      newState[index] = ''
      return newState
    })

    try {
      const response = await fetch('/api/jd2cv/generate-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capability: capability,
          experienceInput: experienceInput,
          prompt: experiencePrompt
        })
      })

      if (response.ok) {
        const data = await response.json()
        setJdData(prev => ({
          ...prev,
          [`generated_text_${index + 1}`]: data.customizedExperience
        }))
        setExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Generated successfully'
          return newState
        })
        
        // Sync heights after content is set
        setTimeout(() => syncExperienceTextareaHeights(index), 100)
        
      } else {
        setExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Generate failed'
          return newState
        })
      }
    } catch (error) {
      setExperienceMessages(prev => {
        const newState = [...prev]
        newState[index] = 'Generate error'
        return newState
      })
    } finally {
      setExperienceGenerating(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
      setTimeout(() => {
        setExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = ''
          return newState
        })
      }, 3000)
    }
  }

  const handleSaveAndNext = async () => {
    const index = currentCapabilityIndex
    
    // Save current experience
    await handleSaveExperience(index)
    
    // Move to next capability if not the last one
    if (index < 4) {
      setCurrentCapabilityIndex(index + 1)
    }
  }

  const handleSearch = async () => {
    if (!searchTitle || !searchCompany) {
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch('/api/jd2cv/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: searchTitle,
          company: searchCompany
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.found) {
          // Fill all form fields with the found data
          setJdData({
            title: data.record.title || '',
            company: data.record.company || '',
            full_job_description: data.record.full_job_description || '',
            capability_1: data.record.capability_1 || '',
            capability_2: data.record.capability_2 || '',
            capability_3: data.record.capability_3 || '',
            capability_4: data.record.capability_4 || '',
            capability_5: data.record.capability_5 || '',
            generated_text_1: data.record.generated_text_1 || '',
            generated_text_2: data.record.generated_text_2 || '',
            generated_text_3: data.record.generated_text_3 || '',
            generated_text_4: data.record.generated_text_4 || '',
            generated_text_5: data.record.generated_text_5 || '',
            your_experience_1: data.record.your_experience_1 || '',
            your_experience_2: data.record.your_experience_2 || '',
            your_experience_3: data.record.your_experience_3 || '',
            your_experience_4: data.record.your_experience_4 || '',
            your_experience_5: data.record.your_experience_5 || ''
          })
          
          // Update experience inputs array
          setExperienceInputs([
            data.record.your_experience_1 || '',
            data.record.your_experience_2 || '',
            data.record.your_experience_3 || '',
            data.record.your_experience_4 || '',
            data.record.your_experience_5 || ''
          ])

          // Set states to show the data is loaded
          setJdSaved(true)
          setCapabilitiesGenerated(true)
          if (data.record.id) {
            setCurrentPageId(data.record.id)
          }
          
          // Sync textarea heights after data is loaded
          setTimeout(() => {
            for (let i = 0; i < 5; i++) {
              syncExperienceTextareaHeights(i)
            }
          }, 200)
        }
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleFilterConfirm = async () => {
    if (!filterTitle || !filterCompany) {
      return
    }

    setIsFiltering(true)
    try {
      const response = await fetch('/api/jd2cv/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: filterTitle,
          company: filterCompany
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.found) {
          // Fill all form fields with the found data (same logic as search)
          setJdData({
            title: data.record.title || '',
            company: data.record.company || '',
            full_job_description: data.record.full_job_description || '',
            capability_1: data.record.capability_1 || '',
            capability_2: data.record.capability_2 || '',
            capability_3: data.record.capability_3 || '',
            capability_4: data.record.capability_4 || '',
            capability_5: data.record.capability_5 || '',
            generated_text_1: data.record.generated_text_1 || '',
            generated_text_2: data.record.generated_text_2 || '',
            generated_text_3: data.record.generated_text_3 || '',
            generated_text_4: data.record.generated_text_4 || '',
            generated_text_5: data.record.generated_text_5 || '',
            your_experience_1: data.record.your_experience_1 || '',
            your_experience_2: data.record.your_experience_2 || '',
            your_experience_3: data.record.your_experience_3 || '',
            your_experience_4: data.record.your_experience_4 || '',
            your_experience_5: data.record.your_experience_5 || ''
          })
          
          // Update experience inputs array
          setExperienceInputs([
            data.record.your_experience_1 || '',
            data.record.your_experience_2 || '',
            data.record.your_experience_3 || '',
            data.record.your_experience_4 || '',
            data.record.your_experience_5 || ''
          ])

          // Set states to show the data is loaded
          setJdSaved(true)
          setCapabilitiesGenerated(true)
          if (data.record.id) {
            setCurrentPageId(data.record.id)
          }
          
          // Sync textarea heights after data is loaded
          setTimeout(() => {
            for (let i = 0; i < 5; i++) {
              syncExperienceTextareaHeights(i)
            }
          }, 200)
        }
      }
    } catch (error) {
      console.error('Filter error:', error)
    } finally {
      setIsFiltering(false)
    }
  }

  // Helper function to remove emojis
  const removeEmojis = (text: string) => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()
  }

  const handleSaveExperience = async (index: number) => {
    const experienceKey = `generated_text_${index + 1}` as keyof JDData
    const experienceValue = jdData[experienceKey]

    setExperienceIsSaving(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    setExperienceSaveMessages(prev => {
      const newState = [...prev]
      newState[index] = ''
      return newState
    })

    try {
      // Remove emojis from the experience value before saving
      const cleanExperienceValue = removeEmojis(experienceValue || '')
      
      const response = await fetch('/api/jd2cv/save-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          experienceIndex: index + 1,
          experienceValue: cleanExperienceValue,
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id && !currentPageId) {
          setCurrentPageId(data.id)
        }
        setExperienceSaveMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Saved successfully'
          return newState
        })
      } else {
        setExperienceSaveMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Save failed'
          return newState
        })
      }
    } catch (error) {
      setExperienceSaveMessages(prev => {
        const newState = [...prev]
        newState[index] = 'Save error'
        return newState
      })
    } finally {
      setExperienceIsSaving(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
      // Keep status message visible and remove height sync to prevent UI jitter
    }
  }

  const handleSaveInputExperience = async (index: number) => {
    const inputExperienceKey = `your_experience_${index + 1}` as keyof JDData
    const inputExperienceValue = experienceInputs[index]

    // Also update the jdData with the current input
    setJdData(prev => ({
      ...prev,
      [inputExperienceKey]: inputExperienceValue
    }))

    setInputExperienceSaving(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    setInputExperienceMessages(prev => {
      const newState = [...prev]
      newState[index] = ''
      return newState
    })

    try {
      // Remove emojis from the input experience value before saving
      const cleanInputExperienceValue = removeEmojis(inputExperienceValue || '')
      
      const response = await fetch('/api/jd2cv/save-input-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          experienceIndex: index + 1,
          inputExperienceValue: cleanInputExperienceValue,
          overwrite: true // Add overwrite flag
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id && !currentPageId) {
          setCurrentPageId(data.id)
        }
        setInputExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Saved successfully'
          return newState
        })
      } else {
        setInputExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Save failed'
          return newState
        })
      }
    } catch (error) {
      setInputExperienceMessages(prev => {
        const newState = [...prev]
        newState[index] = 'Save error'
        return newState
      })
    } finally {
      setInputExperienceSaving(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
      // Keep status message visible for better user feedback
      // setTimeout removed to maintain persistent status display
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-shrink-0">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">JD2CV</h2>
          <p className="text-gray-600">Transform job descriptions into tailored CV content</p>
        </div>
        
        <div className="flex-shrink-0 space-y-3">
          {/* Search Row */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 w-16">Search:</span>
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="Search by title..."
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-44 text-sm"
            />
            <input
              type="text"
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              placeholder="Search by company..."
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-44 text-sm"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchTitle || !searchCompany}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 text-sm font-medium transition-colors duration-200 min-w-[80px]"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {/* Filter Row */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 w-16">Filter:</span>
            <select
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-44 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!optionsLoaded}
            >
              <option value="">{optionsLoaded ? 'Select title...' : 'Loading...'}</option>
              {availableTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-44 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!optionsLoaded}
            >
              <option value="">{optionsLoaded ? 'Select company...' : 'Loading...'}</option>
              {availableCompanies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            <button
              onClick={handleFilterConfirm}
              disabled={isFiltering || !filterTitle || !filterCompany || !optionsLoaded}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 text-sm font-medium transition-colors duration-200 min-w-[80px]"
            >
              {isFiltering ? 'Loading...' : 'Confirm'}
            </button>
            <button
              onClick={handleClearFilter}
              disabled={isClearing || isFiltering}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 text-sm font-medium transition-colors duration-200 min-w-[80px] shadow-sm hover:shadow-md"
            >
              {isClearing ? 'Clearing...' : 'Clear'}
            </button>
          </div>
          
          {/* Status Messages */}
          {(isSearching || isFiltering || isClearing) && (
            <div className="flex justify-end">
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span>
                  {isSearching ? 'Searching database...' : 
                   isFiltering ? 'Loading record...' : 
                   'Clearing form...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Description Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-semibold text-gray-800">Job Description Input</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${jdData.title ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${jdData.company ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${jdData.full_job_description ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              {currentPageId && (
                <button
                  onClick={() => window.open(`https://www.notion.so/${currentPageId.replace(/-/g, '')}`, '_blank')}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-md border border-purple-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                  title="Open in Notion"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Notion
                </button>
              )}
            </div>
            <input
              type="text"
              value={jdData.title}
              onChange={(e) => {
                setJdData(prev => ({ ...prev, title: e.target.value }))
                if (jdSaved) setJdSaved(false)
                if (jdSaveError) setJdSaveError(false)
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Senior Software Engineer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={jdData.company}
              onChange={(e) => {
                setJdData(prev => ({ ...prev, company: e.target.value }))
                if (jdSaved) setJdSaved(false)
                if (jdSaveError) setJdSaveError(false)
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Google"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Job Description <span className="text-red-500">*</span>
          </label>
          {!jdSaved ? (
            <textarea
              value={jdData.full_job_description}
              onChange={(e) => {
                setJdData(prev => ({ ...prev, full_job_description: e.target.value }))
                if (jdSaved) setJdSaved(false) // Reset saved state when content changes
                if (jdSaveError) setJdSaveError(false) // Reset error state when content changes
                if (generateError) setGenerateError(false) // Reset generate error when content changes
              }}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[150px]"
              placeholder="Paste the complete job description here..."
            />
          ) : (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50">
              <div className="text-gray-700 mb-3 leading-relaxed">
                {jdData.full_job_description.substring(0, 200)}
                {jdData.full_job_description.length > 200 && '...'}
              </div>
              <button
                onClick={() => setShowJDModal(true)}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                View full content
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex gap-3 justify-end items-center">
            <p className="text-sm text-gray-400 min-w-[120px] text-right">
              {isSaving ? 'Saving...' : jdSaveError ? 'Error occurred' : jdSaved ? 'Saved successfully' : 'Ready to save'}
            </p>
            <button
              onClick={handleJDSubmit}
              disabled={isSaving}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {isSaving ? 'Saving...' : jdSaveError ? 'Retry' : 'Save JD'}
            </button>
          </div>
          
          <div className="flex gap-3 justify-end items-center">
            <p className="text-sm text-gray-400 min-w-[120px] text-right">
              {isGenerating ? 'Generating...' : generateError ? 'Error occurred' : capabilitiesGenerated ? 'Generated successfully' : 'Ready to generate'}
            </p>
            <button
              onClick={handleGenerateCapabilities}
              disabled={isGenerating}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {isGenerating ? 'Generating...' : generateError ? 'Retry' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* All Capabilities and Experience Areas */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-800">Key Required Capabilities</h4>
          
          {[1, 2, 3, 4, 5].map((num) => {
            const index = num - 1
            return (
              <div key={num} className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h5 className="font-medium text-gray-800">Capability {num}</h5>
                
                {/* Capability Content */}
                <div className="space-y-3">
                  <textarea
                    value={jdData[`capability_${num}` as keyof JDData]}
                    onChange={(e) => {
                      setJdData(prev => ({ 
                        ...prev, 
                        [`capability_${num}`]: e.target.value 
                      }))
                      // Auto-resize on change
                      setTimeout(() => autoResizeTextarea(e.target), 0)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none overflow-hidden"
                    placeholder={`Key capability ${num}`}
                    style={{
                      minHeight: '100px'
                    }}
                    onInput={(e) => autoResizeTextarea(e.target as HTMLTextAreaElement)}
                    ref={(el) => {
                      if (el) {
                        // Auto-resize on initial render and when content changes
                        setTimeout(() => autoResizeTextarea(el), 0)
                      }
                    }}
                  />
                  <div className="flex gap-3 justify-end items-center">
                    <p className="text-sm text-gray-400 min-w-[150px] text-right">
                      {capabilitySaveMessages[index] || 'Ready to save'}
                    </p>
                    <button
                      onClick={() => handleSaveCapability(index)}
                      disabled={capabilityIsSaving[index]}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 flex-shrink-0"
                    >
                      {capabilityIsSaving[index] ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Experience Customization */}
                <div className="space-y-4">
                  <h6 className="font-medium text-gray-700">Experience Customization</h6>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left: Input Experience */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Your Experience</label>
                      <textarea
                        id={`your-experience-${index}`}
                        value={experienceInputs[index]}
                        onChange={(e) => {
                          const newInputs = [...experienceInputs]
                          newInputs[index] = e.target.value
                          setExperienceInputs(newInputs)
                        }}
                        onInput={() => {
                          // Delayed sync to reduce jitter
                          setTimeout(() => syncExperienceTextareaHeights(index), 100)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none overflow-hidden"
                        placeholder="Describe your relevant experience..."
                        style={{ minHeight: '120px' }}
                      />
                      <div className="flex gap-3 justify-end items-center">
                        <p className="text-sm text-gray-400 min-w-[120px] text-right">
                          {inputExperienceMessages[index] || 'Ready to save'}
                        </p>
                        <button
                          onClick={() => handleSaveInputExperience(index)}
                          disabled={inputExperienceSaving[index]}
                          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow w-20 text-center"
                        >
                          {inputExperienceSaving[index] ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>

                    {/* Right: Generated Experience */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Generated Text</label>
                      <textarea
                        id={`generated-text-${index}`}
                        value={jdData[`generated_text_${num}` as keyof JDData]}
                        onChange={(e) => {
                          setJdData(prev => ({ 
                            ...prev, 
                            [`generated_text_${num}`]: e.target.value 
                          }))
                        }}
                        onInput={() => {
                          // Delayed sync to reduce jitter
                          setTimeout(() => syncExperienceTextareaHeights(index), 100)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none overflow-hidden"
                        placeholder="Generated experience will appear here..."
                        style={{ minHeight: '120px' }}
                      />
                      
                      {/* Buttons - Vertical layout aligned to right */}
                      <div className="flex flex-col gap-3 items-end">
                        {/* Generate Button Row */}
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400">
                            {experienceGenerating[index] ? 'AI is generating...' : (experienceMessages[index] && experienceMessages[index].includes('generated') ? 'Generated successfully' : 'Ready to generate')}
                          </p>
                          <TooltipPrompt
                            value={experiencePrompts[index]}
                            onChange={(value) => {
                              const newPrompts = [...experiencePrompts]
                              newPrompts[index] = value
                              setExperiencePrompts(newPrompts)
                            }}
                            onSave={() => {
                              console.log('Experience prompt updated for capability', index + 1)
                            }}
                            placeholder="Additional instructions for customization..."
                            disabled={experienceGenerating[index]}
                            saving={false}
                          />
                          <button
                            onClick={() => handleGenerateExperience(index)}
                            disabled={experienceGenerating[index]}
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow w-20 text-center flex items-center justify-center gap-2"
                          >
                            {experienceGenerating[index] ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                Gen...
                              </>
                            ) : (
                              'Generate'
                            )}
                          </button>
                        </div>
                        
                        {/* Save Button Row */}
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400 min-w-[120px] text-right">
                            {experienceSaveMessages[index] || 'Ready to save'}
                          </p>
                          <button
                            onClick={() => handleSaveExperience(index)}
                            disabled={experienceIsSaving[index]}
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow w-20 text-center"
                          >
                            {experienceIsSaving[index] ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Job Description Modal */}
      {showJDModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Job Description</h3>
              <button
                onClick={() => setShowJDModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {jdData.full_job_description}
              </div>
            </div>
            <div className="flex justify-end p-6 border-t">
              <button
                onClick={() => setShowJDModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}