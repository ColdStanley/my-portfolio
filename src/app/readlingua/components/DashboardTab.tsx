'use client'

import { useEffect, useState } from 'react'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import { articleApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'
import UploadForm from './UploadForm'
import ArticleList from './ArticleList'

interface DashboardTabProps {
  nativeLanguage: string
  learningLanguage: string
}

const PANEL_CLASS = 'flex min-h-0 flex-col overflow-hidden border border-border bg-surface'
const PANEL_BODY_CLASS = 'flex-1 min-h-0 overflow-y-auto p-4'

export default function DashboardTab({ nativeLanguage, learningLanguage }: DashboardTabProps) {
  const {
    articles,
    setArticles,
    shouldRefreshArticles,
    setSelectedArticle,
    setActiveTab,
    addArticle
  } = useReadLinguaStore()
  const [isLoading, setIsLoading] = useState(false)

  const filteredArticles = articles.filter(
    (article) =>
      article.native_language === nativeLanguage &&
      article.source_language === learningLanguage
  )

  useEffect(() => {
    if (shouldRefreshArticles()) {
      void loadArticles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleArticleUploaded = (newArticle: any) => {
    addArticle(newArticle)
  }

  const loadArticles = async () => {
    try {
      setIsLoading(true)
      let userId = 'anonymous'

      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()
        if (user) {
          userId = user.id
        }
      } catch (authError) {
        console.warn('Anonymous mode', authError)
      }

      const userArticles = await articleApi.getArticles(userId)
      setArticles(userArticles)
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleArticleSelect = (article: any) => {
    setSelectedArticle(article)
    setActiveTab('learning')
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden px-6 py-6">
      <div className="grid h-full min-h-0 gap-4 lg:grid-cols-2">
        <article className={PANEL_CLASS}>
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-text-primary">Browse Articles</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={loadArticles}
                disabled={isLoading}
                className="p-1 text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
                title="Refresh articles"
              >
                <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <span className="px-2 py-0.5 text-xs text-text-secondary border border-border">
                {filteredArticles.length}
              </span>
            </div>
          </header>

          <div className={PANEL_BODY_CLASS}>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span className="text-sm text-text-secondary">Loading...</span>
                </div>
              </div>
            ) : (
              <ArticleList
                articles={filteredArticles}
                onArticleSelect={handleArticleSelect}
              />
            )}
          </div>
        </article>

        <article className={`${PANEL_CLASS} hidden md:flex`}>
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-text-primary">Add New Article</h2>
          </header>

          <div className={PANEL_BODY_CLASS}>
            <UploadForm
              defaultNativeLanguage={nativeLanguage}
              defaultSourceLanguage={learningLanguage}
              onArticleUploaded={handleArticleUploaded}
            />
          </div>
        </article>
      </div>
    </section>
  )
}
