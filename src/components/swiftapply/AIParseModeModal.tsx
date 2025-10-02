'use client'

import { useState, useRef } from 'react'
import { useSwiftApplyStore, type PersonalInfo, type ExperienceTemplate } from '@/lib/swiftapply/store'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import pdfToText from 'react-pdftotext'

type Step = 1 | 2 | 3

export default function AIParseModeModal() {
  const {
    setPersonalInfo,
    setTemplates,
    setResumeRawText,
    templates: existingTemplates,
    closeAIParseMode
  } = useSwiftApplyStore()

  const [step, setStep] = useState<Step>(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedInfo, setParsedInfo] = useState<PersonalInfo | null>(null)
  const [resumeText, setResumeText] = useState<string>('')
  const [generatedTemplates, setGeneratedTemplates] = useState<ExperienceTemplate[]>([])
  const [currentRole, setCurrentRole] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 1: Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate PDF only
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported')
      return
    }

    setError(null)
    setIsProcessing(true)

    console.log('[AI Mode] 1. Uploading PDF:', file.name)

    try {
      // Extract text from PDF using react-pdftotext
      console.log('[AI Mode] 2. Extracting text from PDF...')
      const extractedText = await pdfToText(file)

      console.log('[AI Mode] 3. Extracted text length:', extractedText.length)

      if (!extractedText || extractedText.length < 50) {
        throw new Error('Failed to extract text from PDF or text too short')
      }

      // Send text to API for parsing
      console.log('[AI Mode] 4. Sending text to API for parsing...')
      const response = await fetch('/api/swiftapply/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: extractedText })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to parse resume')
      }

      const result = await response.json()

      console.log('[AI Mode] 5. Parse successful:', result.data.personalInfo.fullName)

      setParsedInfo(result.data.personalInfo)
      setResumeText(result.data.resumeText)
      setResumeRawText(result.data.resumeText)

      // Auto-proceed to Step 2 with scroll
      setStep(2)

      // Scroll to top to show Step 2 content
      setTimeout(() => {
        const contentArea = document.querySelector('.flex-1.overflow-y-auto')
        if (contentArea) {
          contentArea.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 100)

      // Small delay to show Step 2, then proceed to Step 3
      setTimeout(() => {
        setPersonalInfo(result.data.personalInfo)
        setStep(3)

        // Scroll to top again for Step 3
        const contentArea = document.querySelector('.flex-1.overflow-y-auto')
        if (contentArea) {
          contentArea.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 800)

    } catch (err: any) {
      console.error('[AI Mode] Error:', err)
      setError(err.message || 'Failed to parse resume')
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Step 3: Generate template for a role
  const handleGenerateTemplate = async () => {
    if (!currentRole.trim() || !resumeText) return

    setError(null)
    setIsProcessing(true)

    console.log('[AI Mode] Generating template for role:', currentRole)

    try {
      const response = await fetch('/api/swiftapply/generate-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetRole: currentRole.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate templates')
      }

      const result = await response.json()
      const newTemplates = result.data.templates

      console.log('[AI Mode] Generated', newTemplates.length, 'templates')

      setGeneratedTemplates([...generatedTemplates, ...newTemplates])
      setCurrentRole('')

    } catch (err: any) {
      console.error('[AI Mode] Generate error:', err)
      setError(err.message || 'Failed to generate templates')
    } finally {
      setIsProcessing(false)
    }
  }

  // Save all and close
  const handleSaveAndFinish = () => {
    if (generatedTemplates.length > 0) {
      const allTemplates = [...existingTemplates, ...generatedTemplates]
      setTemplates(allTemplates)
    }
    console.log('[AI Mode] Saved', generatedTemplates.length, 'templates')
    closeAIParseMode()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50">
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-dark bg-surface">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-text-primary">
              AI Resume Setup
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Upload resume and generate templates
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={closeAIParseMode}
            className="w-8 h-8 p-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 sm:px-6 py-4 bg-surface border-b border-neutral-light">
          <div className="flex items-center justify-center gap-3">
            {/* Step 1 */}
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-text-muted'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step > 1 ? 'bg-primary text-white' : step === 1 ? 'bg-primary text-primary-foreground' : 'bg-neutral-light text-text-secondary'
              }`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Upload</span>
            </div>

            <div className="w-8 h-0.5 bg-neutral-light"></div>

            {/* Step 2 */}
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-text-muted'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step > 2 ? 'bg-primary text-white' : step === 2 ? 'bg-primary text-primary-foreground' : 'bg-neutral-light text-text-secondary'
              }`}>
                {step > 2 ? '✓' : '2'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Parse</span>
            </div>

            <div className="w-8 h-0.5 bg-neutral-light"></div>

            {/* Step 3 */}
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-text-muted'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 3 ? 'bg-primary text-primary-foreground' : 'bg-neutral-light text-text-secondary'
              }`}>
                3
              </div>
              <span className="text-sm font-medium hidden sm:inline">Templates</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Upload Your Resume
                  </h3>
                  <p className="text-sm text-text-secondary">
                    PDF format only
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isProcessing}
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="primary"
                  size="lg"
                  disabled={isProcessing}
                  className="min-w-[200px]"
                >
                  {isProcessing ? 'Processing...' : 'Select File'}
                </Button>
              </div>

              {error && (
                <div className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Auto-parsing (brief transition) */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto animate-pulse">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary">
                Parsing Complete
              </h3>
              <p className="text-sm text-text-secondary">
                Extracted: {parsedInfo?.fullName}
              </p>
            </div>
          )}

          {/* Step 3: Generate Templates */}
          {step === 3 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Generate Experience Templates
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  Enter target roles to create tailored templates
                </p>

                <div className="flex gap-3 mb-6">
                  <Input
                    type="text"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isProcessing) {
                        handleGenerateTemplate()
                      }
                    }}
                    placeholder="e.g., Software Engineer"
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleGenerateTemplate}
                    variant="primary"
                    size="md"
                    disabled={isProcessing || !currentRole.trim()}
                  >
                    {isProcessing ? 'Generating...' : 'Generate'}
                  </Button>
                </div>

                {error && (
                  <div className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error mb-4">
                    {error}
                  </div>
                )}

                {/* Generated Templates List */}
                {generatedTemplates.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-text-secondary">
                      Generated Templates ({generatedTemplates.length})
                    </h4>
                    {generatedTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 bg-surface rounded-lg border border-neutral-mid"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-text-primary text-sm">
                              {template.title}
                            </h5>
                            <p className="text-xs text-text-secondary mt-1">
                              {template.content.length} bullet points
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {generatedTemplates.length === 0 && (
                  <div className="text-center py-8 text-text-secondary">
                    <p className="text-sm">No templates generated yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 3 && (
          <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-neutral-dark">
            <Button
              variant="secondary"
              onClick={closeAIParseMode}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAndFinish}
              disabled={generatedTemplates.length === 0}
            >
              Save & Finish
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
