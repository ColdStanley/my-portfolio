'use client'

import { useEffect, useState } from 'react'
import { useJdInputStore } from '../store/useJdInputStore'
import { getSingleEmbedding } from '../utils/deepseekEmbedding'
import { splitAndEmbedSentences } from '../utils/splitAndEmbedSentences'

const LOCAL_KEY = 'cv_builder_saved_jd'

function computeHash(text: string): string {
  return btoa(unescape(encodeURIComponent(text)))
}

export default function JdInputPanel() {
  const {
    jdText,
    setJdText,
    setJdEmbedding,
    setJdSentenceEmbeddings,
  } = useJdInputStore()

  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [fadeIn, setFadeIn] = useState(false)
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.jdText) setJdText(parsed.jdText)
        if (parsed.embedding) setJdEmbedding(parsed.embedding)
        if (parsed.sentenceEmbeddings) setJdSentenceEmbeddings(parsed.sentenceEmbeddings)
        if (parsed.timestamp) setSavedAt(parsed.timestamp)
      } catch (err) {
        console.warn('Failed to parse saved JD from localStorage:', err)
      }
    }
  }, [setJdText, setJdEmbedding, setJdSentenceEmbeddings])

  useEffect(() => {
    const timeout = setTimeout(() => setFadeIn(true), 50)
    return () => clearTimeout(timeout)
  }, [])

  const handleSave = async () => {
    if (!jdText.trim()) {
      setStatus('Job description cannot be empty.')
      return
    }

    const currentHash = computeHash(jdText)
    const cached = localStorage.getItem(LOCAL_KEY)

    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (
          computeHash(parsed.jdText) === currentHash &&
          parsed.embedding &&
          parsed.sentenceEmbeddings &&
          parsed.sentenceEmbeddings.length > 0
        ) {
          setJdEmbedding(parsed.embedding)
          setJdSentenceEmbeddings(parsed.sentenceEmbeddings)
          setSavedAt(Date.now())
          setStatus('Job description unchanged. Loaded cached embeddings.')
          return
        }
      } catch (err) {
        console.warn('Failed to parse existing JD cache:', err)
      }
    }

    setSaving(true)
    setStatus('Generating embeddings...')

    try {
      const [embedding, sentenceResult] = await Promise.all([
        getSingleEmbedding(jdText),
        splitAndEmbedSentences(jdText),
      ])

      const sentenceEmbeddings = sentenceResult.sentences.map((s, i) => ({
        sentence: s,
        embedding: sentenceResult.embeddings[i],
      }))

      setJdEmbedding(embedding)
      setJdSentenceEmbeddings(sentenceEmbeddings)

      localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify({
          jdText,
          embedding,
          sentenceEmbeddings,
          timestamp: Date.now(),
        })
      )

      setSavedAt(Date.now())
      setStatus('Embeddings updated and saved.')
    } catch (err) {
      console.error('Embedding failed:', err)
      setStatus('Failed to generate embeddings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className={`relative max-w-5xl mx-auto px-4 py-6 space-y-4 transition-opacity duration-500 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <h2 className="text-2xl font-bold text-gray-800">Paste the Job Description</h2>

      <textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="Paste the job description here..."
        rows={24}
        className="w-full border border-gray-300 rounded-lg p-4 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
      />

      <div className="pt-2 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">{status}</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-5 py-2 rounded text-sm font-medium flex items-center gap-2 transition-all duration-300 active:scale-95 ${
              saving
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
            }`}
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {saving ? 'Saving...' : 'Save to Browser'}
          </button>
        </div>

        {savedAt && (
          <p className="text-xs text-gray-500 text-right mt-1">
            Last saved at: {new Date(savedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  )
}
