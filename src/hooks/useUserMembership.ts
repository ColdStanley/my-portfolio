'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const PRODUCT_ID = 'ielts-speaking'  // ⚠️ 请根据你的数据库中产品 ID 替换

export function useUserMembership() {
  const supabase = createClientComponentClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkMembership = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUserId(null)
        setIsPro(false)
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data, error } = await supabase
        .from('user_product_membership')
        .select('membership_tier')
        .eq('user_id', user.id)
        .eq('product_id', PRODUCT_ID)
        .maybeSingle()

      if (error) {
        console.error('Membership query error:', error)
        setIsPro(false)
      } else {
        setIsPro(data?.membership_tier === 'pro')
      }

      setLoading(false)
    }

    checkMembership()
  }, [supabase])

  return { userId, isPro, loading }
}
