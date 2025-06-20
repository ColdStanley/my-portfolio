'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

type UserType = 'guest' | 'registered' | 'pro' | 'vip'

export function useCurrentUserType() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType>('guest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndMembership = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setUserId(null)
        setUserType('guest')
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data, error } = await supabase
        .from('user_product_membership')
        .select('membership_tier')
        .eq('user_id', user.id)
        .eq('product_id', 'ielts-speaking') // TODO: 替换为真实产品 ID
        .single()

      if (error || !data?.membership_tier) {
        setUserType('registered')
      } else if (data.membership_tier === 'pro') {
        setUserType('pro')
      } else if (data.membership_tier === 'vip') {
        setUserType('vip')
      } else {
        setUserType('registered')
      }

      setLoading(false)
    }

    fetchUserAndMembership()
  }, [])

  return { userId, userType, loading }
}
