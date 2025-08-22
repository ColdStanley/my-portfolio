'use client'

import { useState, useEffect } from 'react'
// Removed auth dependency for anonymous access
import ProgressTooltip from './ProgressTooltip'

interface Education {
  degree: string
  institution: string
  year: string
  gpa?: string
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
  certificates: []
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

  // Save config to localStorage whenever it changes
  const saveConfig = () => {
    localStorage.setItem('jd2cv2-pdf-data-anonymous', JSON.stringify(config))
  }

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
      saveConfig()
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
    saveConfig()
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
      saveConfig()
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
    saveConfig()
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
      saveConfig()
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
    saveConfig()
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
      saveConfig()
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
    saveConfig()
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
      saveConfig()
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
    saveConfig()
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
      const webhookResponse = await fetch('http://localhost:5678/webhook/cf88dabc-821e-4ce5-b78a-d2699bfa1851', {
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
      
      // Parse JSON response to extract the actual content
      let aiExperience = aiExperienceRaw
      try {
        const parsedResponse = JSON.parse(aiExperienceRaw)
        if (parsedResponse.output) {
          aiExperience = parsedResponse.output
          setCurrentStep('merging')
          setStepNumber(3)
        }
      } catch (error) {
        setCurrentStep('merging')
        setStepNumber(3)
      }

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

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 pb-60 overflow-y-auto">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            JD2CV 2.0
          </h1>
          <p className="text-gray-600">
            Generate professional resumes with AI-powered experience matching
          </p>
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
                  saveConfig()
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
                  saveConfig()
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
                  saveConfig()
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
                  saveConfig()
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
                  saveConfig()
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
                  saveConfig()
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                value={newEducation.degree}
                onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-sm"
                placeholder="Degree"
              />
              <input
                type="text"
                value={newEducation.institution}
                onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-sm"
                placeholder="Institution"
              />
              <input
                type="text"
                value={newEducation.year}
                onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-sm"
                placeholder="Year"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEducation.gpa}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, gpa: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-sm"
                  placeholder="GPA"
                />
                <button
                  onClick={addEducation}
                  className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  Add
                </button>
              </div>
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
        </div>

        {/* JD Input Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Description</h2>
          
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

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerateCV}
            disabled={isGenerating}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
              isGenerating
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isGenerating ? 'Generating Resume...' : 'Generate Resume PDF'}
          </button>
        </div>

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