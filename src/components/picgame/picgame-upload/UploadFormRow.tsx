'use client'

import { useState } from 'react'

interface Props {
  quotes: string
  setQuotes: (val: string) => void
  onInsertFromCategory: (category: 'love' | 'apology' | 'blessing' | 'thanks') => void
}

export default function UploadFormRow({ quotes, setQuotes, onInsertFromCategory }: Props) {
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
      alert('Please select an image first.')
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
    alert('Upload successful!')
  }

  const handleSaveToNotion = async () => {
    if (!imageUrl) {
      alert('Please upload an image first.')
      return
    }
    if (!description && !quotes.trim()) {
      alert('Please provide both a description and quote.')
      return
    }
    if (!description) {
      alert('Please enter a description.')
      return
    }
    if (!quotes.trim()) {
      alert('Please enter a quote.')
      return
    }

    setSaving(true)

    const res = await fetch('/api/picgame/save-to-notion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, description, quotes, type: 'Uncategorized' }),
    })

    const data = await res.json()

    setSaving(false)

    if (!data.title) {
      alert('Failed to save. Please check the server log.')
      return
    }

    const link = `${window.location.origin}/picgame/user-view/${data.title}`
    setShareLink(link)
    alert('Your shareable link is ready!')
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
        {/* Left: Upload Image */}
        <div className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between h-[300px]">
          <div className="text-gray-700 text-sm mb-2 font-semibold">Upload Image</div>
          <p className="text-xs text-gray-400 mb-2">Drag and drop, or use the button below to select a file</p>
          <input type="file" accept="image/*" className="mb-4" onChange={handleFileChange} />
          <div className="flex justify-end">
            <button
              className="px-4 py-2 text-sm rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {imageUrl && (
            <div className="mt-4 text-xs text-purple-500 break-all">
              Image uploaded:<br />
              <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {imageUrl}
              </a>
            </div>
          )}
        </div>

        {/* Middle: Quotes */}
        <div className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between h-[300px]">
          <div className="text-gray-700 text-sm mb-2 font-semibold">Quote Bubbles</div>
          <textarea
            rows={4}
            value={quotes}
            onChange={(e) => setQuotes(e.target.value)}
            placeholder="Write a few words to someone, to yourself, or to the future..."
            className="flex-grow border border-purple-200 rounded-lg p-3 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <button
              onClick={() => onInsertFromCategory('love')}
              className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              LOVE
            </button>
            <button
              onClick={() => onInsertFromCategory('apology')}
              className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              Apology
            </button>
            <button
              onClick={() => onInsertFromCategory('blessing')}
              className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              Blessing
            </button>
            <button
              onClick={() => onInsertFromCategory('thanks')}
              className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              Thanks
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400 italic">
            For custom quote templates, email <span className="underline">stanleytonight@hotmail.com</span>
          </p>
        </div>

        {/* Right: Description */}
        <div className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between h-[300px]">
          <div className="text-gray-700 text-sm mb-2 font-semibold">Photo Story</div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="The story behind this photo—your thoughts, feelings, or the moment..."
            className="flex-grow border border-purple-200 rounded-lg p-3 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      {/* Generate Link */}
      <div className="grid grid-cols-3 gap-4 w-full mb-8 items-center">
        <div className="flex items-center justify-start">
          <button
            className="w-[400px] py-2 text-sm rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all disabled:opacity-50"
            onClick={handleSaveToNotion}
            disabled={saving}
          >
            {saving ? '⏳ Generating link...' : 'Generate link to share with He, She, They, or Yourself'}
          </button>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareLink}
            placeholder="Your shareable link will appear here"
            className="w-full border border-purple-300 rounded-lg px-4 py-2 text-sm bg-gray-50 text-purple-600 font-medium focus:outline-none"
          />
          <button
            className="w-16 py-2 text-sm bg-purple-100 text-purple-600 rounded hover:bg-purple-200 text-center"
            onClick={handleCopy}
          >
            Copy
          </button>
        </div>
      </div>
    </>
  )
}
