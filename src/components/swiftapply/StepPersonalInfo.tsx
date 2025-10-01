'use client'

import { useState, useEffect } from 'react'
import { useSwiftApplyStore, type PersonalInfo } from '@/lib/swiftapply/store'
import { getDefaultPersonalInfo } from '@/lib/swiftapply/localStorage'
import { validatePersonalInfo, parseMultilineToArray, arrayToMultiline, isValidEmail, isValidPhone, isValidUrl } from '@/lib/swiftapply/utils'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'

export default function StepPersonalInfo() {
  const { personalInfo, setPersonalInfo, openSettings } = useSwiftApplyStore()

  // Local form state
  const [formData, setFormData] = useState<PersonalInfo>(() =>
    personalInfo || getDefaultPersonalInfo()
  )
  const [errors, setErrors] = useState<string[]>([])

  // Temporary input states for add-mode fields
  const [summaryInput, setSummaryInput] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [languageInput, setLanguageInput] = useState('')
  const [certificateInput, setCertificateInput] = useState('')

  // Sync with store when personalInfo changes
  useEffect(() => {
    if (personalInfo) {
      setFormData(personalInfo)
    }
  }, [personalInfo])

  // Handle field changes
  const handleChange = (field: keyof PersonalInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle array field changes (summary, skills, etc.)
  const handleArrayChange = (field: keyof PersonalInfo, value: string) => {
    const arrayValue = parseMultilineToArray(value)
    handleChange(field, arrayValue)
  }

  // Handle education changes
  const handleEducationChange = (index: number, field: string, value: string) => {
    const updated = [...formData.education]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('education', updated)
  }

  const addEducation = () => {
    handleChange('education', [
      ...formData.education,
      { degree: '', institution: '', year: '', gpa: '' }
    ])
  }

  const removeEducation = (index: number) => {
    const updated = formData.education.filter((_, i) => i !== index)
    handleChange('education', updated)
  }

  // Handle custom modules
  const handleCustomModuleChange = (index: number, field: string, value: any) => {
    const updated = [...formData.customModules]
    if (field === 'content') {
      updated[index] = { ...updated[index], [field]: parseMultilineToArray(value) }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    handleChange('customModules', updated)
  }

  const addCustomModule = () => {
    handleChange('customModules', [
      ...formData.customModules,
      { id: Date.now().toString(), title: '', content: [] }
    ])
  }

  const removeCustomModule = (index: number) => {
    const updated = formData.customModules.filter((_, i) => i !== index)
    handleChange('customModules', updated)
  }

  // Handle add-mode fields
  const addSummary = () => {
    if (summaryInput.trim()) {
      handleChange('summary', [...formData.summary, summaryInput.trim()])
      setSummaryInput('')
    }
  }

  const removeSummary = (index: number) => {
    const updated = formData.summary.filter((_, i) => i !== index)
    handleChange('summary', updated)
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      handleChange('technicalSkills', [...formData.technicalSkills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (index: number) => {
    const updated = formData.technicalSkills.filter((_, i) => i !== index)
    handleChange('technicalSkills', updated)
  }

  const addLanguage = () => {
    if (languageInput.trim()) {
      handleChange('languages', [...formData.languages, languageInput.trim()])
      setLanguageInput('')
    }
  }

  const removeLanguage = (index: number) => {
    const updated = formData.languages.filter((_, i) => i !== index)
    handleChange('languages', updated)
  }

  const addCertificate = () => {
    if (certificateInput.trim()) {
      handleChange('certificates', [...formData.certificates, certificateInput.trim()])
      setCertificateInput('')
    }
  }

  const removeCertificate = (index: number) => {
    const updated = formData.certificates.filter((_, i) => i !== index)
    handleChange('certificates', updated)
  }

  // Validation and save
  const handleSaveAndContinue = () => {
    const validationErrors = validatePersonalInfo(formData)

    // Additional email validation
    if (formData.email && !isValidEmail(formData.email)) {
      validationErrors.push('Please enter a valid email address')
    }

    // Additional phone validation
    if (formData.phone && !isValidPhone(formData.phone)) {
      validationErrors.push('Please enter a valid phone number')
    }

    // Additional URL validation
    if (formData.linkedin && !isValidUrl(formData.linkedin)) {
      validationErrors.push('Please enter a valid LinkedIn URL')
    }

    if (formData.website && !isValidUrl(formData.website)) {
      validationErrors.push('Please enter a valid website URL')
    }


    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      setPersonalInfo(formData)
      openSettings(2)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col p-4 sm:p-6 max-h-[70vh] sm:max-h-[75vh]">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-6 pb-28 sm:pb-32">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Full Name *
              </label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Phone
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Location
              </label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="City, State/Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                LinkedIn
              </label>
              <Input
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Website
              </label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Professional Summary
          </label>

          {/* Added items */}
          {formData.summary.length > 0 && (
            <div className="space-y-2 mb-3">
              {formData.summary.map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-neutral-light/50 rounded border border-neutral-mid">
                  <span className="flex-1 text-sm text-text-primary">{item}</span>
                  <Button
                    onClick={() => removeSummary(index)}
                    variant="ghost"
                    size="sm"
                    className="text-error hover:brightness-90 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add new item */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSummary()
                }
              }}
              placeholder="Experienced software developer with 5+ years..."
              className="flex-1"
            />
            <Button
              onClick={addSummary}
              variant="primary"
              size="md"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Skills and Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Technical Skills */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Technical Skills
            </label>

            {/* Added items */}
            {formData.technicalSkills.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.technicalSkills.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-neutral-light/50 rounded border border-neutral-mid">
                    <span className="flex-1 text-sm text-text-primary">{item}</span>
                    <Button
                      onClick={() => removeSkill(index)}
                      variant="ghost"
                      size="sm"
                      className="text-error hover:brightness-90 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new item */}
            <div className="flex gap-2">
              <Input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }}
                placeholder="e.g., React, Python, Node.js"
                className="flex-1"
              />
              <Button
                onClick={addSkill}
                variant="primary"
                size="md"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Languages
            </label>

            {/* Added items */}
            {formData.languages.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.languages.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-neutral-light/50 rounded border border-neutral-mid">
                    <span className="flex-1 text-sm text-text-primary">{item}</span>
                    <Button
                      onClick={() => removeLanguage(index)}
                      variant="ghost"
                      size="sm"
                      className="text-error hover:brightness-90 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new item */}
            <div className="flex gap-2">
              <Input
                type="text"
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addLanguage()
                  }
                }}
                placeholder="e.g., English (Native)"
                className="flex-1"
              />
              <Button
                onClick={addLanguage}
                variant="primary"
                size="md"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Education */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Education</h3>
            <Button
              onClick={addEducation}
              variant="primary"
              size="sm"
            >
              Add Education
            </Button>
          </div>

          {formData.education.map((edu, index) => (
            <div key={index} className="border border-neutral-mid rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-text-primary">
                  Education {index + 1}
                </span>
                <Button
                  onClick={() => removeEducation(index)}
                  variant="ghost"
                  size="sm"
                  className="text-error hover:brightness-90 text-sm"
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Degree
                  </label>
                  <Input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    placeholder="Bachelor of Science in Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Institution
                  </label>
                  <Input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    placeholder="University Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Year
                  </label>
                  <Input
                    type="text"
                    value={edu.year}
                    onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                    placeholder="2020"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    GPA (Optional)
                  </label>
                  <Input
                    type="text"
                    value={edu.gpa || ''}
                    onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                    placeholder="3.8"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Certifications
          </label>

          {/* Added items */}
          {formData.certificates.length > 0 && (
            <div className="space-y-2 mb-3">
              {formData.certificates.map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-neutral-light/50 rounded border border-neutral-mid">
                  <span className="flex-1 text-sm text-text-primary">{item}</span>
                  <Button
                    onClick={() => removeCertificate(index)}
                    variant="ghost"
                    size="sm"
                    className="text-error hover:brightness-90 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add new item */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={certificateInput}
              onChange={(e) => setCertificateInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCertificate()
                }
              }}
              placeholder="e.g., AWS Certified Solutions Architect"
              className="flex-1"
            />
            <Button
              onClick={addCertificate}
              variant="primary"
              size="md"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Custom Modules */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Custom Sections</h3>
            <Button
              onClick={addCustomModule}
              variant="primary"
              size="sm"
            >
              Add Section
            </Button>
          </div>

          {formData.customModules.map((module, index) => (
            <div key={module.id} className="border border-neutral-mid rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-text-primary">
                  Section {index + 1}
                </span>
                <Button
                  onClick={() => removeCustomModule(index)}
                  variant="ghost"
                  size="sm"
                  className="text-error hover:brightness-90 text-sm"
                >
                  Remove
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Section Title
                  </label>
                  <Input
                    type="text"
                    value={module.title}
                    onChange={(e) => handleCustomModuleChange(index, 'title', e.target.value)}
                    placeholder="Projects, Publications, Awards, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Content
                  </label>
                  <p className="text-xs text-text-secondary mb-2">One item per line</p>
                  <Input
                    multiline
                    rows={3}
                    value={arrayToMultiline(module.content)}
                    onChange={(e) => handleCustomModuleChange(index, 'content', e.target.value)}
                    placeholder="• Built a web application that serves 10,000+ users..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Format Selection and Actions Row */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Format Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Resume Format
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="A4"
                  checked={formData.format === 'A4'}
                  onChange={(e) => handleChange('format', e.target.value as 'A4' | 'Letter')}
                  className="mr-2 text-primary focus:ring-primary"
                />
                A4 (210 × 297 mm)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="Letter"
                  checked={formData.format === 'Letter'}
                  onChange={(e) => handleChange('format', e.target.value as 'A4' | 'Letter')}
                  className="mr-2 text-primary focus:ring-primary"
                />
                Letter (8.5 × 11 in)
              </label>
            </div>
          </div>

          {/* Right: Error Messages and Actions */}
          <div className="flex-1 space-y-4">
            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="p-4 bg-error/5 border border-error/20 rounded-lg">
                <h4 className="text-sm font-medium text-error mb-2">Please fix the following errors:</h4>
                <ul className="list-disc list-inside text-sm text-error space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-neutral-mid">
              <Button
                onClick={handleSaveAndContinue}
                variant="primary"
                size="md"
              >
                Save & Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
