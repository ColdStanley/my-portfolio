'use client'

import { useState } from 'react'

export default function NotionToSupabaseSync() {
  const [supabaseTable, setSupabaseTable] = useState('')
  const [databaseId, setDatabaseId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')

  const handleSync = async () => {
    if (!supabaseTable || !databaseId) {
      setStatus('❗请输入完整的表名和数据库 ID')
      return
    }

    setSubmitting(true)
    setStatus('🚀 正在同步数据...')
    try {
      const res = await fetch('/api/notionwriter/sync-to-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: supabaseTable, databaseId }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus(`✅ 同步成功，共写入 ${data.count} 条记录`)
      } else {
        setStatus(`❌ 同步失败: ${data.message}`)
      }
    } catch (err) {
      setStatus('❌ 同步出错，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-20 px-4 max-w-7xl mx-auto font-sans space-y-10">

      {/* 顶部进度条 */}
      {submitting && (
        <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-700 animate-pulse" />
      )}

      {/* 使用说明卡片 */}
      <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-md">
        <h2 className="text-lg font-bold text-purple-700 mb-2">使用说明</h2>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Notion 的 <strong className="text-purple-600">Title 字段</strong> 内容不会写入 Supabase</li>
          <li>Supabase 和 Notion 字段类型都应为 <strong className="text-purple-600">text</strong></li>
        </ul>
      </div>

      {/* 三列横向表单区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <input
          type="text"
          placeholder="Supabase 表名"
          className="w-full p-3 border border-gray-300 rounded-xl shadow-sm text-sm focus:outline-purple-500"
          value={supabaseTable}
          onChange={(e) => setSupabaseTable(e.target.value)}
        />
        <input
          type="text"
          placeholder="Notion 数据库 ID"
          className="w-full p-3 border border-gray-300 rounded-xl shadow-sm text-sm focus:outline-purple-500"
          value={databaseId}
          onChange={(e) => setDatabaseId(e.target.value)}
        />
        <button
          onClick={handleSync}
          disabled={submitting}
          className="w-full bg-purple-600 hover:bg-purple-700 hover:scale-105 transition-all text-white text-sm font-semibold rounded-xl px-4 py-3 disabled:opacity-50 shadow-md"
        >
          {submitting ? '同步中...' : '确认写入'}
        </button>
      </div>

      {/* 状态提示 */}
      {status && (
        <div className="text-sm text-gray-700 italic text-center">{status}</div>
      )}
    </div>
  )
}
