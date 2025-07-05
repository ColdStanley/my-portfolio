'use client'

import { useEffect, useState } from 'react'
import { useJdInputStore } from '../store/useJdInputStore'
import { toast } from 'sonner'

const LOCAL_KEY = 'cv_builder_saved_jd'

export default function JdInputPanel() {
  const { jdText, setJdText } = useJdInputStore()
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  // 自动加载本地 JD（首次进入页面时）
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY)
    if (saved) {
      setJdText(saved)
    }
  }, [setJdText])

  const handleSave = () => {
    setSaving(true)
    localStorage.setItem(LOCAL_KEY, jdText)
    setSavedAt(Date.now())

    setTimeout(() => {
      setSaving(false)
      toast.success('✅ 职位描述已保存到浏览器')
    }, 800)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">📄 粘贴职位描述</h2>

      <textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="请粘贴职位描述..."
        rows={12}
        className="w-full border rounded p-4 text-sm text-gray-800"
      />

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded text-sm transition ${
            saving
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {saving ? 'Saving...' : '💾 Save to Browser'}
        </button>
      </div>

      {savedAt && (
        <p className="text-xs text-gray-400 text-right">
          上次保存时间：{new Date(savedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
