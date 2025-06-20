'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import dayjs from 'dayjs'

type UserType = 'guest' | 'registered' | 'pro' | 'vip'

const LIMITS = {
  guest: 2,
  registered: 4,
  pro: 10,
  vip: Infinity,
}

export function useAnswerCounter(userId: string | null, userType: UserType = 'guest') {
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const todayKey = `ielts-answer-count-${dayjs().format('YYYY-MM-DD')}`

  useEffect(() => {
    const fetchCount = async () => {
      setLoading(true)

      if (!userId) {
        // 游客：使用 localStorage
        const localCount = parseInt(localStorage.getItem(todayKey) || '0', 10)
        setCount(localCount)
      } else {
        // 注册用户：从 Supabase 获取
        const { data, error } = await supabase
          .from('answer_count')
          .select('count')
          .eq('user_id', userId)
          .eq('date', dayjs().format('YYYY-MM-DD'))
          .single()

        if (data) {
          setCount(data.count)
        } else {
          setCount(0)
        }
      }

      setLoading(false)
    }

    fetchCount()
  }, [userId])

  const increaseCount = async () => {
    const newCount = count + 1
    setCount(newCount)

    if (!userId) {
      localStorage.setItem(todayKey, newCount.toString())
    } else {
      const date = dayjs().format('YYYY-MM-DD')

      // 查是否已有记录
      const { data, error } = await supabase
        .from('answer_count')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single()

      if (data) {
        await supabase
          .from('answer_count')
          .update({ count: newCount })
          .eq('user_id', userId)
          .eq('date', date)
      } else {
        await supabase.from('answer_count').insert({
          user_id: userId,
          date,
          count: newCount,
        })
      }
    }
  }

  const isLimitReached = count >= LIMITS[userType]

  return {
    count,
    limit: LIMITS[userType],
    loading,
    isLimitReached,
    increaseCount,
  }
}
