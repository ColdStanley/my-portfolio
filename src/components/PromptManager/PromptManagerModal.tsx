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
  
  const themeConfig = PURPLE_THEME
  
  // Initialize with first prompt
  useEffect(() => {
    if (!selectedPromptId && Object.keys(prompts).length > 0) {
      setSelectedPromptId(Object.keys(prompts)[0])
    }
  }, [prompts, selectedPromptId])
  
  // Update local state when props change
  useEffect(() => {
    setLocalPrompts(prompts)
  }, [prompts])
  
  if (!isOpen) return null
  
  const handleSave = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(localPrompts))
    }
    onPromptsChange(localPrompts)
    console.log('Prompts saved to localStorage')
  }
  
  const handleReset = () => {
    if (!selectedPromptId) return
    
    // Reset to original prompt (you might want to store original prompts separately)
    const originalPrompt = prompts[selectedPromptId]
    if (originalPrompt) {
      setLocalPrompts(prev => ({
        ...prev,
        [selectedPromptId]: { ...originalPrompt }
      }))
    }
  }
  
  const handleTest = async () => {
    // Placeholder for test functionality
    console.log('Testing prompt:', localPrompts[selectedPromptId])
    // You can implement actual AI testing here
  }
  
  const updatePrompt = (field: string, value: any) => {
    if (!selectedPromptId) return
    
    setLocalPrompts(prev => ({
      ...prev,
      [selectedPromptId]: {
        ...prev[selectedPromptId],
        [field]: value
      }
    }))
  }
  
  const currentPrompt = localPrompts[selectedPromptId]
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Prompt Management</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Prompt List */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-3">AI Prompts</h3>
            <div className="space-y-1">
              {Object.entries(localPrompts).map(([id, prompt]) => (
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
                  <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Model:</label>
                      <select 
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={currentPrompt.model}
                        onChange={(e) => updatePrompt('model', e.target.value)}
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="deepseek">DeepSeek</option>
                      </select>
                    </div>
                    {currentPrompt.count !== undefined && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Count:</label>
                        <input 
                          type="number" 
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={currentPrompt.count}
                          onChange={(e) => updatePrompt('count', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    )}
                  </div>
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
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                  <button 
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium transition-colors"
                    onClick={handleTest}
                  >
                    Test Prompt
                  </button>
                  <button 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
                    onClick={handleReset}
                  >
                    Reset to Default
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