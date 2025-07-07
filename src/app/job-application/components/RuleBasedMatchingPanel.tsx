'use client'

import { useEffect, useState } from 'react'
import { useJdInputStore } from '../store/useJdInputStore'
import { useAuthStore } from '@/store/useAuthStore'
import { matchJDWithVector } from '../utils/deepseekVectorMatcher'
import { matchJDWithResumeSentences, MatchResult } from '../utils/matchJDWithResumeSentences'
import { extractUnmatchedJDLines } from '../utils/missingDetector'
import { supabase } from '@/lib/supabaseClient'

import OverallSimilarityPanel from './analysis/OverallSimilarityPanel'
import Top3MatchesPanel from './analysis/Top3MatchesPanel'
import MissingCoveragePanel from './analysis/MissingCoveragePanel'
import SentenceHighlightViewer from './analysis/SentenceHighlightViewer'

interface MatchItem {
  content: string
  similarity: number
  contentType: string
}

interface MatchAnalysisResult {
  jdText: string
  resumeCentroidSimilarity: number
  matches: MatchItem[]
  unmatchedJDLines: string[]
}

interface Props {
  active: boolean
}

export default function RuleBasedMatchingPanel({ active }: Props) {
  if (!active) return null

  const jdText = useJdInputStore((s) => s.jdText)
  const jdEmbedding = useJdInputStore((s) => s.jdEmbedding)
  const jdSentenceEmbeddings = useJdInputStore((s) => s.jdSentenceEmbeddings)

  const [analysisResult, setAnalysisResult] = useState<MatchAnalysisResult | null>(null)
  const [sentenceMatchResults, setSentenceMatchResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setFadeIn(true), 50)
    return () => clearTimeout(timeout)
  }, [])

  const fetchResumeDataFromSupabase = async (userId: string) => {
    const { data, error } = await supabase
      .from('cv_builder_data')
      .select('data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) throw new Error('❌ Failed to fetch resume data')

    return data.data // resume JSON: { workExperience, projects, skills, education, awards }
  }

  const handleVectorMatch = async () => {
    setLoading(true)
    setError(null)

    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Missing userId')

      const resume = await fetchResumeDataFromSupabase(userId)

      const result = await matchJDWithVector(jdText, 20, userId, jdEmbedding, {
        work: resume.workExperience,
        project: resume.projects,
        education: resume.education,
        award: resume.awards,
        skills: resume.skills,
      })

      const unmatched = extractUnmatchedJDLines(jdText, result.matches)

      setAnalysisResult({
        jdText,
        resumeCentroidSimilarity: result.overallScore,
        matches: result.matches,
        unmatchedJDLines: unmatched,
      })

      if (jdSentenceEmbeddings.length > 0) {
        const sentenceResults = await matchJDWithResumeSentences(jdSentenceEmbeddings, userId)
        console.log('✅ sentenceMatchResults:', sentenceResults)
        setSentenceMatchResults(sentenceResults)
      }
    } catch (err) {
      console.error(err)
      setError('❌ Matching analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`transition-opacity duration-500 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      } max-w-5xl mx-auto px-4 py-10 space-y-8`}
    >
      <h2 className="text-2xl font-bold text-gray-800">Matching Analysis</h2>
      <p className="text-sm text-gray-600">Here’s how your resume aligns with this job.</p>

      <div className="flex justify-end">
        <button
          onClick={handleVectorMatch}
          className="px-4 py-2 rounded bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
        >
          Start Matching Analysis
        </button>
      </div>

      {loading && <p className="text-gray-500 text-sm">Analyzing... Please wait.</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {analysisResult && (
        <div className="space-y-8">
          <OverallSimilarityPanel
            resumeCentroidSimilarity={analysisResult.resumeCentroidSimilarity}
          />

          <Top3MatchesPanel topMatches={analysisResult.matches.slice(0, 3)} />

          {sentenceMatchResults.length > 0 && (
            <SentenceHighlightViewer matches={sentenceMatchResults} />
          )}

          <MissingCoveragePanel unmatchedLines={analysisResult.unmatchedJDLines} />
        </div>
      )}
    </div>
  )
}
