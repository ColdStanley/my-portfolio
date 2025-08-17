'use client'

import { useState } from 'react'

export default function FrenchPanel() {
  const [inputText, setInputText] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('https://stanleyhi.app.n8n.cloud/webhook/study/french')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [responseData, setResponseData] = useState<any>(null)

  const handleRefresh = () => {
    // Refresh functionality placeholder
    console.log('Refresh clicked')
  }

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError('Please enter some French text first')
      return
    }

    if (!webhookUrl.trim()) {
      setError('Please enter a webhook URL')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // 创建超时控制器 - 10分钟超时
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 10 * 60 * 1000) // 10分钟

    try {
      const response = await fetch('/api/study/french', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          webhookUrl: webhookUrl
        }),
        signal: controller.signal
      })

      // 清除超时定时器
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('n8n response:', data)
      
      // Store response data
      setResponseData(data)
      
      // Success feedback
      setSuccess('French text processed successfully!')
      setInputText('') // Clear text box on success
      
    } catch (error) {
      // 清除超时定时器
      clearTimeout(timeoutId)
      
      console.error('Error sending to n8n:', error)
      
      // 处理不同类型的错误
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Request timed out after 10 minutes. The process may still be running in the background.')
        } else {
          setError(error.message)
        }
      } else {
        setError('Failed to process French text')
      }
    } finally {
      setIsLoading(false)
    }
  }


  const cardData = [
    { 
      id: 1, 
      title: 'Text Output 1', 
      content: responseData 
        ? JSON.stringify(responseData, null, 2)
        : 'This is the first text output card...', 
      hasData: !!responseData
    },
    { 
      id: 2, 
      title: 'Text Output 2', 
      content: 'This is the second text output card...', 
      hasData: false
    },
    { 
      id: 3, 
      title: 'Text Output 3', 
      content: 'This is the third text output card...', 
      hasData: false
    }
  ]

  return (
    <>
      {/* 控制栏 - 固定位置 */}
      <div className="fixed top-20 right-4 flex items-center gap-4 z-40">
        {/* Refresh Button - Always first */}
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <span>↻</span>
          <span>Refresh</span>
        </button>
        
        {/* Filter Dropdown - Placeholder */}
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-purple-200 rounded-md text-sm text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-300 transition-all duration-200"
        >
          <option value="all">All French</option>
          <option value="vocabulary">Vocabulary</option>
          <option value="grammar">Grammar</option>
          <option value="conversation">Conversation</option>
        </select>
        
        {/* Primary Action Button - Always last */}
        <button
          onClick={() => console.log('New French item')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
        >
          <span>🇫🇷</span>
          <span>New French</span>
        </button>
      </div>

      {/* 主内容区域 - 固定位置 */}
      <div className="fixed top-32 left-[68px] right-4 bottom-4 overflow-y-auto">
        {/* Desktop Layout */}
        <div className="flex gap-6 h-full p-6">
          {/* Left: Text Input Section - 30% (替代Calendar) */}
          <div className="w-3/10 space-y-4">
            {/* Text Input Area */}
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">French Input</h3>
              
              {/* Webhook URL Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://stanleyhi.app.n8n.cloud/webhook/..."
                  disabled={isLoading}
                  className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                />
              </div>

              {/* Text Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  French Text
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your French text here..."
                  disabled={isLoading}
                  className="w-full h-32 p-4 border border-purple-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputText.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing (up to 10 minutes)...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Process French</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Text Output Cards Section - 70% */}
          <div className="w-7/10 space-y-4">
            {cardData.map((card) => (
              <div
                key={card.id}
                className={`bg-white/90 backdrop-blur-md rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl p-6 ${
                  card.hasData ? 'border-l-4 border-purple-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-900">{card.title}</h3>
                  <div className="flex items-center gap-2">
                    {card.hasData && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        Updated
                      </span>
                    )}
                    <span className="text-sm text-purple-600">Card #{card.id}</span>
                  </div>
                </div>
                <div className={`leading-relaxed ${
                  card.hasData 
                    ? 'text-gray-800 font-medium' 
                    : 'text-gray-500 italic'
                }`}>
                  {card.hasData && responseData ? (
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                      {card.content}
                    </pre>
                  ) : (
                    card.content
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>🇫🇷 French content</span>
                    <span>•</span>
                    <span>{card.hasData ? 'Analysis complete' : 'Awaiting data'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}