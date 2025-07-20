'use client'

import { useState } from 'react'

interface JDData {
  title: string
  company: string
  full_job_description: string
  prompt_for_jd_keypoints: string
  key_required_capability_1: string
  key_required_capability_2: string
  key_required_capability_3: string
  key_required_capability_4: string
  key_required_capability_5: string
  e_p_for_c_1: string
  e_p_for_c_2: string
  e_p_for_c_3: string
  e_p_for_c_4: string
  e_p_for_c_5: string
  input_e_p_for_c_1: string
  input_e_p_for_c_2: string
  input_e_p_for_c_3: string
  input_e_p_for_c_4: string
  input_e_p_for_c_5: string
}

export default function JD2CVPanel() {
  const [jdData, setJdData] = useState<JDData>({
    title: '',
    company: '',
    full_job_description: '',
    prompt_for_jd_keypoints: '',
    key_required_capability_1: '',
    key_required_capability_2: '',
    key_required_capability_3: '',
    key_required_capability_4: '',
    key_required_capability_5: '',
    e_p_for_c_1: '',
    e_p_for_c_2: '',
    e_p_for_c_3: '',
    e_p_for_c_4: '',
    e_p_for_c_5: '',
    input_e_p_for_c_1: '',
    input_e_p_for_c_2: '',
    input_e_p_for_c_3: '',
    input_e_p_for_c_4: '',
    input_e_p_for_c_5: ''
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedCapabilities, setGeneratedCapabilities] = useState<string[]>([])
  const [showGenerated, setShowGenerated] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [generateMessage, setGenerateMessage] = useState('')
  const [promptSaveMessage, setPromptSaveMessage] = useState('')
  const [currentPageId, setCurrentPageId] = useState<string>('')
  
  // Individual capability states
  const [capabilitySaveMessages, setCapabilitySaveMessages] = useState<string[]>(['', '', '', '', ''])
  const [capabilityIsSaving, setCapabilityIsSaving] = useState<boolean[]>([false, false, false, false, false])
  const [experienceInputs, setExperienceInputs] = useState<string[]>(['', '', '', '', ''])
  const [experiencePrompts, setExperiencePrompts] = useState<string[]>(['', '', '', '', ''])
  const [experienceGenerating, setExperienceGenerating] = useState<boolean[]>([false, false, false, false, false])
  const [experienceMessages, setExperienceMessages] = useState<string[]>(['', '', '', '', ''])
  const [inputExperienceSaving, setInputExperienceSaving] = useState<boolean[]>([false, false, false, false, false])
  const [inputExperienceMessages, setInputExperienceMessages] = useState<string[]>(['', '', '', '', ''])
  const [experienceSectionExpanded, setExperienceSectionExpanded] = useState<boolean[]>([false, false, false, false, false])

  const handleJDSubmit = async () => {
    if (!jdData.title || !jdData.company || !jdData.full_job_description) {
      setSaveMessage('Please fill in all JD fields')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    setIsSaving(true)
    setSaveMessage('')
    try {
      const response = await fetch('/api/jd2cv/save-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          full_job_description: jdData.full_job_description
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id) {
          setCurrentPageId(data.id)
        }
        setSaveMessage('Job Description saved successfully')
      } else if (response.status === 409) {
        const data = await response.json()
        setSaveMessage(data.error || 'Record with same title and company already exists')
      } else {
        setSaveMessage('Failed to save Job Description')
      }
    } catch (error) {
      setSaveMessage('Error saving Job Description')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleGenerateCapabilities = async () => {
    setIsGenerating(true)
    setGenerateMessage('')
    try {
      const response = await fetch('/api/jd2cv/generate-capabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          full_job_description: jdData.full_job_description,
          prompt: jdData.prompt_for_jd_keypoints
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedCapabilities(data.capabilities)
        setShowGenerated(true)
        
        // Update the capability fields
        setJdData(prev => ({
          ...prev,
          key_required_capability_1: data.capabilities[0] || '',
          key_required_capability_2: data.capabilities[1] || '',
          key_required_capability_3: data.capabilities[2] || '',
          key_required_capability_4: data.capabilities[3] || '',
          key_required_capability_5: data.capabilities[4] || ''
        }))
        setGenerateMessage('Capabilities generated successfully')
        
        // Auto-expand experience sections for better workflow
        setExperienceSectionExpanded([true, true, true, true, true])
      } else {
        setGenerateMessage('Failed to generate capabilities')
      }
    } catch (error) {
      setGenerateMessage('Error generating capabilities')
    } finally {
      setIsGenerating(false)
      setTimeout(() => setGenerateMessage(''), 3000)
    }
  }

  const handleSaveCapabilities = async () => {
    setIsSaving(true)
    setSaveMessage('')
    try {
      const response = await fetch('/api/jd2cv/save-capabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          prompt_for_jd_keypoints: jdData.prompt_for_jd_keypoints,
          key_required_capability_1: jdData.key_required_capability_1,
          key_required_capability_2: jdData.key_required_capability_2,
          key_required_capability_3: jdData.key_required_capability_3,
          key_required_capability_4: jdData.key_required_capability_4,
          key_required_capability_5: jdData.key_required_capability_5
        })
      })

      if (response.ok) {
        setSaveMessage('Capabilities saved successfully')
      } else {
        setSaveMessage('Failed to save capabilities')
      }
    } catch (error) {
      setSaveMessage('Error saving capabilities')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleSavePrompt = async () => {
    if (!jdData.prompt_for_jd_keypoints) {
      setPromptSaveMessage('Please enter a prompt')
      setTimeout(() => setPromptSaveMessage(''), 3000)
      return
    }

    setIsSaving(true)
    setPromptSaveMessage('')
    try {
      const response = await fetch('/api/jd2cv/save-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          prompt_for_jd_keypoints: jdData.prompt_for_jd_keypoints
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id && !currentPageId) {
          setCurrentPageId(data.id)
        }
        setPromptSaveMessage('Prompt saved successfully')
      } else {
        setPromptSaveMessage('Failed to save prompt')
      }
    } catch (error) {
      setPromptSaveMessage('Error saving prompt')
    } finally {
      setIsSaving(false)
      setTimeout(() => setPromptSaveMessage(''), 3000)
    }
  }

  // Individual capability functions
  const handleSaveCapability = async (index: number) => {
    const capabilityKey = `key_required_capability_${index + 1}` as keyof JDData
    const capabilityValue = jdData[capabilityKey]

    setCapabilityIsSaving(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    setCapabilitySaveMessages(prev => {
      const newState = [...prev]
      newState[index] = ''
      return newState
    })

    try {
      const response = await fetch('/api/jd2cv/save-individual-capability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          capabilityIndex: index + 1,
          capabilityValue: capabilityValue
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id && !currentPageId) {
          setCurrentPageId(data.id)
        }
        setCapabilitySaveMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Capability saved successfully'
          return newState
        })
      } else {
        setCapabilitySaveMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Failed to save capability'
          return newState
        })
      }
    } catch (error) {
      setCapabilitySaveMessages(prev => {
        const newState = [...prev]
        newState[index] = 'Error saving capability'
        return newState
      })
    } finally {
      setCapabilityIsSaving(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
      setTimeout(() => {
        setCapabilitySaveMessages(prev => {
          const newState = [...prev]
          newState[index] = ''
          return newState
        })
      }, 3000)
    }
  }

  const handleGenerateExperience = async (index: number) => {
    const experienceInput = experienceInputs[index]
    const experiencePrompt = experiencePrompts[index]
    const capabilityKey = `key_required_capability_${index + 1}` as keyof JDData
    const capability = jdData[capabilityKey]

    setExperienceGenerating(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    setExperienceMessages(prev => {
      const newState = [...prev]
      newState[index] = ''
      return newState
    })

    try {
      const response = await fetch('/api/jd2cv/generate-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capability: capability,
          experienceInput: experienceInput,
          prompt: experiencePrompt
        })
      })

      if (response.ok) {
        const data = await response.json()
        setJdData(prev => ({
          ...prev,
          [`e_p_for_c_${index + 1}`]: data.customizedExperience
        }))
        setExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Experience generated successfully'
          return newState
        })
        
      } else {
        setExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Failed to generate experience'
          return newState
        })
      }
    } catch (error) {
      setExperienceMessages(prev => {
        const newState = [...prev]
        newState[index] = 'Error generating experience'
        return newState
      })
    } finally {
      setExperienceGenerating(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
      setTimeout(() => {
        setExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = ''
          return newState
        })
      }, 3000)
    }
  }

  const handleSaveExperience = async (index: number) => {
    const experienceKey = `e_p_for_c_${index + 1}` as keyof JDData
    const experienceValue = jdData[experienceKey]
    const capabilityKey = `key_required_capability_${index + 1}` as keyof JDData
    const capabilityValue = jdData[capabilityKey]

    setExperienceGenerating(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    setExperienceMessages(prev => {
      const newState = [...prev]
      newState[index] = ''
      return newState
    })

    try {
      // First save the experience property
      const response = await fetch('/api/jd2cv/save-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          experienceIndex: index + 1,
          experienceValue: experienceValue
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id && !currentPageId) {
          setCurrentPageId(data.id)
        }

        // Then update the callout with both capability and experience
        if (capabilityValue) {
          await fetch('/api/jd2cv/update-capability-callout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: jdData.title,
              company: jdData.company,
              capabilityIndex: index + 1,
              capabilityValue: capabilityValue,
              experienceValue: experienceValue
            })
          })
        }

        setExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Experience saved successfully'
          return newState
        })
      } else {
        setExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Failed to save experience'
          return newState
        })
      }
    } catch (error) {
      setExperienceMessages(prev => {
        const newState = [...prev]
        newState[index] = 'Error saving experience'
        return newState
      })
    } finally {
      setExperienceGenerating(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
      setTimeout(() => {
        setExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = ''
          return newState
        })
      }, 3000)
    }
  }

  const handleSaveInputExperience = async (index: number) => {
    const inputExperienceKey = `input_e_p_for_c_${index + 1}` as keyof JDData
    const inputExperienceValue = experienceInputs[index]

    // Also update the jdData with the current input
    setJdData(prev => ({
      ...prev,
      [inputExperienceKey]: inputExperienceValue
    }))

    setInputExperienceSaving(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })

    setInputExperienceMessages(prev => {
      const newState = [...prev]
      newState[index] = ''
      return newState
    })

    try {
      const response = await fetch('/api/jd2cv/save-input-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          experienceIndex: index + 1,
          inputExperienceValue: inputExperienceValue
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id && !currentPageId) {
          setCurrentPageId(data.id)
        }
        setInputExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Input experience saved successfully'
          return newState
        })
      } else {
        setInputExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = 'Failed to save input experience'
          return newState
        })
      }
    } catch (error) {
      setInputExperienceMessages(prev => {
        const newState = [...prev]
        newState[index] = 'Error saving input experience'
        return newState
      })
    } finally {
      setInputExperienceSaving(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
      setTimeout(() => {
        setInputExperienceMessages(prev => {
          const newState = [...prev]
          newState[index] = ''
          return newState
        })
      }, 3000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">JD2CV</h2>
        <p className="text-gray-600">Transform job descriptions into tailored CV content</p>
      </div>

      {/* Job Description Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-semibold text-gray-800">Job Description Input</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${jdData.title ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${jdData.company ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${jdData.full_job_description ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              {currentPageId && (
                <button
                  onClick={() => window.open(`https://www.notion.so/${currentPageId.replace(/-/g, '')}`, '_blank')}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                  title="Open in Notion"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Notion
                </button>
              )}
            </div>
            <input
              type="text"
              value={jdData.title}
              onChange={(e) => setJdData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Senior Software Engineer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={jdData.company}
              onChange={(e) => setJdData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Google"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={jdData.full_job_description}
            onChange={(e) => setJdData(prev => ({ ...prev, full_job_description: e.target.value }))}
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[300px]"
            placeholder="Paste the complete job description here including responsibilities, requirements, and qualifications..."
          />
        </div>

        <div className="flex justify-end">
          <div className="space-y-2">
            <button
              onClick={handleJDSubmit}
              disabled={isSaving}
              className="w-32 bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium"
            >
              {isSaving ? 'Saving...' : 'Save JD'}
            </button>
            {saveMessage && (
              <p className={`text-sm text-right ${saveMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Key Points Generation Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Key Points of JD Generation</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Prompt</label>
          <textarea
            value={jdData.prompt_for_jd_keypoints}
            onChange={(e) => setJdData(prev => ({ ...prev, prompt_for_jd_keypoints: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your prompt (e.g., 'Based on Title, Company, and Full Job Description, generate up to 5 Key Required Capabilities')"
          />
          <div className="flex justify-center gap-4 mt-6">
            <div className="space-y-2">
              <button
                onClick={handleGenerateCapabilities}
                disabled={isGenerating}
                className="w-32 bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
              {generateMessage && (
                <p className={`text-sm text-center ${generateMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {generateMessage}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <button
                onClick={handleSavePrompt}
                disabled={isSaving}
                className="w-32 bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              {promptSaveMessage && (
                <p className={`text-sm text-center ${promptSaveMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {promptSaveMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Individual Capabilities */}
        <div className="space-y-8">
          <h4 className="text-lg font-medium text-gray-800">Key Required Capabilities</h4>
          
          {[1, 2, 3, 4, 5].map((num) => {
            const index = num - 1
            return (
              <div key={num} className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h5 className="font-medium text-gray-800">Capability {num}</h5>
                
                {/* Capability Content */}
                <div className="space-y-2">
                  <textarea
                    value={jdData[`key_required_capability_${num}` as keyof JDData]}
                    onChange={(e) => setJdData(prev => ({ 
                      ...prev, 
                      [`key_required_capability_${num}`]: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y min-h-[80px]"
                    placeholder={`Key capability ${num}`}
                  />
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSaveCapability(index)}
                      disabled={capabilityIsSaving[index]}
                      className="w-32 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {capabilityIsSaving[index] ? 'Saving...' : 'Save'}
                    </button>
                    {capabilitySaveMessages[index] && (
                      <p className={`text-sm ${capabilitySaveMessages[index].includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                        {capabilitySaveMessages[index]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Experience Generation Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h6 className="font-medium text-gray-700">Experience Customization</h6>
                    <button
                      onClick={() => {
                        setExperienceSectionExpanded(prev => {
                          const newState = [...prev]
                          newState[index] = !newState[index]
                          return newState
                        })
                      }}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      {experienceSectionExpanded[index] ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  
                  {experienceSectionExpanded[index] && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Input Experience
                        </label>
                        <textarea
                          value={experienceInputs[index]}
                          onChange={(e) => {
                            const newInputs = [...experienceInputs]
                            newInputs[index] = e.target.value
                            setExperienceInputs(newInputs)
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[120px]"
                          placeholder="Describe your relevant experience or project..."
                        />
                        <div className="flex justify-start">
                          <div className="space-y-2">
                            <button
                              onClick={() => handleSaveInputExperience(index)}
                              disabled={inputExperienceSaving[index]}
                              className="w-24 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium"
                            >
                              {inputExperienceSaving[index] ? 'Saving...' : 'Save'}
                            </button>
                            {inputExperienceMessages[index] && (
                              <p className={`text-sm ${inputExperienceMessages[index].includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                                {inputExperienceMessages[index]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Customization Prompt
                        </label>
                        <textarea
                          value={experiencePrompts[index]}
                          onChange={(e) => {
                            const newPrompts = [...experiencePrompts]
                            newPrompts[index] = e.target.value
                            setExperiencePrompts(newPrompts)
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[80px]"
                          placeholder="Additional instructions for customization (optional)..."
                        />
                      </div>

                      <div className="flex justify-center">
                        <div className="space-y-2">
                          <button
                            onClick={() => handleGenerateExperience(index)}
                            disabled={experienceGenerating[index]}
                            className="w-40 bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium"
                          >
                            {experienceGenerating[index] ? 'Generating...' : 'Generate'}
                          </button>
                          {experienceMessages[index] && (
                            <p className={`text-sm text-center ${experienceMessages[index].includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                              {experienceMessages[index]}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Customized Experience Result */}
                      <div className="border-t pt-4 space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Customized Result
                        </label>
                        <textarea
                          value={jdData[`e_p_for_c_${num}` as keyof JDData]}
                          onChange={(e) => setJdData(prev => ({ 
                            ...prev, 
                            [`e_p_for_c_${num}`]: e.target.value 
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[120px]"
                          placeholder="Generated experience will appear here, or you can write manually..."
                        />
                        <div className="flex justify-start">
                          <button
                            onClick={() => handleSaveExperience(index)}
                            disabled={experienceGenerating[index]}
                            className="w-24 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium"
                          >
                            {experienceGenerating[index] ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}