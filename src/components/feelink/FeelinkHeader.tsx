'use client'
import { motion } from 'framer-motion'
import { Quicksand } from 'next/font/google'
import Link from 'next/link'
import { HiOutlinePhotograph } from 'react-icons/hi'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'

// Merged FeelinkFloatingBackground component
function FeelinkFloatingBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* 渐变圆圈 1 */}
      <motion.div
        className="absolute top-[20%] left-[10%] w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30"
        animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 渐变圆圈 2 */}
      <motion.div
        className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-purple-100 rounded-full blur-2xl opacity-20"
        animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export default function FeelinkHeader() {
  const { ref, inView } = useInView({ triggerOnce: true })
  
  // Upload functionality state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [quotes, setQuotes] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  
  // Sample quotes for quick insertion
  const sampleQuotes = {
    love: [
      "Meeting you is the luckiest thing that's ever happened to me.",
      "Your smile finds its way into my dreams.",
      "You're the person I once wished for, silently.",
      "When you appear, everything else quiets down.",
      "My heart races every time I see you—without fail."
    ],
    apology: [
      "I'm truly sorry—I never meant to hurt you.",
      "Your forgiveness would mean the world to me.",
      "I'm not perfect, but I'm trying to be better.",
      "Please don't stay mad—it hurts me more than you know.",
      "Sorry, I messed up—I promise to do better next time."
    ],
    blessing: [
      "May your heart always find its light, and your eyes their wonder.",
      "Wishing you peace, joy, and everything in between.",
      "May your days carry breezes and blossoms.",
      "May every effort bring quiet, beautiful rewards.",
      "May you become your own sun, glowing from within."
    ],
    thanks: [
      "Thank you for always being there.",
      "You complete my world—thank you.",
      "Your presence lights up my life—thank you.",
      "You've filled my life with laughter and light—thank you.",
      "Having you is having the whole world—thank you."
    ]
  }

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
    const res = await fetch('/api/feelink/blob-upload', { method: 'POST', body: formData })
    const data = await res.json()
    const completeUrl = data.url.startsWith('http') ? data.url : `https://${data.url}`
    setImageUrl(completeUrl)
    setUploading(false)
    setUploadSuccess(true)
    setTimeout(() => setUploadSuccess(false), 1500)
    alert('Upload successful!')
  }

  const handleSaveToSupabase = async () => {
    if (!imageUrl) {
      alert('Please upload an image first.')
      return
    }
    if (!description || !quotes.trim()) {
      alert('Please provide both a description and quote.')
      return
    }

    setSaving(true)

    const res = await fetch('/api/feelink/save-to-supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, description, quotes, type: 'User Created' }),
    })

    const data = await res.json()

    setSaving(false)

    if (!data.title) {
      alert('Failed to save. Please check the server log.')
      return
    }

    const link = `${window.location.origin}/feelink/user-view/${data.title}`
    setShareLink(link)
    alert('Your shareable link is ready!')
  }

  const handleCopy = () => {
    if (!shareLink) return
    navigator.clipboard.writeText(shareLink)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 1500)
  }

  const handleInsertQuote = (category: keyof typeof sampleQuotes) => {
    const selectedQuotes = sampleQuotes[category]
    const randomQuote = selectedQuotes[Math.floor(Math.random() * selectedQuotes.length)]
    setQuotes(prev => prev ? `${prev}\n${randomQuote}` : randomQuote)
  }

  return (
    <div className="relative w-full mb-10" ref={ref}>
      <FeelinkFloatingBackground />

      {/* 第一行：左侧Card */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        {/* 左栏 - 保持不变 */}
        <motion.div
          className="bg-white shadow rounded-xl px-6 py-8 flex flex-col justify-between relative min-h-[200px]"
        >
          {/* 嵌入右上角的锚点按钮组 */}
          <div className="absolute top-6 right-6 flex flex-col space-y-2 items-end">
            {['Love', 'Sorry', 'Blessing', 'Thanks'].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="w-28 text-center px-4 py-1 text-sm font-medium rounded-full border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-900 hover:scale-105 transition-all"
              >
                {label}
              </a>
            ))}
          </div>

          {/* 文案主体区域 */}
          <div className="flex flex-col gap-y-4 pr-32">
            <motion.h1
              className={`text-3xl md:text-4xl font-extrabold text-purple-600 tracking-wide ${quicksand.className}`}
              animate={{
                textShadow: [
                  '0px 0px 0px rgba(192,132,252,0.3)',
                  '0px 0px 12px rgba(192,132,252,0.6)',
                  '0px 0px 24px rgba(192,132,252,0.8)',
                  '0px 0px 12px rgba(192,132,252,0.6)',
                  '0px 0px 0px rgba(192,132,252,0.3)'
                ],
                scale: [1, 1.03, 1],
                opacity: [1, 0.95, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              Feelink
            </motion.h1>

            <p className="text-base text-gray-700 font-medium leading-snug">Say it with a picture.</p>
            <p className="text-sm text-gray-500 leading-snug">Every feeling deserves to be seen and shared.</p>
            <p className="text-sm text-gray-500 italic leading-snug">Explore your message by mood:</p>
          </div>

        </motion.div>
      </motion.div>

      {/* 第二行：4个创作步骤 */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      >
        {/* 步骤1：上传图片 */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
          <div className="text-center mb-4">
            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-purple-600 font-medium text-sm">1</span>
            </div>
            <h4 className="text-sm font-medium text-purple-700 mb-2">Upload Image</h4>
          </div>
          
          <div className="space-y-3">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="w-full text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-2.5 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Uploading...' : uploadSuccess ? '✓ Uploaded' : 'Upload'}
              </button>
            )}
          </div>
        </div>

        {/* 步骤2：选择引用 */}
        <div className={`bg-white rounded-xl shadow-sm border border-purple-100 p-6 transition-opacity duration-300 ${!imageUrl ? 'opacity-50' : ''}`}>
          <div className="text-center mb-4">
            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-purple-600 font-medium text-sm">2</span>
            </div>
            <h4 className="text-sm font-medium text-purple-700 mb-2">Add Quotes</h4>
          </div>
          
          {imageUrl ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(sampleQuotes).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleInsertQuote(category as keyof typeof sampleQuotes)}
                    className="px-2 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors border border-purple-200"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
              <textarea
                value={quotes}
                onChange={(e) => setQuotes(e.target.value)}
                placeholder="Select or write quotes..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center">Upload image first</p>
          )}
        </div>

        {/* 步骤3：写描述 */}
        <div className={`bg-white rounded-xl shadow-sm border border-purple-100 p-6 transition-opacity duration-300 ${!imageUrl || !quotes.trim() ? 'opacity-50' : ''}`}>
          <div className="text-center mb-4">
            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-purple-600 font-medium text-sm">3</span>
            </div>
            <h4 className="text-sm font-medium text-purple-700 mb-2">Photo Story</h4>
          </div>
          
          {imageUrl && quotes.trim() ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the story..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
          ) : (
            <p className="text-sm text-gray-400 text-center">Complete previous steps</p>
          )}
        </div>

        {/* 步骤4：生成链接 */}
        <div className={`bg-white rounded-xl shadow-sm border border-purple-100 p-6 transition-opacity duration-300 ${!imageUrl || !quotes.trim() || !description ? 'opacity-50' : ''}`}>
          <div className="text-center mb-4">
            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-purple-600 font-medium text-sm">4</span>
            </div>
            <h4 className="text-sm font-medium text-purple-700 mb-2">Generate</h4>
          </div>
          
          {imageUrl && quotes.trim() && description ? (
            <div className="space-y-3">
              <button
                onClick={handleSaveToSupabase}
                disabled={saving}
                className="w-full py-2.5 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {saving ? '⏳ Creating...' : 'Generate Feelink'}
              </button>
              
              {shareLink && (
                <div className="space-y-2">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-gray-50 text-purple-600"
                  />
                  <button
                    onClick={handleCopy}
                    className="w-full py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    {copySuccess ? '✓ Copied' : 'Copy Link'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center">Complete all steps</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
