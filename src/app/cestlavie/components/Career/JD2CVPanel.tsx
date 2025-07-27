'use client'

import { useState, useEffect, useRef } from 'react'


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
  const [capabilityExporting, setCapabilityExporting] = useState<boolean[]>([false, false, false, false, false])
  const [experienceSaveMessages, setExperienceSaveMessages] = useState<string[]>(['', '', '', '', ''])
  const [experienceIsSaving, setExperienceIsSaving] = useState<boolean[]>([false, false, false, false, false])
  const [generatedExporting, setGeneratedExporting] = useState<boolean[]>([false, false, false, false, false])
  const [experienceInputs, setExperienceInputs] = useState<string[]>(['', '', '', '', ''])
  const [experienceGenerating, setExperienceGenerating] = useState<boolean[]>([false, false, false, false, false])
  const [experienceMessages, setExperienceMessages] = useState<string[]>(['', '', '', '', ''])
  const [inputExperienceSaving, setInputExperienceSaving] = useState<boolean[]>([false, false, false, false, false])
  const [inputExperienceMessages, setInputExperienceMessages] = useState<string[]>(['', '', '', '', ''])
  const [experienceSectionExpanded, setExperienceSectionExpanded] = useState<boolean[]>([false, false, false, false, false])
  const [jdSaved, setJdSaved] = useState(false)
  const [keySentences, setKeySentences] = useState<string[]>([])
  const [sentenceCount, setSentenceCount] = useState<number>(5)
  const [categoryCount, setCategoryCount] = useState<number>(3)
  const [keywordCount, setKeywordCount] = useState<number>(3)
  const [currentCapabilityIndex, setCurrentCapabilityIndex] = useState(-1)
  const [capabilitiesGenerated, setCapabilitiesGenerated] = useState(false)
  const [isUpdatingKeySentences, setIsUpdatingKeySentences] = useState(false)
  
  // Tooltip states for highlight editing
  const [deleteTooltip, setDeleteTooltip] = useState<{
    show: boolean
    sentence: string
    position: { x: number; y: number }
  }>({ show: false, sentence: '', position: { x: 0, y: 0 } })
  
  const [addTooltip, setAddTooltip] = useState<{
    show: boolean
    text: string
    position: { x: number; y: number }
  }>({ show: false, text: '', position: { x: 0, y: 0 } })

  // Capability keyword tooltip states
  const [deleteKeywordTooltip, setDeleteKeywordTooltip] = useState<{
    show: boolean
    keyword: string
    capabilityIndex: number
    position: { x: number; y: number }
  }>({ show: false, keyword: '', capabilityIndex: -1, position: { x: 0, y: 0 } })
  
  const [addKeywordTooltip, setAddKeywordTooltip] = useState<{
    show: boolean
    text: string
    capabilityIndex: number
    position: { x: number; y: number }
  }>({ show: false, text: '', capabilityIndex: -1, position: { x: 0, y: 0 } })

  // Experience keyword tooltip states
  const [deleteExperienceKeywordTooltip, setDeleteExperienceKeywordTooltip] = useState<{
    show: boolean
    keyword: string
    experienceIndex: number
    position: { x: number; y: number }
  }>({ show: false, keyword: '', experienceIndex: -1, position: { x: 0, y: 0 } })
  
  const [addExperienceKeywordTooltip, setAddExperienceKeywordTooltip] = useState<{
    show: boolean
    text: string
    experienceIndex: number
    position: { x: number; y: number }
  }>({ show: false, text: '', experienceIndex: -1, position: { x: 0, y: 0 } })

  // Generated text keyword tooltip states
  const [deleteGeneratedKeywordTooltip, setDeleteGeneratedKeywordTooltip] = useState<{
    show: boolean
    keyword: string
    generatedIndex: number
    position: { x: number; y: number }
  }>({ show: false, keyword: '', generatedIndex: -1, position: { x: 0, y: 0 } })
  
  const [addGeneratedKeywordTooltip, setAddGeneratedKeywordTooltip] = useState<{
    show: boolean
    text: string
    generatedIndex: number
    position: { x: number; y: number }
  }>({ show: false, text: '', generatedIndex: -1, position: { x: 0, y: 0 } })
  
  // Search states
  const [searchTitle, setSearchTitle] = useState('')
  const [searchCompany, setSearchCompany] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Highlight key sentences in JD text
  const highlightKeySentences = (text: string, sentences: string[]) => {
    if (!sentences || sentences.length === 0) return text
    
    let highlightedText = text
    sentences.forEach(sentence => {
      if (sentence.trim()) {
        // Escape special regex characters and create pattern
        const escapedSentence = sentence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escapedSentence, 'g')
        
        // Clickable highlighted sentences
        highlightedText = highlightedText.replace(
          regex, 
          `<span class="inline-block px-2 py-1 rounded-lg bg-purple-100/20 text-purple-800 backdrop-blur-xs shadow-sm cursor-pointer hover:bg-purple-200/30 transition-colors" data-sentence="${sentence.replace(/"/g, '&quot;')}">${sentence}</span>`
        )
      }
    })
    return highlightedText
  }

  // Highlight keywords in capability text
  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return text
    
    let highlightedText = text
    keywords.forEach(keyword => {
      if (keyword.trim()) {
        // Escape special regex characters and create pattern
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi')
        
        // Clickable highlighted keywords - same purple style as JD highlights
        highlightedText = highlightedText.replace(
          regex, 
          `<span class="inline-block px-2 py-1 rounded-lg bg-purple-100/20 text-purple-800 backdrop-blur-xs shadow-sm cursor-pointer hover:bg-purple-200/30 transition-colors" data-keyword="${keyword.replace(/"/g, '&quot;')}">${keyword}</span>`
        )
      }
    })
    return highlightedText
  }
  
  // Filter states
  const [filterTitle, setFilterTitle] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [availableTitles, setAvailableTitles] = useState<string[]>([])
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([])
  const [allTitles, setAllTitles] = useState<string[]>([])
  const [allCompanies, setAllCompanies] = useState<string[]>([])
  const [combinations, setCombinations] = useState<Record<string, string[]>>({})
  const [reverseCombinations, setReverseCombinations] = useState<Record<string, string[]>>({})
  const [optionsLoaded, setOptionsLoaded] = useState(false)
  
  // Keywords states
  const [capabilityKeywords, setCapabilityKeywords] = useState<string[][]>([[], [], [], [], []])
  const [experienceKeywords, setExperienceKeywords] = useState<string[][]>([[], [], [], [], []])
  const [generatedKeywords, setGeneratedKeywords] = useState<string[][]>([[], [], [], [], []])
  const [capabilityKeywordCounts, setCapabilityKeywordCounts] = useState<number[]>([3, 3, 3, 3, 3])
  const [experienceKeywordCounts, setExperienceKeywordCounts] = useState<number[]>([3, 3, 3, 3, 3])
  const [generatedTextKeywordCounts, setGeneratedTextKeywordCounts] = useState<number[]>([3, 3, 3, 3, 3])
  const [generatedTextKeywords, setGeneratedTextKeywords] = useState<string[][]>([[], [], [], [], []])
  const [experienceInputKeywords, setExperienceInputKeywords] = useState<string[][]>([[], [], [], [], []])
  
  // Model selection state
  const [selectedModel, setSelectedModel] = useState<'gpt-4' | 'deepseek'>('deepseek')
  
  // Delete states
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteTooltipShow, setDeleteTooltipShow] = useState(false)
  
  // Match score states
  const [matchScore, setMatchScore] = useState<number>(0)
  const [isSavingMatchScore, setIsSavingMatchScore] = useState(false)

  // Auto-resize textarea function
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.max(textarea.scrollHeight, 120)}px` // minimum 120px
  }

  // Close delete tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deleteTooltipShow) {
        const target = e.target as HTMLElement
        if (!target.closest('.relative')) {
          setDeleteTooltipShow(false)
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [deleteTooltipShow])


  // Load keywords from database
  const loadKeywords = async () => {
    if (!jdData.title || !jdData.company) return
    
    try {
      const response = await fetch('/api/jd2cv/get-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: jdData.title, 
          company: jdData.company 
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Update capability keywords
        const newCapabilityKeywords = [[], [], [], [], []]
        data.capabilityKeywords.forEach((item: any) => {
          if (item.index >= 1 && item.index <= 5) {
            newCapabilityKeywords[item.index - 1] = item.keywords || []
          }
        })
        setCapabilityKeywords(newCapabilityKeywords)
        
        // Update experience keywords
        const newExperienceKeywords = [[], [], [], [], []]
        data.experienceKeywords.forEach((item: any) => {
          if (item.index >= 1 && item.index <= 5) {
            newExperienceKeywords[item.index - 1] = item.keywords || []
          }
        })
        setExperienceKeywords(newExperienceKeywords)
        
        // Update experience input keywords for highlighting
        setExperienceInputKeywords(newExperienceKeywords)
        
        // Update generated keywords
        const newGeneratedKeywords = [[], [], [], [], []]
        data.generatedKeywords.forEach((item: any) => {
          if (item.index >= 1 && item.index <= 5) {
            newGeneratedKeywords[item.index - 1] = item.keywords || []
          }
        })
        setGeneratedKeywords(newGeneratedKeywords)
        
        // Update generated text keywords for highlighting
        setGeneratedTextKeywords(newGeneratedKeywords)
      }
    } catch (error) {
      console.error('Failed to load keywords:', error)
    }
  }


  // Load available options on component mount and scroll to top
  useEffect(() => {
    loadFilterOptions()
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Load keywords when title and company are available
  useEffect(() => {
    if (jdData.title && jdData.company) {
      loadKeywords()
    }
  }, [jdData.title, jdData.company])

  // Auto-resize textareas when data changes
  useEffect(() => {
    // Auto-resize all textareas after data loads or changes
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const yourExpTextarea = document.getElementById(`your-experience-${i}`) as HTMLTextAreaElement
        const generatedTextarea = document.getElementById(`generated-text-${i}`) as HTMLTextAreaElement
        if (yourExpTextarea) autoResizeTextarea(yourExpTextarea)
        if (generatedTextarea) autoResizeTextarea(generatedTextarea)
      }, 100)
    }
  }, [jdData, experienceInputs])

  // Auto-resize textareas when experience generation completes
  useEffect(() => {
    // Auto-resize after experience generation completes
    for (let i = 0; i < 5; i++) {
      if (!experienceGenerating[i]) {
        setTimeout(() => {
          const generatedTextarea = document.getElementById(`generated-text-${i}`) as HTMLTextAreaElement
          if (generatedTextarea) autoResizeTextarea(generatedTextarea)
        }, 100)
      }
    }
  }, [experienceGenerating])

  const handleClearFilter = () => {
    setIsClearing(true)
    
    // Clear filter selections
    setFilterTitle('')
    setFilterCompany('')
    
    // Reset available options to show all
    setAvailableTitles(allTitles)
    setAvailableCompanies(allCompanies)
    
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
        setAllTitles(data.titles || [])
        setAllCompanies(data.companies || [])
        setAvailableTitles(data.titles || [])
        setAvailableCompanies(data.companies || [])
        setCombinations(data.combinations || {})
        setReverseCombinations(data.reverseCombinations || {})
        setOptionsLoaded(true)
      }
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  // Handle cascade filtering
  const handleTitleChange = (selectedTitle: string) => {
    setFilterTitle(selectedTitle)
    
    if (selectedTitle) {
      // Filter companies based on selected title
      const availableCompaniesForTitle = combinations[selectedTitle] || []
      setAvailableCompanies(availableCompaniesForTitle)
      
      // Clear company selection if current company is not available for this title
      if (filterCompany && !availableCompaniesForTitle.includes(filterCompany)) {
        setFilterCompany('')
      }
    } else {
      // Show all companies when no title is selected
      setAvailableCompanies(allCompanies)
      setFilterCompany('')
    }
  }

  const handleCompanyChange = (selectedCompany: string) => {
    setFilterCompany(selectedCompany)
    
    if (selectedCompany) {
      // Filter titles based on selected company
      const availableTitlesForCompany = reverseCombinations[selectedCompany] || []
      setAvailableTitles(availableTitlesForCompany)
      
      // Clear title selection if current title is not available for this company
      if (filterTitle && !availableTitlesForCompany.includes(filterTitle)) {
        setFilterTitle('')
      }
    } else {
      // Show all titles when no company is selected
      setAvailableTitles(allTitles)
      setFilterTitle('')
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
          full_job_description: jdData.full_job_description,
          model: selectedModel,
          sentenceCount: sentenceCount
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id) {
          setCurrentPageId(data.id)
        }
        if (data.keySentences) {
          setKeySentences(data.keySentences)
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
    if (keySentences.length === 0) {
      alert('Please save JD first to generate key sentences for categorization.')
      return
    }

    setIsGenerating(true)
    setGenerateError(false)
    try {
      const response = await fetch('/api/jd2cv/generate-capabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          full_job_description: jdData.full_job_description,
          keySentences: keySentences,
          categoryCount: categoryCount,
          model: selectedModel
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
          capabilityValue: capabilityValue,
          model: selectedModel,
          keywordCount: capabilityKeywordCounts[index]
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id && !currentPageId) {
          setCurrentPageId(data.id)
        }
        // Update capability keywords immediately with returned keywords
        if (data.keywords && Array.isArray(data.keywords)) {
          setCapabilityKeywords(prev => {
            const newState = [...prev]
            newState[index] = data.keywords
            return newState
          })
        }
        setCapabilitySaveMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Saved successfully'
          return newState
        })
        // Refresh keywords after successful save
        setTimeout(() => loadKeywords(), 1000)
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
          model: selectedModel
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
        
        // Auto-resize generated textarea after content is set
        setTimeout(() => {
          const generatedTextarea = document.getElementById(`generated-text-${index}`) as HTMLTextAreaElement
          if (generatedTextarea) autoResizeTextarea(generatedTextarea)
        }, 100)
        
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
          
          // Auto-resize textareas after data is loaded
          setTimeout(() => {
            for (let i = 0; i < 5; i++) {
              const yourExpTextarea = document.getElementById(`your-experience-${i}`) as HTMLTextAreaElement
              const generatedTextarea = document.getElementById(`generated-text-${i}`) as HTMLTextAreaElement
              if (yourExpTextarea) autoResizeTextarea(yourExpTextarea)
              if (generatedTextarea) autoResizeTextarea(generatedTextarea)
            }
          }, 200)
          
          // Load keywords after data is loaded
          setTimeout(() => loadKeywords(), 300)
          
          // Set key sentences if available
          if (data.record.job_description_key_sentences && Array.isArray(data.record.job_description_key_sentences)) {
            setKeySentences(data.record.job_description_key_sentences)
          }
          
          // Set match score if available (including 0)
          if (typeof data.record.match_score === 'number') {
            setMatchScore(data.record.match_score)
          }
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
          
          // Auto-resize textareas after data is loaded
          setTimeout(() => {
            for (let i = 0; i < 5; i++) {
              const yourExpTextarea = document.getElementById(`your-experience-${i}`) as HTMLTextAreaElement
              const generatedTextarea = document.getElementById(`generated-text-${i}`) as HTMLTextAreaElement
              if (yourExpTextarea) autoResizeTextarea(yourExpTextarea)
              if (generatedTextarea) autoResizeTextarea(generatedTextarea)
            }
          }, 200)
          
          // Load keywords after data is loaded
          setTimeout(() => loadKeywords(), 300)
          
          // Set key sentences if available
          if (data.record.job_description_key_sentences && Array.isArray(data.record.job_description_key_sentences)) {
            setKeySentences(data.record.job_description_key_sentences)
          }
          
          // Set match score if available (including 0)
          if (typeof data.record.match_score === 'number') {
            setMatchScore(data.record.match_score)
          }
          
          // Reset filter options to show all available options for next filter
          setAvailableTitles(allTitles)
          setAvailableCompanies(allCompanies)
        }
      }
    } catch (error) {
      console.error('Filter error:', error)
    } finally {
      setIsFiltering(false)
    }
  }

  // Handle delete page
  const handleDeletePage = async () => {
    if (!currentPageId) return
    
    setIsDeleting(true)
    setDeleteTooltipShow(false)
    
    try {
      const response = await fetch('/api/jd2cv/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: currentPageId })
      })
      
      if (response.ok) {
        // Reset all states after successful deletion
        setJdData({
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
        setKeySentences([])
        setJdSaved(false)
        setCapabilitiesGenerated(false)
        setCurrentPageId('')
        setExperienceInputs(['', '', '', '', ''])
        
        // Reset all keyword states
        setCapabilityKeywords([[], [], [], [], []])
        setExperienceKeywords([[], [], [], [], []])
        setGeneratedKeywords([[], [], [], [], []])
        setGeneratedTextKeywords([[], [], [], [], []])
        setExperienceInputKeywords([[], [], [], [], []])
        setCapabilityKeywordCounts([3, 3, 3, 3, 3])
        setExperienceKeywordCounts([3, 3, 3, 3, 3])
        setGeneratedTextKeywordCounts([3, 3, 3, 3, 3])
        
        // Reset all save messages
        setCapabilitySaveMessages(['', '', '', '', ''])
        setExperienceSaveMessages(['', '', '', '', ''])
        setInputExperienceMessages(['', '', '', '', ''])
        setExperienceMessages(['', '', '', '', ''])
        
        // Reset filter states
        setFilterTitle('')
        setFilterCompany('')
        setAvailableTitles(allTitles)
        setAvailableCompanies(allCompanies)
        
        // Reset match score
        setMatchScore(0)
        
        console.log('Page deleted successfully')
      } else {
        console.error('Failed to delete page')
      }
    } catch (error) {
      console.error('Error deleting page:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle match score save
  const handleMatchScoreSave = async (score: number) => {
    if (!currentPageId || score === matchScore) return
    
    setIsSavingMatchScore(true)
    try {
      const response = await fetch('/api/jd2cv/save-match-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          matchScore: score
        })
      })
      
      if (response.ok) {
        setMatchScore(score)
        console.log('Match score saved successfully')
      } else {
        console.error('Failed to save match score')
      }
    } catch (error) {
      console.error('Error saving match score:', error)
    } finally {
      setIsSavingMatchScore(false)
    }
  }

  // Helper function to update keywords in database
  const updateKeywordsInDatabase = async (type: 'capability' | 'experience' | 'generated', index: number, keywords: string[]) => {
    if (!currentPageId) return
    
    try {
      const response = await fetch('/api/jd2cv/update-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          type: type,
          index: index,
          keywords: keywords
        })
      })
      
      if (response.ok) {
        // Silent success - no console log needed
        return
      } else {
        // Silent failure - just return without error logging
        return
      }
    } catch (error) {
      // Silent failure - just return without error logging
      return
    }
  }

  // Helper function to remove emojis
  const removeEmojis = (text: string) => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()
  }

  // Handle clicking on highlighted sentence to show delete tooltip
  const handleHighlightClick = (e: React.MouseEvent, sentence: string) => {
    e.stopPropagation()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setDeleteTooltip({
      show: true,
      sentence: sentence,
      position: { x: rect.right, y: rect.bottom + 5 }
    })
  }

  // Handle confirming delete of highlighted sentence
  const handleConfirmDelete = async () => {
    const sentenceToDelete = deleteTooltip.sentence
    setDeleteTooltip({ show: false, sentence: '', position: { x: 0, y: 0 } })

    // Update local state immediately
    setKeySentences(prev => prev.filter(sentence => sentence !== sentenceToDelete))

    // Update backend
    if (jdData.title && jdData.company) {
      setIsUpdatingKeySentences(true)
      try {
        const updatedSentences = keySentences.filter(sentence => sentence !== sentenceToDelete)
        await fetch('/api/jd2cv/update-key-sentences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: jdData.title,
            company: jdData.company,
            keySentences: updatedSentences
          })
        })
      } catch (error) {
        console.error('Failed to update key sentences:', error)
        // Revert on error
        setKeySentences(prev => [...prev, sentenceToDelete])
      } finally {
        setIsUpdatingKeySentences(false)
      }
    }
  }

  // Handle text selection to show add tooltip
  const handleTextSelection = (e: React.MouseEvent) => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim()
      // Check if already highlighted
      if (!keySentences.includes(selectedText)) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setAddTooltip({
          show: true,
          text: selectedText,
          position: { x: rect.right, y: rect.bottom + 5 }
        })
      }
    }
  }

  // Handle confirming add of new highlight
  const handleConfirmAdd = async () => {
    const textToAdd = addTooltip.text
    setAddTooltip({ show: false, text: '', position: { x: 0, y: 0 } })
    
    // Clear selection
    window.getSelection()?.removeAllRanges()

    // Update local state immediately
    setKeySentences(prev => [...prev, textToAdd])

    // Update backend
    if (jdData.title && jdData.company) {
      setIsUpdatingKeySentences(true)
      try {
        const updatedSentences = [...keySentences, textToAdd]
        await fetch('/api/jd2cv/update-key-sentences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: jdData.title,
            company: jdData.company,
            keySentences: updatedSentences
          })
        })
      } catch (error) {
        console.error('Failed to update key sentences:', error)
        // Revert on error
        setKeySentences(prev => prev.filter(sentence => sentence !== textToAdd))
      } finally {
        setIsUpdatingKeySentences(false)
      }
    }
  }

  // Handle capability keyword click to show delete tooltip
  const handleKeywordClick = (e: React.MouseEvent, keyword: string, capabilityIndex: number) => {
    e.stopPropagation()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setDeleteKeywordTooltip({
      show: true,
      keyword: keyword,
      capabilityIndex: capabilityIndex,
      position: { x: rect.right, y: rect.bottom + 5 }
    })
  }

  // Handle confirming delete of capability keyword
  const handleConfirmKeywordDelete = () => {
    const { keyword, capabilityIndex } = deleteKeywordTooltip
    setDeleteKeywordTooltip({ show: false, keyword: '', capabilityIndex: -1, position: { x: 0, y: 0 } })

    // Update local state immediately
    setCapabilityKeywords(prev => {
      const newState = [...prev]
      newState[capabilityIndex] = newState[capabilityIndex].filter(k => k !== keyword)
      
      // Update database with new keywords
      updateKeywordsInDatabase('capability', capabilityIndex, newState[capabilityIndex])
      
      return newState
    })
  }

  // Handle capability text selection to show add keyword tooltip
  const handleCapabilityTextSelection = (e: React.MouseEvent, capabilityIndex: number) => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim()
      // Check if already highlighted as keyword
      if (!capabilityKeywords[capabilityIndex].includes(selectedText)) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setAddKeywordTooltip({
          show: true,
          text: selectedText,
          capabilityIndex: capabilityIndex,
          position: { x: rect.right, y: rect.bottom + 5 }
        })
      }
    }
  }

  // Handle confirming add of new capability keyword
  const handleConfirmKeywordAdd = () => {
    const { text, capabilityIndex } = addKeywordTooltip
    setAddKeywordTooltip({ show: false, text: '', capabilityIndex: -1, position: { x: 0, y: 0 } })
    
    // Clear selection
    window.getSelection()?.removeAllRanges()

    // Update local state immediately
    setCapabilityKeywords(prev => {
      const newState = [...prev]
      newState[capabilityIndex] = [...newState[capabilityIndex], text]
      
      // Update database with new keywords
      updateKeywordsInDatabase('capability', capabilityIndex, newState[capabilityIndex])
      
      return newState
    })
  }

  // Handle confirming delete of experience keyword
  const handleConfirmExperienceKeywordDelete = () => {
    const { keyword, experienceIndex } = deleteExperienceKeywordTooltip
    setDeleteExperienceKeywordTooltip({ show: false, keyword: '', experienceIndex: -1, position: { x: 0, y: 0 } })

    // Update local state immediately
    setExperienceInputKeywords(prev => {
      const newState = [...prev]
      newState[experienceIndex] = newState[experienceIndex].filter(k => k !== keyword)
      
      // Update database with new keywords
      updateKeywordsInDatabase('experience', experienceIndex, newState[experienceIndex])
      
      return newState
    })
  }

  // Handle confirming add of new experience keyword
  const handleConfirmExperienceKeywordAdd = () => {
    const { text, experienceIndex } = addExperienceKeywordTooltip
    setAddExperienceKeywordTooltip({ show: false, text: '', experienceIndex: -1, position: { x: 0, y: 0 } })
    
    // Clear selection
    window.getSelection()?.removeAllRanges()

    // Update local state immediately
    setExperienceInputKeywords(prev => {
      const newState = [...prev]
      newState[experienceIndex] = [...newState[experienceIndex], text]
      
      // Update database with new keywords
      updateKeywordsInDatabase('experience', experienceIndex, newState[experienceIndex])
      
      return newState
    })
  }

  // Handle confirming delete of generated text keyword
  const handleConfirmGeneratedKeywordDelete = () => {
    const { keyword, generatedIndex } = deleteGeneratedKeywordTooltip
    setDeleteGeneratedKeywordTooltip({ show: false, keyword: '', generatedIndex: -1, position: { x: 0, y: 0 } })

    // Update local state immediately
    setGeneratedTextKeywords(prev => {
      const newState = [...prev]
      newState[generatedIndex] = newState[generatedIndex].filter(k => k !== keyword)
      
      // Update database with new keywords
      updateKeywordsInDatabase('generated', generatedIndex, newState[generatedIndex])
      
      return newState
    })
  }

  // Handle confirming add of new generated text keyword
  const handleConfirmGeneratedKeywordAdd = () => {
    const { text, generatedIndex } = addGeneratedKeywordTooltip
    setAddGeneratedKeywordTooltip({ show: false, text: '', generatedIndex: -1, position: { x: 0, y: 0 } })
    
    // Clear selection
    window.getSelection()?.removeAllRanges()

    // Update local state immediately
    setGeneratedTextKeywords(prev => {
      const newState = [...prev]
      newState[generatedIndex] = [...newState[generatedIndex], text]
      
      // Update database with new keywords
      updateKeywordsInDatabase('generated', generatedIndex, newState[generatedIndex])
      
      return newState
    })
  }

  // Close tooltips when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.fixed.z-50')) {
        setDeleteTooltip({ show: false, sentence: '', position: { x: 0, y: 0 } })
        setAddTooltip({ show: false, text: '', position: { x: 0, y: 0 } })
        setDeleteKeywordTooltip({ show: false, keyword: '', capabilityIndex: -1, position: { x: 0, y: 0 } })
        setAddKeywordTooltip({ show: false, text: '', capabilityIndex: -1, position: { x: 0, y: 0 } })
        setDeleteExperienceKeywordTooltip({ show: false, keyword: '', experienceIndex: -1, position: { x: 0, y: 0 } })
        setAddExperienceKeywordTooltip({ show: false, text: '', experienceIndex: -1, position: { x: 0, y: 0 } })
        setDeleteGeneratedKeywordTooltip({ show: false, keyword: '', generatedIndex: -1, position: { x: 0, y: 0 } })
        setAddGeneratedKeywordTooltip({ show: false, text: '', generatedIndex: -1, position: { x: 0, y: 0 } })
      }
    }

    if (deleteTooltip.show || addTooltip.show || deleteKeywordTooltip.show || addKeywordTooltip.show || deleteExperienceKeywordTooltip.show || addExperienceKeywordTooltip.show || deleteGeneratedKeywordTooltip.show || addGeneratedKeywordTooltip.show) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [deleteTooltip.show, addTooltip.show, deleteKeywordTooltip.show, addKeywordTooltip.show, deleteExperienceKeywordTooltip.show, addExperienceKeywordTooltip.show, deleteGeneratedKeywordTooltip.show, addGeneratedKeywordTooltip.show])

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
          model: selectedModel,
          keywordCount: generatedTextKeywordCounts[index]
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id && !currentPageId) {
          setCurrentPageId(data.id)
        }
        // Update generated text keywords immediately with returned keywords
        if (data.keywords && Array.isArray(data.keywords)) {
          setGeneratedTextKeywords(prev => {
            const newState = [...prev]
            newState[index] = data.keywords
            return newState
          })
        }
        setExperienceSaveMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Saved successfully'
          return newState
        })
        // Refresh keywords after successful save
        setTimeout(() => loadKeywords(), 1000)
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

  // Export capability to Notion
  const handleExportCapability = async (index: number) => {
    if (!currentPageId) return
    
    const capabilityKey = `capability_${index + 1}` as keyof JDData
    const capabilityValue = jdData[capabilityKey]
    const keywords = capabilityKeywords[index] || []

    setCapabilityExporting(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    try {
      const response = await fetch('/api/jd2cv/export-capability-to-notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          capabilityIndex: index + 1,
          capabilityValue: capabilityValue,
          keywords: keywords
        })
      })

      if (response.ok) {
        console.log(`Capability ${index + 1} exported to Notion successfully`)
      } else {
        console.error(`Failed to export capability ${index + 1} to Notion`)
      }
    } catch (error) {
      console.error(`Error exporting capability ${index + 1} to Notion:`, error)
    } finally {
      setCapabilityExporting(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
    }
  }

  // Export generated text to Notion
  const handleExportGeneratedText = async (index: number) => {
    if (!currentPageId) return
    
    const experienceKey = `generated_text_${index + 1}` as keyof JDData
    const experienceValue = jdData[experienceKey]
    const keywords = generatedTextKeywords[index] || []

    setGeneratedExporting(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    try {
      const response = await fetch('/api/jd2cv/export-generated-text-to-notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          experienceIndex: index + 1,
          experienceValue: experienceValue,
          keywords: keywords
        })
      })

      if (response.ok) {
        console.log(`Generated text ${index + 1} exported to Notion successfully`)
      } else {
        console.error(`Failed to export generated text ${index + 1} to Notion`)
      }
    } catch (error) {
      console.error(`Error exporting generated text ${index + 1} to Notion:`, error)
    } finally {
      setGeneratedExporting(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
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
          overwrite: true, // Add overwrite flag
          model: selectedModel,
          keywordCount: experienceKeywordCounts[index]
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id && !currentPageId) {
          setCurrentPageId(data.id)
        }
        // Update experience input keywords immediately with returned keywords
        if (data.keywords && Array.isArray(data.keywords)) {
          setExperienceInputKeywords(prev => {
            const newState = [...prev]
            newState[index] = data.keywords
            return newState
          })
        }
        setInputExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Saved successfully'
          return newState
        })
        // Refresh keywords after successful save
        setTimeout(() => loadKeywords(), 1000)
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
              onChange={(e) => handleTitleChange(e.target.value)}
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
              onChange={(e) => handleCompanyChange(e.target.value)}
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
          
          {/* Model Selection Row */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 w-16">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as 'gpt-4' | 'deepseek')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-44 text-sm"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="deepseek">DeepSeek</option>
            </select>
            <div className="w-44"></div> {/* Spacer for alignment */}
            <div className="min-w-[80px]"></div> {/* Spacer for alignment */}
            <div className="min-w-[80px]"></div> {/* Spacer for alignment */}
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
        
        <div className="space-y-6 mb-8">
          {/* Labels Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              {currentPageId && (
                <div className="flex items-center gap-2">
                  {/* Match Score Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleMatchScoreSave(star)}
                        disabled={isSavingMatchScore}
                        className={`text-lg transition-colors duration-200 hover:scale-110 transform ${
                          star <= matchScore 
                            ? 'text-yellow-400 hover:text-yellow-500' 
                            : 'text-gray-300 hover:text-yellow-300'
                        } ${isSavingMatchScore ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                    {isSavingMatchScore && (
                      <svg className="w-4 h-4 animate-spin text-purple-600 ml-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setDeleteTooltipShow(true)}
                      disabled={isDeleting}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-md border border-purple-200 bg-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
                      title="Delete page"
                    >
                      {isDeleting ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      Delete
                    </button>
                    
                    {/* Delete confirmation tooltip */}
                    {deleteTooltipShow && (
                      <div className="absolute right-full mr-2 top-0 bg-purple-600 text-white px-3 py-2 rounded-md shadow-lg text-sm whitespace-nowrap z-50">
                        <div className="flex items-center gap-2">
                          <span>Confirm delete?</span>
                          <button
                            onClick={handleDeletePage}
                            className="bg-white text-purple-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteTooltipShow(false)}
                            className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-purple-400"
                          >
                            No
                          </button>
                        </div>
                        {/* Tooltip arrow pointing right */}
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-purple-600 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                      </div>
                    )}
                  </div>
                  
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
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company <span className="text-red-500">*</span>
              </label>
            </div>
          </div>
          
          {/* Input Fields Row */}
          <div className="grid grid-cols-2 gap-6">
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
              <div 
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: highlightKeySentences(jdData.full_job_description, keySentences)
                }}
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  const sentence = target.getAttribute('data-sentence')
                  if (sentence && keySentences.includes(sentence)) {
                    handleHighlightClick(e, sentence)
                  }
                }}
                onMouseUp={handleTextSelection}
              />
            </div>
          )}
        </div>

        {/* Two-Row Button Layout */}
        <div className="space-y-3">
          {/* First Row: Key Sentences and Save JD */}
          <div className="flex items-center gap-4 justify-end">
            {/* Sentence Count Input */}
            <div className="flex items-center gap-2">
              <label htmlFor="sentenceCount" className="text-sm font-medium text-gray-600">
                Key Sentences:
              </label>
              <input
                id="sentenceCount"
                type="number"
                value={sentenceCount}
                onChange={(e) => setSentenceCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 5)))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                max="10"
              />
            </div>

            {/* Save JD Button */}
            <button
              onClick={handleJDSubmit}
              disabled={isSaving}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow w-32"
            >
              {isSaving ? 'Saving...' : jdSaveError ? 'Retry' : 'Save JD'}
            </button>
          </div>

          {/* Second Row: Categories and Generate */}
          <div className="flex items-center gap-4 justify-end">
            {/* Category Count Input */}
            <div className="flex items-center gap-2">
              <label htmlFor="categoryCount" className="text-sm font-medium text-gray-600">
                Categories:
              </label>
              <input
                id="categoryCount"
                type="number"
                value={categoryCount}
                onChange={(e) => setCategoryCount(Math.max(1, Math.min(5, parseInt(e.target.value) || 3)))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                max="5"
              />
            </div>
            
            {/* Generate Button */}
            <button
              onClick={handleGenerateCapabilities}
              disabled={isGenerating}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow w-32"
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
                <h5 className="font-medium text-gray-800">Role Expectation {num}</h5>
                
                {/* Capability Content */}
                <div className="space-y-3">
                  {capabilityKeywords[index] && capabilityKeywords[index].length > 0 ? (
                    // Show highlighted view when keywords are available
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <div 
                        className="text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[100px]"
                        dangerouslySetInnerHTML={{
                          __html: highlightKeywords(jdData[`capability_${num}` as keyof JDData] || '', capabilityKeywords[index])
                        }}
                        onClick={(e) => {
                          const target = e.target as HTMLElement
                          const keyword = target.getAttribute('data-keyword')
                          if (keyword && capabilityKeywords[index].includes(keyword)) {
                            handleKeywordClick(e, keyword, index)
                          }
                        }}
                        onMouseUp={(e) => handleCapabilityTextSelection(e, index)}
                      />
                    </div>
                  ) : (
                    // Show editable textarea when no keywords are available
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
                  )}
                  
                  {/* Keywords Count and Save Button Row */}
                  <div className="flex items-center gap-3 mt-2">
                    {/* Keywords Count Input */}
                    <div className="flex items-center gap-2">
                      <label htmlFor={`keywordCount-${index}`} className="text-sm font-medium text-gray-600">
                        Keywords:
                      </label>
                      <input
                        id={`keywordCount-${index}`}
                        type="number"
                        value={capabilityKeywordCounts[index]}
                        onChange={(e) => {
                          const newCount = Math.max(1, Math.min(10, parseInt(e.target.value) || 3))
                          setCapabilityKeywordCounts(prev => {
                            const newCounts = [...prev]
                            newCounts[index] = newCount
                            return newCounts
                          })
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                        max="10"
                      />
                    </div>
                    
                    {/* Save Button */}
                    <button
                      onClick={() => handleSaveCapability(index)}
                      disabled={capabilityIsSaving[index]}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 flex-shrink-0"
                    >
                      {capabilityIsSaving[index] ? 'Saving...' : 'Save'}
                    </button>
                    
                    {/* Export Button */}
                    <button
                      onClick={() => handleExportCapability(index)}
                      disabled={!currentPageId || capabilityExporting[index]}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 flex-shrink-0"
                    >
                      {capabilityExporting[index] ? 'Exporting...' : 'Export'}
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
                      {experienceInputKeywords[index] && experienceInputKeywords[index].length > 0 ? (
                        // Show highlighted view when keywords are available
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                          <div 
                            className="text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[120px]"
                            dangerouslySetInnerHTML={{
                              __html: highlightKeywords(experienceInputs[index] || '', experienceInputKeywords[index])
                            }}
                            onClick={(e) => {
                              const target = e.target as HTMLElement
                              const keyword = target.getAttribute('data-keyword')
                              if (keyword) {
                                e.stopPropagation()
                                const rect = target.getBoundingClientRect()
                                setDeleteExperienceKeywordTooltip({
                                  show: true,
                                  keyword: keyword,
                                  experienceIndex: index,
                                  position: { x: rect.right, y: rect.bottom + 5 }
                                })
                              }
                            }}
                            onMouseUp={(e) => {
                              const selection = window.getSelection()
                              const selectedText = selection?.toString().trim()
                              
                              if (selectedText && selectedText.length > 0) {
                                const target = e.target as HTMLElement
                                if (!target.getAttribute('data-keyword')) {
                                  e.stopPropagation()
                                  const rect = selection?.getRangeAt(0).getBoundingClientRect()
                                  if (rect) {
                                    setAddExperienceKeywordTooltip({
                                      show: true,
                                      text: selectedText,
                                      experienceIndex: index,
                                      position: { x: rect.right, y: rect.bottom + 5 }
                                    })
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      ) : (
                        // Show editable textarea when no keywords are available
                        <textarea
                          id={`your-experience-${index}`}
                          value={experienceInputs[index]}
                          onChange={(e) => {
                            const newInputs = [...experienceInputs]
                            newInputs[index] = e.target.value
                            setExperienceInputs(newInputs)
                          }}
                          onInput={(e) => {
                            // Auto-resize on input
                            autoResizeTextarea(e.target as HTMLTextAreaElement)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none overflow-hidden"
                          placeholder="Describe your relevant experience..."
                          style={{ minHeight: '120px' }}
                        />
                      )}
                      
                      {/* Save Button Row */}
                      <div className="flex justify-end gap-3 mt-2 items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Keywords:</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={experienceKeywordCounts[index]}
                            onChange={(e) => {
                              const newCounts = [...experienceKeywordCounts]
                              newCounts[index] = parseInt(e.target.value) || 3
                              setExperienceKeywordCounts(newCounts)
                            }}
                            className="w-12 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-center"
                          />
                        </div>
                        <button
                          onClick={() => handleSaveInputExperience(index)}
                          disabled={inputExperienceSaving[index]}
                          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow w-20 text-center"
                        >
                          {inputExperienceSaving[index] ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>

                    {/* Right: Generated Experience */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Aligned Experience</label>
                      {generatedTextKeywords[index] && generatedTextKeywords[index].length > 0 ? (
                        // Show highlighted view when keywords are available
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                          <div 
                            className="text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[120px]"
                            dangerouslySetInnerHTML={{
                              __html: highlightKeywords(jdData[`generated_text_${num}` as keyof JDData] || '', generatedTextKeywords[index])
                            }}
                            onClick={(e) => {
                              const target = e.target as HTMLElement
                              const keyword = target.getAttribute('data-keyword')
                              if (keyword) {
                                e.stopPropagation()
                                const rect = target.getBoundingClientRect()
                                setDeleteGeneratedKeywordTooltip({
                                  show: true,
                                  keyword: keyword,
                                  generatedIndex: index,
                                  position: { x: rect.right, y: rect.bottom + 5 }
                                })
                              }
                            }}
                            onMouseUp={(e) => {
                              const selection = window.getSelection()
                              const selectedText = selection?.toString().trim()
                              
                              if (selectedText && selectedText.length > 0) {
                                const target = e.target as HTMLElement
                                if (!target.getAttribute('data-keyword')) {
                                  e.stopPropagation()
                                  const rect = selection?.getRangeAt(0).getBoundingClientRect()
                                  if (rect) {
                                    setAddGeneratedKeywordTooltip({
                                      show: true,
                                      text: selectedText,
                                      generatedIndex: index,
                                      position: { x: rect.right, y: rect.bottom + 5 }
                                    })
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      ) : (
                        // Show editable textarea when no keywords are available
                        <textarea
                          id={`generated-text-${index}`}
                          value={jdData[`generated_text_${num}` as keyof JDData]}
                          onChange={(e) => {
                            setJdData(prev => ({ 
                              ...prev, 
                              [`generated_text_${num}`]: e.target.value 
                            }))
                          }}
                          onInput={(e) => {
                            // Auto-resize on input
                            autoResizeTextarea(e.target as HTMLTextAreaElement)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none overflow-hidden"
                          placeholder="Generated experience will appear here..."
                          style={{ minHeight: '120px' }}
                        />
                      )}
                      
                      {/* Buttons Row */}
                      <div className="flex justify-end gap-3 mt-2 items-center">
                        {/* Generate Button */}
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
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Keywords:</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={generatedTextKeywordCounts[index]}
                            onChange={(e) => {
                              const newCounts = [...generatedTextKeywordCounts]
                              newCounts[index] = parseInt(e.target.value) || 3
                              setGeneratedTextKeywordCounts(newCounts)
                            }}
                            className="w-12 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-center"
                          />
                        </div>
                        
                        {/* Save Button */}
                        <button
                          onClick={() => handleSaveExperience(index)}
                          disabled={experienceIsSaving[index]}
                          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow w-20 text-center"
                        >
                          {experienceIsSaving[index] ? 'Saving...' : 'Save'}
                        </button>
                        
                        {/* Export Button */}
                        <button
                          onClick={() => handleExportGeneratedText(index)}
                          disabled={!currentPageId || generatedExporting[index]}
                          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow w-20 text-center"
                        >
                          {generatedExporting[index] ? 'Exporting...' : 'Export'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Delete Highlight Tooltip */}
      {deleteTooltip.show && (
        <div
          className="fixed z-50 bg-white shadow-xl border border-purple-200 rounded-lg text-gray-700 overflow-hidden"
          style={{
            left: Math.min(window.innerWidth - 200, deleteTooltip.position.x),
            top: deleteTooltip.position.y,
            pointerEvents: 'auto',
            width: '200px'
          }}
        >
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3">
            <p className="text-white font-medium text-sm">Remove Highlight</p>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600 mb-3">
              "{deleteTooltip.sentence.substring(0, 50)}{deleteTooltip.sentence.length > 50 ? '...' : ''}"
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmDelete}
                disabled={isUpdatingKeySentences}
                className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                {isUpdatingKeySentences ? 'Removing...' : 'Remove'}
              </button>
              <button
                onClick={() => setDeleteTooltip({ show: false, sentence: '', position: { x: 0, y: 0 } })}
                className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Highlight Tooltip */}
      {addTooltip.show && (
        <div
          className="fixed z-50 bg-white shadow-xl border border-purple-200 rounded-lg text-gray-700 overflow-hidden"
          style={{
            left: Math.min(window.innerWidth - 200, addTooltip.position.x),
            top: addTooltip.position.y,
            pointerEvents: 'auto',
            width: '200px'
          }}
        >
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3">
            <p className="text-white font-medium text-sm">Add Highlight</p>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600 mb-3">
              "{addTooltip.text.substring(0, 50)}{addTooltip.text.length > 50 ? '...' : ''}"
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmAdd}
                disabled={isUpdatingKeySentences}
                className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                {isUpdatingKeySentences ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={() => setAddTooltip({ show: false, text: '', position: { x: 0, y: 0 } })}
                className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Capability Keyword Tooltip */}
      {deleteKeywordTooltip.show && (
        <div
          className="fixed z-50 bg-white shadow-xl border border-purple-200 rounded-lg text-gray-700 overflow-hidden"
          style={{
            left: Math.min(window.innerWidth - 200, deleteKeywordTooltip.position.x),
            top: deleteKeywordTooltip.position.y,
            pointerEvents: 'auto',
            width: '200px'
          }}
        >
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3">
            <p className="text-white font-medium text-sm">Remove Keyword</p>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600 mb-3">
              "{deleteKeywordTooltip.keyword}"
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmKeywordDelete}
                className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Remove
              </button>
              <button
                onClick={() => setDeleteKeywordTooltip({ show: false, keyword: '', capabilityIndex: -1, position: { x: 0, y: 0 } })}
                className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Capability Keyword Tooltip */}
      {addKeywordTooltip.show && (
        <div
          className="fixed z-50 bg-white shadow-xl border border-purple-200 rounded-lg text-gray-700 overflow-hidden"
          style={{
            left: Math.min(window.innerWidth - 200, addKeywordTooltip.position.x),
            top: addKeywordTooltip.position.y,
            pointerEvents: 'auto',
            width: '200px'
          }}
        >
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3">
            <p className="text-white font-medium text-sm">Add Keyword</p>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600 mb-3">
              "{addKeywordTooltip.text.substring(0, 50)}{addKeywordTooltip.text.length > 50 ? '...' : ''}"
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmKeywordAdd}
                className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Add
              </button>
              <button
                onClick={() => setAddKeywordTooltip({ show: false, text: '', capabilityIndex: -1, position: { x: 0, y: 0 } })}
                className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Experience Keyword Tooltip */}
      {deleteExperienceKeywordTooltip.show && (
        <div
          className="fixed z-50 bg-white shadow-xl border border-purple-200 rounded-lg text-gray-700 overflow-hidden"
          style={{
            left: Math.min(window.innerWidth - 200, deleteExperienceKeywordTooltip.position.x),
            top: deleteExperienceKeywordTooltip.position.y,
            pointerEvents: 'auto',
            width: '200px'
          }}
        >
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3">
            <p className="text-white font-medium text-sm">Delete Keyword</p>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600 mb-3">
              "{deleteExperienceKeywordTooltip.keyword}"
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmExperienceKeywordDelete}
                className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteExperienceKeywordTooltip({ show: false, keyword: '', experienceIndex: -1, position: { x: 0, y: 0 } })}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Experience Keyword Tooltip */}
      {addExperienceKeywordTooltip.show && (
        <div
          className="fixed z-50 bg-white shadow-xl border border-purple-200 rounded-lg text-gray-700 overflow-hidden"
          style={{
            left: Math.min(window.innerWidth - 200, addExperienceKeywordTooltip.position.x),
            top: addExperienceKeywordTooltip.position.y,
            pointerEvents: 'auto',
            width: '200px'
          }}
        >
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3">
            <p className="text-white font-medium text-sm">Add Keyword</p>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600 mb-3">
              "{addExperienceKeywordTooltip.text.substring(0, 50)}{addExperienceKeywordTooltip.text.length > 50 ? '...' : ''}"
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmExperienceKeywordAdd}
                className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Add
              </button>
              <button
                onClick={() => setAddExperienceKeywordTooltip({ show: false, text: '', experienceIndex: -1, position: { x: 0, y: 0 } })}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Aligned Experience Keyword Tooltip */}
      {deleteGeneratedKeywordTooltip.show && (
        <div
          className="fixed z-50 bg-white shadow-xl border border-purple-200 rounded-lg text-gray-700 overflow-hidden"
          style={{
            left: Math.min(window.innerWidth - 200, deleteGeneratedKeywordTooltip.position.x),
            top: deleteGeneratedKeywordTooltip.position.y,
            pointerEvents: 'auto',
            width: '200px'
          }}
        >
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3">
            <p className="text-white font-medium text-sm">Delete Keyword</p>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600 mb-3">
              "{deleteGeneratedKeywordTooltip.keyword}"
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmGeneratedKeywordDelete}
                className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteGeneratedKeywordTooltip({ show: false, keyword: '', generatedIndex: -1, position: { x: 0, y: 0 } })}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Aligned Experience Keyword Tooltip */}
      {addGeneratedKeywordTooltip.show && (
        <div
          className="fixed z-50 bg-white shadow-xl border border-purple-200 rounded-lg text-gray-700 overflow-hidden"
          style={{
            left: Math.min(window.innerWidth - 200, addGeneratedKeywordTooltip.position.x),
            top: addGeneratedKeywordTooltip.position.y,
            pointerEvents: 'auto',
            width: '200px'
          }}
        >
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3">
            <p className="text-white font-medium text-sm">Add Keyword</p>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600 mb-3">
              "{addGeneratedKeywordTooltip.text.substring(0, 50)}{addGeneratedKeywordTooltip.text.length > 50 ? '...' : ''}"
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmGeneratedKeywordAdd}
                className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Add
              </button>
              <button
                onClick={() => setAddGeneratedKeywordTooltip({ show: false, text: '', generatedIndex: -1, position: { x: 0, y: 0 } })}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}