'use client'

import { useState, useEffect } from 'react'
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

  // Update state when generatedContent changes
  useEffect(() => {
    if (generatedContent?.workExperience) {
      setEditedWorkExperience(generatedContent.workExperience)
    }
    if (generatedContent?.personalInfo) {
      setEditedPersonalInfoText(JSON.stringify(generatedContent.personalInfo, null, 2))
    }
  }, [generatedContent])

  // Show empty state if no generated content
  if (!generatedContent) {
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 h-full flex flex-col border border-neutral-dark">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-light h-12 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Resume Editor</h2>
          <Button
            variant="primary"
            disabled={true}
            className="px-3 py-1 text-xs opacity-50"
          >
            Confirm & Preview
          </Button>
        </div>

        {/* Second Section */}
        <div className="px-6 py-2.5 border-b border-neutral-light flex items-center gap-3 h-16">
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
          <div className="flex-1 min-h-0 bg-neutral-light/30 rounded-lg border border-neutral-light">
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-light bg-surface/50 h-12 flex items-center">
        </div>
      </div>
    )
  }

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
      // Call PDF generation API for preview
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

      // Create preview URL
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Set preview URL in store for Panel 4 to display
      const { setPdfPreviewUrl } = useSwiftApplyStore.getState()
      setPdfPreviewUrl(url)

    } catch (error) {
      console.error('PDF generation error:', error)
      setError((error as Error)?.message || 'Failed to generate PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }


  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 h-full flex flex-col border border-neutral-dark">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-light h-12 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Resume Editor</h2>
        <Button
          variant="secondary"
          onClick={handleConfirm}
          disabled={isGeneratingPDF}
          className="px-3 py-1 text-xs"
        >
          {isGeneratingPDF ? (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Generating Preview...
            </div>
          ) : (
            'Confirm & Preview'
          )}
        </Button>
      </div>

      {/* Second Section */}
      <div className="px-6 py-2.5 border-b border-neutral-light flex items-center gap-3 h-16">
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
        <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto">
          {/* Work Experience */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary" htmlFor="work-experience">
              AI-Generated Work Experience
            </label>
            <Input
              id="work-experience"
              multiline
              rows={8}
              value={editedWorkExperience}
              onChange={event => setEditedWorkExperience(event.target.value)}
              placeholder="AI-generated work experience will appear here..."
              className="resize-none leading-relaxed"
            />
          </div>

          {/* Personal Info */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary" htmlFor="personal-info">
              Personal Information (JSON)
            </label>
            <Input
              id="personal-info"
              multiline
              rows={8}
              value={editedPersonalInfoText}
              onChange={event => setEditedPersonalInfoText(event.target.value)}
              placeholder="Personal information JSON..."
              className="font-mono resize-none leading-relaxed"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-neutral-light bg-surface/50 h-12 flex items-center">
      </div>
    </div>
  )
}
