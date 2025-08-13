'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useWorkspaceStore } from '../store/workspaceStore'

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
    education: Array<{
      degree: string
      institution: string
      year: string
      gpa?: string
    }>
    certificates: string[]
  }
}

interface PDFSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: PDFConfig) => void
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

export default function PDFSetupModal({ isOpen, onClose, onSave }: PDFSetupModalProps) {
  const { user } = useAuthStore()
  const { selectedExperiences, optimizedExperiences } = useWorkspaceStore()
  
  const [config, setConfig] = useState<PDFConfig>(defaultConfig)

  const [newSummaryItem, setNewSummaryItem] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [newCertificate, setNewCertificate] = useState('')
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false)

  // Load existing config only on first open
  useEffect(() => {
    if (user && isOpen && !hasLoadedConfig) {
      // Try to load draft first (from current session)
      const draftKey = `pdf-draft-${user.id}`
      const savedKey = `oneclick-pdf-data-${user.id}`
      
      const draft = sessionStorage.getItem(draftKey)
      const stored = localStorage.getItem(savedKey)
      
      // Priority: draft > saved > default
      const dataToLoad = draft || stored
      
      if (dataToLoad) {
        try {
          const loadedConfig = JSON.parse(dataToLoad)
          // Validate and merge with default config to ensure all fields exist
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
          // Reset to default config on error
          setConfig(defaultConfig)
        }
      }
      
      setHasLoadedConfig(true)
    }
  }, [user, isOpen, hasLoadedConfig])

  // Auto-save draft while editing
  useEffect(() => {
    if (user && isOpen && hasLoadedConfig) {
      // Save current state as draft
      sessionStorage.setItem(`pdf-draft-${user.id}`, JSON.stringify(config))
    }
  }, [config, user, isOpen, hasLoadedConfig])

  const handleSave = () => {
    if (user) {
      localStorage.setItem(`oneclick-pdf-data-${user.id}`, JSON.stringify(config))
      // Clear draft after successful save
      sessionStorage.removeItem(`pdf-draft-${user.id}`)
      onSave(config)
      handleClose()
    }
  }

  const handleClose = () => {
    // Reset loaded flag for next open
    setHasLoadedConfig(false)
    onClose()
  }

  const handleCancel = () => {
    if (user) {
      // Clear draft on cancel
      sessionStorage.removeItem(`pdf-draft-${user.id}`)
    }
    handleClose()
  }

  const addArrayItem = (field: keyof Pick<PDFConfig['personalInfo'], 'summary' | 'technicalSkills' | 'languages' | 'certificates'>, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setConfig(prev => ({
        ...prev,
        personalInfo: {
          ...defaultPersonalInfo,
          ...prev.personalInfo,
          [field]: [...(prev.personalInfo?.[field] || []), value.trim()]
        }
      }))
      setter('')
    }
  }

  const removeArrayItem = (field: keyof Pick<PDFConfig['personalInfo'], 'summary' | 'technicalSkills' | 'languages' | 'certificates'>, index: number) => {
    setConfig(prev => ({
      ...prev,
      personalInfo: {
        ...defaultPersonalInfo,
        ...prev.personalInfo,
        [field]: (prev.personalInfo?.[field] || []).filter((_, i) => i !== index)
      }
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">PDF Setup Configuration</h2>
            <button
              onClick={handleClose}
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
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">PDF Format</h3>
            <div className="flex gap-4">
              {['A4', 'Letter'].map((format) => (
                <label key={format} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={config.format === format}
                    onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as 'A4' | 'Letter' }))}
                    className="text-purple-500"
                  />
                  <span className="text-sm">{format}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section Toggles */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Include Sections</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'includePersonalInfo', label: 'Personal Information' },
                { key: 'includeSummary', label: 'Professional Summary' },
                { key: 'includeSkills', label: 'Skills' },
                { key: 'includeEducation', label: 'Education' },
                { key: 'includeCertificates', label: 'Certifications' },
                { key: 'includeExperiences', label: 'Work Experience' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config[key as keyof PDFConfig] as boolean}
                    onChange={(e) => setConfig(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="text-purple-500"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
            <h3 className="font-medium text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={config.personalInfo?.fullName || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    personalInfo: { ...defaultPersonalInfo, ...prev.personalInfo, fullName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={config.personalInfo?.email || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    personalInfo: { ...defaultPersonalInfo, ...prev.personalInfo, email: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={config.personalInfo?.phone || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    personalInfo: { ...defaultPersonalInfo, ...prev.personalInfo, phone: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={config.personalInfo?.location || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    personalInfo: { ...defaultPersonalInfo, ...prev.personalInfo, location: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="text"
                  value={config.personalInfo?.linkedin || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    personalInfo: { ...defaultPersonalInfo, ...prev.personalInfo, linkedin: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  value={config.personalInfo?.website || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    personalInfo: { ...defaultPersonalInfo, ...prev.personalInfo, website: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
            <h3 className="font-medium text-gray-800 mb-4">Professional Summary</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSummaryItem}
                onChange={(e) => setNewSummaryItem(e.target.value)}
                placeholder="Add summary point..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addArrayItem('summary', newSummaryItem, setNewSummaryItem)}
              />
              <button
                onClick={() => addArrayItem('summary', newSummaryItem, setNewSummaryItem)}
                className="w-24 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {(config.personalInfo?.summary || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-sm">{item}</span>
                  <button
                    onClick={() => removeArrayItem('summary', index)}
                    className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center justify-center text-xs transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
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
                  placeholder="Add skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('technicalSkills', newSkill, setNewSkill)}
                />
                <button
                  onClick={() => addArrayItem('technicalSkills', newSkill, setNewSkill)}
                  className="w-16 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(config.personalInfo?.technicalSkills || []).map((skill, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    {skill}
                    <button
                      onClick={() => removeArrayItem('technicalSkills', index)}
                      className="text-purple-600 hover:text-purple-800 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
              <h3 className="font-medium text-gray-800 mb-4">Languages</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Add language..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('languages', newLanguage, setNewLanguage)}
                />
                <button
                  onClick={() => addArrayItem('languages', newLanguage, setNewLanguage)}
                  className="w-16 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(config.personalInfo?.languages || []).map((language, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {language}
                    <button
                      onClick={() => removeArrayItem('languages', index)}
                      className="text-blue-600 hover:text-blue-800 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
            <h3 className="font-medium text-gray-800 mb-4">Certifications</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCertificate}
                onChange={(e) => setNewCertificate(e.target.value)}
                placeholder="Add certification..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addArrayItem('certificates', newCertificate, setNewCertificate)}
              />
              <button
                onClick={() => addArrayItem('certificates', newCertificate, setNewCertificate)}
                className="w-24 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {(config.personalInfo?.certificates || []).map((cert, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-sm">{cert}</span>
                  <button
                    onClick={() => removeArrayItem('certificates', index)}
                    className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center justify-center text-xs transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Selected Experiences</h3>
            <div className="text-sm text-gray-600">
              {selectedExperiences.length > 0 ? (
                <div className="space-y-2">
                  {selectedExperiences.map((exp) => (
                    <div key={exp.id} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span>{exp.company} - {exp.title}</span>
                      {optimizedExperiences[exp.id]?.isGenerated && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Optimized</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No experiences selected in workspace</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="w-24 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-24 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}