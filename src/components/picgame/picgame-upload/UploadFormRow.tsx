'use client'

import { useState } from 'react'

interface Props {
  quotes: string
  setQuotes: (val: string) => void
}

export default function UploadFormRow({ quotes, setQuotes }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('请先选择图片')
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    const res = await fetch('/api/picgame/blob-upload', { method: 'POST', body: formData })
    const data = await res.json()
    const completeUrl = data.url.startsWith('http') ? data.url : `https://${data.url}`
    setImageUrl(completeUrl)
    setUploading(false)
    alert('上传成功！')
  }

  const handleSaveToNotion = async () => {
    if (!imageUrl) {
      alert('请先上传图片')
      return
    }
    if (!description && !quotes.trim()) {
      alert('请填写描述和 Quotes 内容')
      return
    }
    if (!description) {
      alert('请填写描述内容')
      return
    }
    if (!quotes.trim()) {
      alert('请填写 Quotes 内容')
      return
    }

    setSaving(true)

    const res = await fetch('/api/picgame/save-to-notion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, description, quotes, type: '未分类' }),
    })

    const data = await res.json()

    setSaving(false)

    if (!data.title) {
      alert('保存失败，请检查服务器日志')
      return
    }

    const link = `${window.location.origin}/picgame/user-view/${data.title}`
    setShareLink(link)
    alert('已成功生成分享链接！')
  }

  const handleCopy = () => {
    if (!shareLink) return
    navigator.clipboard.writeText(shareLink)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 w-full mb-8">
        {/* 左栏：图片上传 */}
        <div className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between h-[300px]">
          <div className="text-gray-700 text-sm mb-2 font-semibold">上传图片</div>
          <p className="text-xs text-gray-400 mb-2">支持拖拽上传，或点击下方按钮选择文件</p>
          <input type="file" accept="image/*" className="mb-4" onChange={handleFileChange} />
          <div className="flex justify-end">
            <button
              className="px-4 py-2 text-sm rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? '上传中...' : '确认上传'}
            </button>
          </div>
          {imageUrl && (
            <div className="mt-4 text-xs text-purple-500 break-all">
              图片链接已生成：<br />
              <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {imageUrl}
              </a>
            </div>
          )}
        </div>

        {/* 中栏：Quotes */}
        <div className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between h-[300px]">
          <div className="text-gray-700 text-sm mb-2 font-semibold">Quotes</div>
          <textarea
            rows={4}
            value={quotes}
            onChange={(e) => setQuotes(e.target.value)}
            placeholder="写给某人，自己，或未来的几句话……"
            className="flex-grow border border-purple-200 rounded-lg p-3 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* 右栏：图片描述 */}
        <div className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between h-[300px]">
          <div className="text-gray-700 text-sm mb-2 font-semibold">图片描述</div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请输入这张图片背后的故事、情绪、时间或想法……"
            className="flex-grow border border-purple-200 rounded-lg p-3 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      {/* 确认生成链接 */}
      <div className="grid grid-cols-3 gap-4 w-full mb-8 items-center">
        <div className="flex items-center justify-start">
          <button
            className="w-[400px] py-2 text-sm rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all disabled:opacity-50"
            onClick={handleSaveToNotion}
            disabled={saving}
          >
            {saving ? '⏳ 正在生成链接...' : '确认生成可分享的链接'}
          </button>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareLink}
            placeholder="生成的链接将显示在这里"
            className="w-full border border-purple-300 rounded-lg px-4 py-2 text-sm bg-gray-50 text-purple-600 font-medium focus:outline-none"
          />
          <button
            className="w-16 py-2 text-sm bg-purple-100 text-purple-600 rounded hover:bg-purple-200 text-center"
            onClick={handleCopy}
          >
            复制
          </button>
        </div>
      </div>
    </>
  )
}
