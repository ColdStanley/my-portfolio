'use client'

import { useEffect, useState } from 'react'
import { CardItem, HighlightItem, NotionApiResponse } from '@/types/common'

export function useNotionCards(pageId?: string) {
  const [cards, setCards] = useState<CardItem[]>([])
  const [loading, setLoading] = useState(pageId !== undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (pageId === undefined) {
      setLoading(false)
      return
    }

    const fetchCards = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const url = pageId ? `/api/notion?pageId=${pageId}` : '/api/notion'
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch card data')
        }
        
        const result: NotionApiResponse<CardItem> = await response.json()
        setCards(result.data || [])
      } catch (err) {
        console.error('Error loading cards:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [pageId])

  return { cards, loading, error, refetch: () => setLoading(true) }
}

export function useNotionHighlights(skipFetch = false) {
  const [highlights, setHighlights] = useState<HighlightItem[]>([])
  const [loading, setLoading] = useState(!skipFetch)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (skipFetch) {
      setLoading(false)
      return
    }

    const fetchHighlights = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/notion?pageId=home-latest')
        
        if (!response.ok) {
          throw new Error('Failed to fetch highlights')
        }
        
        const result: NotionApiResponse<HighlightItem> = await response.json()
        
        if (result.data && Array.isArray(result.data)) {
          const filtered = result.data
            .filter((item: any) => item?.status === 'Published' && item?.visibleOnSite === true)
            .sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999))
          setHighlights(filtered)
        } else {
          setHighlights([])
        }
      } catch (err) {
        console.error('Failed to load highlights', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchHighlights()
  }, [skipFetch])

  return { highlights, loading, error }
}