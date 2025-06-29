// src/app/lueur/hooks/useLueurData.ts
'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../lib/supabase'  // ✅ 正确使用懒加载单例
import { parseHighlightData } from '../utils/parseHighlightData'
import { ParsedLueurItem, LueurItem } from '../types'

export default function useLueurData(): {
  item: ParsedLueurItem | null
  loading: boolean
  error: string | null
} {
  const [item, setItem] = useState<ParsedLueurItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const supabase = getSupabaseClient()  // ✅ 使用单例客户端

      const { data, error } = await supabase
        .from('lueur_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        console.warn('⚠️ No data fetched:', error?.message ?? 'null')
        setError(error?.message ?? 'No data')
        setLoading(false)
        return
      }

      const parsed = parseHighlightData(data as LueurItem)
      setItem(parsed)
      setLoading(false)
    }

    fetch()
  }, [])

  return { item, loading, error }
}
