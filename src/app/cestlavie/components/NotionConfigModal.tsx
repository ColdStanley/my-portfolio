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
  const [syncing, setSyncing] = useState(false)
  const [testResult, setTestResult] = useState<{success: boolean, message: string, details?: any} | null>(null)
  const [syncResult, setSyncResult] = useState<{success: boolean, message: string, results?: any[]} | null>(null)
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
      const response = await fetch('/api/user-profile')
      const result = await response.json()
      
      if (response.ok && result.data) {
        setConfig({
          notion_api_key: result.data.notion_api_key || '',
          tasks_db_id: result.data.notion_tasks_db_id || '',
          strategy_db_id: result.data.notion_strategy_db_id || '',
          plan_db_id: result.data.notion_plan_db_id || ''
        })
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
      const saveResponse = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notion_api_key: config.notion_api_key,
          notion_tasks_db_id: config.tasks_db_id,
          notion_strategy_db_id: config.strategy_db_id,
          notion_plan_db_id: config.plan_db_id
        })
      })
      
      if (!saveResponse.ok) {
        const saveError = await saveResponse.json()
        throw new Error(`Failed to save configuration: ${saveError.error || 'Unknown error'}`)
      }

      // 测试配置 - 暂时使用tasks API进行测试
      const testResponse = await fetch('/api/tasks')
      
      if (testResponse.status === 404) {
        setTestResult({
          success: false,
          message: 'Test endpoint not found. Using tasks API for testing...'
        })
        return
      }
      
      const result = await testResponse.json()
      
      if (testResponse.ok) {
        setTestResult({
          success: true,
          message: 'Configuration test passed! Tasks API is working correctly.',
          details: `Found ${result.data?.length || 0} tasks in database`
        })
      } else {
        // 分析错误类型
        let errorMessage = result.error || 'Unknown error'
        if (testResponse.status === 401) {
          errorMessage = 'Notion API key is invalid or has expired. Please check your API key.'
        } else if (testResponse.status === 404) {
          errorMessage = 'Tasks database not found. Please verify your database ID.'
        } else if (testResponse.status === 403) {
          errorMessage = 'Access denied to the tasks database. Please ensure your Notion integration has access to this database.'
        }
        
        setTestResult({
          success: false,
          message: errorMessage,
          details: result
        })
      }
      
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSync = async () => {
    if (!config.notion_api_key || !config.tasks_db_id || !config.plan_db_id || !config.strategy_db_id) {
      setSyncResult({
        success: false,
        message: 'Please fill in all database IDs and API key before syncing'
      })
      return
    }

    setSyncing(true)
    setSyncResult(null)
    
    try {
      // 先保存配置
      const saveResponse = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notion_api_key: config.notion_api_key,
          notion_tasks_db_id: config.tasks_db_id,
          notion_strategy_db_id: config.strategy_db_id,
          notion_plan_db_id: config.plan_db_id
        })
      })
      
      if (!saveResponse.ok) {
        const saveError = await saveResponse.json()
        throw new Error(`Configuration save failed: ${saveError.error || 'Unknown error'}`)
      }

      // 执行数据库schema同步
      const syncResponse = await fetch('/api/sync-notion-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const syncData = await syncResponse.json()
      
      if (syncResponse.ok) {
        setSyncResult({
          success: syncData.success,
          message: syncData.message,
          results: syncData.results
        })
      } else {
        setSyncResult({
          success: false,
          message: syncData.error || 'Schema sync failed',
          results: syncData.results || []
        })
      }
      
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notion_api_key: config.notion_api_key,
          notion_tasks_db_id: config.tasks_db_id,
          notion_strategy_db_id: config.strategy_db_id,
          notion_plan_db_id: config.plan_db_id
        })
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
          <div className="p-8 border-b border-purple-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-purple-900">Configuration</h2>
              <button
                onClick={onClose}
                className="text-purple-400 hover:text-purple-600 transition-colors text-2xl font-light"
              >
                ×
              </button>
            </div>
            <p className="mt-3 text-purple-600/80 font-medium">
              Sync your workspace with our golden template
            </p>
          </div>

          {/* 内容 */}
          <div className="p-8 space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <p className="mt-4 text-purple-600">Loading...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Notion API Key */}
                <div>
                  <label className="block text-base font-semibold text-purple-900 mb-3">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={config.notion_api_key}
                    onChange={(e) => handleInputChange('notion_api_key', e.target.value)}
                    placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 ${
                      errors.notion_api_key 
                        ? 'border-red-300 focus:border-red-400' 
                        : 'border-purple-200 focus:border-purple-400 hover:border-purple-300'
                    } bg-purple-50/30 focus:bg-white`}
                  />
                  {errors.notion_api_key && (
                    <p className="mt-2 text-sm text-red-500">{errors.notion_api_key}</p>
                  )}
                </div>

                {/* Database IDs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tasks */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-2">
                      Tasks DB
                    </label>
                    <input
                      type="text"
                      value={config.tasks_db_id}
                      onChange={(e) => handleInputChange('tasks_db_id', e.target.value)}
                      placeholder="Database ID"
                      className="w-full px-3 py-2.5 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 hover:border-purple-300 transition-all duration-200 bg-purple-50/30 focus:bg-white text-sm"
                    />
                  </div>

                  {/* Plan */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-2">
                      Plan DB
                    </label>
                    <input
                      type="text"
                      value={config.plan_db_id}
                      onChange={(e) => handleInputChange('plan_db_id', e.target.value)}
                      placeholder="Database ID"
                      className="w-full px-3 py-2.5 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 hover:border-purple-300 transition-all duration-200 bg-purple-50/30 focus:bg-white text-sm"
                    />
                  </div>

                  {/* Strategy */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-2">
                      Strategy DB
                    </label>
                    <input
                      type="text"
                      value={config.strategy_db_id}
                      onChange={(e) => handleInputChange('strategy_db_id', e.target.value)}
                      placeholder="Database ID"
                      className="w-full px-3 py-2.5 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 hover:border-purple-300 transition-all duration-200 bg-purple-50/30 focus:bg-white text-sm"
                    />
                  </div>
                </div>

                {/* 结果显示 */}
                {testResult && (
                  <div className={`p-4 rounded-xl border-2 ${
                    testResult.success 
                      ? 'bg-green-50/50 border-green-200' 
                      : 'bg-red-50/50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {testResult.success ? '✅' : '❌'}
                      </span>
                      <div>
                        <p className={`font-semibold ${
                          testResult.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {testResult.success ? 'Connection verified' : 'Connection failed'}
                        </p>
                        <p className={`text-sm ${
                          testResult.success ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {testResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 同步结果显示 */}
                {syncResult && (
                  <div className={`p-4 rounded-xl border-2 ${
                    syncResult.success 
                      ? 'bg-purple-50/50 border-purple-200' 
                      : 'bg-red-50/50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {syncResult.success ? '🎉' : '❌'}
                      </span>
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          syncResult.success ? 'text-purple-900' : 'text-red-800'
                        }`}>
                          {syncResult.success ? 'Sync completed' : 'Sync failed'}
                        </p>
                        <p className={`text-sm ${
                          syncResult.success ? 'text-purple-700' : 'text-red-600'
                        }`}>
                          {syncResult.message}
                        </p>
                        {syncResult.results && syncResult.results.length > 0 && (
                          <div className="mt-2 flex gap-2">
                            {syncResult.results.map((result: any, index: number) => (
                              <div key={index} className={`text-xs px-2 py-1 rounded-full font-medium ${
                                result.success 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {result.database}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="p-8 border-t border-purple-100 bg-purple-50/30">
            <div className="flex justify-center gap-4">
              <button
                onClick={handleTest}
                disabled={testing || saving || syncing || !config.notion_api_key || !config.tasks_db_id}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {testing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              
              <button
                onClick={handleSync}
                disabled={testing || saving || syncing || !config.notion_api_key || !config.tasks_db_id || !config.plan_db_id || !config.strategy_db_id}
                className="px-6 py-3 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {syncing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {syncing ? 'Syncing...' : 'Sync Workspace'}
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving || loading || syncing}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}