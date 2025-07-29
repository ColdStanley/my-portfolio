'use client'

import { useState, useEffect, useRef } from 'react'
import PromptManager, { PromptData } from '@/components/PromptManager'


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
  application_stage: string
  comment: string
  role_group: string
  firm_type: string
  cv_pdf: string
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
    your_experience_5: '',
    application_stage: '',
    comment: '',
    role_group: '',
    firm_type: '',
    cv_pdf: ''
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
  
  // Application stage state
  const [isSavingApplicationStage, setIsSavingApplicationStage] = useState(false)
  
  // Role group state
  const [isSavingRoleGroup, setIsSavingRoleGroup] = useState(false)
  
  // Firm type state
  const [isSavingFirmType, setIsSavingFirmType] = useState(false)
  
  // Comment state
  const [commentSaveTimeout, setCommentSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Application stage options
  const applicationStageOptions = [
    'Capability Extraction',
    'Raw Experience',
    'Customized Experience',
    'CV Polish',
    'Submitted'
  ]
  
  // Role group options
  const roleGroupOptions = [
    'Solution',
    'TAM',
    'Customer Success',
    'BD',
    'Sales'
  ]
  
  // Firm type options
  const firmTypeOptions = [
    'Startup',
    'Mature',
    'Bigwig'
  ]
  
  // Tab state for capability sections
  const [activeCapabilityTab, setActiveCapabilityTab] = useState(0)
  
  // Tab state for JD sections
  const [activeJDTab, setActiveJDTab] = useState(0) // 0: Original, 1: Highlight
  
  // Tab state for each capability's sub-tabs (Original/Highlight)
  const [activeCapabilitySubTabs, setActiveCapabilitySubTabs] = useState<number[]>([0, 0, 0, 0, 0]) // 0: Original, 1: Highlight for each capability
  
  // Tab state for each experience's sub-tabs (Original/Highlight)
  const [activeExperienceSubTabs, setActiveExperienceSubTabs] = useState<number[]>([0, 0, 0, 0, 0]) // 0: Original, 1: Highlight for each experience
  
  // Tab state for each aligned experience's sub-tabs (Original/Highlight)
  const [activeAlignedExperienceSubTabs, setActiveAlignedExperienceSubTabs] = useState<number[]>([0, 0, 0, 0, 0]) // 0: Original, 1: Highlight for each aligned experience
  
  // JD2CV specific prompts configuration
  const [jd2cvPrompts, setJd2cvPrompts] = useState<PromptData>({
    key_sentences_btn: {
      name: 'Key Sentences Button',
      location: 'JD Input → Highlight Tab',
      model: 'gpt-4',
      count: 5,
      prompt: `You are an expert at analyzing job descriptions and identifying the most critical requirements.

Analyze the following job description and extract the {count} most important sentences that define the core responsibilities, requirements, and expectations for this role.

Focus on:
- Key technical skills and qualifications
- Primary job responsibilities  
- Important experience requirements
- Critical soft skills or attributes

Job Description:
{job_description}

Return exactly {count} sentences as a JSON array of strings, with each sentence being a direct quote from the original text.`
    },
    generate_capabilities_btn: {
      name: 'Generate Button',
      location: 'Role Expectations Analysis',
      model: 'gpt-4',
      count: 3,
      prompt: `You are an expert career consultant who specializes in breaking down job requirements into specific capability areas.

Based on the following key sentences from a job description, generate {count} distinct role expectation categories that cover the main areas of capability required for this position.

For each capability area, provide:
1. A clear, specific description of what's expected
2. Focus on actionable requirements rather than generic statements
3. Ensure each area is distinct and non-overlapping

Key sentences:
{key_sentences}

Return {count} capability descriptions as a JSON array of strings.`
    },
    capability_keywords_btn: {
      name: 'Key Words Button',
      location: 'Role Expectation → Highlight Tab',
      model: 'gpt-4',
      count: 3,
      prompt: `You are an expert at identifying key terms and phrases that are important for applicant tracking systems (ATS) and hiring managers.

Analyze the following capability text and extract the {count} most important keywords or key phrases that would be valuable for job matching and resume optimization.

Focus on:
- Technical skills and tools
- Industry-specific terminology
- Action words and competencies
- Measurable qualifications

Capability text:
{text}

Return exactly {count} keywords/phrases as a JSON array of strings.`
    },
    generate_aligned_experience_btn: {
      name: 'Generate Aligned Experience Button',
      location: 'Role Expectation → Experience Customization',
      model: 'gpt-4',
      count: 1,
      prompt: `You are a professional resume writer who excels at aligning candidate experience with job requirements.

Given the role expectation below and the candidate's experience, rewrite the experience to directly demonstrate how it meets the job requirement.

Role Expectation:
{role_expectation}

Candidate Experience:
{user_experience}

Rewrite the experience to:
1. Use similar terminology and keywords from the role expectation
2. Highlight relevant achievements and responsibilities
3. Quantify results where possible
4. Show direct alignment with the requirement
5. Maintain truthfulness while optimizing presentation

Return the rewritten experience as a single string.`
    },
    experience_keywords_btn: {
      name: 'Key Words Button',
      location: 'Your Experience → Highlight Tab',
      model: 'gpt-4',
      count: 3,
      prompt: `You are an expert at identifying key terms and phrases that are important for applicant tracking systems (ATS) and hiring managers.

Analyze the following experience text and extract the {count} most important keywords or key phrases that would be valuable for job matching and resume optimization.

Focus on:
- Technical skills and tools
- Industry-specific terminology
- Action words and competencies
- Measurable qualifications

Experience text:
{text}

Return exactly {count} keywords/phrases as a JSON array of strings.`
    },
    aligned_experience_keywords_btn: {
      name: 'Key Words Button',
      location: 'Aligned Experience → Highlight Tab',
      model: 'gpt-4',
      count: 3,
      prompt: `You are an expert at identifying key terms and phrases that are important for applicant tracking systems (ATS) and hiring managers.

Analyze the following aligned experience text and extract the {count} most important keywords or key phrases that would be valuable for job matching and resume optimization.

Focus on:
- Technical skills and tools
- Industry-specific terminology
- Action words and competencies
- Measurable qualifications

Aligned experience text:
{text}

Return exactly {count} keywords/phrases as a JSON array of strings.`
    }
  })

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

  // Cleanup comment timeout on unmount
  useEffect(() => {
    return () => {
      if (commentSaveTimeout) {
        clearTimeout(commentSaveTimeout)
      }
    }
  }, [commentSaveTimeout])

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

  const handleGenerateKeySentences = async () => {
    if (!jdData.title || !jdData.company || !jdData.full_job_description) {
      alert('Please save JD first before generating key sentences.')
      return
    }

    setIsGenerating(true)
    setGenerateError(false)
    try {
      const response = await fetch('/api/jd2cv/extract-key-sentences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_job_description: jdData.full_job_description,
          model: selectedModel,
          sentenceCount: sentenceCount
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.keySentences) {
          setKeySentences(data.keySentences)
          // Auto switch to Highlight tab after generating key sentences
          setActiveJDTab(1)
          
          // Save key sentences to Notion if we have a pageId
          if (currentPageId) {
            try {
              await fetch('/api/jd2cv/update-key-sentences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: jdData.title,
                  company: jdData.company,
                  keySentences: data.keySentences
                })
              })
            } catch (error) {
              console.error('Failed to save key sentences to Notion:', error)
            }
          }
        }
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
      const response = await fetch('/api/jd2cv/save-capability-only', {
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
    }
  }

  // Generate keywords for capability
  const handleGenerateCapabilityKeywords = async (index: number) => {
    const capabilityKey = `capability_${index + 1}` as keyof JDData
    const capabilityValue = jdData[capabilityKey]

    if (!capabilityValue || capabilityValue.trim() === '') {
      setCapabilitySaveMessages(prev => {
        const newState = [...prev]
        newState[index] = 'No content to generate keywords from'
        return newState
      })
      return
    }

    setCapabilityIsSaving(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    setCapabilitySaveMessages(prev => {
      const newState = [...prev]
      newState[index] = 'Generating keywords...'
      return newState
    })

    try {
      const response = await fetch('/api/jd2cv/extract-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: capabilityValue,
          type: 'capability',
          model: selectedModel,
          keywordCount: capabilityKeywordCounts[index]
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.keywords) {
          setCapabilityKeywords(prev => {
            const newState = [...prev]
            newState[index] = data.keywords
            return newState
          })
          setCapabilitySaveMessages(prev => {
            const newState = [...prev]
            newState[index] = 'Keywords generated successfully'
            return newState
          })
          
          // Auto-switch to Highlight tab after successful keyword generation
          setActiveCapabilitySubTabs(prev => {
            const newSubTabs = [...prev]
            newSubTabs[index] = 1  // Switch to Highlight tab (index 1)
            return newSubTabs
          })
        } else {
          setCapabilitySaveMessages(prev => {
            const newState = [...prev]
            newState[index] = 'Failed to generate keywords'
            return newState
          })
        }
      } else {
        setCapabilitySaveMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Keyword generation failed'
          return newState
        })
      }
    } catch (error) {
      setCapabilitySaveMessages(prev => {
        const newState = [...prev]
        newState[index] = 'Keyword generation error'
        return newState
      })
    } finally {
      setCapabilityIsSaving(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
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
            // Auto switch to Highlight tab if there are key sentences
            if (data.record.job_description_key_sentences.length > 0) {
              setActiveJDTab(1)
            }
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
            your_experience_5: data.record.your_experience_5 || '',
            application_stage: data.record.application_stage || '',
            comment: data.record.comment || '',
            role_group: data.record.role_group || '',
            firm_type: data.record.firm_type || '',
            cv_pdf: data.record.cv_pdf || ''
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
            // Auto switch to Highlight tab if there are key sentences
            if (data.record.job_description_key_sentences.length > 0) {
              setActiveJDTab(1)
            }
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

  // Handle application stage save
  const handleApplicationStageSave = async (stage: string) => {
    if (!currentPageId || stage === jdData.application_stage) return
    
    setIsSavingApplicationStage(true)
    try {
      const response = await fetch('/api/jd2cv/save-application-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          applicationStage: stage
        })
      })
      
      if (response.ok) {
        setJdData(prev => ({ ...prev, application_stage: stage }))
      }
    } catch (error) {
      console.error('Failed to save application stage:', error)
    } finally {
      setIsSavingApplicationStage(false)
    }
  }

  // Handle role group save
  const handleRoleGroupSave = async (roleGroup: string) => {
    if (!currentPageId || roleGroup === jdData.role_group) return
    
    setIsSavingRoleGroup(true)
    try {
      const response = await fetch('/api/jd2cv/save-role-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          roleGroup: roleGroup
        })
      })
      
      if (response.ok) {
        setJdData(prev => ({ ...prev, role_group: roleGroup }))
      }
    } catch (error) {
      console.error('Failed to save role group:', error)
    } finally {
      setIsSavingRoleGroup(false)
    }
  }

  // Handle firm type save
  const handleFirmTypeSave = async (firmType: string) => {
    if (!currentPageId || firmType === jdData.firm_type) return
    
    setIsSavingFirmType(true)
    try {
      const response = await fetch('/api/jd2cv/save-firm-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          firmType: firmType
        })
      })
      
      if (response.ok) {
        setJdData(prev => ({ ...prev, firm_type: firmType }))
      }
    } catch (error) {
      console.error('Failed to save firm type:', error)
    } finally {
      setIsSavingFirmType(false)
    }
  }

  // Handle comment save with debounce
  const handleCommentSave = async (comment: string) => {
    if (!currentPageId) return
    
    try {
      const response = await fetch('/api/jd2cv/save-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          comment: comment
        })
      })
      
      if (response.ok) {
        setJdData(prev => ({ ...prev, comment: comment }))
      }
    } catch (error) {
      console.error('Failed to save comment:', error)
    }
  }

  // Handle comment input with debounce
  const handleCommentInput = (value: string) => {
    setJdData(prev => ({ ...prev, comment: value }))
    
    if (commentSaveTimeout) {
      clearTimeout(commentSaveTimeout)
    }
    
    const timeout = setTimeout(() => {
      handleCommentSave(value)
    }, 500)
    
    setCommentSaveTimeout(timeout)
  }

  // Handle comment enter key
  const handleCommentEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (commentSaveTimeout) {
        clearTimeout(commentSaveTimeout)
        setCommentSaveTimeout(null)
      }
      handleCommentSave(jdData.comment)
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
      
      const response = await fetch('/api/jd2cv/save-aligned-experience-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          experienceIndex: index + 1,
          experienceValue: cleanExperienceValue
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

  // Save aligned experience without keyword extraction (for Original tab)
  const handleSaveAlignedExperienceOnly = async (index: number) => {
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
      
      // Use a simpler API that doesn't extract keywords
      const response = await fetch('/api/jd2cv/save-aligned-experience-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          experienceIndex: index + 1,
          experienceValue: cleanExperienceValue
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
      // Keep status message visible for better user feedback
      // setTimeout removed to maintain persistent status display
    }
  }

  // Generate keywords for aligned experience (for Highlight tab)
  const handleGenerateAlignedExperienceKeywords = async (index: number) => {
    const experienceKey = `generated_text_${index + 1}` as keyof JDData
    const experienceValue = jdData[experienceKey]

    if (!experienceValue || experienceValue.trim() === '') {
      setExperienceSaveMessages(prev => {
        const newState = [...prev]
        newState[index] = 'No content to generate keywords from'
        return newState
      })
      return
    }

    setExperienceIsSaving(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    setExperienceSaveMessages(prev => {
      const newState = [...prev]
      newState[index] = 'Generating keywords...'
      return newState
    })

    try {
      const cleanExperienceValue = removeEmojis(experienceValue || '')
      
      const response = await fetch('/api/jd2cv/extract-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanExperienceValue,
          type: 'generated_experience',
          model: selectedModel,
          keywordCount: generatedTextKeywordCounts[index]
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.keywords) {
          setGeneratedTextKeywords(prev => {
            const newState = [...prev]
            newState[index] = data.keywords
            return newState
          })
          setExperienceSaveMessages(prev => {
            const newState = [...prev]
            newState[index] = 'Keywords generated successfully'
            return newState
          })
          
          // Auto-switch to Highlight tab after successful keyword generation
          setActiveAlignedExperienceSubTabs(prev => {
            const newSubTabs = [...prev]
            newSubTabs[index] = 1  // Switch to Highlight tab (index 1)
            return newSubTabs
          })
        } else {
          setExperienceSaveMessages(prev => {
            const newState = [...prev]
            newState[index] = 'Failed to generate keywords'
            return newState
          })
        }
      } else {
        setExperienceSaveMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Keyword generation failed'
          return newState
        })
      }
    } catch (error) {
      setExperienceSaveMessages(prev => {
        const newState = [...prev]
        newState[index] = 'Keyword generation error'
        return newState
      })
    } finally {
      setExperienceIsSaving(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
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

  // Save input experience without keyword extraction (for Original tab)
  const handleSaveInputExperienceOnly = async (index: number) => {
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
      
      // Use a simpler API that doesn't extract keywords
      const response = await fetch('/api/jd2cv/save-aligned-experience-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          experienceIndex: index + 1,
          experienceValue: cleanInputExperienceValue
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

  // Generate keywords for input experience (for Highlight tab)
  const handleGenerateInputExperienceKeywords = async (index: number) => {
    const inputExperienceValue = experienceInputs[index]

    if (!inputExperienceValue || inputExperienceValue.trim() === '') {
      setInputExperienceMessages(prev => {
        const newState = [...prev]
        newState[index] = 'No content to generate keywords from'
        return newState
      })
      return
    }

    setInputExperienceSaving(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    setInputExperienceMessages(prev => {
      const newState = [...prev]
      newState[index] = 'Generating keywords...'
      return newState
    })

    try {
      const response = await fetch('/api/jd2cv/extract-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputExperienceValue,
          type: 'experience',
          model: selectedModel,
          keywordCount: experienceKeywordCounts[index]
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.keywords) {
          setExperienceInputKeywords(prev => {
            const newState = [...prev]
            newState[index] = data.keywords
            return newState
          })
          setInputExperienceMessages(prev => {
            const newState = [...prev]
            newState[index] = 'Keywords generated successfully'
            return newState
          })
          
          // Auto-switch to Highlight tab after successful keyword generation
          setActiveExperienceSubTabs(prev => {
            const newSubTabs = [...prev]
            newSubTabs[index] = 1  // Switch to Highlight tab (index 1)
            return newSubTabs
          })
        } else {
          setInputExperienceMessages(prev => {
            const newState = [...prev]
            newState[index] = 'Failed to generate keywords'
            return newState
          })
        }
      } else {
        setInputExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Keyword generation failed'
          return newState
        })
      }
    } catch (error) {
      setInputExperienceMessages(prev => {
        const newState = [...prev]
        newState[index] = 'Keyword generation error'
        return newState
      })
    } finally {
      setInputExperienceSaving(prev => {
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
          {/* Title and Company Input with Operations */}
          <div className="flex items-start justify-between gap-6">
            {/* Left: Input Area */}
            <div className="w-1/2 space-y-4">
              {/* Title Row */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={jdData.title}
                  onChange={(e) => {
                    setJdData(prev => ({ ...prev, title: e.target.value }))
                    if (jdSaved) setJdSaved(false)
                    if (jdSaveError) setJdSaveError(false)
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Senior Software Engineer"
                />
              </div>
              
              {/* Company Row */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
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
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Google"
                />
              </div>
            </div>
            
            {/* Right: Operations Area */}
            {currentPageId && (
              <div className="w-1/2 space-y-2">
                {/* First Row: Stars, PDF, Delete, Notion (Right Aligned) */}
                <div className="flex items-center justify-end gap-2">
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
                  
                  {/* PDF Button */}
                  {jdData.cv_pdf && (
                    <button
                      onClick={() => window.open(jdData.cv_pdf, '_blank')}
                      className="w-20 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center justify-center gap-1 px-2 py-1 rounded-md border border-purple-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                      title="Open CV PDF"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>
                  )}
                  
                  <div className="relative">
                    <button
                      onClick={() => setDeleteTooltipShow(true)}
                      disabled={isDeleting}
                      className="w-20 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center justify-center gap-1 px-2 py-1 rounded-md border border-purple-200 bg-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
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
                    onClick={() => {
                      console.log('Current Page ID:', currentPageId)
                      const notionUrl = `https://www.notion.so/${currentPageId.replace(/-/g, '')}`
                      console.log('Opening Notion URL:', notionUrl)
                      window.open(notionUrl, '_blank')
                    }}
                    className="w-20 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center justify-center gap-1 px-2 py-1 rounded-md border border-purple-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                    title="Open in Notion"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Notion
                  </button>
                </div>
                
                {/* Second Row: Dropdowns (Right Aligned, Equal Width) */}
                <div className="flex items-center justify-end gap-2">
                  {/* Application Stage Dropdown */}
                  <select
                    value={jdData.application_stage}
                    onChange={(e) => handleApplicationStageSave(e.target.value)}
                    disabled={isSavingApplicationStage}
                    className="w-24 text-xs px-2 py-1 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
                    title="Application Stage"
                  >
                    <option value="">Stage</option>
                    {applicationStageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  
                  {/* Role Group Dropdown */}
                  <select
                    value={jdData.role_group}
                    onChange={(e) => handleRoleGroupSave(e.target.value)}
                    disabled={isSavingRoleGroup}
                    className="w-24 text-xs px-2 py-1 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
                    title="Role Group"
                  >
                    <option value="">Role</option>
                    {roleGroupOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  
                  {/* Firm Type Dropdown */}
                  <select
                    value={jdData.firm_type}
                    onChange={(e) => handleFirmTypeSave(e.target.value)}
                    disabled={isSavingFirmType}
                    className="w-24 text-xs px-2 py-1 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
                    title="Firm Type"
                  >
                    <option value="">Firm</option>
                    {firmTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Third Row: Comment Input */}
                <div className="flex items-center">
                  <input
                    type="text"
                    value={jdData.comment}
                    onChange={(e) => handleCommentInput(e.target.value)}
                    onKeyDown={handleCommentEnter}
                    placeholder="Add comment..."
                    className="w-full text-sm px-3 py-1 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm hover:shadow-md transition-shadow"
                    title="Press Enter to save immediately"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Full Job Description <span className="text-purple-600">*</span>
          </label>
          
          {/* JD Tab Navigation */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex space-x-1 -mb-px" role="tablist">
              {['Original', 'Highlight'].map((tabName, index) => {
                const isActive = activeJDTab === index
                return (
                  <button
                    key={index}
                    id={`jd-tab-${index}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`jd-panel-${index}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveJDTab(index)}
                    className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors duration-200 focus:outline-none ${
                      isActive 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tabName}
                  </button>
                )
              })}
            </nav>
          </div>
          
          {/* JD Tab Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {activeJDTab === 0 ? (
              // Original Tab - Editable textarea
              <textarea
                value={jdData.full_job_description}
                onChange={(e) => {
                  setJdData(prev => ({ ...prev, full_job_description: e.target.value }))
                  if (jdSaved) setJdSaved(false)
                  if (jdSaveError) setJdSaveError(false)
                  if (generateError) setGenerateError(false)
                  // Auto-resize textarea
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${target.scrollHeight}px`
                }}
                className="w-full border-0 focus:outline-none resize-none overflow-hidden min-h-[150px] text-gray-700"
                placeholder="Paste the complete job description here..."
                style={{
                  height: jdData.full_job_description ? 'auto' : '150px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${target.scrollHeight}px`
                }}
                ref={(el) => {
                  if (el && jdData.full_job_description) {
                    setTimeout(() => {
                      el.style.height = 'auto'
                      el.style.height = `${el.scrollHeight}px`
                    }, 0)
                  }
                }}
              />
            ) : (
              // Highlight Tab - Read-only display with highlighting
              <div 
                className="text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[150px]"
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
            )}
          </div>
        </div>

        {/* Button Layout - Different for each tab */}
        <div className="space-y-3">
          {activeJDTab === 0 ? (
            // Original Tab: Only Save to Database button
            <div className="flex items-center gap-4 justify-end">
              <button
                onClick={handleJDSubmit}
                disabled={isSaving || !jdData.full_job_description.trim()}
                className="w-[160px] px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow text-center text-sm"
              >
                {isSaving ? 'Saving...' : jdSaveError ? 'Retry' : 'Save to Database'}
              </button>
            </div>
          ) : (
            // Highlight Tab: Key Sentences button with count input
            <div className="flex items-center gap-4 justify-end">
              {/* Sentence Count Input */}
              <div className="flex items-center gap-2">
                <label htmlFor="sentenceCount" className="text-sm font-medium text-gray-600">
                  Count:
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

              {/* Key Sentences Button */}
              <button
                onClick={handleGenerateKeySentences}
                disabled={isGenerating || !jdData.full_job_description.trim()}
                className="w-[160px] px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow text-center text-sm"
              >
                {isGenerating ? 'Generating...' : generateError ? 'Retry' : 'Key Sentences'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Role Expectations - Independent Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Role Expectations Analysis</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${keySentences.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${capabilitiesGenerated ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            Generate role expectations based on key sentences from the job description. This analysis bridges the job requirements with specific capability areas.
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="categoryCount" className="text-sm font-medium text-gray-700">
                  Categories:
                </label>
                <input
                  id="categoryCount"
                  type="number"
                  value={categoryCount}
                  onChange={(e) => setCategoryCount(Math.max(1, Math.min(5, parseInt(e.target.value) || 3)))}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  min="1"
                  max="5"
                />
              </div>
            </div>
            
            <button
              onClick={handleGenerateCapabilities}
              disabled={isGenerating || keySentences.length === 0}
              className="w-24 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 text-sm"
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* All Capabilities and Experience Areas - Tab Version */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-800">Key Required Capabilities</h4>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide -mb-px" role="tablist">
              {[1, 2, 3, 4, 5].map((num) => {
                const index = num - 1
                const isActive = activeCapabilityTab === index
                const hasContent = jdData[`capability_${num}` as keyof JDData]
                
                return (
                  <button
                    key={num}
                    id={`capability-tab-${num}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`capability-panel-${num}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveCapabilityTab(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft' && index > 0) {
                        setActiveCapabilityTab(index - 1)
                      } else if (e.key === 'ArrowRight' && index < 4) {
                        setActiveCapabilityTab(index + 1)
                      }
                    }}
                    className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 rounded-t-lg border-l border-r border-t font-medium text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      isActive 
                        ? 'bg-purple-600 text-white shadow-md border-purple-600 relative z-10' 
                        : hasContent
                          ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 hover:shadow-sm border-purple-200'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-600 border-gray-200'
                    }`}
                  >
                    <span className="whitespace-nowrap">Role Expectation {num}</span>
                  </button>
                )
              })}
            </nav>
          </div>
          
          {/* Tab Content */}
          {[1, 2, 3, 4, 5].map((num) => {
            const index = num - 1
            const isActive = activeCapabilityTab === index
            
            if (!isActive) return null
            
            return (
              <div 
                key={num} 
                id={`capability-panel-${num}`}
                role="tabpanel"
                aria-labelledby={`capability-tab-${num}`}
                className="mt-0"
              >
                <div className="bg-white rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                  
                  {/* Capability Content - Secondary Tab System */}
                  <div className="space-y-4">
                    {/* Secondary Tab Navigation */}
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-1 -mb-px" role="tablist">
                        {['Original', 'Highlight'].map((tabName, subIndex) => {
                          const isSubActive = activeCapabilitySubTabs[index] === subIndex
                          return (
                            <button
                              key={subIndex}
                              role="tab"
                              aria-selected={isSubActive}
                              onClick={() => {
                                const newSubTabs = [...activeCapabilitySubTabs]
                                newSubTabs[index] = subIndex
                                setActiveCapabilitySubTabs(newSubTabs)
                              }}
                              className={`flex-shrink-0 px-3 py-1.5 rounded-t-md border-l border-r border-t font-medium text-xs transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-purple-400 ${
                                isSubActive 
                                  ? 'bg-purple-600 text-white shadow-sm border-purple-600 relative z-10' 
                                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
                              }`}
                            >
                              <span className="whitespace-nowrap">{tabName}</span>
                            </button>
                          )
                        })}
                      </nav>
                    </div>
                    
                    {/* Secondary Tab Content */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      {activeCapabilitySubTabs[index] === 0 ? (
                        // Original Tab - Editable textarea
                        <div>
                          <textarea
                            value={jdData[`capability_${num}` as keyof JDData]}
                            onChange={(e) => {
                              setJdData(prev => ({ 
                                ...prev, 
                                [`capability_${num}`]: e.target.value 
                              }))
                              // Auto-resize on change
                              const target = e.target as HTMLTextAreaElement
                              target.style.height = 'auto'
                              target.style.height = `${target.scrollHeight}px`
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none overflow-hidden min-h-[100px]"
                            placeholder={`Role expectation ${num} content...`}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement
                              target.style.height = 'auto'
                              target.style.height = `${target.scrollHeight}px`
                            }}
                            ref={(el) => {
                              if (el && jdData[`capability_${num}` as keyof JDData]) {
                                // Auto-resize on initial render
                                setTimeout(() => {
                                  el.style.height = 'auto'
                                  el.style.height = `${el.scrollHeight}px`
                                }, 0)
                              }
                            }}
                          />
                        </div>
                      ) : (
                        // Highlight Tab - Read-only display with highlighting
                        <div>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white min-h-[100px]">
                            <div 
                              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
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
                        </div>
                      )}
                    </div>
                    
                    {/* Button Layout - Different for each sub-tab */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 p-3">
                      {activeCapabilitySubTabs[index] === 0 ? (
                        // Original Tab: Only Database button
                        <div className="flex items-center gap-4 justify-end w-full">
                          <button
                            onClick={() => handleSaveCapability(index)}
                            disabled={capabilityIsSaving[index] || !jdData[`capability_${num}` as keyof JDData]?.trim()}
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            {capabilityIsSaving[index] ? 'Saving...' : 'Save to Database'}
                          </button>
                        </div>
                      ) : (
                        // Highlight Tab: Key Words button with count input
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <label htmlFor={`keywordCount-${index}`} className="text-sm font-medium text-gray-600">
                              Count:
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
                          
                          <button
                            onClick={() => handleGenerateCapabilityKeywords(index)}
                            disabled={capabilityIsSaving[index] || !jdData[`capability_${num}` as keyof JDData]?.trim()}
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            {capabilityIsSaving[index] ? 'Generating...' : 'Key Words'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Page Export Section */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleExportCapability(index)}
                    disabled={!currentPageId || capabilityExporting[index]}
                    className="px-6 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {capabilityExporting[index] ? 'Exporting...' : 'Page'}
                  </button>
                </div>

                {/* Experience Customization */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6 mt-6">
                  <h6 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Experience Customization</h6>
                  
                  <div className="space-y-6">
                    {/* Your Experience Section - Secondary Tab System */}
                    <div className="space-y-3">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Your Experience</label>
                      
                      {/* Secondary Tab Navigation */}
                      <div className="border-b border-gray-200">
                        <nav className="flex space-x-1 -mb-px" role="tablist">
                          {['Original', 'Highlight'].map((tabName, subIndex) => {
                            const isSubActive = activeExperienceSubTabs[index] === subIndex
                            return (
                              <button
                                key={subIndex}
                                role="tab"
                                aria-selected={isSubActive}
                                onClick={() => {
                                  const newSubTabs = [...activeExperienceSubTabs]
                                  newSubTabs[index] = subIndex
                                  setActiveExperienceSubTabs(newSubTabs)
                                }}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-t-md border-l border-r border-t font-medium text-xs transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-purple-400 ${
                                  isSubActive 
                                    ? 'bg-purple-600 text-white shadow-sm border-purple-600 relative z-10' 
                                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
                                }`}
                              >
                                <span className="whitespace-nowrap">{tabName}</span>
                              </button>
                            )
                          })}
                        </nav>
                      </div>
                      
                      {/* Secondary Tab Content */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        {activeExperienceSubTabs[index] === 0 ? (
                          // Original Tab - Editable textarea
                          <div>
                            <textarea
                              id={`your-experience-${index}`}
                              value={experienceInputs[index]}
                              onChange={(e) => {
                                const newInputs = [...experienceInputs]
                                newInputs[index] = e.target.value
                                setExperienceInputs(newInputs)
                                // Auto-resize on change
                                const target = e.target as HTMLTextAreaElement
                                target.style.height = 'auto'
                                target.style.height = `${target.scrollHeight}px`
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none overflow-hidden min-h-[120px]"
                              placeholder="Describe your relevant experience..."
                              onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement
                                target.style.height = 'auto'
                                target.style.height = `${target.scrollHeight}px`
                              }}
                              ref={(el) => {
                                if (el && experienceInputs[index]) {
                                  // Auto-resize on initial render
                                  setTimeout(() => {
                                    el.style.height = 'auto'
                                    el.style.height = `${el.scrollHeight}px`
                                  }, 0)
                                }
                              }}
                            />
                          </div>
                        ) : (
                          // Highlight Tab - Read-only display with highlighting
                          <div>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white min-h-[120px]">
                              {experienceInputKeywords[index] && experienceInputKeywords[index].length > 0 ? (
                                // Show highlighted view when keywords are available
                                <div 
                                  className="text-gray-700 leading-relaxed whitespace-pre-wrap"
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
                              ) : (
                                // Show plain text when no keywords are available
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {experienceInputs[index] || 'Your experience content will appear here with highlighted keywords...'}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Button Layout - Different for each sub-tab */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 p-3">
                        {activeExperienceSubTabs[index] === 0 ? (
                          // Original Tab: Only Save to Database button
                          <div className="flex items-center gap-4 justify-end w-full">
                            <button
                              onClick={() => handleSaveInputExperienceOnly(index)}
                              disabled={inputExperienceSaving[index] || !experienceInputs[index]?.trim()}
                              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              {inputExperienceSaving[index] ? 'Saving...' : 'Save to Database'}
                            </button>
                          </div>
                        ) : (
                          // Highlight Tab: Key Words button with count input
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <label htmlFor={`keywordCount-exp-${index}`} className="text-sm font-medium text-gray-600">
                                Count:
                              </label>
                              <input
                                id={`keywordCount-exp-${index}`}
                                type="number"
                                value={experienceKeywordCounts[index]}
                                onChange={(e) => {
                                  const newCount = Math.max(1, Math.min(10, parseInt(e.target.value) || 3))
                                  setExperienceKeywordCounts(prev => {
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
                            
                            <button
                              onClick={() => handleGenerateInputExperienceKeywords(index)}
                              disabled={inputExperienceSaving[index] || !experienceInputs[index]?.trim()}
                              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              {inputExperienceSaving[index] ? 'Generating...' : 'Key Words'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Generate Aligned Experience Button */}
                    <div className="flex justify-end py-4">
                      <button
                        onClick={() => handleGenerateExperience(index)}
                        disabled={experienceGenerating[index]}
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-sm hover:shadow-md min-w-[200px] flex items-center justify-center gap-2"
                      >
                        {experienceGenerating[index] ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          'Generate Aligned Experience'
                        )}
                      </button>
                    </div>

                    {/* Aligned Experience Section - Secondary Tab System */}
                    <div className="space-y-3">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Aligned Experience</label>
                      
                      {/* Secondary Tab Navigation */}
                      <div className="border-b border-gray-200">
                        <nav className="flex space-x-1 -mb-px" role="tablist">
                          {['Original', 'Highlight'].map((tabName, subIndex) => {
                            const isSubActive = activeAlignedExperienceSubTabs[index] === subIndex
                            return (
                              <button
                                key={subIndex}
                                role="tab"
                                aria-selected={isSubActive}
                                onClick={() => {
                                  const newSubTabs = [...activeAlignedExperienceSubTabs]
                                  newSubTabs[index] = subIndex
                                  setActiveAlignedExperienceSubTabs(newSubTabs)
                                }}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-t-md border-l border-r border-t font-medium text-xs transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-purple-400 ${
                                  isSubActive 
                                    ? 'bg-purple-600 text-white shadow-sm border-purple-600 relative z-10' 
                                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
                                }`}
                              >
                                <span className="whitespace-nowrap">{tabName}</span>
                              </button>
                            )
                          })}
                        </nav>
                      </div>
                      
                      {/* Secondary Tab Content */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        {activeAlignedExperienceSubTabs[index] === 0 ? (
                          // Original Tab - Editable textarea
                          <div>
                            <textarea
                              id={`generated-text-${index}`}
                              value={jdData[`generated_text_${num}` as keyof JDData]}
                              onChange={(e) => {
                                setJdData(prev => ({ 
                                  ...prev, 
                                  [`generated_text_${num}`]: e.target.value 
                                }))
                                // Auto-resize on change
                                const target = e.target as HTMLTextAreaElement
                                target.style.height = 'auto'
                                target.style.height = `${target.scrollHeight}px`
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none overflow-hidden min-h-[120px]"
                              placeholder="Generated experience will appear here..."
                              onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement
                                target.style.height = 'auto'
                                target.style.height = `${target.scrollHeight}px`
                              }}
                              ref={(el) => {
                                if (el && jdData[`generated_text_${num}` as keyof JDData]) {
                                  // Auto-resize on initial render
                                  setTimeout(() => {
                                    el.style.height = 'auto'
                                    el.style.height = `${el.scrollHeight}px`
                                  }, 0)
                                }
                              }}
                            />
                          </div>
                        ) : (
                          // Highlight Tab - Read-only display with highlighting
                          <div>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white min-h-[120px]">
                              {generatedTextKeywords[index] && generatedTextKeywords[index].length > 0 ? (
                                // Show highlighted view when keywords are available
                                <div 
                                  className="text-gray-700 leading-relaxed whitespace-pre-wrap"
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
                              ) : (
                                // Show plain text when no keywords are available
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {jdData[`generated_text_${num}` as keyof JDData] || 'Generated aligned experience content will appear here with highlighted keywords...'}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Button Layout - Different for each sub-tab */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 p-3">
                        {activeAlignedExperienceSubTabs[index] === 0 ? (
                          // Original Tab: Only Save to Database button
                          <div className="flex items-center gap-4 justify-end w-full">
                            <button
                              onClick={() => handleSaveAlignedExperienceOnly(index)}
                              disabled={experienceIsSaving[index] || !jdData[`generated_text_${num}` as keyof JDData]?.trim()}
                              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              {experienceIsSaving[index] ? 'Saving...' : 'Save to Database'}
                            </button>
                          </div>
                        ) : (
                          // Highlight Tab: Key Words button with count input
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <label htmlFor={`keywordCount-aligned-${index}`} className="text-sm font-medium text-gray-600">
                                Count:
                              </label>
                              <input
                                id={`keywordCount-aligned-${index}`}
                                type="number"
                                value={generatedTextKeywordCounts[index]}
                                onChange={(e) => {
                                  const newCount = Math.max(1, Math.min(10, parseInt(e.target.value) || 3))
                                  setGeneratedTextKeywordCounts(prev => {
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
                            
                            <button
                              onClick={() => handleGenerateAlignedExperienceKeywords(index)}
                              disabled={experienceIsSaving[index] || !jdData[`generated_text_${num}` as keyof JDData]?.trim()}
                              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              {experienceIsSaving[index] ? 'Generating...' : 'Key Words'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Page Export Section for Aligned Experience */}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => handleExportGeneratedText(index)}
                        disabled={!currentPageId || generatedExporting[index]}
                        className="px-6 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {generatedExporting[index] ? 'Exporting...' : 'Page'}
                      </button>
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
          <div className="bg-purple-600 p-3">
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
          <div className="bg-purple-600 p-3">
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
          <div className="bg-purple-600 p-3">
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
          <div className="bg-purple-600 p-3">
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
          <div className="bg-purple-600 p-3">
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
                className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
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
          <div className="bg-purple-600 p-3">
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
                className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
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
          <div className="bg-purple-600 p-3">
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
                className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
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
          <div className="bg-purple-600 p-3">
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
                className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors duration-200 text-sm active:scale-95 transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PromptManager Component */}
      <PromptManager
        prompts={jd2cvPrompts}
        onPromptsChange={setJd2cvPrompts}
        position="bottom-right"
        storageKey="jd2cv-prompts"
        buttonIcon="</>"
      />

    </div>
  )
}