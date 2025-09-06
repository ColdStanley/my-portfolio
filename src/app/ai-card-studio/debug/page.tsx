'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function DebugPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">AI Card Studio - User Debug</h1>
        
        {user ? (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Current User Information</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm">User ID (复制这个 ID):</label>
                <div className="bg-gray-700 p-3 rounded mt-1 font-mono text-green-400 break-all">
                  {user.id}
                </div>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Email:</label>
                <div className="bg-gray-700 p-3 rounded mt-1">
                  {user.email}
                </div>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Created At:</label>
                <div className="bg-gray-700 p-3 rounded mt-1">
                  {new Date(user.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded">
              <h3 className="font-semibold text-blue-400 mb-2">配置步骤：</h3>
              <ol className="list-decimal list-inside text-sm space-y-1">
                <li>复制上面的 User ID</li>
                <li>打开 .env.local 文件</li>
                <li>将 NEXT_PUBLIC_DEVELOPER_ADMIN_IDS=YOUR_USER_ID_HERE 中的 YOUR_USER_ID_HERE 替换为您的 User ID</li>
                <li>重启开发服务器 (npm run dev)</li>
                <li>访问 AI Card Studio 并按 Ctrl+Shift+D</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-6">
            <h2 className="text-red-400 font-semibold mb-2">未登录</h2>
            <p className="mb-4">请先登录 AI Card Studio 才能获取用户 ID</p>
            <a 
              href="/ai-card-studio" 
              className="inline-block bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-medium"
            >
              前往 AI Card Studio 登录
            </a>
          </div>
        )}
      </div>
    </div>
  )
}