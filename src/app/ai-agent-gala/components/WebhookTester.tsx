'use client'

import { useState, useEffect } from 'react'
import SimpleVoiceRecorder from './SimpleVoiceRecorder'

export default function WebhookTester() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [content, setContent] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [urlHistory, setUrlHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Load URL history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('webhook-url-history')
    if (saved) {
      setUrlHistory(JSON.parse(saved))
    }
  }, [])

  // Save URL to history
  const saveUrlToHistory = (url: string) => {
    if (!url || urlHistory.includes(url)) return
    
    const newHistory = [url, ...urlHistory].slice(0, 10)
    setUrlHistory(newHistory)
    localStorage.setItem('webhook-url-history', JSON.stringify(newHistory))
  }

  // Send webhook request
  const handleSend = async () => {
    if (!webhookUrl || !content) return

    setIsLoading(true)
    setResponse('')
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      })
      
      const data = await response.text()
      setResponse(data)
      saveUrlToHistory(webhookUrl)
    } catch (error) {
      setResponse('Error: Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Select URL from history
  const selectFromHistory = (url: string) => {
    setWebhookUrl(url)
    setShowHistory(false)
  }

  // Handle voice transcript
  const handleVoiceTranscript = (transcript: string) => {
    setContent(prev => prev ? prev + ' ' + transcript : transcript)
  }

  const canSend = webhookUrl && content && !isLoading

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 pb-20">
      <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
        
        {/* Webhook URL Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-3">
          <label className="block text-sm font-medium text-gray-600">Webhook URL</label>
          <div className="relative">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-n8n-webhook-url"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
            />
            {urlHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="absolute right-3 top-3 text-gray-400 hover:text-purple-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            
            {/* History Dropdown */}
            {showHistory && urlHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto z-10">
                {urlHistory.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => selectFromHistory(url)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 truncate transition-colors"
                  >
                    {url}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Input Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-3">
          <label className="block text-sm font-medium text-gray-600">Content</label>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your content here..."
                rows={4}
                className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none transition-colors"
              />
              <div className="absolute top-3 right-3">
                <SimpleVoiceRecorder onTranscript={handleVoiceTranscript} />
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`w-32 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                canSend
                  ? 'bg-purple-500 text-white hover:bg-purple-600 hover:shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>

        {/* Response Section */}
        <div className="flex-1 bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 flex flex-col">
          <label className="block text-sm font-medium text-gray-600 mb-3">Response</label>
          <div className="flex-1 min-h-[200px] bg-white border border-gray-200 rounded-lg p-4 overflow-y-auto">
            {response ? (
              <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-mono">
                {response}
              </pre>
            ) : (
              <div className="text-gray-400 text-sm">Response will appear here...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}