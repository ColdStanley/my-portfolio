'use client'

import { useState } from 'react'
import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'

export default function AIReviewModal() {
  const {
    ai: { generatedContent },
    resetAIState
  } = useSwiftApplyStore()

  const [editedWorkExperience, setEditedWorkExperience] = useState(
    generatedContent?.workExperience || ''
  )
  const [editedPersonalInfoText, setEditedPersonalInfoText] = useState(
    JSON.stringify(generatedContent?.personalInfo || {}, null, 2)
  )
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleConfirm = async () => {
    setError(null)

    // Validate personal info JSON
    let parsedPersonalInfo: any
    try {
      parsedPersonalInfo = JSON.parse(editedPersonalInfoText)
      if (!parsedPersonalInfo || typeof parsedPersonalInfo !== 'object' || Array.isArray(parsedPersonalInfo)) {
        throw new Error('Personal info must be a JSON object')
      }
    } catch (error) {
      setError('Personal info must be valid JSON. Please correct and try again.')
      return
    }

    // Validate work experience
    const trimmedWorkExperience = editedWorkExperience.trim()
    if (!trimmedWorkExperience) {
      setError('Work experience cannot be empty.')
      return
    }

    setIsGeneratingPDF(true)

    try {
      // Call PDF generation API
      const response = await fetch('/api/swiftapply/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: parsedPersonalInfo,
          workExperience: trimmedWorkExperience,
          format: parsedPersonalInfo.format || 'A4'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Download PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url

      // Extract job title from work experience
      let jobTitle = 'Resume'
      if (trimmedWorkExperience) {
        const firstLine = trimmedWorkExperience.split('\n')[0]?.trim() || ''
        if (firstLine.includes('|')) {
          // Pattern: Company | Role | Time
          const parts = firstLine.split('|').map(p => p.trim())
          jobTitle = parts[1] || 'Resume'
        } else if (firstLine.includes('–') || firstLine.includes('-')) {
          // Pattern: Company – Role or Role – Company
          const parts = firstLine.split(/[–-]/).map(p => p.trim())
          jobTitle = parts[1] || parts[0] || 'Resume'
        } else {
          // Use first meaningful word/phrase
          const words = firstLine.split(' ').filter(w => w.length > 2)
          jobTitle = words.slice(0, 2).join('_') || 'Resume'
        }
      }

      // Generate filename: name_title_resume.pdf
      const cleanName = (parsedPersonalInfo.fullName || 'Name').replace(/[^a-z0-9]/gi, '_')
      const cleanTitle = jobTitle.replace(/[^a-z0-9]/gi, '_')
      a.download = `${cleanName}_${cleanTitle}_Resume.pdf`

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Keep panels visible after PDF download
      // Do not reset AI state - user wants panels to persist

    } catch (error) {
      console.error('PDF generation error:', error)
      setError((error as Error)?.message || 'Failed to generate PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleCancel = () => {
    // Keep panels visible - only close if user explicitly wants to clear everything
    // resetAIState()
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 h-full flex flex-col border border-neutral-dark">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-dark px-6 py-4">
        <div>
          <div className="text-lg font-semibold text-text-primary">Review & Download</div>
          <div className="text-xs text-text-secondary">Edit the content below before downloading your PDF</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-8 w-8 p-0"
          aria-label="Close review dialog"
        >
          ×
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Work Experience */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-primary" htmlFor="work-experience">
            AI-Generated Work Experience
          </label>
          <Input
            id="work-experience"
            multiline
            rows={12}
            value={editedWorkExperience}
            onChange={event => setEditedWorkExperience(event.target.value)}
            placeholder="AI-generated work experience will appear here..."
            className="resize-none"
          />
          <p className="text-xs text-text-muted">
            Review and edit the AI-generated experience content
          </p>
        </div>

        {/* Personal Info */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-primary" htmlFor="personal-info">
            Personal Information (JSON)
          </label>
          <Input
            id="personal-info"
            multiline
            rows={12}
            value={editedPersonalInfoText}
            onChange={event => setEditedPersonalInfoText(event.target.value)}
            placeholder="Personal information JSON..."
            className="font-mono resize-none"
          />
          <p className="text-xs text-text-muted">
            Must be valid JSON format. Do not rename fields.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-neutral-dark px-6 py-4">
        <span className="text-sm text-text-secondary">Review your AI-generated resume content before downloading</span>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isGeneratingPDF}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isGeneratingPDF}
            className="px-6"
          >
            {isGeneratingPDF ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Generating PDF...
              </div>
            ) : (
              'Confirm & Download PDF'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}