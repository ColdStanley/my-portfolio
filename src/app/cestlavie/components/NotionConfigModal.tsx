'use client'

import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface NotionConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onConfigSaved: () => void
}

interface NotionConfig {
  notion_api_key: string
  tasks_db_id: string
  strategy_db_id: string
  plan_db_id: string
}

export default function NotionConfigModal({ isOpen, onClose, onConfigSaved }: NotionConfigModalProps) {
  const { user } = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{success: boolean, message: string, details?: any} | null>(null)
  const [config, setConfig] = useState<NotionConfig>({
    notion_api_key: '',
    tasks_db_id: '',
    strategy_db_id: '',
    plan_db_id: ''
  })
  const [errors, setErrors] = useState<Partial<NotionConfig>>({})

  // 加载现有配置
  useEffect(() => {
    if (isOpen && user) {
      fetchConfig()
    }
  }, [isOpen, user])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user-notion-config')
      const result = await response.json()
      
      if (response.ok && result.data) {
        setConfig(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Partial<NotionConfig> = {}
    
    if (!config.notion_api_key.trim()) {
      newErrors.notion_api_key = 'Notion API Key is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTest = async () => {
    if (!config.notion_api_key || !config.tasks_db_id) {
      setTestResult({
        success: false,
        message: 'Please fill in at least Notion API key and Tasks Database ID to test'
      })
      return
    }

    setTesting(true)
    setTestResult(null)
    
    // 先临时保存配置以便测试
    try {
      const saveResponse = await fetch('/api/user-notion-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (!saveResponse.ok) {
        throw new Error('Failed to save configuration for testing')
      }

      // 测试配置
      const testResponse = await fetch('/api/test-notion-config')
      const result = await testResponse.json()
      
      setTestResult({
        success: result.success,
        message: result.success ? result.message : result.error,
        details: result.details
      })
      
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const response = await fetch('/api/user-notion-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const result = await response.json()
      
      if (response.ok) {
        onConfigSaved()
        onClose()
      } else {
        console.error('Failed to save config:', result.error)
      }
    } catch (error) {
      console.error('Error saving config:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof NotionConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* 模态框 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Notion Configuration</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Configure your Notion integration to connect your databases with CestLaVie.
            </p>
          </div>

          {/* 内容 */}
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-gray-600">Loading configuration...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Notion API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notion API Key *
                  </label>
                  <input
                    type="password"
                    value={config.notion_api_key}
                    onChange={(e) => handleInputChange('notion_api_key', e.target.value)}
                    placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.notion_api_key ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.notion_api_key && (
                    <p className="mt-1 text-sm text-red-600">{errors.notion_api_key}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Get your API key from <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Notion Integrations</a>
                  </p>
                </div>

                {/* Tasks Database ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasks Database ID
                  </label>
                  <input
                    type="text"
                    value={config.tasks_db_id}
                    onChange={(e) => handleInputChange('tasks_db_id', e.target.value)}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Database ID for your Tasks (from Notion database URL)
                  </p>
                </div>

                {/* Strategy Database ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strategy Database ID
                  </label>
                  <input
                    type="text"
                    value={config.strategy_db_id}
                    onChange={(e) => handleInputChange('strategy_db_id', e.target.value)}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Database ID for your Strategy (from Notion database URL)
                  </p>
                </div>

                {/* Plan Database ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Database ID
                  </label>
                  <input
                    type="text"
                    value={config.plan_db_id}
                    onChange={(e) => handleInputChange('plan_db_id', e.target.value)}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Database ID for your Plan (from Notion database URL)
                  </p>
                </div>

                {/* 测试结果显示 */}
                {testResult && (
                  <div className={`p-4 rounded-lg border ${
                    testResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className={`text-lg ${
                          testResult.success ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {testResult.success ? '✅' : '❌'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h4 className={`text-sm font-medium ${
                          testResult.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {testResult.success ? 'Configuration Test Passed' : 'Configuration Test Failed'}
                        </h4>
                        <p className={`mt-1 text-sm ${
                          testResult.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {testResult.message}
                        </p>
                        {testResult.details && (
                          <div className="mt-2 text-xs text-gray-600">
                            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                              {JSON.stringify(testResult.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 帮助信息 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Setup Instructions:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Create a new Notion integration at <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="underline">notion.so/my-integrations</a></li>
                    <li>Copy the API key and paste it above</li>
                    <li>Create your databases in Notion (Tasks, Strategy, Plan)</li>
                    <li>Share each database with your integration</li>
                    <li>Copy the database IDs from the URLs and paste them above</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="p-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={handleTest}
              disabled={testing || saving || !config.notion_api_key || !config.tasks_db_id}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {testing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {testing ? 'Testing...' : 'Test Configuration'}
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}