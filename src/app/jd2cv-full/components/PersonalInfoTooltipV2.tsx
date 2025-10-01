'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

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

interface PersonalInfo {
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
  format: 'A4' | 'Letter'
}

interface PersonalInfoTooltipV2Props {
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

const defaultPersonalInfo: PersonalInfo = {
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
  customModules: [],
  format: 'A4'
}

export default function PersonalInfoTooltipV2({ 
  className = '', 
  isOpen: externalIsOpen, 
  onClose: externalOnClose 
}: PersonalInfoTooltipV2Props) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = externalOnClose !== undefined ? 
    (value: boolean) => { if (!value) externalOnClose() } : 
    setInternalIsOpen
  const [isVisible, setIsVisible] = useState(false)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(defaultPersonalInfo)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Ensure component is mounted before using createPortal
  useEffect(() => {
    setMounted(true)
  }, [])

  // New item states
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

  // Load personal info from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('jd2cv-v2-personal-info')
    if (stored) {
      try {
        const loadedInfo = JSON.parse(stored)
        const validatedInfo: PersonalInfo = {
          ...defaultPersonalInfo,
          ...loadedInfo
        }
        setPersonalInfo(validatedInfo)
      } catch (error) {
        console.error('Failed to load personal info:', error)
        setPersonalInfo(defaultPersonalInfo)
      }
    }
    setIsDataLoaded(true)
  }, [])

  // Save to localStorage whenever personalInfo changes
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('jd2cv-v2-personal-info', JSON.stringify(personalInfo))
    }
  }, [personalInfo, isDataLoaded])

  // Animation control
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false)
        setTimeout(() => setIsOpen(false), 300) // Wait for animation
      }
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false)
        setTimeout(() => setIsOpen(false), 300)
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
  }, [isOpen])

  // Array management functions
  const addSummaryItem = () => {
    if (newSummaryItem.trim()) {
      setPersonalInfo(prev => ({
        ...prev,
        summary: [...prev.summary, newSummaryItem.trim()]
      }))
      setNewSummaryItem('')
    }
  }

  const removeSummaryItem = (index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      summary: prev.summary.filter((_, i) => i !== index)
    }))
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setPersonalInfo(prev => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter((_, i) => i !== index)
    }))
  }

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setPersonalInfo(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }))
      setNewLanguage('')
    }
  }

  const removeLanguage = (index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution && newEducation.year) {
      setPersonalInfo(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation }]
      }))
      setNewEducation({ degree: '', institution: '', year: '', gpa: '' })
    }
  }

  const removeEducation = (index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const addCertificate = () => {
    if (newCertificate.trim()) {
      setPersonalInfo(prev => ({
        ...prev,
        certificates: [...prev.certificates, newCertificate.trim()]
      }))
      setNewCertificate('')
    }
  }

  const removeCertificate = (index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
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
      setPersonalInfo(prev => ({
        ...prev,
        customModules: [...prev.customModules, newModule]
      }))
      setNewCustomModuleTitle('')
      setCurrentEditingModuleId(newModule.id)
    }
  }

  const removeCustomModule = (moduleId: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      customModules: prev.customModules.filter(module => module.id !== moduleId)
    }))
    if (currentEditingModuleId === moduleId) {
      setCurrentEditingModuleId(null)
      setNewCustomModuleItem('')
    }
  }

  const addCustomModuleItem = (moduleId: string) => {
    if (newCustomModuleItem.trim()) {
      setPersonalInfo(prev => ({
        ...prev,
        customModules: prev.customModules.map(module => 
          module.id === moduleId 
            ? { ...module, content: [...module.content, newCustomModuleItem.trim()] }
            : module
        )
      }))
      setNewCustomModuleItem('')
    }
  }

  const removeCustomModuleItem = (moduleId: string, itemIndex: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      customModules: prev.customModules.map(module => 
        module.id === moduleId 
          ? { ...module, content: module.content.filter((_, i) => i !== itemIndex) }
          : module
      )
    }))
  }

  return (
    <div className="relative" ref={tooltipRef}>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.5);
        }
        
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.3) rgba(0,0,0,0.1);
        }
      `}</style>
      <button
        onClick={() => {
          if (externalOnClose !== undefined) {
            // External control - only allow opening if currently closed
            if (!isOpen) {
              // This won't work for external control, but we keep it for compatibility
              console.warn('PersonalInfoTooltipV2: Cannot open with external control via internal button')
            }
          } else {
            // Internal control
            setIsOpen(!isOpen)
          }
        }}
        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors border border-gray-200 hover:border-gray-300"
        title="Personal Info V2"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Tooltip Modal - Using Portal */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <div 
            ref={tooltipRef}
            className={`relative bg-white/95 backdrop-blur-md rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar transition-all duration-300 ease-out ${
              isVisible 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 translate-y-2'
            }`}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Personal Information V2
                </h2>
                <button
                  onClick={() => {
                    setIsVisible(false)
                    setTimeout(() => setIsOpen(false), 300)
                  }}
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Format Selection */}
              <div className="bg-gray-50/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">PDF Format</h3>
                <div className="flex gap-4">
                  {['A4', 'Letter'].map((format) => (
                    <label key={format} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value={format}
                        checked={personalInfo.format === format}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, format: e.target.value as 'A4' | 'Letter' }))}
                        className="text-gray-600"
                      />
                      <span className="text-sm">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <h3 className="font-medium text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={personalInfo.linkedin}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                      placeholder="linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="text"
                      value={personalInfo.website}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                      placeholder="yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <h3 className="font-medium text-gray-800 mb-4">Professional Summary</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSummaryItem}
                    onChange={(e) => setNewSummaryItem(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                    placeholder="Add a summary point..."
                    onKeyPress={(e) => e.key === 'Enter' && addSummaryItem()}
                  />
                  <button
                    onClick={addSummaryItem}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {personalInfo.summary.length > 0 && (
                  <div className="space-y-2">
                    {personalInfo.summary.map((item, index) => (
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

              {/* Technical Skills & Languages */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                  <h3 className="font-medium text-gray-800 mb-4">Technical Skills</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {personalInfo.technicalSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {personalInfo.technicalSkills.map((skill, index) => (
                        <div key={index} className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          <span>{skill}</span>
                          <button
                            onClick={() => removeSkill(index)}
                            className="ml-2 text-gray-600 hover:text-purple-700 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                  <h3 className="font-medium text-gray-800 mb-4">Languages</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                      placeholder="Add a language..."
                      onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                    />
                    <button
                      onClick={addLanguage}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {personalInfo.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {personalInfo.languages.map((language, index) => (
                        <div key={index} className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          <span>{language}</span>
                          <button
                            onClick={() => removeLanguage(index)}
                            className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Education Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <h3 className="font-medium text-gray-800 mb-4">Education</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <input
                    type="text"
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                    className="flex-1 min-w-[140px] px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors text-sm"
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                    className="flex-1 min-w-[140px] px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors text-sm"
                    placeholder="Institution"
                  />
                  <input
                    type="text"
                    value={newEducation.year}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                    className="w-20 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors text-sm"
                    placeholder="Year"
                  />
                  <input
                    type="text"
                    value={newEducation.gpa}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, gpa: e.target.value }))}
                    className="w-16 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors text-sm"
                    placeholder="GPA"
                  />
                  <button
                    onClick={addEducation}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
                {personalInfo.education.length > 0 && (
                  <div className="space-y-2">
                    {personalInfo.education.map((edu, index) => (
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
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <h3 className="font-medium text-gray-800 mb-4">Certificates</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCertificate}
                    onChange={(e) => setNewCertificate(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                    placeholder="Add a certificate..."
                    onKeyPress={(e) => e.key === 'Enter' && addCertificate()}
                  />
                  <button
                    onClick={addCertificate}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {personalInfo.certificates.length > 0 && (
                  <div className="space-y-2">
                    {personalInfo.certificates.map((cert, index) => (
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
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800">Custom Modules</h3>
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
                    className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Module
                  </button>
                </div>

                {/* Add new module input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newCustomModuleTitle}
                    onChange={(e) => setNewCustomModuleTitle(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                    placeholder="Module title..."
                    onKeyPress={(e) => e.key === 'Enter' && addCustomModule()}
                  />
                  <button
                    onClick={addCustomModule}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Create
                  </button>
                </div>

                {/* Existing custom modules */}
                {personalInfo.customModules.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 mb-4">
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
                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                            placeholder="Add content item..."
                            onKeyPress={(e) => e.key === 'Enter' && addCustomModuleItem(module.id)}
                          />
                          <button
                            onClick={() => addCustomModuleItem(module.id)}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
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

                {personalInfo.customModules.length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4">
                    No custom modules created. Click "Add Module" to create your first custom section.
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(() => setIsOpen(false), 300)
                }}
                className="px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}