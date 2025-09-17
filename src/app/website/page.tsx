'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { themes } from '@/lib/themes'

export default function WebsitePage() {
  const [city, setCity] = useState('')
  const [name, setName] = useState('')
  const [notionApiKey, setNotionApiKey] = useState('')
  const [databaseUrl, setDatabaseUrl] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('pink')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const extractDatabaseId = (url: string) => {
    const match = url.match(/([a-f0-9]{32})|([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i)
    return match ? match[0].replace(/-/g, '') : ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const databaseId = extractDatabaseId(databaseUrl)
    if (!databaseId) {
      alert('Invalid database URL')
      setIsSubmitting(false)
      return
    }

    // Store in localStorage
    const userKey = `${city.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '')}`
    localStorage.setItem(`notion-${userKey}`, JSON.stringify({
      apiKey: notionApiKey,
      databaseId,
      city,
      name,
      theme: selectedTheme
    }))

    // Navigate to user page
    const citySlug = city.toLowerCase().replace(/\s+/g, '')
    const nameSlug = name.toLowerCase().replace(/\s+/g, '')

    setTimeout(() => {
      router.push(`/website/${citySlug}/${nameSlug}`)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform hover:shadow-3xl transition-all duration-500 border border-pink-100/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-gray-800 mb-2">Create Your Website</h1>
            <p className="text-gray-500 text-sm">Connect your Notion database to generate your personal page</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 bg-white/70 backdrop-blur-sm transition-all duration-300"
                  placeholder="Ottawa"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 bg-white/70 backdrop-blur-sm transition-all duration-300"
                  placeholder="Monika Dong"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Notion API Key</label>
              <input
                type="password"
                value={notionApiKey}
                onChange={(e) => setNotionApiKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 bg-white/70 backdrop-blur-sm transition-all duration-300"
                placeholder="secret_..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Database Address</label>
              <input
                type="url"
                value={databaseUrl}
                onChange={(e) => setDatabaseUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 bg-white/70 backdrop-blur-sm transition-all duration-300"
                placeholder="https://notion.so/username/database-name-abc123..."
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Choose Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(themes).map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedTheme === theme.id
                        ? 'border-gray-400 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${theme.accent} mb-2`}></div>
                    <p className="text-xs font-medium text-gray-700">{theme.name}</p>
                    {selectedTheme === theme.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 disabled:from-pink-300 disabled:to-rose-300 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Website'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}