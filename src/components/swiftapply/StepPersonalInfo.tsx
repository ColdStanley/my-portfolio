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
    <div className="p-4 sm:p-6 max-h-[70vh] sm:max-h-[75vh] overflow-y-auto">
      <div className="space-y-6">
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
          <p className="text-xs text-text-secondary mb-2">One point per line</p>
          <Input
            multiline
            rows={3}
            value={arrayToMultiline(formData.summary)}
            onChange={(e) => handleArrayChange('summary', e.target.value)}
            placeholder="• Experienced software developer with 5+ years..."
          />
        </div>

        {/* Skills and Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Technical Skills
            </label>
            <p className="text-xs text-text-secondary mb-2">One skill per line</p>
            <Input
              multiline
              rows={4}
              value={arrayToMultiline(formData.technicalSkills)}
              onChange={(e) => handleArrayChange('technicalSkills', e.target.value)}
              placeholder="JavaScript
React
Node.js
Python"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Languages
            </label>
            <p className="text-xs text-text-secondary mb-2">One language per line</p>
            <Input
              multiline
              rows={4}
              value={arrayToMultiline(formData.languages)}
              onChange={(e) => handleArrayChange('languages', e.target.value)}
              placeholder="English (Native)
Spanish (Fluent)"
            />
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
                    className="text-sm"
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
                    className="text-sm"
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
                    className="text-sm"
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
                    className="text-sm"
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
          <p className="text-xs text-text-secondary mb-2">One certification per line</p>
          <Input
            multiline
            rows={3}
            value={arrayToMultiline(formData.certificates)}
            onChange={(e) => handleArrayChange('certificates', e.target.value)}
            placeholder="AWS Certified Solutions Architect
Google Cloud Professional"
          />
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
                    className="text-sm"
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
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Format Selection */}
        <div>
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
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-6 p-4 bg-error/5 border border-error/20 rounded-lg">
          <h4 className="text-sm font-medium text-error mb-2">Please fix the following errors:</h4>
          <ul className="list-disc list-inside text-sm text-error space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-neutral-mid">
        <Button
          onClick={handleSaveAndContinue}
          variant="primary"
          size="md"
        >
          Save & Continue
        </Button>
      </div>
    </div>
  )
}