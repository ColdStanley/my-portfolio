'use client'

import { useState, useEffect } from 'react'
import { PromptManagerModalProps, PromptData, PURPLE_THEME } from './types'

export default function PromptManagerModal({
  isOpen,
  onClose,
  prompts,
  onPromptsChange,
  storageKey
}: PromptManagerModalProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<string>('')
  const [localPrompts, setLocalPrompts] = useState<PromptData>(prompts)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [selectedModel, setSelectedModel] = useState<'gpt-4' | 'deepseek'>('deepseek')
  
  const themeConfig = PURPLE_THEME
  
  // Get filtered prompts based on selected model
  const getFilteredPrompts = () => {
    const basePrompts = [
      'generate_key_sentences',
      'generate_keywords', 
      'generate_experience'
    ]
    
    const filtered: PromptData = {}
    basePrompts.forEach(base => {
      const key = `${base}_${selectedModel.replace('-', '')}`
      if (localPrompts[key]) {
        filtered[base] = {
          ...localPrompts[key],
          name: localPrompts[key].name.replace(` - ${selectedModel === 'gpt-4' ? 'GPT-4' : 'DeepSeek'}`, ''),
          location: localPrompts[key].location.replace(` (${selectedModel === 'gpt-4' ? 'GPT-4' : 'DeepSeek'})`, '')
        }
      }
    })
    return filtered
  }
  
  const filteredPrompts = getFilteredPrompts()
  
  // Initialize with first prompt when model changes
  useEffect(() => {
    const filteredKeys = Object.keys(filteredPrompts)
    if (filteredKeys.length > 0) {
      setSelectedPromptId(filteredKeys[0])
    }
  }, [selectedModel, localPrompts])
  
  // Update local state when props change
  useEffect(() => {
    setLocalPrompts(prompts)
  }, [prompts])
  
  if (!isOpen) return null
  
  const handleSave = () => {
    setSaveStatus('saving')
    
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(localPrompts))
    }
    onPromptsChange(localPrompts)
    
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000) // 2秒后恢复
  }
  
  
  const updatePrompt = (field: string, value: any) => {
    if (!selectedPromptId) return
    
    // Reset save status when user makes changes
    if (saveStatus === 'saved') {
      setSaveStatus('idle')
    }
    
    // Get the actual key in localPrompts (with model suffix)
    const actualKey = `${selectedPromptId}_${selectedModel.replace('-', '')}`
    
    setLocalPrompts(prev => ({
      ...prev,
      [actualKey]: {
        ...prev[actualKey],
        [field]: value
      }
    }))
  }
  
  const currentPrompt = filteredPrompts[selectedPromptId]
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Prompt Management</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Model:</label>
              <select 
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as 'gpt-4' | 'deepseek')}
              >
                <option value="deepseek">DeepSeek</option>
                <option value="gpt-4">GPT-4</option>
              </select>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Prompt List */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              AI Prompts ({selectedModel === 'gpt-4' ? 'GPT-4' : 'DeepSeek'})
            </h3>
            <div className="space-y-1">
              {Object.entries(filteredPrompts).map(([id, prompt]) => (
                <div key={id}>
                  <div 
                    className={`text-sm p-2 rounded cursor-pointer transition-colors ${
                      selectedPromptId === id 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedPromptId(id)}
                  >
                    📝 {prompt.name}
                    <div className="text-xs text-gray-500 mt-1">{prompt.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Content - Editor */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentPrompt && (
              <>
                <div className="mb-4">
                  <h3 className="text-base font-medium text-gray-800 mb-1">{currentPrompt.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">Location: {currentPrompt.location}</p>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Template</label>
                  <textarea
                    className="w-full h-80 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={currentPrompt.prompt}
                    onChange={(e) => updatePrompt('prompt', e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
                      saveStatus === 'saved' 
                        ? 'bg-purple-800 hover:bg-purple-900' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' && 'Saving...'}
                    {saveStatus === 'saved' && '✓ Saved'}
                    {saveStatus === 'idle' && 'Save'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}