'use client'

import { useState, useEffect } from 'react'

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
  const [countdown, setCountdown] = useState(120)

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isGenerating) {
      setCountdown(120) // Reset to 120 seconds
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 1 // Don't go below 1
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isGenerating])

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

    try {
      // Create AbortController for 180s timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 180 seconds
      
      try {
        // Call n8n webhook to get AI-generated experience
        const webhookResponse = await fetch('https://agentworkflow.stanleyhi.com/webhook/cf88dabc-821e-4ce5-b78a-d2699bfa1851', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: jd.title,
            full_job_description: jd.full_job_description
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId) // Clear timeout on success

        if (!webhookResponse.ok) {
          throw new Error('Failed to get AI experience from n8n workflow')
        }

        const aiExperienceRaw = await webhookResponse.text()

        // Helper function to parse AI response
        const parseAIResponse = (rawResponse: string): string => {
          if (!rawResponse) return ''
          
          // Try to parse as JSON first
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

        // Store AI experience for Cover Letter use
        localStorage.setItem(`jd2cv-v2-ai-content-${jd.id}`, aiExperience)

        // Generate and Download PDF with V2 API
        const completeResumeData = {
          personalInfo: parsedPersonalInfo,
          aiGeneratedExperience: aiExperience,
          format: parsedPersonalInfo.format || 'A4',
          jobTitle: jd.title
        }

        const pdfResponse = await fetch('/api/jd2cv-full/v2/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(completeResumeData)
        })

        if (!pdfResponse.ok) {
          throw new Error('Failed to generate PDF')
        }

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

      } catch (timeoutError) {
        clearTimeout(timeoutId)
        throw timeoutError // Re-throw to outer catch
      }
      
    } catch (error) {
      console.error('Error generating CV:', error)
      alert(`Failed to generate CV: ${error.message || 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:cursor-not-allowed border border-gray-200 hover:border-purple-300"
        title="Generate Resume PDF V2"
      >
        {isGenerating ? (
          <div className="w-4 h-4 flex items-center justify-center text-xs font-mono text-purple-600">
            {countdown}
          </div>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13 10V3L4 14h7v7l9-11h-7z" clipRule="evenodd" />
          </svg>
        )}
      </button>

    </div>
  )
}