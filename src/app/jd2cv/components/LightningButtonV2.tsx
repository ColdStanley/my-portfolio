'use client'

import { useState } from 'react'
import ProgressTooltipV2 from './ProgressTooltipV2'

interface JD {
  id: string
  title: string
  company: string
  full_job_description: string
}

interface LightningButtonV2Props {
  jd: JD
  className?: string
}

export default function LightningButtonV2({ jd, className = '' }: LightningButtonV2Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [stepNumber, setStepNumber] = useState(1)

  const handleGenerate = async () => {
    // Check if personal info exists
    const personalInfo = localStorage.getItem('jd2cv-v2-personal-info')
    if (!personalInfo) {
      alert('Please configure your personal information first')
      return
    }

    const parsedPersonalInfo = JSON.parse(personalInfo)
    if (!parsedPersonalInfo.fullName || !parsedPersonalInfo.email) {
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
          title: jd.title,
          full_job_description: jd.full_job_description
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

      // Step 3: Store AI experience for Cover Letter use
      localStorage.setItem(`jd2cv-v2-ai-content-${jd.id}`, aiExperience)

      // Step 4: Generate and Download PDF with V2 API
      setCurrentStep('pdf-generating')
      setStepNumber(4)

      const completeResumeData = {
        personalInfo: parsedPersonalInfo,
        aiGeneratedExperience: aiExperience,
        format: parsedPersonalInfo.format || 'A4',
        jobTitle: jd.title
      }

      const pdfResponse = await fetch('/api/jd2cv/v2/generate-pdf', {
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
      a.download = `${parsedPersonalInfo.fullName.replace(/[^a-z0-9]/gi, '_')}_${jd.title.replace(/[^a-z0-9]/gi, '_')}_Resume.pdf`
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
    <div className="relative">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:cursor-not-allowed"
        title="Generate Resume PDF V2"
      >
        {isGenerating ? (
          <div className="animate-spin w-4 h-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13 10V3L4 14h7v7l9-11h-7z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Progress Tooltip */}
      <ProgressTooltipV2 
        show={showProgress}
        currentStep={currentStep}
        stepNumber={stepNumber}
        totalSteps={4}
      />
    </div>
  )
}