'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
// Removed auth dependency for anonymous access
import ProgressTooltip from './ProgressTooltip'

interface Education {
  degree: string
  institution: string
  year: string
  gpa?: string
}

interface CustomModule {
  id: string
  title: string
  content: string[]
}

interface PDFConfig {
  format: 'A4' | 'Letter'
  includePersonalInfo: boolean
  includeSummary: boolean
  includeSkills: boolean
  includeEducation: boolean
  includeCertificates: boolean
  includeExperiences: boolean
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    linkedin: string
    website: string
    summary: string[]
    technicalSkills: string[]
    languages: string[]
    education: Education[]
    certificates: string[]
    customModules: CustomModule[]
  }
}

const defaultPersonalInfo = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  website: '',
  summary: [],
  technicalSkills: [],
  languages: [],
  education: [],
  certificates: [],
  customModules: []
}

const defaultConfig: PDFConfig = {
  format: 'A4',
  includePersonalInfo: true,
  includeSummary: true,
  includeSkills: true,
  includeEducation: true,
  includeCertificates: true,
  includeExperiences: true,
  personalInfo: defaultPersonalInfo
}

export default function JD2CV2() {
  // Anonymous access - no user authentication required
  
  // PDF Setup form states
  const [config, setConfig] = useState<PDFConfig>(defaultConfig)
  
  // Add new item states
  const [newSummaryItem, setNewSummaryItem] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [newCertificate, setNewCertificate] = useState('')
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    year: '',
    gpa: ''
  })
  
  // Custom module states
  const [newCustomModuleTitle, setNewCustomModuleTitle] = useState('')
  const [newCustomModuleItem, setNewCustomModuleItem] = useState('')
  const [currentEditingModuleId, setCurrentEditingModuleId] = useState<string | null>(null)

  // JD input states
  const [jdTitle, setJdTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jdDescription, setJdDescription] = useState('')
  
  // UI states
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Progress tracking states
  const [showProgress, setShowProgress] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [stepNumber, setStepNumber] = useState(1)
  
  // Cover Letter states - completely separate from existing functionality
  const [coverLetterState, setCoverLetterState] = useState({
    available: false,        // Enabled after CV generation
    generating: false,       // Generation in progress
    generated: false,        // Successfully generated
    content: null as string | null,
    error: null as string | null,
    userPrompt: `### Requirements
1. Structure the cover letter in **3–4 short paragraphs**:
   - **Opening**: Express interest in the position and introduce yourself.
   - **Body (1–2 paragraphs)**: Match applicant's skills and experiences with the job's key requirements. Use measurable achievements where possible.
   - **Closing**: Reaffirm enthusiasm, mention availability for interview, polite sign-off.
2. Keep tone **professional, confident, and concise** (approx. 250–350 words).
3. Do **not** repeat the resume word-for-word; instead, highlight the most relevant skills/achievements.
4. Directly address the company (use the company name).
5. Output only the **main body content** - do not include salutation (Dear...) or closing signature (Sincerely...).

### Output Format
Main body paragraphs only (no "Dear..." salutation, no "Sincerely..." closing).

### Job Information
{jd_info}

### Personal Information
{personal_info}

### Tailored Experience (Resume Content)
{tailored_experience}

Based on the above information, generate a professional cover letter for this position.`,
    aiModel: 'deepseek' as 'openai' | 'deepseek'
  })
  
  // Store AI-generated experience for Cover Letter use
  const [aiExperience, setAiExperience] = useState<string>('')
  
  // Flag to prevent auto-save during initial data loading
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Load PDF setup data from localStorage on mount
  useEffect(() => {
    const savedKey = 'jd2cv2-pdf-data-anonymous'
    const stored = localStorage.getItem(savedKey)
    
    if (stored) {
      try {
        const loadedConfig = JSON.parse(stored)
        const validatedConfig: PDFConfig = {
          ...defaultConfig,
          ...loadedConfig,
          personalInfo: {
            ...defaultPersonalInfo,
            ...loadedConfig.personalInfo
          }
        }
        setConfig(validatedConfig)
      } catch (error) {
        console.error('Failed to load PDF config:', error)
        setConfig(defaultConfig)
      }
    }

    // Mark data loading as complete
    setIsDataLoaded(true)

    // Check for transferred JD data from JD2CV 1.0
    const transferData = localStorage.getItem('jd2cv-transfer')
    if (transferData) {
      try {
        const jdData = JSON.parse(transferData)
        setJdTitle(jdData.title || '')
        setCompany(jdData.company || '')
        setJdDescription(jdData.description || '')
        // Clean up transfer data after using it
        localStorage.removeItem('jd2cv-transfer')
      } catch (error) {
        console.error('Failed to load transferred JD data:', error)
      }
    }
  }, [])

  // Save config to localStorage whenever config changes (but only after initial data loading)
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('jd2cv2-pdf-data-anonymous', JSON.stringify(config))
    }
  }, [config, isDataLoaded])

  // Array management functions
  const addSummaryItem = () => {
    if (newSummaryItem.trim()) {
      setConfig(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          summary: [...prev.personalInfo.summary, newSummaryItem.trim()]
        }
      }))
      setNewSummaryItem('')
    }
  }

  const removeSummaryItem = (index: number) => {
    setConfig(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        summary: prev.personalInfo.summary.filter((_, i) => i !== index)
      }
    }))
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setConfig(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          technicalSkills: [...prev.personalInfo.technicalSkills, newSkill.trim()]
        }
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setConfig(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        technicalSkills: prev.personalInfo.technicalSkills.filter((_, i) => i !== index)
      }
    }))
  }

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setConfig(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          languages: [...prev.personalInfo.languages, newLanguage.trim()]
        }
      }))
      setNewLanguage('')
      }
  }

  const removeLanguage = (index: number) => {
    setConfig(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        languages: prev.personalInfo.languages.filter((_, i) => i !== index)
      }
    }))
  }

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution && newEducation.year) {
      setConfig(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          education: [...prev.personalInfo.education, { ...newEducation }]
        }
      }))
      setNewEducation({ degree: '', institution: '', year: '', gpa: '' })
      }
  }

  const removeEducation = (index: number) => {
    setConfig(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        education: prev.personalInfo.education.filter((_, i) => i !== index)
      }
    }))
  }

  const addCertificate = () => {
    if (newCertificate.trim()) {
      setConfig(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          certificates: [...prev.personalInfo.certificates, newCertificate.trim()]
        }
      }))
      setNewCertificate('')
      }
  }

  const removeCertificate = (index: number) => {
    setConfig(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        certificates: prev.personalInfo.certificates.filter((_, i) => i !== index)
      }
    }))
  }

  // Custom module management functions
  const addCustomModule = () => {
    if (newCustomModuleTitle.trim()) {
      const newModule: CustomModule = {
        id: Date.now().toString(),
        title: newCustomModuleTitle.trim(),
        content: []
      }
      setConfig(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          customModules: [...prev.personalInfo.customModules, newModule]
        }
      }))
      setNewCustomModuleTitle('')
      setCurrentEditingModuleId(newModule.id)
      }
  }

  const removeCustomModule = (moduleId: string) => {
    setConfig(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        customModules: prev.personalInfo.customModules.filter(module => module.id !== moduleId)
      }
    }))
    if (currentEditingModuleId === moduleId) {
      setCurrentEditingModuleId(null)
      setNewCustomModuleItem('')
    }
  }

  const addCustomModuleItem = (moduleId: string) => {
    if (newCustomModuleItem.trim()) {
      setConfig(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          customModules: prev.personalInfo.customModules.map(module => 
            module.id === moduleId 
              ? { ...module, content: [...module.content, newCustomModuleItem.trim()] }
              : module
          )
        }
      }))
      setNewCustomModuleItem('')
      }
  }

  const removeCustomModuleItem = (moduleId: string, itemIndex: number) => {
    setConfig(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        customModules: prev.personalInfo.customModules.map(module => 
          module.id === moduleId 
            ? { ...module, content: module.content.filter((_, i) => i !== itemIndex) }
            : module
        )
      }
    }))
  }

  // Handle form submission
  const handleGenerateCV = async () => {
    if (!jdTitle || !company || !jdDescription) {
      alert('Please fill in all JD fields')
      return
    }

    if (!config.personalInfo.fullName || !config.personalInfo.email) {
      alert('Please fill in basic personal information (Name & Email)')
      return
    }

    setIsGenerating(true)
    setShowProgress(true)
    setCurrentStep('validating')
    setStepNumber(1)

    try {
      // Step 1: Validate data (already done above)
      setCurrentStep('ai-generating')
      setStepNumber(2)

      // Step 2: Call n8n webhook to get AI-generated experience
      const webhookResponse = await fetch('https://agentworkflow.stanleyhi.com/webhook/cf88dabc-821e-4ce5-b78a-d2699bfa1851', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: jdTitle,
          full_job_description: jdDescription
        })
      })

      if (!webhookResponse.ok) {
        throw new Error('Failed to get AI experience from n8n workflow')
      }

      const aiExperienceRaw = await webhookResponse.text()
      
      // Enhanced parsing to handle both single and double nested JSON responses
      const parseAIResponse = (rawResponse: string): string => {
        try {
          const firstParse = JSON.parse(rawResponse)
          
          // Priority check for output field
          if (firstParse.output !== undefined) {
            const outputValue = firstParse.output
            
            // If output is string, attempt second parsing
            if (typeof outputValue === 'string') {
              try {
                const secondParse = JSON.parse(outputValue)
                // Use strict check instead of || operator
                return secondParse.output !== undefined ? secondParse.output : outputValue
              } catch {
                // Second parse failed, it's normal text content
                return outputValue
              }
            }
            
            // Output is not string, convert directly
            return String(outputValue)
          }
          
          // No output field, return string representation of parsed object
          return String(firstParse)
        } catch {
          // Not JSON, return original text
          return rawResponse
        }
      }

      const aiExperience = parseAIResponse(aiExperienceRaw)
      setCurrentStep('merging')
      setStepNumber(3)

      // Step 3: Merge data (personal info + AI experience)
      const completeResumeData = {
        personalInfo: config.personalInfo,
        aiGeneratedExperience: aiExperience,
        format: config.format,
        jobTitle: jdTitle
      }

      // Step 4: Generate and Download PDF with JD2CV 2.0 API
      setCurrentStep('pdf-generating')
      setStepNumber(4)
      const pdfResponse = await fetch('/api/ai-agent-gala/jd2cv2/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeResumeData)
      })

      if (!pdfResponse.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Download the PDF
      const blob = await pdfResponse.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${config.personalInfo.fullName.replace(/[^a-z0-9]/gi, '_')}_${jdTitle.replace(/[^a-z0-9]/gi, '_')}_Resume.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setCurrentStep('completed')
      setStepNumber(4)
      
      // Store AI experience and enable Cover Letter generation
      setAiExperience(aiExperience)
      setCoverLetterState(prev => ({ 
        ...prev, 
        available: true,
        // Reset previous generation state if any
        generated: false,
        content: null,
        error: null
      }))
      
      // Hide progress after showing completion
      setTimeout(() => {
        setShowProgress(false)
      }, 2500)
      
    } catch (error) {
      console.error('Error generating CV:', error)
      alert(`Failed to generate CV: ${error.message || 'Unknown error'}`)
      setShowProgress(false)
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle Cover Letter generation
  const handleGenerateCoverLetter = async () => {
    setCoverLetterState(prev => ({ 
      ...prev, 
      generating: true, 
      error: null,
      generated: false
    }))

    try {
      const response = await fetch('/api/ai-agent-gala/jd2cv2/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: config.personalInfo,
          jdInfo: {
            title: jdTitle,
            company: company,
            description: jdDescription
          },
          tailoredExperience: aiExperience,
          userPrompt: coverLetterState.userPrompt,
          aiModel: coverLetterState.aiModel
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success && result.coverLetter) {
        setCoverLetterState(prev => ({
          ...prev,
          generating: false,
          generated: true,
          content: result.coverLetter
        }))

        // Automatically generate and download PDF
        try {
          const pdfResponse = await fetch('/api/ai-agent-gala/jd2cv2/generate-cover-letter-pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              coverLetterContent: result.coverLetter,
              personalInfo: config.personalInfo,
              jdInfo: {
                title: jdTitle,
                company: company,
                description: jdDescription
              },
              format: config.format
            })
          })

          if (pdfResponse.ok) {
            // Download the PDF
            const blob = await pdfResponse.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            const cleanName = config.personalInfo.fullName.replace(/[^a-z0-9]/gi, '_')
            const cleanCompany = company.replace(/[^a-z0-9]/gi, '_')
            const cleanPosition = jdTitle.replace(/[^a-z0-9]/gi, '_')
            a.download = `${cleanName}_${cleanCompany}_${cleanPosition}_CoverLetter.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          } else {
            console.error('PDF generation failed:', pdfResponse.statusText)
            // Don't show error to user, just log it - text generation was successful
          }
        } catch (pdfError) {
          console.error('PDF generation error:', pdfError)
          // Don't show error to user, just log it - text generation was successful
        }
      } else {
        throw new Error(result.error || 'Failed to generate cover letter')
      }

    } catch (error) {
      console.error('Cover Letter generation error:', error)
      setCoverLetterState(prev => ({
        ...prev,
        generating: false,
        error: error.message || 'Unknown error occurred'
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 pb-60">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            JD2CV 2.0
          </h1>
          <p className="text-gray-600 mb-4">
            Generate professional resumes with AI-powered experience matching
          </p>
          
          {/* Image */}
          <div className="mb-4 flex justify-center">
            <img 
              src="/images/AI Agent - JD2CV 2.0.png" 
              alt="JD2CV 2.0 Interface"
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          </div>
          
          {/* Additional Information */}
          <div className="bg-purple-50/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Requirements:</span> Requires integration with{' '}
              <Link 
                href="/jd2cv-full" 
                className="text-purple-600 hover:text-purple-700 font-medium underline decoration-purple-200 hover:decoration-purple-400 transition-colors"
              >
                JD2CV 1.0
              </Link>{' '}
              or contact{' '}
              <a 
                href="mailto:stanleytonight@hotmail.com" 
                className="text-purple-600 hover:text-purple-700 font-medium underline decoration-purple-200 hover:decoration-purple-400 transition-colors"
              >
                stanleytonight@hotmail.com
              </a>{' '}
              for custom setup.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Speed:</span> Generate customized CV in one click, takes 2-3 minutes.
            </p>
          </div>
        </div>

        {/* JD Input Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Job Description</h2>
            <button
              onClick={handleGenerateCV}
              disabled={isGenerating}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                isGenerating
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Resume PDF'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Job Title</label>
              <input
                type="text"
                value={jdTitle}
                onChange={(e) => setJdTitle(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="e.g. Google"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Job Description</label>
            <textarea
              value={jdDescription}
              onChange={(e) => setJdDescription(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none transition-colors"
              placeholder="Paste the complete job description here..."
            />
          </div>
        </div>

        {/* PDF Setup Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <input
                type="text"
                value={config.personalInfo.fullName}
                onChange={(e) => {
                  setConfig(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                  }))
                              }}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={config.personalInfo.email}
                onChange={(e) => {
                  setConfig(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, email: e.target.value }
                  }))
                              }}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <input
                type="text"
                value={config.personalInfo.phone}
                onChange={(e) => {
                  setConfig(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))
                              }}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
              <input
                type="text"
                value={config.personalInfo.location}
                onChange={(e) => {
                  setConfig(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, location: e.target.value }
                  }))
                              }}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">LinkedIn</label>
              <input
                type="text"
                value={config.personalInfo.linkedin}
                onChange={(e) => {
                  setConfig(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                  }))
                              }}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Website</label>
              <input
                type="text"
                value={config.personalInfo.website}
                onChange={(e) => {
                  setConfig(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, website: e.target.value }
                  }))
                              }}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="yourwebsite.com"
              />
            </div>
          </div>

          {/* Summary Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600">Professional Summary</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSummaryItem}
                onChange={(e) => setNewSummaryItem(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Add a summary point..."
                onKeyPress={(e) => e.key === 'Enter' && addSummaryItem()}
              />
              <button
                onClick={addSummaryItem}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add
              </button>
            </div>
            {config.personalInfo.summary.length > 0 && (
              <div className="space-y-2">
                {config.personalInfo.summary.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-700">{item}</span>
                    <button
                      onClick={() => removeSummaryItem(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technical Skills Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600">Technical Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Add a skill..."
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add
              </button>
            </div>
            {config.personalInfo.technicalSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {config.personalInfo.technicalSkills.map((skill, index) => (
                  <div key={index} className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-purple-500 hover:text-purple-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Languages Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600">Languages</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Add a language..."
                onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
              />
              <button
                onClick={addLanguage}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add
              </button>
            </div>
            {config.personalInfo.languages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {config.personalInfo.languages.map((language, index) => (
                  <div key={index} className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                    <span>{language}</span>
                    <button
                      onClick={() => removeLanguage(index)}
                      className="ml-2 text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600">Education</label>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={newEducation.degree}
                onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                className="flex-1 min-w-[140px] px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-sm"
                placeholder="Degree"
              />
              <input
                type="text"
                value={newEducation.institution}
                onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                className="flex-1 min-w-[140px] px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-sm"
                placeholder="Institution"
              />
              <input
                type="text"
                value={newEducation.year}
                onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                className="w-20 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-sm"
                placeholder="Year"
              />
              <input
                type="text"
                value={newEducation.gpa}
                onChange={(e) => setNewEducation(prev => ({ ...prev, gpa: e.target.value }))}
                className="w-16 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-sm"
                placeholder="GPA"
              />
              <button
                onClick={addEducation}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm whitespace-nowrap"
              >
                Add
              </button>
            </div>
            {config.personalInfo.education.length > 0 && (
              <div className="space-y-2">
                {config.personalInfo.education.map((edu, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-700">
                      {edu.degree} at {edu.institution} ({edu.year})
                      {edu.gpa && ` - GPA: ${edu.gpa}`}
                    </span>
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certificates Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600">Certificates</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCertificate}
                onChange={(e) => setNewCertificate(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Add a certificate..."
                onKeyPress={(e) => e.key === 'Enter' && addCertificate()}
              />
              <button
                onClick={addCertificate}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add
              </button>
            </div>
            {config.personalInfo.certificates.length > 0 && (
              <div className="space-y-2">
                {config.personalInfo.certificates.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-700">{cert}</span>
                    <button
                      onClick={() => removeCertificate(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Modules Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-600">Custom Modules</label>
              <button
                onClick={() => {
                  if (newCustomModuleTitle.trim()) {
                    addCustomModule()
                  } else {
                    setNewCustomModuleTitle('New Module')
                    setTimeout(() => {
                      const input = document.querySelector('input[placeholder="Module title..."]') as HTMLInputElement
                      if (input) {
                        input.focus()
                        input.select()
                      }
                    }, 100)
                  }
                }}
                className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Module
              </button>
            </div>

            {/* Add new module input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCustomModuleTitle}
                onChange={(e) => setNewCustomModuleTitle(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Module title..."
                onKeyPress={(e) => e.key === 'Enter' && addCustomModule()}
              />
              <button
                onClick={addCustomModule}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Create
              </button>
            </div>

            {/* Existing custom modules */}
            {config.personalInfo.customModules.map((module) => (
              <div key={module.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">{module.title}</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (currentEditingModuleId === module.id) {
                          setCurrentEditingModuleId(null)
                          setNewCustomModuleItem('')
                        } else {
                          setCurrentEditingModuleId(module.id)
                          setNewCustomModuleItem('')
                        }
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      {currentEditingModuleId === module.id ? 'Done' : 'Edit'}
                    </button>
                    <button
                      onClick={() => removeCustomModule(module.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Add content input when editing */}
                {currentEditingModuleId === module.id && (
                  <div className="mb-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCustomModuleItem}
                        onChange={(e) => setNewCustomModuleItem(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="Add content item..."
                        onKeyPress={(e) => e.key === 'Enter' && addCustomModuleItem(module.id)}
                      />
                      <button
                        onClick={() => addCustomModuleItem(module.id)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Module content */}
                {module.content.length > 0 && (
                  <div className="space-y-2">
                    {module.content.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg">
                        <span className="text-sm text-gray-700">• {item}</span>
                        <button
                          onClick={() => removeCustomModuleItem(module.id, index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {module.content.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No content added yet</p>
                )}
              </div>
            ))}

            {config.personalInfo.customModules.length === 0 && (
              <p className="text-sm text-gray-500 italic text-center py-4">
                No custom modules created. Click "Add Module" to create your first custom section.
              </p>
            )}
          </div>
        </div>

        {/* Cover Letter Generator - Conditionally shown after CV generation */}
        {coverLetterState.available && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              📝 Cover Letter Generator
            </h2>
            
            <div className="text-sm text-purple-600 mb-4 bg-purple-50/50 rounded-lg p-3">
              <p><strong>Auto-included data:</strong> Personal Info + Job Details + Tailored Resume Content</p>
              <p className="text-xs mt-1 text-purple-500">Placeholders {`{personal_info}`}, {`{jd_info}`}, {`{tailored_experience}`} will be automatically populated.</p>
              <p className="text-xs mt-2 text-indigo-600 font-medium">📄 Generates both text preview + PDF download automatically</p>
            </div>
            
            <div className="space-y-4">
              {/* Prompt Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customize Requirements (Optional)
                </label>
                <textarea
                  value={coverLetterState.userPrompt}
                  onChange={(e) => setCoverLetterState(prev => ({ ...prev, userPrompt: e.target.value }))}
                  rows={12}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Modify the prompt or use the default template..."
                />
              </div>
              
              {/* AI Model Selection */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">AI Model:</label>
                <select 
                  value={coverLetterState.aiModel}
                  onChange={(e) => setCoverLetterState(prev => ({ ...prev, aiModel: e.target.value as 'openai' | 'deepseek' }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
                >
                  <option value="deepseek">DeepSeek (Recommended)</option>
                  <option value="openai">OpenAI GPT-4</option>
                </select>
              </div>
              
              {/* Generate Button */}
              <button
                onClick={handleGenerateCoverLetter}
                disabled={coverLetterState.generating}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {coverLetterState.generating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Cover Letter + PDF...
                  </div>
                ) : (
                  'Generate Cover Letter + PDF'
                )}
              </button>
              
              {/* Error Display */}
              {coverLetterState.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{coverLetterState.error}</p>
                  <button 
                    onClick={handleGenerateCoverLetter}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {/* Success Result Display */}
              {coverLetterState.generated && coverLetterState.content && (
                <div className="p-4 bg-white border border-purple-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-purple-900">Generated Cover Letter</h4>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(coverLetterState.content || '')
                        alert('Cover letter copied to clipboard!')
                      }}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 max-h-64 overflow-y-auto bg-gray-50 p-3 rounded border">
                    {coverLetterState.content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Tooltip */}
        <ProgressTooltip 
          show={showProgress}
          currentStep={currentStep}
          stepNumber={stepNumber}
          totalSteps={4}
        />
      </div>
    </div>
  )
}